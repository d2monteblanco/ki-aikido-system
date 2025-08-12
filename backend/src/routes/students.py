from flask import Blueprint, request, jsonify
from src.models import db, Student, Dojo
from src.routes.auth import login_required, get_current_user, admin_required
from datetime import datetime
import re

students_bp = Blueprint('students', __name__)

@students_bp.route('/students', methods=['GET'])
@login_required
def get_students():
    """Lista alunos com controle de acesso por dojo"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Parâmetros de busca e filtro
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '').strip()
        dojo_id = request.args.get('dojo_id', type=int)
        status = request.args.get('status', '').strip()
        
        # Query base
        query = Student.query
        
        # Controle de acesso: admin vê tudo, usuário de dojo vê apenas seu dojo
        if not current_user.is_admin():
            query = query.filter(Student.dojo_id == current_user.dojo_id)
        elif dojo_id:  # Admin pode filtrar por dojo específico
            query = query.filter(Student.dojo_id == dojo_id)
        
        # Filtro por busca (nome, email, número de registro)
        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                db.or_(
                    Student.name.ilike(search_filter),
                    Student.email.ilike(search_filter),
                    Student.registration_number.ilike(search_filter)
                )
            )
        
        # Filtro por status
        if status:
            query = query.filter(Student.status == status)
        
        # Ordenação
        query = query.order_by(Student.name.asc())
        
        # Paginação
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        students = [student.to_dict() for student in pagination.items]
        
        return jsonify({
            'students': students,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@students_bp.route('/students/<int:student_id>', methods=['GET'])
@login_required
def get_student(student_id):
    """Obtém um aluno específico"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        student = Student.query.get(student_id)
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        # Verifica se o usuário pode acessar este aluno
        if not current_user.can_access_dojo(student.dojo_id):
            return jsonify({'error': 'Access denied'}), 403
        
        return jsonify({'student': student.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@students_bp.route('/students', methods=['POST'])
@login_required
def create_student():
    """Cria um novo aluno"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validação de campos obrigatórios
        required_fields = ['name', 'email', 'birth_date', 'address']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Determina o dojo
        if current_user.is_admin() and data.get('dojo_id'):
            dojo_id = data['dojo_id']
        else:
            dojo_id = current_user.dojo_id
        
        if not dojo_id:
            return jsonify({'error': 'Dojo is required'}), 400
        
        # Verifica se o dojo existe
        dojo = Dojo.query.get(dojo_id)
        if not dojo:
            return jsonify({'error': 'Dojo not found'}), 404
        
        # Verifica se o usuário pode criar alunos neste dojo
        if not current_user.can_access_dojo(dojo_id):
            return jsonify({'error': 'Access denied'}), 403
        
        # Verifica se o email já existe
        existing_student = Student.query.filter_by(email=data['email'].lower().strip()).first()
        if existing_student:
            return jsonify({'error': 'Email already exists'}), 400
        
        # Gera número de registro se não fornecido
        registration_number = data.get('registration_number')
        if not registration_number:
            registration_number = Student.generate_registration_number(dojo_id)
        else:
            # Verifica se o número já existe
            existing_reg = Student.query.filter_by(registration_number=registration_number).first()
            if existing_reg:
                return jsonify({'error': 'Registration number already exists'}), 400
        
        # Converte data de nascimento
        try:
            birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid birth_date format. Use YYYY-MM-DD'}), 400
        
        # Converte data de registro se fornecida
        registration_date = datetime.utcnow()
        if data.get('registration_date'):
            try:
                registration_date = datetime.strptime(data['registration_date'], '%Y-%m-%d %H:%M:%S')
            except ValueError:
                try:
                    registration_date = datetime.strptime(data['registration_date'], '%Y-%m-%d')
                except ValueError:
                    return jsonify({'error': 'Invalid registration_date format'}), 400
        
        # Cria o aluno
        student = Student(
            registration_number=registration_number,
            name=data['name'].strip(),
            email=data['email'].lower().strip(),
            birth_date=birth_date,
            address=data['address'].strip(),
            dojo_id=dojo_id,
            registration_date=registration_date,
            started_practicing_year=data.get('started_practicing_year'),
            status=data.get('status', 'active'),
            notes=data.get('notes', '').strip() if data.get('notes') else None
        )
        
        db.session.add(student)
        db.session.commit()
        
        return jsonify({
            'message': 'Student created successfully',
            'student': student.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@students_bp.route('/students/<int:student_id>', methods=['PUT'])
@login_required
def update_student(student_id):
    """Atualiza um aluno"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        student = Student.query.get(student_id)
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        # Verifica se o usuário pode acessar este aluno
        if not current_user.can_access_dojo(student.dojo_id):
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Atualiza campos permitidos
        if 'name' in data:
            student.name = data['name'].strip()
        
        if 'email' in data:
            new_email = data['email'].lower().strip()
            if new_email != student.email:
                # Verifica se o novo email já existe
                existing = Student.query.filter_by(email=new_email).first()
                if existing:
                    return jsonify({'error': 'Email already exists'}), 400
                student.email = new_email
        
        if 'birth_date' in data:
            try:
                student.birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid birth_date format. Use YYYY-MM-DD'}), 400
        
        if 'address' in data:
            student.address = data['address'].strip()
        
        if 'started_practicing_year' in data:
            student.started_practicing_year = data['started_practicing_year']
        
        if 'status' in data:
            student.status = data['status']
        
        if 'notes' in data:
            student.notes = data['notes'].strip() if data['notes'] else None
        
        # Apenas admin pode alterar dojo
        if current_user.is_admin() and 'dojo_id' in data:
            new_dojo = Dojo.query.get(data['dojo_id'])
            if not new_dojo:
                return jsonify({'error': 'Dojo not found'}), 404
            student.dojo_id = data['dojo_id']
        
        student.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Student updated successfully',
            'student': student.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@students_bp.route('/students/<int:student_id>', methods=['DELETE'])
@login_required
def delete_student(student_id):
    """Exclui um aluno (soft delete)"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        student = Student.query.get(student_id)
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        # Verifica se o usuário pode acessar este aluno
        if not current_user.can_access_dojo(student.dojo_id):
            return jsonify({'error': 'Access denied'}), 403
        
        # Soft delete - marca como inativo
        student.status = 'inactive'
        student.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Student deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@students_bp.route('/students/stats', methods=['GET'])
@login_required
def get_students_stats():
    """Retorna estatísticas dos alunos"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Query base
        query = Student.query
        
        # Controle de acesso
        if not current_user.is_admin():
            query = query.filter(Student.dojo_id == current_user.dojo_id)
        
        # Estatísticas
        total = query.count()
        active = query.filter(Student.status == 'active').count()
        pending = query.filter(Student.status == 'pending').count()
        inactive = query.filter(Student.status == 'inactive').count()
        
        return jsonify({
            'stats': {
                'total': total,
                'active': active,
                'pending': pending,
                'inactive': inactive
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

