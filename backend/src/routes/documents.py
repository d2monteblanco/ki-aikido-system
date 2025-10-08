from flask import Blueprint, request, jsonify, send_file, current_app
from src.models import db, User, MemberStatus, MemberGraduation, MemberQualification, DocumentAttachment
from src.utils import create_all_thumbnails, optimize_image, is_valid_image
from src.routes.auth import login_required, get_current_user
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
import mimetypes

documents_bp = Blueprint('documents', __name__)

def allowed_file(filename):
    """Verifica se a extensão do arquivo é permitida"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def get_mime_type(filename):
    """Retorna o MIME type do arquivo"""
    mime_type, _ = mimetypes.guess_type(filename)
    return mime_type or 'application/octet-stream'

def generate_unique_filename(original_filename):
    """Gera um nome único para o arquivo"""
    ext = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
    unique_name = f"{uuid.uuid4().hex}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    return f"{unique_name}.{ext}" if ext else unique_name

def check_access_permission(user, related_object):
    """Verifica se o usuário tem permissão para acessar o documento"""
    if user.role == 'admin':
        return True
    
    # Encontrar o dojo relacionado ao objeto
    dojo_id = None
    if hasattr(related_object, 'student'):
        dojo_id = related_object.student.dojo_id
    elif hasattr(related_object, 'member_status'):
        if related_object.member_status.student:
            dojo_id = related_object.member_status.student.dojo_id
    
    return user.dojo_id == dojo_id

@documents_bp.route('/documents/upload', methods=['POST'])
@login_required
def upload_document():
    """Upload de documento (certificado ou foto)"""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    # Verificar se há arquivo na requisição
    if 'file' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
    
    # Obter parâmetros
    document_type = request.form.get('document_type')  # 'graduation', 'qualification', 'member_photo'
    related_id = request.form.get('related_id')
    
    if not document_type or not related_id:
        return jsonify({'error': 'Tipo de documento e ID relacionado são obrigatórios'}), 400
    
    try:
        related_id = int(related_id)
    except ValueError:
        return jsonify({'error': 'ID relacionado inválido'}), 400
    
    # Validar tipo de documento
    if document_type not in ['graduation', 'qualification', 'member_photo']:
        return jsonify({'error': 'Tipo de documento inválido'}), 400
    
    # Verificar se o arquivo é permitido
    if not allowed_file(file.filename):
        return jsonify({'error': 'Tipo de arquivo não permitido. Use PDF, JPG ou PNG'}), 400
    
    # Verificar MIME type real
    mime_type = get_mime_type(file.filename)
    if not DocumentAttachment.is_valid_type(mime_type, document_type):
        if document_type == 'member_photo':
            return jsonify({'error': 'Fotos devem ser em formato JPG ou PNG'}), 400
        else:
            return jsonify({'error': 'Certificados devem ser em formato PDF, JPG ou PNG'}), 400
    
    # Verificar se o objeto relacionado existe e se o usuário tem permissão
    related_object = None
    if document_type == 'graduation':
        related_object = MemberGraduation.query.get(related_id)
        if not related_object:
            return jsonify({'error': 'Graduação não encontrada'}), 404
    elif document_type == 'qualification':
        related_object = MemberQualification.query.get(related_id)
        if not related_object:
            return jsonify({'error': 'Qualificação não encontrada'}), 404
    elif document_type == 'member_photo':
        related_object = MemberStatus.query.get(related_id)
        if not related_object:
            return jsonify({'error': 'Status de membro não encontrado'}), 404
    
    # Verificar permissão de acesso
    if not check_access_permission(user, related_object):
        return jsonify({'error': 'Sem permissão para fazer upload neste registro'}), 403
    
    # Gerar nome único e salvar arquivo
    unique_filename = generate_unique_filename(secure_filename(file.filename))
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
    
    try:
        file.save(file_path)
        file_size = os.path.getsize(file_path)
        
        # Se for imagem, validar, otimizar e criar thumbnails
        thumbnails_created = {}
        if mime_type.startswith('image/'):
            # Validar que é uma imagem real
            if not is_valid_image(file_path):
                os.remove(file_path)
                return jsonify({'error': 'Arquivo corrompido ou não é uma imagem válida'}), 400
            
            # Otimizar imagem original (reduzir qualidade/tamanho)
            optimize_image(file_path, max_size=(1920, 1920), quality=85)
            
            # Criar thumbnails
            thumbnails_created = create_all_thumbnails(file_path, current_app.config['UPLOAD_FOLDER'])
            
            # Atualizar tamanho do arquivo após otimização
            file_size = os.path.getsize(file_path)
        
        # Criar registro no banco de dados
        document = DocumentAttachment(
            file_name=file.filename,
            file_path=unique_filename,
            file_type=mime_type,
            file_size=file_size,
            uploaded_by_user_id=user.id,
            document_type=document_type,
            related_id=related_id
        )
        db.session.add(document)
        
        # Atualizar campo document_path ou photo_path no modelo relacionado
        if document_type == 'graduation':
            related_object.document_path = unique_filename
        elif document_type == 'qualification':
            related_object.document_path = unique_filename
        elif document_type == 'member_photo':
            related_object.photo_path = unique_filename
        
        db.session.commit()
        
        response_data = {
            'message': 'Arquivo enviado com sucesso',
            'document': document.to_dict()
        }
        
        # Adicionar info de thumbnails se foram criados
        if thumbnails_created:
            response_data['thumbnails'] = thumbnails_created
            response_data['message'] += f' ({len(thumbnails_created)} thumbnails gerados)'
        
        return jsonify(response_data), 201
        
    except Exception as e:
        db.session.rollback()
        # Remover arquivo se houver erro no banco
        if os.path.exists(file_path):
            os.remove(file_path)
        # Remover thumbnails se foram criados
        if thumbnails_created:
            for thumb_file in thumbnails_created.values():
                thumb_path = os.path.join(current_app.config['UPLOAD_FOLDER'], thumb_file)
                if os.path.exists(thumb_path):
                    os.remove(thumb_path)
        return jsonify({'error': f'Erro ao salvar arquivo: {str(e)}'}), 500

@documents_bp.route('/documents/<int:document_id>', methods=['GET'])
@login_required
def get_document_metadata(document_id):
    """Obter metadados de um documento"""
    
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    document = DocumentAttachment.query.get(document_id)
    if not document:
        return jsonify({'error': 'Documento não encontrado'}), 404
    
    # Verificar permissão (buscar objeto relacionado)
    related_object = None
    if document.document_type == 'graduation':
        related_object = MemberGraduation.query.get(document.related_id)
    elif document.document_type == 'qualification':
        related_object = MemberQualification.query.get(document.related_id)
    elif document.document_type == 'member_photo':
        related_object = MemberStatus.query.get(document.related_id)
    
    if related_object and not check_access_permission(user, related_object):
        return jsonify({'error': 'Sem permissão para acessar este documento'}), 403
    
    return jsonify(document.to_dict()), 200

@documents_bp.route('/documents/<int:document_id>/view', methods=['GET'])
@login_required
def view_document(document_id):
    """Visualizar documento inline (sem download)"""
    
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    document = DocumentAttachment.query.get(document_id)
    if not document:
        return jsonify({'error': 'Documento não encontrado'}), 404
    
    # Verificar permissão
    related_object = None
    if document.document_type == 'graduation':
        related_object = MemberGraduation.query.get(document.related_id)
    elif document.document_type == 'qualification':
        related_object = MemberQualification.query.get(document.related_id)
    elif document.document_type == 'member_photo':
        related_object = MemberStatus.query.get(document.related_id)
    
    if related_object and not check_access_permission(user, related_object):
        return jsonify({'error': 'Sem permissão para acessar este documento'}), 403
    
    # Servir arquivo
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], document.file_path)
    if not os.path.exists(file_path):
        return jsonify({'error': 'Arquivo não encontrado no servidor'}), 404
    
    # Retornar arquivo com Content-Disposition: inline (visualização no navegador)
    return send_file(
        file_path,
        mimetype=document.file_type,
        as_attachment=False,  # inline, não download
        download_name=document.file_name
    )

@documents_bp.route('/documents/by-path/<path:file_path>/view', methods=['GET'])
@login_required
def view_document_by_path(file_path):
    """Visualizar documento por caminho (para compatibilidade com campos document_path)"""
    
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    # Buscar documento pelo file_path
    document = DocumentAttachment.query.filter_by(file_path=file_path).first()
    
    # Verificar permissão se documento existe
    if document:
        related_object = None
        if document.document_type == 'graduation':
            related_object = MemberGraduation.query.get(document.related_id)
        elif document.document_type == 'qualification':
            related_object = MemberQualification.query.get(document.related_id)
        elif document.document_type == 'member_photo':
            related_object = MemberStatus.query.get(document.related_id)
        
        if related_object and not check_access_permission(user, related_object):
            return jsonify({'error': 'Sem permissão para acessar este documento'}), 403
    
    # Servir arquivo
    full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], file_path)
    if not os.path.exists(full_path):
        return jsonify({'error': 'Arquivo não encontrado no servidor'}), 404
    
    # Detectar MIME type
    mime_type = get_mime_type(file_path)
    
    return send_file(
        full_path,
        mimetype=mime_type,
        as_attachment=False
    )

@documents_bp.route('/documents/<int:document_id>', methods=['DELETE'])
@login_required
def delete_document(document_id):
    """Remover documento"""
    
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    document = DocumentAttachment.query.get(document_id)
    if not document:
        return jsonify({'error': 'Documento não encontrado'}), 404
    
    # Verificar permissão (apenas admin ou quem fez upload)
    related_object = None
    if document.document_type == 'graduation':
        related_object = MemberGraduation.query.get(document.related_id)
    elif document.document_type == 'qualification':
        related_object = MemberQualification.query.get(document.related_id)
    elif document.document_type == 'member_photo':
        related_object = MemberStatus.query.get(document.related_id)
    
    if not (user.role == 'admin' or user.id == document.uploaded_by_user_id or 
            (related_object and check_access_permission(user, related_object))):
        return jsonify({'error': 'Sem permissão para remover este documento'}), 403
    
    # Remover arquivo físico
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], document.file_path)
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Erro ao remover arquivo: {e}")
    
    # Limpar campo document_path ou photo_path no modelo relacionado
    if related_object:
        if document.document_type == 'graduation':
            related_object.document_path = None
        elif document.document_type == 'qualification':
            related_object.document_path = None
        elif document.document_type == 'member_photo':
            related_object.photo_path = None
    
    # Remover registro do banco
    db.session.delete(document)
    db.session.commit()
    
    return jsonify({'message': 'Documento removido com sucesso'}), 200

@documents_bp.route('/documents/by-path/<path:file_path>/thumbnail/<size>', methods=['GET'])
@login_required
def view_thumbnail(file_path, size):
    """Visualizar thumbnail de um documento inline (sem download)"""
    
    # Validar tamanho
    valid_sizes = ['small', 'medium', 'large']
    if size not in valid_sizes:
        return jsonify({'error': 'Tamanho inválido. Use: small, medium ou large'}), 400
    
    # Construir caminho do thumbnail
    base_name = os.path.splitext(file_path)[0]
    thumb_filename = f"{base_name}_thumb_{size}.jpg"
    thumb_path = os.path.join(current_app.config['UPLOAD_FOLDER'], thumb_filename)
    
    # Se thumbnail não existe, retornar imagem original
    if not os.path.exists(thumb_path):
        full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], file_path)
        if not os.path.exists(full_path):
            return jsonify({'error': 'Arquivo não encontrado'}), 404
        thumb_path = full_path
    
    # Verificar permissão (buscar documento pelo path)
    document = DocumentAttachment.query.filter_by(file_path=file_path).first()
    if document:
        user = get_current_user()
        # Verificar acesso pelo tipo de documento
        if document.document_type == 'graduation':
            related = MemberGraduation.query.get(document.related_id)
        elif document.document_type == 'qualification':
            related = MemberQualification.query.get(document.related_id)
        else:  # member_photo
            related = MemberStatus.query.get(document.related_id)
        
        if related and not check_access_permission(user, related):
            return jsonify({'error': 'Sem permissão para acessar este documento'}), 403
    
    # Servir arquivo inline
    return send_file(
        thumb_path,
        mimetype='image/jpeg',
        as_attachment=False,
        download_name=f'thumbnail_{size}.jpg'
    )
