from src.models.user import db
from datetime import datetime

class DocumentAttachment(db.Model):
    """Tabela para documentos e fotos anexadas (certificados, fotos de membros)"""
    __tablename__ = 'document_attachment'
    
    id = db.Column(db.Integer, primary_key=True)
    file_name = db.Column(db.String(255), nullable=False)  # Nome original do arquivo
    file_path = db.Column(db.String(500), nullable=False)  # Caminho no servidor
    file_type = db.Column(db.String(100), nullable=False)  # MIME type
    file_size = db.Column(db.Integer, nullable=False)  # Tamanho em bytes
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    uploaded_by_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    document_type = db.Column(db.String(50), nullable=False)  # 'graduation', 'qualification', 'member_photo'
    related_id = db.Column(db.Integer, nullable=False)  # ID da graduação, qualificação ou member_status
    
    # Campos de verificação (Sprint 4)
    is_verified = db.Column(db.Boolean, default=False)  # Se documento foi verificado
    verified_at = db.Column(db.DateTime, nullable=True)  # Data da verificação
    verified_by_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Quem verificou
    verification_notes = db.Column(db.String(500), nullable=True)  # Notas sobre verificação
    
    # Relacionamento com usuário
    uploaded_by = db.relationship('User', backref='uploaded_documents', foreign_keys=[uploaded_by_user_id])
    verified_by = db.relationship('User', foreign_keys=[verified_by_user_id])
    
    # Constantes para tipos de documentos
    DOCUMENT_TYPES = {
        'graduation': 'Certificado de Graduação',
        'qualification': 'Certificado de Qualificação',
        'member_photo': 'Foto do Membro'
    }
    
    # Formatos permitidos
    ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg']
    ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    
    def __repr__(self):
        return f'<DocumentAttachment {self.file_name} - {self.document_type}>'
    
    @classmethod
    def is_valid_type(cls, mime_type, document_type):
        """Valida se o MIME type é permitido para o tipo de documento"""
        if document_type == 'member_photo':
            return mime_type in cls.ALLOWED_IMAGE_TYPES
        else:  # graduation ou qualification
            return mime_type in cls.ALLOWED_DOCUMENT_TYPES
    
    def to_dict(self):
        return {
            'id': self.id,
            'file_name': self.file_name,
            'file_path': self.file_path,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'uploaded_by_user_id': self.uploaded_by_user_id,
            'uploaded_by_name': self.uploaded_by.name if self.uploaded_by else None,
            'document_type': self.document_type,
            'document_type_display': self.DOCUMENT_TYPES.get(self.document_type, self.document_type),
            'related_id': self.related_id,
            'is_verified': self.is_verified,
            'verified_at': self.verified_at.isoformat() if self.verified_at else None,
            'verified_by_user_id': self.verified_by_user_id,
            'verified_by_name': self.verified_by.name if self.verified_by else None,
            'verification_notes': self.verification_notes
        }
    
    def verify(self, user_id, notes=None):
        """Marca documento como verificado"""
        self.is_verified = True
        self.verified_at = datetime.utcnow()
        self.verified_by_user_id = user_id
        self.verification_notes = notes
        db.session.commit()
    
    def unverify(self):
        """Remove verificação do documento"""
        self.is_verified = False
        self.verified_at = None
        self.verified_by_user_id = None
        self.verification_notes = None
        db.session.commit()
