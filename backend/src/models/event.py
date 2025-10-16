from src.models.user import db
from datetime import datetime

class Event(db.Model):
    """Modelo para eventos do calendário"""
    __tablename__ = 'events'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Informações básicas
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50), nullable=False)  # exame, seminario, aula_especial, aula_regular, evento_social, aviso, outro
    
    # Tipo e propriedade
    event_type = db.Column(db.String(20), nullable=False)  # admin, dojo
    dojo_id = db.Column(db.Integer, db.ForeignKey('dojo.id'), nullable=True)  # null para eventos admin
    
    # Data/hora
    start_datetime = db.Column(db.DateTime, nullable=False)
    end_datetime = db.Column(db.DateTime, nullable=False)
    all_day = db.Column(db.Boolean, default=False)
    
    # Status
    status = db.Column(db.String(20), default='active')  # active, suspended, cancelled, completed
    suspension_reason = db.Column(db.String(200))
    
    # Recorrência
    is_recurring = db.Column(db.Boolean, default=False)
    recurrence_pattern = db.Column(db.String(50))  # daily, weekly, monthly, yearly
    recurrence_interval = db.Column(db.Integer, default=1)  # a cada X dias/semanas/meses
    recurrence_days = db.Column(db.String(50))  # dias da semana (formato JSON: "1,3,5" para seg,qua,sex)
    recurrence_end_date = db.Column(db.DateTime)
    recurrence_count = db.Column(db.Integer)  # número de ocorrências
    series_id = db.Column(db.String(50))  # identificador da série de eventos recorrentes
    parent_event_id = db.Column(db.Integer, db.ForeignKey('events.id'))  # referência ao evento pai se for ocorrência
    is_exception = db.Column(db.Boolean, default=False)  # se é uma exceção na série
    
    # Localização
    location = db.Column(db.String(200))
    
    # Prioridade de aviso
    reminder_priority = db.Column(db.String(20), default='medium')  # high, medium, low
    
    # Auditoria
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    dojo = db.relationship('Dojo', backref='events')
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_events')
    parent_event = db.relationship('Event', remote_side=[id], backref='occurrences')
    reminders = db.relationship('EventReminder', backref='event', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Converte o evento para dicionário"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'event_type': self.event_type,
            'dojo_id': self.dojo_id,
            'dojo_name': self.dojo.name if self.dojo else None,
            'start_datetime': self.start_datetime.isoformat() if self.start_datetime else None,
            'end_datetime': self.end_datetime.isoformat() if self.end_datetime else None,
            'all_day': self.all_day,
            'status': self.status,
            'suspension_reason': self.suspension_reason,
            'is_recurring': self.is_recurring,
            'recurrence_pattern': self.recurrence_pattern,
            'recurrence_interval': self.recurrence_interval,
            'recurrence_days': self.recurrence_days,
            'recurrence_end_date': self.recurrence_end_date.isoformat() if self.recurrence_end_date else None,
            'recurrence_count': self.recurrence_count,
            'series_id': self.series_id,
            'parent_event_id': self.parent_event_id,
            'is_exception': self.is_exception,
            'location': self.location,
            'reminder_priority': self.reminder_priority,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class EventReminder(db.Model):
    """Modelo para avisos/lembretes de eventos"""
    __tablename__ = 'event_reminders'
    
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    
    # Configuração do aviso
    days_before = db.Column(db.Integer, nullable=False)  # quantos dias antes do evento
    reminder_type = db.Column(db.String(20), nullable=False)  # banner, badge, popup
    message = db.Column(db.Text)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    triggered_at = db.Column(db.DateTime)  # quando o aviso foi disparado
    
    # Auditoria
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Converte o aviso para dicionário"""
        return {
            'id': self.id,
            'event_id': self.event_id,
            'days_before': self.days_before,
            'reminder_type': self.reminder_type,
            'message': self.message,
            'is_active': self.is_active,
            'triggered_at': self.triggered_at.isoformat() if self.triggered_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class EventOccurrence(db.Model):
    """Modelo para ocorrências de eventos recorrentes (cache para performance)"""
    __tablename__ = 'event_occurrences'
    
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    series_id = db.Column(db.String(50), nullable=False)
    
    # Data/hora da ocorrência específica
    occurrence_date = db.Column(db.DateTime, nullable=False)
    end_datetime = db.Column(db.DateTime, nullable=False)
    
    # Status específico desta ocorrência
    status = db.Column(db.String(20), default='active')  # active, suspended, cancelled, completed
    suspension_reason = db.Column(db.String(200))
    
    # Override de dados (se diferente do evento pai)
    override_title = db.Column(db.String(200))
    override_description = db.Column(db.Text)
    override_location = db.Column(db.String(200))
    
    # Auditoria
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamento
    event = db.relationship('Event', backref=db.backref('cached_occurrences', cascade='all, delete-orphan'))
    
    def to_dict(self):
        """Converte a ocorrência para dicionário"""
        return {
            'id': self.id,
            'event_id': self.event_id,
            'series_id': self.series_id,
            'occurrence_date': self.occurrence_date.isoformat() if self.occurrence_date else None,
            'end_datetime': self.end_datetime.isoformat() if self.end_datetime else None,
            'status': self.status,
            'suspension_reason': self.suspension_reason,
            'override_title': self.override_title,
            'override_description': self.override_description,
            'override_location': self.override_location,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
