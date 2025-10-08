"""
Rotas para relatórios e estatísticas de documentos
Sistema Ki Aikido - Sprint 4
"""

from flask import Blueprint, request, jsonify
from src.models import db, User, MemberStatus, MemberGraduation, MemberQualification, DocumentAttachment
from src.routes.auth import login_required, get_current_user
from sqlalchemy import func, and_, or_

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/reports/documents/pending', methods=['GET'])
@login_required
def get_pending_documents():
    """Relatório de documentos pendentes (não enviados ou não verificados)"""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    # Filtro por dojo (se não for admin)
    dojo_filter = user.dojo_id if user.role != 'admin' else None
    
    report = {
        'members_without_photo': [],
        'graduations_without_certificate': [],
        'qualifications_without_certificate': [],
        'unverified_documents': []
    }
    
    # Membros sem foto
    query = db.session.query(MemberStatus).join(MemberStatus.student)
    if dojo_filter:
        query = query.filter(MemberStatus.student.has(dojo_id=dojo_filter))
    
    members_without_photo = query.filter(
        or_(MemberStatus.photo_path == None, MemberStatus.photo_path == '')
    ).all()
    
    report['members_without_photo'] = [{
        'id': m.id,
        'student_id': m.student_id,
        'student_name': m.student.name if m.student else 'N/A',
        'registered_number': m.registered_number,
        'member_type': m.member_type_display
    } for m in members_without_photo]
    
    # Graduações sem certificado
    query = db.session.query(MemberGraduation).join(
        MemberStatus, MemberGraduation.member_status_id == MemberStatus.id
    ).join(MemberStatus.student)
    
    if dojo_filter:
        query = query.filter(MemberStatus.student.has(dojo_id=dojo_filter))
    
    graduations_without_cert = query.filter(
        or_(MemberGraduation.document_path == None, MemberGraduation.document_path == '')
    ).all()
    
    report['graduations_without_certificate'] = [{
        'id': g.id,
        'member_status_id': g.member_status_id,
        'student_name': g.member_status.student.name if g.member_status and g.member_status.student else 'N/A',
        'discipline': g.discipline,
        'rank_name': g.rank_display,
        'examination_date': g.examination_date.isoformat() if g.examination_date else None
    } for g in graduations_without_cert]
    
    # Qualificações sem certificado
    query = db.session.query(MemberQualification).join(
        MemberStatus, MemberQualification.member_status_id == MemberStatus.id
    ).join(MemberStatus.student)
    
    if dojo_filter:
        query = query.filter(MemberStatus.student.has(dojo_id=dojo_filter))
    
    qualifications_without_cert = query.filter(
        or_(MemberQualification.document_path == None, MemberQualification.document_path == '')
    ).all()
    
    report['qualifications_without_certificate'] = [{
        'id': q.id,
        'member_status_id': q.member_status_id,
        'student_name': q.member_status.student.name if q.member_status and q.member_status.student else 'N/A',
        'qualification_type': q.qualification_type_display,
        'qualification_level': q.qualification_level,
        'date_obtained': q.date_obtained.isoformat() if q.date_obtained else None
    } for q in qualifications_without_cert]
    
    # Documentos não verificados (apenas admin pode ver)
    if user.role == 'admin':
        unverified = DocumentAttachment.query.filter_by(is_verified=False).all()
        report['unverified_documents'] = [doc.to_dict() for doc in unverified]
    
    # Estatísticas
    report['statistics'] = {
        'total_members_without_photo': len(report['members_without_photo']),
        'total_graduations_without_certificate': len(report['graduations_without_certificate']),
        'total_qualifications_without_certificate': len(report['qualifications_without_certificate']),
        'total_unverified_documents': len(report['unverified_documents'])
    }
    
    return jsonify(report), 200

@reports_bp.route('/reports/documents/statistics', methods=['GET'])
@login_required
def get_documents_statistics():
    """Estatísticas gerais de documentos"""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    dojo_filter = user.dojo_id if user.role != 'admin' else None
    
    stats = {}
    
    # Membros
    members_query = db.session.query(MemberStatus).join(MemberStatus.student)
    if dojo_filter:
        members_query = members_query.filter(MemberStatus.student.has(dojo_id=dojo_filter))
    
    total_members = members_query.count()
    members_with_photo = members_query.filter(
        and_(MemberStatus.photo_path != None, MemberStatus.photo_path != '')
    ).count()
    
    stats['members'] = {
        'total': total_members,
        'with_photo': members_with_photo,
        'without_photo': total_members - members_with_photo,
        'percentage_with_photo': round((members_with_photo / total_members * 100) if total_members > 0 else 0, 1)
    }
    
    # Graduações
    grads_query = db.session.query(MemberGraduation).join(
        MemberStatus, MemberGraduation.member_status_id == MemberStatus.id
    ).join(MemberStatus.student)
    
    if dojo_filter:
        grads_query = grads_query.filter(MemberStatus.student.has(dojo_id=dojo_filter))
    
    total_grads = grads_query.count()
    grads_with_cert = grads_query.filter(
        and_(MemberGraduation.document_path != None, MemberGraduation.document_path != '')
    ).count()
    
    stats['graduations'] = {
        'total': total_grads,
        'with_certificate': grads_with_cert,
        'without_certificate': total_grads - grads_with_cert,
        'percentage_with_certificate': round((grads_with_cert / total_grads * 100) if total_grads > 0 else 0, 1)
    }
    
    # Qualificações
    quals_query = db.session.query(MemberQualification).join(
        MemberStatus, MemberQualification.member_status_id == MemberStatus.id
    ).join(MemberStatus.student)
    
    if dojo_filter:
        quals_query = quals_query.filter(MemberStatus.student.has(dojo_id=dojo_filter))
    
    total_quals = quals_query.count()
    quals_with_cert = quals_query.filter(
        and_(MemberQualification.document_path != None, MemberQualification.document_path != '')
    ).count()
    
    stats['qualifications'] = {
        'total': total_quals,
        'with_certificate': quals_with_cert,
        'without_certificate': total_quals - quals_with_cert,
        'percentage_with_certificate': round((quals_with_cert / total_quals * 100) if total_quals > 0 else 0, 1)
    }
    
    # Documentos (apenas admin)
    if user.role == 'admin':
        total_docs = DocumentAttachment.query.count()
        verified_docs = DocumentAttachment.query.filter_by(is_verified=True).count()
        
        stats['documents'] = {
            'total': total_docs,
            'verified': verified_docs,
            'unverified': total_docs - verified_docs,
            'percentage_verified': round((verified_docs / total_docs * 100) if total_docs > 0 else 0, 1),
            'by_type': {
                'member_photo': DocumentAttachment.query.filter_by(document_type='member_photo').count(),
                'graduation': DocumentAttachment.query.filter_by(document_type='graduation').count(),
                'qualification': DocumentAttachment.query.filter_by(document_type='qualification').count()
            }
        }
    
    return jsonify(stats), 200

@reports_bp.route('/reports/documents/verify/<int:document_id>', methods=['POST'])
@login_required
def verify_document(document_id):
    """Marca um documento como verificado (apenas admin)"""
    user = get_current_user()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Apenas administradores podem verificar documentos'}), 403
    
    document = DocumentAttachment.query.get(document_id)
    if not document:
        return jsonify({'error': 'Documento não encontrado'}), 404
    
    data = request.get_json() or {}
    notes = data.get('notes', '')
    
    document.verify(user.id, notes)
    
    return jsonify({
        'message': 'Documento verificado com sucesso',
        'document': document.to_dict()
    }), 200

@reports_bp.route('/reports/documents/unverify/<int:document_id>', methods=['POST'])
@login_required
def unverify_document(document_id):
    """Remove verificação de um documento (apenas admin)"""
    user = get_current_user()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Apenas administradores podem modificar verificações'}), 403
    
    document = DocumentAttachment.query.get(document_id)
    if not document:
        return jsonify({'error': 'Documento não encontrado'}), 404
    
    document.unverify()
    
    return jsonify({
        'message': 'Verificação removida com sucesso',
        'document': document.to_dict()
    }), 200
