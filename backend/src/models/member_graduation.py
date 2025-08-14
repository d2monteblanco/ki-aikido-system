from src.models.user import db
from datetime import datetime

class MemberGraduation(db.Model):
    """Tabela para histórico de graduações dos membros"""
    __tablename__ = 'member_graduation'
    
    id = db.Column(db.Integer, primary_key=True)
    member_status_id = db.Column(db.Integer, db.ForeignKey('member_status.id'), nullable=False)
    discipline = db.Column(db.String(100), nullable=False)  # 'Shinshin Toitsudo' ou 'Shinshin Toitsu Aikido'
    rank_name = db.Column(db.String(100), nullable=False)  # Nome da graduação
    rank_level = db.Column(db.Integer, nullable=True)  # Nível numérico para ordenação
    examination_date = db.Column(db.Date, nullable=True)  # Data do exame
    certificate_number = db.Column(db.String(100), nullable=True)  # Número do certificado
    certificate_status = db.Column(db.String(50), nullable=False, default='pending')  # issued, pending, to-be-filed
    is_current = db.Column(db.Boolean, default=False)  # Indica se é a graduação atual
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Constantes para disciplinas
    DISCIPLINES = {
        'Shinshin Toitsudo': 'Shinshin Toitsudo',
        'Shinshin Toitsu Aikido': 'Shinshin Toitsu Aikido'
    }
    
    # Constantes para status de certificado
    CERTIFICATE_STATUS = {
        'issued': 'Emitido',
        'pending': 'Pendente',
        'to-be-filed': 'A ser arquivado'
    }
    
    # Graduações Shinshin Toitsudo
    TOITSUDO_RANKS = {
        'Shokyu': {'level': 1, 'display': 'Shokyu (Básico)'},
        'Chukyu': {'level': 2, 'display': 'Chukyu (Intermediário)'},
        'Jokyu': {'level': 3, 'display': 'Jokyu (Avançado)'},
        'Okuden': {'level': 4, 'display': 'Okuden (Mestre)'}
    }
    
    # Graduações Shinshin Toitsu Aikido
    AIKIDO_RANKS = {
        '5th Kyu': {'level': 1, 'display': '5º Kyu'},
        '4th Kyu': {'level': 2, 'display': '4º Kyu'},
        '3rd Kyu': {'level': 3, 'display': '3º Kyu'},
        '2nd Kyu': {'level': 4, 'display': '2º Kyu'},
        '1st Kyu': {'level': 5, 'display': '1º Kyu'},
        'Shodan': {'level': 6, 'display': 'Shodan (1º Dan)'},
        'Nidan': {'level': 7, 'display': 'Nidan (2º Dan)'},
        'Sandan': {'level': 8, 'display': 'Sandan (3º Dan)'},
        'Yondan': {'level': 9, 'display': 'Yondan (4º Dan)'},
        'Godan': {'level': 10, 'display': 'Godan (5º Dan)'},
        'Rokudan': {'level': 11, 'display': 'Rokudan (6º Dan)'},
        'Shichidan': {'level': 12, 'display': 'Shichidan (7º Dan)'},
        'Hachidan': {'level': 13, 'display': 'Hachidan (8º Dan)'}
    }
    
    def __repr__(self):
        return f'<MemberGraduation {self.rank_name} - {self.discipline}>'
    
    @classmethod
    def get_rank_level(cls, discipline, rank_name):
        """Retorna o nível numérico de uma graduação"""
        if discipline == 'Shinshin Toitsudo':
            return cls.TOITSUDO_RANKS.get(rank_name, {}).get('level', 0)
        elif discipline == 'Shinshin Toitsu Aikido':
            return cls.AIKIDO_RANKS.get(rank_name, {}).get('level', 0)
        return 0
    
    @classmethod
    def get_rank_display(cls, discipline, rank_name):
        """Retorna o nome de exibição de uma graduação"""
        if discipline == 'Shinshin Toitsudo':
            return cls.TOITSUDO_RANKS.get(rank_name, {}).get('display', rank_name)
        elif discipline == 'Shinshin Toitsu Aikido':
            return cls.AIKIDO_RANKS.get(rank_name, {}).get('display', rank_name)
        return rank_name
    
    @classmethod
    def get_available_ranks(cls, discipline):
        """Retorna as graduações disponíveis para uma disciplina"""
        if discipline == 'Shinshin Toitsudo':
            return cls.TOITSUDO_RANKS
        elif discipline == 'Shinshin Toitsu Aikido':
            return cls.AIKIDO_RANKS
        return {}
    
    def save(self):
        """Salva a graduação e atualiza o rank_level automaticamente"""
        if not self.rank_level:
            self.rank_level = self.get_rank_level(self.discipline, self.rank_name)
        db.session.add(self)
        db.session.commit()
    
    def set_as_current(self):
        """Define esta graduação como atual para a disciplina"""
        # Remove o status atual de outras graduações da mesma disciplina
        other_grads = MemberGraduation.query.filter_by(
            member_status_id=self.member_status_id,
            discipline=self.discipline
        ).filter(MemberGraduation.id != self.id).all()
        
        for grad in other_grads:
            grad.is_current = False
        
        self.is_current = True
        db.session.commit()
    
    def to_dict(self):
        return {
            'id': self.id,
            'member_status_id': self.member_status_id,
            'discipline': self.discipline,
            'rank_name': self.rank_name,
            'rank_display': self.get_rank_display(self.discipline, self.rank_name),
            'rank_level': self.rank_level,
            'examination_date': self.examination_date.isoformat() if self.examination_date else None,
            'certificate_number': self.certificate_number,
            'certificate_status': self.certificate_status,
            'certificate_status_display': self.CERTIFICATE_STATUS.get(self.certificate_status, self.certificate_status),
            'is_current': self.is_current,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

