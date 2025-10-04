#!/bin/bash

# =============================================================================
# Sistema Ki Aikido - Script de Importação de Dados
# =============================================================================
# Versão: 1.0
# Descrição: Importa dados do arquivo unified_file.csv para o banco de dados
# =============================================================================

set -e

# Cores
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configurações
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
DATA_FILE="$PROJECT_DIR/data/unified_file - unified_file.csv"
VENV_ACTIVATE="$BACKEND_DIR/venv/bin/activate"

echo -e "${CYAN}📥 Sistema Ki Aikido - Importação de Dados${NC}"
echo -e "${CYAN}==========================================${NC}"

# Verificar se o arquivo CSV existe
if [[ ! -f "$DATA_FILE" ]]; then
    echo -e "${RED}❌ Erro: Arquivo de dados não encontrado: $DATA_FILE${NC}"
    exit 1
fi

echo -e "${CYAN}📄 Arquivo de dados: $DATA_FILE${NC}"

# Verificar se o virtual environment existe
if [[ ! -f "$VENV_ACTIVATE" ]]; then
    echo -e "${RED}❌ Erro: Virtual environment não encontrado${NC}"
    echo -e "${YELLOW}Execute primeiro: cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt${NC}"
    exit 1
fi

# Ativar virtual environment
echo -e "${CYAN}🔧 Ativando virtual environment...${NC}"
source "$VENV_ACTIVATE"

# Verificar se o Python está disponível
if ! command -v python3 >/dev/null 2>&1; then
    echo -e "${RED}❌ Erro: Python 3 não encontrado${NC}"
    exit 1
fi

echo -e "${CYAN}🐍 Usando Python: $(python3 --version)${NC}"

# Executar o script Python de importação
echo -e "${CYAN}🚀 Iniciando importação...${NC}"
echo ""

cd "$BACKEND_DIR"
python3 << 'EOF'
import sys
import os
import csv
import re
from datetime import datetime, date

# Adicionar o caminho do backend ao sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.main import app, db
from src.models.student import Student
from src.models.dojo import Dojo
from src.models.member_status import MemberStatus
from src.models.member_graduation import MemberGraduation
from src.models.member_qualification import MemberQualification

# Constantes
DEFAULT_DATE = date(1999, 12, 12)
DATA_FILE = '../data/unified_file - unified_file.csv'

def parse_date(date_string):
    """Parse date in various formats"""
    if not date_string or date_string.strip() == '':
        return DEFAULT_DATE
    
    date_string = date_string.strip()
    
    # Try different date formats
    formats = [
        '%m/%d/%Y',  # 06/15/2019
        '%d/%m/%Y',  # 15/06/2019
        '%Y-%m-%d',  # 2019-06-15
        '%d/%m/%y',  # 15/06/19
        '%m/%d/%y',  # 06/15/19
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_string, fmt).date()
        except ValueError:
            continue
    
    print(f"   ⚠️  Data inválida '{date_string}', usando data padrão: 12/12/1999")
    return DEFAULT_DATE

def clean_text(text):
    """Clean and normalize text"""
    if not text:
        return ''
    return text.strip()

def parse_status(status_text):
    """Parse activity status"""
    if not status_text:
        return 'inactive'
    
    status_text = status_text.strip().lower()
    if 'ativo' in status_text:
        return 'active'
    elif 'inativo' in status_text:
        return 'inactive'
    else:
        return 'inactive'

def generate_unique_registration(dojo_id, registration_numbers_used):
    """Generate a unique registration number"""
    counter = 1
    while True:
        reg_number = f"KIA-{dojo_id:03d}-{counter:04d}"
        if reg_number not in registration_numbers_used:
            return reg_number
        counter += 1

def map_dojo_name(dojo_name):
    """Map CSV dojo names to correct database dojo names"""
    dojo_mapping = {
        'CDKI - Curitiba': 'CDKI Centro de desenvolvimento de KI',
        'CDKI - Belo Horizonte': 'Centro de desenvolvimento de KI de Belo Horizonte',
    }
    
    return dojo_mapping.get(dojo_name, dojo_name)

def generate_email(name, dojo_name, existing_emails):
    """Generate a unique email if not provided"""
    # Clean name
    name_parts = name.lower().split()
    if len(name_parts) >= 2:
        base_email = f"{name_parts[0]}.{name_parts[-1]}"
    else:
        base_email = name.lower().replace(' ', '.')
    
    # Remove special characters
    base_email = re.sub(r'[^a-z0-9.]', '', base_email)
    
    # Generate email
    counter = 1
    email = f"{base_email}@kiaikido.com.br"
    
    while email in existing_emails:
        email = f"{base_email}{counter}@kiaikido.com.br"
        counter += 1
    
    existing_emails.add(email)
    return email

def set_current_graduations(member_status_id):
    """Set only the most recent graduation of each discipline as current"""
    # Get all graduations for this member
    graduations = MemberGraduation.query.filter_by(
        member_status_id=member_status_id
    ).all()
    
    # First, set all to not current
    for grad in graduations:
        grad.is_current = False
    
    # Group by discipline
    disciplines = {}
    for grad in graduations:
        if grad.discipline not in disciplines:
            disciplines[grad.discipline] = []
        disciplines[grad.discipline].append(grad)
    
    # For each discipline, find the most recent and set as current
    for discipline, grads in disciplines.items():
        if grads:
            # Sort by examination_date (most recent first)
            most_recent = max(grads, key=lambda g: g.examination_date)
            most_recent.is_current = True
            print(f"      ✓ Graduação atual {discipline}: {most_recent.rank_name} ({most_recent.examination_date})")
    
    db.session.flush()

def import_data():
    """Import data from CSV file"""
    
    with app.app_context():
        print("🔧 Iniciando importação de dados...\n")
        
        # Statistics
        stats = {
            'dojos_created': 0,
            'students_created': 0,
            'member_status_created': 0,
            'graduations_created': 0,
            'qualifications_created': 0,
            'rows_processed': 0,
            'errors': 0
        }
        
        # Cache for dojos and existing data
        dojos_cache = {}
        students_cache = {}  # Key: (name, dojo_id)
        existing_emails = set()
        registration_numbers_used = set()
        
        # Get or create dojos from database
        existing_dojos = Dojo.query.all()
        for dojo in existing_dojos:
            dojos_cache[dojo.name] = dojo
        
        # Get existing registration numbers
        existing_students = Student.query.all()
        for student in existing_students:
            if student.registration_number:
                registration_numbers_used.add(student.registration_number)
        
        # Read CSV file
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                
                for row_num, row in enumerate(reader, start=2):
                    stats['rows_processed'] += 1
                    
                    try:
                        # Extract data from row
                        dojo_name = clean_text(row.get('Dojo', ''))
                        student_number = clean_text(row.get('Número', ''))
                        student_name = clean_text(row.get('Nome do praticante', ''))
                        activity_status = clean_text(row.get('Em Atividade', ''))
                        
                        # Shinshin Toitsudo data
                        toitsudo_rank = clean_text(row.get('Shinshin Toitsudo', ''))
                        toitsudo_exam_date = clean_text(row.get('Data Exame Shinshin Toitsudo', ''))
                        toitsudo_certificate = clean_text(row.get('Certificado', ''))
                        
                        # Aikido data
                        aikido_rank = clean_text(row.get('Aikido Rank', ''))
                        aikido_exam_date = clean_text(row.get('Data Exame Aikido Rank', ''))
                        # Get Aikido certificate - it's the second 'Certificado' column
                        cols = list(row.keys())
                        cert_cols = [i for i, col in enumerate(cols) if col == 'Certificado']
                        if len(cert_cols) >= 2:
                            aikido_certificate = clean_text(list(row.values())[cert_cols[1]])
                        else:
                            aikido_certificate = ''
                        
                        # Qualifications
                        examiner_level = clean_text(row.get('Nivel de Examinador', ''))
                        examiner_date = clean_text(row.get('Data do Nível de Examinador', ''))
                        instructor_level = clean_text(row.get('Nivel de Professor', ''))
                        instructor_date = clean_text(row.get('Data do nível de professor', ''))
                        
                        membership_year = clean_text(row.get('Filiação', ''))
                        birth_date_str = clean_text(row.get('Nascimento:', ''))
                        address = clean_text(row.get('Endereço:', ''))
                        email = clean_text(row.get('Email:', ''))
                        gender = clean_text(row.get('Sexo', ''))
                        profession = clean_text(row.get('Profissão', ''))
                        
                        # Skip rows without student name
                        if not student_name:
                            continue
                        
                        # Map dojo name to correct database name
                        if not dojo_name:
                            print(f"   ⚠️  Linha {row_num}: Nome do dojo não encontrado, usando 'Dojo Principal'")
                            dojo_name = 'Dojo Principal'
                        else:
                            dojo_name = map_dojo_name(dojo_name)
                        
                        # Get or create dojo
                        if dojo_name not in dojos_cache:
                            dojo = Dojo(
                                name=dojo_name,
                                address='',
                                is_active=True
                            )
                            db.session.add(dojo)
                            db.session.flush()
                            dojos_cache[dojo_name] = dojo
                            stats['dojos_created'] += 1
                            print(f"✅ Dojo criado: {dojo_name}")
                        
                        dojo = dojos_cache[dojo_name]
                        
                        # Check if student already exists (by name and dojo)
                        student_key = (student_name, dojo.id)
                        
                        if student_key in students_cache:
                            # Student exists, just add graduations/qualifications
                            student = students_cache[student_key]
                        else:
                            # Create new student
                            
                            # Generate email if not provided
                            if not email:
                                email = generate_email(student_name, dojo_name, existing_emails)
                                print(f"   ℹ️  Email gerado para {student_name}: {email}")
                            else:
                                if email in existing_emails:
                                    email = generate_email(student_name, dojo_name, existing_emails)
                                    print(f"   ℹ️  Email duplicado, gerado novo para {student_name}: {email}")
                                else:
                                    existing_emails.add(email)
                            
                            # Parse birth date
                            birth_date = parse_date(birth_date_str) if birth_date_str else DEFAULT_DATE
                            
                            # Generate registration number (matrícula) - always auto-generated
                            reg_number = generate_unique_registration(dojo.id, registration_numbers_used)
                            registration_numbers_used.add(reg_number)
                            
                            # Create student
                            student = Student(
                                registration_number=reg_number,
                                name=student_name,
                                email=email,
                                birth_date=birth_date,
                                address=address if address else 'Endereço não informado - importado de CSV',
                                dojo_id=dojo.id,
                                started_practicing_year=int(membership_year) if membership_year.isdigit() else None,
                                notes=f"Profissão: {profession}. Sexo: {gender}. Importado de CSV." if profession or gender else "Importado de CSV."
                            )
                            
                            db.session.add(student)
                            db.session.flush()
                            
                            students_cache[student_key] = student
                            stats['students_created'] += 1
                            
                            # Create member status
                            current_status = parse_status(activity_status)
                            
                            # Create member status
                            # Note: student_number from CSV is the registered_number (número de membro)
                            # not the registration_number (matrícula) which is auto-generated
                            member_status = MemberStatus(
                                student_id=student.id,
                                registered_number=student_number if student_number else None,
                                membership_date=DEFAULT_DATE,
                                member_type='student',
                                current_status=current_status,
                                last_activity_year=datetime.now().year if current_status == 'active' else None
                            )
                            
                            db.session.add(member_status)
                            db.session.flush()
                            stats['member_status_created'] += 1
                            
                            print(f"✅ Estudante criado: {student_name} ({dojo_name})")
                            if student_number:
                                print(f"   📋 Número de membro: {student_number}")
                        
                        # Get member status
                        member_status = MemberStatus.query.filter_by(student_id=student.id).first()
                        
                        if not member_status:
                            print(f"   ⚠️  Member status não encontrado para {student_name}, criando...")
                            current_status = parse_status(activity_status)
                            member_status = MemberStatus(
                                student_id=student.id,
                                registered_number=student_number if student_number else None,
                                membership_date=DEFAULT_DATE,
                                member_type='student',
                                current_status=current_status,
                                last_activity_year=datetime.now().year if current_status == 'active' else None
                            )
                            db.session.add(member_status)
                            db.session.flush()
                            stats['member_status_created'] += 1
                        
                        # Add Shinshin Toitsudo graduation
                        if toitsudo_rank:
                            # Check if graduation already exists
                            existing_grad = MemberGraduation.query.filter_by(
                                member_status_id=member_status.id,
                                discipline='Shinshin Toitsudo',
                                rank_name=toitsudo_rank
                            ).first()
                            
                            if not existing_grad:
                                exam_date = parse_date(toitsudo_exam_date) if toitsudo_exam_date else DEFAULT_DATE
                                
                                cert_status = 'pending'
                                if toitsudo_certificate:
                                    if 'on-hand' in toitsudo_certificate.lower():
                                        cert_status = 'issued'
                                    elif 'to-be-filed' in toitsudo_certificate.lower():
                                        cert_status = 'to-be-filed'
                                
                                graduation = MemberGraduation(
                                    member_status_id=member_status.id,
                                    discipline='Shinshin Toitsudo',
                                    rank_name=toitsudo_rank,
                                    rank_level=MemberGraduation.get_rank_level('Shinshin Toitsudo', toitsudo_rank),
                                    examination_date=exam_date,
                                    certificate_number=toitsudo_certificate if toitsudo_certificate and toitsudo_certificate not in ['to-be-filed', 'on-hand'] else None,
                                    certificate_status=cert_status,
                                    is_current=False  # Will be set later based on most recent date
                                )
                                
                                db.session.add(graduation)
                                stats['graduations_created'] += 1
                        
                        # Add Aikido graduation
                        if aikido_rank:
                            # Check if graduation already exists
                            existing_grad = MemberGraduation.query.filter_by(
                                member_status_id=member_status.id,
                                discipline='Shinshin Toitsu Aikido',
                                rank_name=aikido_rank
                            ).first()
                            
                            if not existing_grad:
                                exam_date = parse_date(aikido_exam_date) if aikido_exam_date else DEFAULT_DATE
                                
                                cert_status = 'pending'
                                if aikido_certificate:
                                    if 'on-hand' in aikido_certificate.lower():
                                        cert_status = 'issued'
                                    elif 'to-be-filed' in aikido_certificate.lower():
                                        cert_status = 'to-be-filed'
                                
                                graduation = MemberGraduation(
                                    member_status_id=member_status.id,
                                    discipline='Shinshin Toitsu Aikido',
                                    rank_name=aikido_rank,
                                    rank_level=MemberGraduation.get_rank_level('Shinshin Toitsu Aikido', aikido_rank),
                                    examination_date=exam_date,
                                    certificate_number=aikido_certificate if aikido_certificate and aikido_certificate not in ['to-be-filed', 'on-hand'] else None,
                                    certificate_status=cert_status,
                                    is_current=False  # Will be set later based on most recent date
                                )
                                
                                db.session.add(graduation)
                                stats['graduations_created'] += 1
                        
                        # Add examiner qualification
                        if examiner_level:
                            existing_qual = MemberQualification.query.filter_by(
                                member_status_id=member_status.id,
                                qualification_type='examiner'
                            ).first()
                            
                            if not existing_qual:
                                exam_qual_date = parse_date(examiner_date) if examiner_date else DEFAULT_DATE
                                
                                qualification = MemberQualification(
                                    member_status_id=member_status.id,
                                    qualification_type='examiner',
                                    qualification_level=examiner_level.lower() if examiner_level.lower() in ['assistente', 'companheiro', 'pleno'] else None,
                                    date_obtained=exam_qual_date,
                                    is_active=True
                                )
                                
                                db.session.add(qualification)
                                stats['qualifications_created'] += 1
                        
                        # Add instructor qualification
                        if instructor_level:
                            existing_qual = MemberQualification.query.filter_by(
                                member_status_id=member_status.id,
                                qualification_type='lecturer'
                            ).first()
                            
                            if not existing_qual:
                                instr_qual_date = parse_date(instructor_date) if instructor_date else DEFAULT_DATE
                                
                                qualification = MemberQualification(
                                    member_status_id=member_status.id,
                                    qualification_type='lecturer',
                                    qualification_level=instructor_level.lower() if instructor_level.lower() in ['assistente', 'companheiro', 'pleno'] else None,
                                    date_obtained=instr_qual_date,
                                    is_active=True
                                )
                                
                                db.session.add(qualification)
                                stats['qualifications_created'] += 1
                        
                    except Exception as e:
                        stats['errors'] += 1
                        print(f"❌ Erro na linha {row_num}: {str(e)}")
                        db.session.rollback()  # Rollback on error
                        continue
                
                # Commit all changes
                db.session.commit()
                
                # Now set current graduations for each member (most recent per discipline)
                print("\n🔄 Definindo graduações atuais (mais recentes por disciplina)...")
                all_member_status = MemberStatus.query.all()
                for ms in all_member_status:
                    if ms.graduations:
                        set_current_graduations(ms.id)
                
                db.session.commit()
                print("✅ Graduações atuais definidas!\n")
                
        except FileNotFoundError:
            print(f"❌ Erro: Arquivo não encontrado: {DATA_FILE}")
            return False
        except Exception as e:
            print(f"❌ Erro ao processar arquivo: {str(e)}")
            db.session.rollback()
            return False
        
        # Print statistics
        print("\n" + "="*50)
        print("📊 ESTATÍSTICAS DA IMPORTAÇÃO")
        print("="*50)
        print(f"Linhas processadas:        {stats['rows_processed']}")
        print(f"Dojos criados:             {stats['dojos_created']}")
        print(f"Estudantes criados:        {stats['students_created']}")
        print(f"Status de membros criados: {stats['member_status_created']}")
        print(f"Graduações criadas:        {stats['graduations_created']}")
        print(f"Qualificações criadas:     {stats['qualifications_created']}")
        print(f"Erros encontrados:         {stats['errors']}")
        print("="*50)
        
        return True

# Execute import
if __name__ == '__main__':
    success = import_data()
    sys.exit(0 if success else 1)

EOF

echo ""
echo -e "${GREEN}✅ Importação concluída!${NC}"

exit 0
