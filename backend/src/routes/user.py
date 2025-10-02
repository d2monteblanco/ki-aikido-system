from flask import Blueprint, jsonify, request
from src.models.user import User, db
from src.routes.auth import login_required, admin_required, get_current_user

user_bp = Blueprint('user', __name__)

@user_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    """Lista todos os usuários - apenas admin"""
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@user_bp.route('/users', methods=['POST'])
@admin_required
def create_user():
    """Cria um novo usuário - apenas admin"""
    try:
        data = request.json
        
        if not data.get('email') or not data.get('password') or not data.get('name'):
            return jsonify({'error': 'Email, password and name are required'}), 400
        
        # Verifica se email já existe
        if User.query.filter_by(email=data['email'].lower().strip()).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        user = User(
            email=data['email'].lower().strip(),
            name=data['name'],
            role=data.get('role', 'dojo_user'),
            dojo_id=data.get('dojo_id'),
            is_active=data.get('is_active', True)
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify(user.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/<int:user_id>', methods=['GET'])
@login_required
def get_user(user_id):
    """Obtém informações de um usuário"""
    current = get_current_user()
    user = User.query.get_or_404(user_id)
    
    # Usuário pode ver seu próprio perfil, admin pode ver todos
    if not current.is_admin() and current.id != user_id:
        return jsonify({'error': 'Permission denied'}), 403
    
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
@login_required
def update_user(user_id):
    """Atualiza informações de um usuário"""
    try:
        current = get_current_user()
        user = User.query.get_or_404(user_id)
        
        # Usuário pode editar seu próprio perfil, admin pode editar todos
        if not current.is_admin() and current.id != user_id:
            return jsonify({'error': 'Permission denied'}), 403
        
        data = request.json
        
        # Campos que usuário normal pode editar
        if 'name' in data:
            user.name = data['name']
        
        # Apenas admin pode alterar role, dojo_id e is_active
        if current.is_admin():
            if 'role' in data:
                user.role = data['role']
            if 'dojo_id' in data:
                user.dojo_id = data['dojo_id']
            if 'is_active' in data:
                user.is_active = data['is_active']
            if 'email' in data:
                # Verifica se email já existe
                existing = User.query.filter_by(email=data['email'].lower().strip()).first()
                if existing and existing.id != user_id:
                    return jsonify({'error': 'Email already exists'}), 400
                user.email = data['email'].lower().strip()
        
        db.session.commit()
        return jsonify(user.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Deleta um usuário - apenas admin"""
    try:
        user = User.query.get_or_404(user_id)
        
        # Não permite deletar a si mesmo
        current = get_current_user()
        if current.id == user_id:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        db.session.delete(user)
        db.session.commit()
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/<int:user_id>/reset-password', methods=['POST'])
@admin_required
def reset_user_password(user_id):
    """Reset de senha de um usuário - apenas admin"""
    try:
        data = request.json
        
        if not data.get('new_password'):
            return jsonify({'error': 'New password is required'}), 400
        
        user = User.query.get_or_404(user_id)
        user.set_password(data['new_password'])
        
        db.session.commit()
        
        return jsonify({'message': 'Password reset successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/<int:user_id>/toggle-status', methods=['POST'])
@admin_required
def toggle_user_status(user_id):
    """Ativa/desativa um usuário - apenas admin"""
    try:
        user = User.query.get_or_404(user_id)
        
        # Não permite desativar a si mesmo
        current = get_current_user()
        if current.id == user_id:
            return jsonify({'error': 'Cannot deactivate your own account'}), 400
        
        user.is_active = not user.is_active
        db.session.commit()
        
        return jsonify({
            'message': f'User {"activated" if user.is_active else "deactivated"} successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/profile', methods=['GET'])
@login_required
def get_profile():
    """Obtém perfil do usuário atual"""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict())

@user_bp.route('/profile', methods=['PUT'])
@login_required
def update_profile():
    """Atualiza perfil do usuário atual"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.json
        
        # Campos que o usuário pode atualizar no próprio perfil
        if 'name' in data:
            user.name = data['name']
        
        db.session.commit()
        return jsonify(user.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/profile/change-password', methods=['POST'])
@login_required
def change_own_password():
    """Altera senha do usuário atual"""
    try:
        data = request.json
        
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        user.set_password(data['new_password'])
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
