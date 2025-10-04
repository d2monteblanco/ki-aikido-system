from src.models.user import db
from datetime import datetime

class Dojo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    address = db.Column(db.Text, nullable=True)
    contact_email = db.Column(db.String(120), nullable=True)
    contact_phone = db.Column(db.String(20), nullable=True)
    responsible_instructor = db.Column(db.String(255), nullable=True)
    registration_number = db.Column(db.String(50), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamento com estudantes
    students = db.relationship('Student', backref='dojo', lazy=True)

    def __repr__(self):
        return f'<Dojo {self.name}>'

    def to_dict(self):
        # Calcular membros ativos (estudantes com member_status ativo)
        from src.models.member_status import MemberStatus
        active_members = 0
        if self.students:
            for student in self.students:
                member_status = MemberStatus.query.filter_by(student_id=student.id).first()
                if member_status and member_status.current_status == 'active':
                    active_members += 1
        
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'contact_email': self.contact_email,
            'contact_phone': self.contact_phone,
            'responsible_instructor': self.responsible_instructor,
            'registration_number': self.registration_number,
            'is_active': self.is_active,
            'student_count': len(self.students) if self.students else 0,
            'active_members': active_members,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def get_stats(self):
        """Retorna estatísticas do dojo"""
        from src.models.member_status import MemberStatus
        
        # Contar estudantes por status em member_status
        active_count = 0
        inactive_count = 0
        pending_count = 0
        
        for student in self.students:
            member_status = MemberStatus.query.filter_by(student_id=student.id).first()
            if member_status:
                if member_status.current_status == 'active':
                    active_count += 1
                elif member_status.current_status == 'inactive':
                    inactive_count += 1
                elif member_status.current_status == 'pending':
                    pending_count += 1
        
        return {
            'total_students': len(self.students),
            'active_students': active_count,
            'pending_students': pending_count,
            'inactive_students': inactive_count
        }

