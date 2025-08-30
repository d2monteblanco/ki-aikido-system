from flask import Blueprint, request, jsonify
from src.models import db, Student, MemberStatus, MemberGraduation
from src.routes.auth import login_required, get_current_user
from datetime import datetime

member_graduations_bp = Blueprint('member_graduations', __name__)

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

@member_graduations_bp.route('/member-status/<int:member_status_id>/graduations', methods=['GET'])
@login_required
def list_graduations(member_status_id):
    """Lista graduações de um membro"""
    if not check_member_access(member_status_id):
        return jsonify({'error': 'Acesso negado'}), 403
    
    # Filtros
    discipline = request.args.get('discipline', '').strip()
    is_current = request.args.get('is_current', type=bool)
    
    query = MemberGraduation.query.filter_by(member_status_id=member_status_id)
    
    if discipline:
        query = query.filter(MemberGraduation.discipline == discipline)
    
    if is_current is not None:
        query = query.filter(MemberGraduation.is_current == is_current)
    
    # Ordenar por disciplina e nível
    graduations = query.order_by(
        MemberGraduation.discipline,
        MemberGraduation.rank_level.desc(),
        MemberGraduation.examination_date.desc()
    ).all()
    
    return jsonify([grad.to_dict() for grad in graduations])

@member_graduations_bp.route('/member-graduations', methods=['POST'])
@login_required
def create_graduation_by_student():
    """Cria uma nova graduação usando student_id (endpoint alternativo)"""
    data = request.get_json()
    
    # Validações
    required_fields = ['student_id', 'discipline', 'rank_name']
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
        graduation = MemberGraduation(
            member_status_id=member_status.id,
            discipline=data['discipline'],
            rank_name=data['rank_name'],
            examination_date=datetime.strptime(data['examination_date'], '%Y-%m-%d').date() if data.get('examination_date') else None,
            certificate_number=data.get('certificate_number'),
            certificate_status=data.get('certificate_status', 'pending'),
            is_current=data.get('is_current', True)  # Por padrão, nova graduação é atual
        )
        
        # Definir rank_level automaticamente
        graduation.rank_level = MemberGraduation.get_rank_level(
            graduation.discipline, graduation.rank_name
        )
        
        db.session.add(graduation)
        
        # Se marcada como atual, desmarcar outras da mesma disciplina
        if graduation.is_current:
            other_grads = MemberGraduation.query.filter_by(
                member_status_id=member_status.id,
                discipline=graduation.discipline
            ).all()
            
            for grad in other_grads:
                grad.is_current = False
        
        db.session.commit()
        
        return jsonify(graduation.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar graduação: {str(e)}'}), 500

@member_graduations_bp.route('/member-status/<int:member_status_id>/graduations', methods=['POST'])
@login_required
def create_graduation(member_status_id):
    """Cria uma nova graduação para um membro"""
    if not check_member_access(member_status_id):
        return jsonify({'error': 'Acesso negado'}), 403
    
    data = request.get_json()
    
    # Validações
    required_fields = ['discipline', 'rank_name']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} é obrigatório'}), 400
    
    try:
        graduation = MemberGraduation(
            member_status_id=member_status_id,
            discipline=data['discipline'],
            rank_name=data['rank_name'],
            examination_date=datetime.strptime(data['examination_date'], '%Y-%m-%d').date() if data.get('examination_date') else None,
            certificate_number=data.get('certificate_number'),
            certificate_status=data.get('certificate_status', 'pending'),
            is_current=data.get('is_current', False)
        )
        
        # Definir rank_level automaticamente
        graduation.rank_level = MemberGraduation.get_rank_level(
            graduation.discipline, graduation.rank_name
        )
        
        db.session.add(graduation)
        
        # Se marcada como atual, desmarcar outras da mesma disciplina
        if graduation.is_current:
            other_grads = MemberGraduation.query.filter_by(
                member_status_id=member_status_id,
                discipline=graduation.discipline
            ).all()
            
            for grad in other_grads:
                grad.is_current = False
        
        db.session.commit()
        
        return jsonify(graduation.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar graduação: {str(e)}'}), 500

@member_graduations_bp.route('/graduations/<int:id>', methods=['GET'])
@login_required
def get_graduation(id):
    """Retorna detalhes de uma graduação específica"""
    graduation = MemberGraduation.query.get_or_404(id)
    
    if not check_member_access(graduation.member_status_id):
        return jsonify({'error': 'Acesso negado'}), 403
    
    return jsonify(graduation.to_dict())

@member_graduations_bp.route('/graduations/<int:id>', methods=['PUT'])
@login_required
def update_graduation(id):
    """Atualiza uma graduação"""
    graduation = MemberGraduation.query.get_or_404(id)
    
    if not check_member_access(graduation.member_status_id):
        return jsonify({'error': 'Acesso negado'}), 403
    
    data = request.get_json()
    
    try:
        # Atualizar campos
        if 'rank_name' in data:
            graduation.rank_name = data['rank_name']
            graduation.rank_level = MemberGraduation.get_rank_level(
                graduation.discipline, graduation.rank_name
            )
        
        if 'examination_date' in data:
            graduation.examination_date = datetime.strptime(data['examination_date'], '%Y-%m-%d').date() if data['examination_date'] else None
        
        if 'certificate_number' in data:
            graduation.certificate_number = data['certificate_number']
        
        if 'certificate_status' in data:
            graduation.certificate_status = data['certificate_status']
        
        if 'is_current' in data:
            graduation.is_current = data['is_current']
            
            # Se marcada como atual, desmarcar outras da mesma disciplina
            if graduation.is_current:
                other_grads = MemberGraduation.query.filter_by(
                    member_status_id=graduation.member_status_id,
                    discipline=graduation.discipline
                ).filter(MemberGraduation.id != graduation.id).all()
                
                for grad in other_grads:
                    grad.is_current = False
        
        db.session.commit()
        
        return jsonify(graduation.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao atualizar graduação: {str(e)}'}), 500

@member_graduations_bp.route('/graduations/<int:id>', methods=['DELETE'])
@login_required
def delete_graduation(id):
    """Remove uma graduação"""
    graduation = MemberGraduation.query.get_or_404(id)
    
    if not check_member_access(graduation.member_status_id):
        return jsonify({'error': 'Acesso negado'}), 403
    
    try:
        db.session.delete(graduation)
        db.session.commit()
        return jsonify({'message': 'Graduação removida com sucesso'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao remover graduação: {str(e)}'}), 500

@member_graduations_bp.route('/graduations/<int:id>/set-current', methods=['POST'])
@login_required
def set_graduation_as_current(id):
    """Define uma graduação como atual"""
    graduation = MemberGraduation.query.get_or_404(id)
    
    if not check_member_access(graduation.member_status_id):
        return jsonify({'error': 'Acesso negado'}), 403
    
    try:
        graduation.set_as_current()
        return jsonify(graduation.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao definir graduação como atual: {str(e)}'}), 500

