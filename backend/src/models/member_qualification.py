from src.models.user import db
from datetime import datetime

class MemberQualification(db.Model):
    """Tabela para qualificações especiais dos membros"""
    __tablename__ = 'member_qualification'
    
    id = db.Column(db.Integer, primary_key=True)
    member_status_id = db.Column(db.Integer, db.ForeignKey('member_status.id'), nullable=False)
    qualification_type = db.Column(db.String(100), nullable=False)  # examiner, instructor
    qualification_level = db.Column(db.String(100), nullable=True)  # Nível da qualificação
    date_obtained = db.Column(db.Date, nullable=True)  # Data de obtenção
    certificate_number = db.Column(db.String(100), nullable=True)  # Número do certificado
    document_path = db.Column(db.String(500), nullable=True)  # Caminho do certificado digitalizado (OPCIONAL)
    is_active = db.Column(db.Boolean, default=True)  # Se a qualificação está ativa
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Constantes para tipos de qualificação
    QUALIFICATION_TYPES = {
        'examiner': 'Examinador',
        'lecturer': 'Instrutor',
    }
    
    # Níveis de qualificação para examinadores
    EXAMINER_LEVELS = {
        'assistente': 'Assistente',
        'companheiro': 'Companheiro',
        'pleno': 'Pleno'
    }
    
    # Níveis de qualificação para instrutores
    INSTRUCTOR_LEVELS = {
        'assistente': 'Assistente',
        'companheiro': 'Companheiro',
        'pleno': 'Pleno'
    }
    
    def __repr__(self):
        return f'<MemberQualification {self.qualification_type} - {self.qualification_level}>'
    
    @classmethod
    def get_available_levels(cls, qualification_type):
        """Retorna os níveis disponíveis para um tipo de qualificação"""
        if qualification_type == 'examiner' or qualification_type == 'special_examiner':
            return cls.EXAMINER_LEVELS
        elif qualification_type == 'lecturer':
            return cls.INSTRUCTOR_LEVELS
        return {}
    
    def get_qualification_display(self):
        """Retorna o nome de exibição da qualificação"""
        type_display = self.QUALIFICATION_TYPES.get(self.qualification_type, self.qualification_type)
        
        if self.qualification_level:
            levels = self.get_available_levels(self.qualification_type)
            level_display = levels.get(self.qualification_level, self.qualification_level)
            return f"{type_display} - {level_display}"
        
        return type_display
    
    def to_dict(self):
        return {
            'id': self.id,
            'member_status_id': self.member_status_id,
            'qualification_type': self.qualification_type,
            'qualification_type_display': self.QUALIFICATION_TYPES.get(self.qualification_type, self.qualification_type),
            'qualification_level': self.qualification_level,
            'qualification_display': self.get_qualification_display(),
            'date_obtained': self.date_obtained.isoformat() if self.date_obtained else None,
            'certificate_number': self.certificate_number,
            'document_path': self.document_path,
            'has_document': bool(self.document_path),
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }