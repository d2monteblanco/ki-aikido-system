from src.models.user import db
from datetime import datetime

class MemberStatus(db.Model):
    """Tabela para informações de status organizacional dos membros"""
    __tablename__ = 'member_status'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False, unique=True)
    registered_number = db.Column(db.String(50), unique=True, nullable=True)  # Número oficial de registro
    membership_date = db.Column(db.Date, nullable=True)  # Data de filiação/ingresso
    member_type = db.Column(db.String(50), nullable=False, default='student')  # student, instructor, chief_instructor
    current_status = db.Column(db.String(50), nullable=False, default='active')  # active, inactive, pending
    last_activity_year = db.Column(db.Integer, nullable=True)  # Último ano de atividade
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    student = db.relationship('Student', backref=db.backref('member_status', uselist=False))
    graduations = db.relationship('MemberGraduation', backref='member_status', lazy=True, cascade='all, delete-orphan')
    qualifications = db.relationship('MemberQualification', backref='member_status', lazy=True, cascade='all, delete-orphan')
    
    # Constantes para tipos de membro
    MEMBER_TYPES = {
        'student': 'Estudante',
        'instructor': 'Instrutor',
        'chief_instructor': 'Instrutor Chefe'
    }
    
    # Constantes para status
    STATUS_TYPES = {
        'active': 'Ativo',
        'inactive': 'Inativo',
        'pending': 'Pendente'
    }
    
    def __repr__(self):
        return f'<MemberStatus {self.student.name if self.student else "Unknown"}>'
    
    def get_current_graduations(self):
        """Retorna as graduações atuais por disciplina"""
        current_grads = {}
        for grad in self.graduations:
            if grad.is_current:
                current_grads[grad.discipline] = grad
        return current_grads
    
    def get_highest_graduation(self, discipline):
        """Retorna a graduação mais alta em uma disciplina específica"""
        grads = [g for g in self.graduations if g.discipline == discipline]
        if not grads:
            return None
        return max(grads, key=lambda x: x.rank_level or 0)
    
    def to_dict(self):
        current_grads = self.get_current_graduations()
        
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else None,
            'registered_number': self.registered_number,
            'membership_date': self.membership_date.isoformat() if self.membership_date else None,
            'member_type': self.member_type,
            'member_type_display': self.MEMBER_TYPES.get(self.member_type, self.member_type),
            'current_status': self.current_status,
            'current_status_display': self.STATUS_TYPES.get(self.current_status, self.current_status),
            'last_activity_year': self.last_activity_year,
            'current_graduations': {
                discipline: grad.to_dict() for discipline, grad in current_grads.items()
            },
            'total_graduations': len(self.graduations),
            'total_qualifications': len(self.qualifications),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def to_summary(self):
        """Retorna um resumo para listagens"""
        current_grads = self.get_current_graduations()
        
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else None,
            'registered_number': self.registered_number,
            'member_type': self.member_type,
            'member_type_display': self.MEMBER_TYPES.get(self.member_type, self.member_type),
            'current_status': self.current_status,
            'current_graduations': {
                discipline: {
                    'rank_name': grad.rank_name,
                    'rank_level': grad.rank_level
                } for discipline, grad in current_grads.items()
            }
        }

