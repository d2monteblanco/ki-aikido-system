from flask import Blueprint, request, jsonify
from src.models import db, Student, MemberStatus, MemberGraduation, MemberQualification, User
from src.routes.auth import login_required, get_current_user
from datetime import datetime

member_status_bp = Blueprint('member_status', __name__)

def get_user_dojos():
    """Retorna os dojos que o usuário pode acessar"""
    user = get_current_user()
    if not user:
        return []
    if user.role == 'admin':
        return None  # Admin pode ver todos
    return [user.dojo_id] if user.dojo_id else []

@member_status_bp.route('/member-status', methods=['GET'])
@login_required
def list_member_status():
    """Lista todos os status de membros com paginação e filtros"""
    
    # Parâmetros de paginação
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    
    # Filtros
    search = request.args.get('search', '').strip()
    member_type = request.args.get('member_type', '').strip()
    current_status = request.args.get('current_status', '').strip()
    dojo_id = request.args.get('dojo_id', type=int)
    
    # Query base
    query = db.session.query(MemberStatus).join(Student)
    
    # Filtro por dojos permitidos
    allowed_dojos = get_user_dojos()
    if allowed_dojos is not None:
        query = query.filter(Student.dojo_id.in_(allowed_dojos))
    
    # Aplicar filtros
    if search:
        query = query.filter(
            db.or_(
                Student.name.ilike(f'%{search}%'),
                MemberStatus.registered_number.ilike(f'%{search}%')
            )
        )
    
    if member_type:
        query = query.filter(MemberStatus.member_type == member_type)
    
    if current_status:
        query = query.filter(MemberStatus.current_status == current_status)
    
    if dojo_id:
        query = query.filter(Student.dojo_id == dojo_id)
    
    # Ordenação
    query = query.order_by(Student.name)
    
    # Paginação
    pagination = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'members': [ms.to_summary() for ms in pagination.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    })

@member_status_bp.route('/member-status/<int:id>', methods=['GET'])
@login_required
def get_member_status(id):
    """Retorna detalhes de um status de membro específico"""
    
    member_status = MemberStatus.query.get_or_404(id)
    
    # Verificar permissão
    allowed_dojos = get_user_dojos()
    if allowed_dojos is not None and member_status.student.dojo_id not in allowed_dojos:
        return jsonify({'error': 'Acesso negado'}), 403
    
    return jsonify(member_status.to_dict())

@member_status_bp.route('/member-status', methods=['POST'])
@login_required
def create_member_status():
    """Cria um novo status de membro"""
    
    data = request.get_json()
    
    # Validações
    if not data.get('student_id'):
        return jsonify({'error': 'student_id é obrigatório'}), 400
    
    student = Student.query.get(data['student_id'])
    if not student:
        return jsonify({'error': 'Estudante não encontrado'}), 404
    
    # Verificar permissão
    allowed_dojos = get_user_dojos()
    if allowed_dojos is not None and student.dojo_id not in allowed_dojos:
        return jsonify({'error': 'Acesso negado'}), 403
    
    # Verificar se já existe status para este estudante
    existing = MemberStatus.query.filter_by(student_id=data['student_id']).first()
    if existing:
        return jsonify({'error': 'Estudante já possui status de membro'}), 400
    
    try:
        # Converter string vazia para None no registered_number
        reg_num = data.get('registered_number')
        registered_number = reg_num if reg_num and str(reg_num).strip() else None
        
        member_status = MemberStatus(
            student_id=data['student_id'],
            registered_number=registered_number,
            membership_date=datetime.strptime(data['membership_date'], '%Y-%m-%d').date() if data.get('membership_date') else None,
            member_type=data.get('member_type', 'student'),
            current_status=data.get('current_status', 'active'),
            last_activity_year=data.get('last_activity_year')
        )
        
        db.session.add(member_status)
        db.session.commit()
        
        return jsonify(member_status.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar status de membro: {str(e)}'}), 500

@member_status_bp.route('/member-status/<int:id>', methods=['PUT'])
@login_required
def update_member_status(id):
    """Atualiza um status de membro"""
    
    member_status = MemberStatus.query.get_or_404(id)
    
    # Verificar permissão
    allowed_dojos = get_user_dojos()
    if allowed_dojos is not None and member_status.student.dojo_id not in allowed_dojos:
        return jsonify({'error': 'Acesso negado'}), 403
    
    data = request.get_json()
    
    try:
        # Atualizar campos
        if 'registered_number' in data:
            # Converter string vazia para None para evitar conflito com UNIQUE constraint
            reg_num = data['registered_number']
            member_status.registered_number = reg_num if reg_num and reg_num.strip() else None
        if 'membership_date' in data:
            member_status.membership_date = datetime.strptime(data['membership_date'], '%Y-%m-%d').date() if data['membership_date'] else None
        if 'member_type' in data:
            member_status.member_type = data['member_type']
        if 'current_status' in data:
            member_status.current_status = data['current_status']
        if 'last_activity_year' in data:
            member_status.last_activity_year = data['last_activity_year']
        
        member_status.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(member_status.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao atualizar status de membro: {str(e)}'}), 500

@member_status_bp.route('/member-status/<int:id>', methods=['DELETE'])
@login_required
def delete_member_status(id):
    """Remove um status de membro"""
    
    member_status = MemberStatus.query.get_or_404(id)
    
    # Verificar permissão
    allowed_dojos = get_user_dojos()
    if allowed_dojos is not None and member_status.student.dojo_id not in allowed_dojos:
        return jsonify({'error': 'Acesso negado'}), 403
    
    try:
        db.session.delete(member_status)
        db.session.commit()
        return jsonify({'message': 'Status de membro removido com sucesso'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao remover status de membro: {str(e)}'}), 500

@member_status_bp.route('/member-status/constants', methods=['GET', 'OPTIONS'])
def get_constants():
    """Retorna constantes para formulários"""
    from flask import make_response
    
    # Handle preflight request
    if request.method == 'OPTIONS':
        response = make_response('', 200)
        response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response
    
    response = jsonify({
        'member_types': MemberStatus.MEMBER_TYPES,
        'status_types': MemberStatus.STATUS_TYPES,
        'disciplines': MemberGraduation.DISCIPLINES,
        'toitsudo_ranks': MemberGraduation.TOITSUDO_RANKS,
        'aikido_ranks': MemberGraduation.AIKIDO_RANKS,
        'qualification_types': MemberQualification.QUALIFICATION_TYPES,
        'examiner_levels': MemberQualification.EXAMINER_LEVELS,
        'lecturer_levels': MemberQualification.INSTRUCTOR_LEVELS,  # Corrigido: usar INSTRUCTOR_LEVELS
        'certificate_status': MemberGraduation.CERTIFICATE_STATUS
    })
    
    # Add CORS headers explicitly
    response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    
    return response

