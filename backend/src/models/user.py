from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='dojo_user')  # admin, dojo_user
    dojo_id = db.Column(db.Integer, db.ForeignKey('dojo.id'), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamento com dojo
    dojo = db.relationship('Dojo', backref='users', lazy=True)

    def set_password(self, password):
        """Define a senha do usuário com hash"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verifica se a senha está correta"""
        return check_password_hash(self.password_hash, password)

    def is_admin(self):
        """Verifica se o usuário é administrador"""
        return self.role == 'admin'

    def can_access_dojo(self, dojo_id):
        """Verifica se o usuário pode acessar dados de um dojo específico"""
        if self.is_admin():
            return True
        return self.dojo_id == dojo_id

    def __repr__(self):
        return f'<User {self.email}>'

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'dojo_id': self.dojo_id,
            'dojo_name': self.dojo.name if self.dojo else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

