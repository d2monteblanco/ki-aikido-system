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
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def get_stats(self):
        """Retorna estatísticas do dojo"""
        active_students = [s for s in self.students if s.status == 'active']
        return {
            'total_students': len(self.students),
            'active_students': len(active_students),
            'pending_students': len([s for s in self.students if s.status == 'pending']),
            'inactive_students': len([s for s in self.students if s.status == 'inactive'])
        }

