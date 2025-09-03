from flask import Blueprint, request, jsonify
from src.models import db, Student, MemberStatus, MemberQualification
from src.routes.auth import login_required, get_current_user
from datetime import datetime

member_qualifications_bp = Blueprint('member_qualifications', __name__)

def get_user_dojos():
    """Retorna os dojos que o usuário pode acessar"""
    user = get_current_user()
    if not user:
        return []
    if user.role == 'admin':
        return None  # Admin pode ver todos
    return [user.dojo_id] if user.dojo_id else []

def check_member_access(member_status_id):
    """Verifica se o usuário tem acesso ao membro"""
    member_status = MemberStatus.query.get(member_status_id)
    if not member_status:
        return False
    
    allowed_dojos = get_user_dojos()
    if allowed_dojos is not None and member_status.student.dojo_id not in allowed_dojos:
        return False
    
    return True

@member_qualifications_bp.route('/member-status/<int:member_status_id>/qualifications', methods=['GET'])
@login_required
def list_qualifications(member_status_id):
    """Lista qualificações de um membro"""
    if not check_member_access(member_status_id):
        return jsonify({'error': 'Acesso negado'}), 403
    
    # Filtros
    qualification_type = request.args.get('qualification_type', '').strip()
    is_active = request.args.get('is_active', type=bool)
    
    query = MemberQualification.query.filter_by(member_status_id=member_status_id)
    
    if qualification_type:
        query = query.filter(MemberQualification.qualification_type == qualification_type)
    
    if is_active is not None:
        query = query.filter(MemberQualification.is_active == is_active)
    
    # Ordenar por tipo e data
    qualifications = query.order_by(
        MemberQualification.qualification_type,
        MemberQualification.date_obtained.desc()
    ).all()
    
    return jsonify([qual.to_dict() for qual in qualifications])

@member_qualifications_bp.route('/member-qualifications', methods=['POST'])
@login_required
def create_qualification_by_student():
    """Cria uma nova qualificação usando student_id (endpoint alternativo)"""
    data = request.get_json()
    
    # Validações
    required_fields = ['student_id', 'qualification_type']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} é obrigatório'}), 400
    
    # Encontrar o member_status_id pelo student_id
    member_status = MemberStatus.query.filter_by(student_id=data['student_id']).first()
    if not member_status:
        return jsonify({'error': 'Status de membro não encontrado para este estudante'}), 404
    
    if not check_member_access(member_status.id):
        return jsonify({'error': 'Acesso negado'}), 403
    
    try:
        qualification = MemberQualification(
            member_status_id=member_status.id,
            qualification_type=data['qualification_type'],
            qualification_level=data.get('qualification_level'),
            date_obtained=datetime.strptime(data['date_obtained'], '%Y-%m-%d').date() if data.get('date_obtained') else None,
            certificate_number=data.get('certificate_number'),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(qualification)
        db.session.commit()
        
        return jsonify(qualification.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar qualificação: {str(e)}'}), 500

@member_qualifications_bp.route('/member-status/<int:member_status_id>/qualifications', methods=['POST'])
@login_required
def create_qualification(member_status_id):
    """Cria uma nova qualificação para um membro"""
    if not check_member_access(member_status_id):
        return jsonify({'error': 'Acesso negado'}), 403
    
    data = request.get_json()
    
    # Validações
    required_fields = ['qualification_type']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} é obrigatório'}), 400
    
    try:
        qualification = MemberQualification(
            member_status_id=member_status_id,
            qualification_type=data['qualification_type'],
            qualification_level=data.get('qualification_level'),
            date_obtained=datetime.strptime(data['date_obtained'], '%Y-%m-%d').date() if data.get('date_obtained') else None,
            certificate_number=data.get('certificate_number'),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(qualification)
        db.session.commit()
        
        return jsonify(qualification.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar qualificação: {str(e)}'}), 500

@member_qualifications_bp.route('/qualifications/<int:id>', methods=['GET'])
@login_required
def get_qualification(id):
    """Retorna detalhes de uma qualificação específica"""
    qualification = MemberQualification.query.get_or_404(id)
    
    if not check_member_access(qualification.member_status_id):
        return jsonify({'error': 'Acesso negado'}), 403
    
    return jsonify(qualification.to_dict())

@member_qualifications_bp.route('/qualifications/<int:id>', methods=['PUT'])
@login_required
def update_qualification(id):
    """Atualiza uma qualificação"""
    qualification = MemberQualification.query.get_or_404(id)
    
    if not check_member_access(qualification.member_status_id):
        return jsonify({'error': 'Acesso negado'}), 403
    
    data = request.get_json()
    
    try:
        # Atualizar campos
        if 'qualification_type' in data:
            qualification.qualification_type = data['qualification_type']
        
        if 'qualification_level' in data:
            qualification.qualification_level = data['qualification_level']
        
        if 'date_obtained' in data:
            qualification.date_obtained = datetime.strptime(data['date_obtained'], '%Y-%m-%d').date() if data['date_obtained'] else None
        
        if 'certificate_number' in data:
            qualification.certificate_number = data['certificate_number']
        
        if 'is_active' in data:
            qualification.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify(qualification.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao atualizar qualificação: {str(e)}'}), 500

@member_qualifications_bp.route('/qualifications/<int:id>', methods=['DELETE'])
@login_required
def delete_qualification(id):
    """Remove uma qualificação"""
    qualification = MemberQualification.query.get_or_404(id)
    
    if not check_member_access(qualification.member_status_id):
        return jsonify({'error': 'Acesso negado'}), 403
    
    try:
        db.session.delete(qualification)
        db.session.commit()
        return jsonify({'message': 'Qualificação removida com sucesso'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao remover qualificação: {str(e)}'}), 500

@member_qualifications_bp.route('/qualifications/constants', methods=['GET'])
def get_qualification_constants():
    """Retorna constantes para formulários de qualificação"""
    return jsonify({
        'qualification_types': MemberQualification.QUALIFICATION_TYPES,
        'examiner_levels': MemberQualification.EXAMINER_LEVELS,
        'lecturer_levels': MemberQualification.LECTURER_LEVELS
    })
