from src.models.user import db
from datetime import datetime
import re

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    registration_number = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=True)  # Campo telefone adicionado
    birth_date = db.Column(db.Date, nullable=False)
    address = db.Column(db.Text, nullable=False)
    dojo_id = db.Column(db.Integer, db.ForeignKey('dojo.id'), nullable=False)
    registration_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    started_practicing_year = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='active')  # active, pending, inactive
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Student {self.name}>'

    @staticmethod
    def generate_registration_number(dojo_id):
        """Gera um número de registro único para o aluno"""
        # Busca o último número de registro para o dojo
        last_student = Student.query.filter_by(dojo_id=dojo_id).order_by(Student.id.desc()).first()
        
        if last_student and last_student.registration_number:
            # Extrai o número do último registro
            match = re.search(r'(\d+)$', last_student.registration_number)
            if match:
                last_number = int(match.group(1))
                new_number = last_number + 1
            else:
                new_number = 1
        else:
            new_number = 1
        
        # Formato: KIA-DOJO_ID-NUMERO (ex: KIA-001-0001)
        return f"KIA-{dojo_id:03d}-{new_number:04d}"

    @staticmethod
    def clean_registration_number(raw_number):
        """Limpa e padroniza números de registro da planilha"""
        if not raw_number or raw_number.lower().strip() in ['não tenho', 'nao tenho', '']:
            return None
        
        # Remove espaços e caracteres especiais desnecessários
        cleaned = re.sub(r'\s+', '', raw_number.strip())
        return cleaned if cleaned else None

    def to_dict(self):
        return {
            'id': self.id,
            'registration_number': self.registration_number,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'birth_date': self.birth_date.isoformat() if self.birth_date else None,
            'address': self.address,
            'dojo_id': self.dojo_id,
            'dojo_name': self.dojo.name if self.dojo else None,
            'registration_date': self.registration_date.isoformat() if self.registration_date else None,
            'started_practicing_year': self.started_practicing_year,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def to_summary(self):
        """Retorna um resumo do aluno para listagens"""
        return {
            'id': self.id,
            'registration_number': self.registration_number,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'dojo_name': self.dojo.name if self.dojo else None,
            'status': self.status,
            'registration_date': self.registration_date.isoformat() if self.registration_date else None
        }

