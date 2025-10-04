from flask import Blueprint, request, jsonify
from src.models import db, Dojo, User
from src.routes.auth import login_required, get_current_user, admin_required

dojos_bp = Blueprint('dojos', __name__)

@dojos_bp.route('/dojos', methods=['GET'])
@login_required
def get_dojos():
    """Lista dojos - admin vê todos, usuário vê apenas o seu"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        if current_user.is_admin():
            # Admin vê todos os dojos
            dojos = Dojo.query.filter_by(is_active=True).order_by(Dojo.name.asc()).all()
        else:
            # Usuário vê apenas seu dojo
            if not current_user.dojo_id:
                return jsonify({'dojos': []}), 200
            dojo = Dojo.query.get(current_user.dojo_id)
            dojos = [dojo] if dojo and dojo.is_active else []
        
        return jsonify({
            'dojos': [dojo.to_dict() for dojo in dojos]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dojos_bp.route('/dojos/<int:dojo_id>', methods=['GET'])
@login_required
def get_dojo(dojo_id):
    """Obtém um dojo específico"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        dojo = Dojo.query.get(dojo_id)
        if not dojo:
            return jsonify({'error': 'Dojo not found'}), 404
        
        # Verifica se o usuário pode acessar este dojo
        if not current_user.can_access_dojo(dojo_id):
            return jsonify({'error': 'Access denied'}), 403
        
        return jsonify({'dojo': dojo.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dojos_bp.route('/dojos', methods=['POST'])
@admin_required
def create_dojo():
    """Cria um novo dojo (apenas admin)"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validação de campos obrigatórios
        if not data.get('name'):
            return jsonify({'error': 'Name is required'}), 400
        
        # Verifica se o nome já existe
        existing_dojo = Dojo.query.filter_by(name=data['name'].strip()).first()
        if existing_dojo:
            return jsonify({'error': 'Dojo name already exists'}), 400
        
        # Cria o dojo
        dojo = Dojo(
            name=data['name'].strip(),
            address=data.get('address', '').strip() if data.get('address') else None,
            contact_email=data.get('contact_email', '').strip() if data.get('contact_email') else None,
            contact_phone=data.get('contact_phone', '').strip() if data.get('contact_phone') else None,
            responsible_instructor=data.get('responsible_instructor', '').strip() if data.get('responsible_instructor') else None,
            registration_number=data.get('registration_number', '').strip() if data.get('registration_number') else None
        )
        
        db.session.add(dojo)
        db.session.commit()
        
        return jsonify({
            'message': 'Dojo created successfully',
            'dojo': dojo.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@dojos_bp.route('/dojos/<int:dojo_id>', methods=['PUT'])
@admin_required
def update_dojo(dojo_id):
    """Atualiza um dojo (apenas admin)"""
    try:
        dojo = Dojo.query.get(dojo_id)
        if not dojo:
            return jsonify({'error': 'Dojo not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Atualiza campos permitidos
        if 'name' in data:
            new_name = data['name'].strip()
            if new_name != dojo.name:
                # Verifica se o novo nome já existe
                existing = Dojo.query.filter_by(name=new_name).first()
                if existing:
                    return jsonify({'error': 'Dojo name already exists'}), 400
                dojo.name = new_name
        
        if 'address' in data:
            dojo.address = data['address'].strip() if data['address'] else None
        
        if 'contact_email' in data:
            dojo.contact_email = data['contact_email'].strip() if data['contact_email'] else None
        
        if 'contact_phone' in data:
            dojo.contact_phone = data['contact_phone'].strip() if data['contact_phone'] else None
        
        if 'responsible_instructor' in data:
            dojo.responsible_instructor = data['responsible_instructor'].strip() if data['responsible_instructor'] else None
        
        if 'registration_number' in data:
            dojo.registration_number = data['registration_number'].strip() if data['registration_number'] else None
        
        if 'is_active' in data:
            dojo.is_active = bool(data['is_active'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Dojo updated successfully',
            'dojo': dojo.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@dojos_bp.route('/dojos/<int:dojo_id>', methods=['DELETE'])
@admin_required
def delete_dojo(dojo_id):
    """Exclui um dojo (apenas admin)"""
    try:
        dojo = Dojo.query.get(dojo_id)
        if not dojo:
            return jsonify({'error': 'Dojo not found'}), 404
        
        # Verifica se há estudantes vinculados ao dojo
        from src.models.student import Student
        student_count = Student.query.filter_by(dojo_id=dojo_id).count()
        
        if student_count > 0:
            return jsonify({
                'error': f'Cannot delete dojo. There are {student_count} student(s) linked to this dojo. Please reassign or delete them first.'
            }), 400
        
        # Verifica se há usuários vinculados ao dojo
        user_count = User.query.filter_by(dojo_id=dojo_id).count()
        
        if user_count > 0:
            return jsonify({
                'error': f'Cannot delete dojo. There are {user_count} user(s) linked to this dojo. Please reassign or delete them first.'
            }), 400
        
        # Se não há dependências, pode excluir
        db.session.delete(dojo)
        db.session.commit()
        
        return jsonify({
            'message': 'Dojo deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@dojos_bp.route('/dojos/<int:dojo_id>/stats', methods=['GET'])
@login_required
def get_dojo_stats(dojo_id):
    """Retorna estatísticas de um dojo"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Verifica se o usuário pode acessar este dojo
        if not current_user.can_access_dojo(dojo_id):
            return jsonify({'error': 'Access denied'}), 403
        
        dojo = Dojo.query.get(dojo_id)
        if not dojo:
            return jsonify({'error': 'Dojo not found'}), 404
        
        stats = dojo.get_stats()
        
        return jsonify({
            'dojo_id': dojo_id,
            'dojo_name': dojo.name,
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

