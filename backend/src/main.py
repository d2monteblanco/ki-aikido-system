import sys
import os
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from datetime import datetime
import uuid
from src.models import db, User, Dojo, Student, MemberStatus, MemberGraduation, MemberQualification, DocumentAttachment, Event, EventReminder, EventOccurrence
from src.routes.auth import auth_bp
from src.routes.students import students_bp
from src.routes.dojos import dojos_bp
from src.routes.member_status import member_status_bp
from src.routes.member_graduations import member_graduations_bp
from src.routes.member_qualifications import member_qualifications_bp
from src.routes.user import user_bp
from src.routes.documents import documents_bp
from src.routes.reports import reports_bp
from src.routes.events import events_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Configurações
app.config['SECRET_KEY'] = 'ki-aikido-secret-key-2024'
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configuração de uploads
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads', 'documents')
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'jpg', 'jpeg', 'png'}

# Configuração de sessão
app.config['SESSION_COOKIE_SECURE'] = False  # Para desenvolvimento
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# CORS para permitir requisições do frontend
CORS(app, 
     supports_credentials=True,
     origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8080", "http://127.0.0.1:8080", "null", "https://5000-izgjrvq6mcow7rda4z9gz-53bb438c.manus.computer", "file://"],  # null para file://
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(students_bp, url_prefix='/api')
app.register_blueprint(dojos_bp, url_prefix='/api')
app.register_blueprint(member_status_bp, url_prefix='/api')
app.register_blueprint(member_graduations_bp, url_prefix='/api')
app.register_blueprint(member_qualifications_bp, url_prefix='/api')
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(documents_bp, url_prefix='/api')
app.register_blueprint(reports_bp, url_prefix='/api')
app.register_blueprint(events_bp, url_prefix='/api')

# Criar diretório de uploads se não existir
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Inicializar banco de dados
db.init_app(app)

@app.route('/api/health')
def health_check():
    """Endpoint de verificação de saúde da API"""
    return jsonify({
        'status': 'OK',
        'message': 'Ki Aikido Students API está funcionando',
        'version': '1.0.0'
    }), 200

def init_database():
    """Inicializa o banco de dados com dados de exemplo"""
    with app.app_context():
        # Criar todas as tabelas
        db.create_all()
        
        # Verificar se já existem dados
        if User.query.first() is not None:
            return  # Dados já existem
        
        print("Inicializando banco de dados com dados de exemplo...")
        
        # Criar dojos baseados na planilha
        dojos_data = [
            {
                'name': 'Florianópolis Ki-Aikido Dojo',
                'address': 'Florianópolis, SC, Brasil',
                'contact_email': 'florianopolis@kiaikido.com',
                'responsible_instructor': 'Instrutor Florianópolis'
            },
            {
                'name': 'CDKI Centro de desenvolvimento de KI',
                'address': 'Curitiba, PR, Brasil',
                'contact_email': 'cdki@kiaikido.com',
                'responsible_instructor': 'Instrutor CDKI'
            },
            {
                'name': 'Ki-Aikido Dojo Bagé',
                'address': 'Bagé, RS, Brasil',
                'contact_email': 'bage@kiaikido.com',
                'responsible_instructor': 'Instrutor Bagé'
            },
            {
                'name': 'Shukikan Ki Society',
                'address': 'São Paulo, SP, Brasil',
                'contact_email': 'shukikan@kiaikido.com',
                'responsible_instructor': 'Instrutor Shukikan'
            },
            {
                'name': 'Centro de desenvolvimento de KI de Belo Horizonte',
                'address': 'Belo Horizonte, MG, Brasil',
                'contact_email': 'belohorizonte@kiaikido.com',
                'responsible_instructor': 'Instrutor BH'
            },
            {
                'name': 'Rio Ki-Aikido',
                'address': 'Rio de Janeiro, RJ, Brasil',
                'contact_email': 'rio@kiaikido.com',
                'responsible_instructor': 'Instrutor Rio'
            }
        ]
        
        dojos = []
        for dojo_data in dojos_data:
            dojo = Dojo(**dojo_data)
            db.session.add(dojo)
            dojos.append(dojo)
        
        db.session.commit()
        
        # Criar usuários
        users_data = [
            {
                'email': 'admin@kiaikido.com',
                'name': 'Administrador Geral',
                'password': '123456',
                'role': 'admin',
                'dojo_id': None
            },
            {
                'email': 'florianopolis@kiaikido.com',
                'name': 'Responsável Florianópolis',
                'password': '123456',
                'role': 'dojo_user',
                'dojo_id': dojos[0].id
            },
            {
                'email': 'cdki@kiaikido.com',
                'name': 'Responsável CDKI',
                'password': '123456',
                'role': 'dojo_user',
                'dojo_id': dojos[1].id
            },
            {
                'email': 'bage@kiaikido.com',
                'name': 'Responsável Bagé',
                'password': '123456',
                'role': 'dojo_user',
                'dojo_id': dojos[2].id
            },
            {
                'email': 'shukikan@kiaikido.com',
                'name': 'Responsável Shukikan',
                'password': '123456',
                'role': 'dojo_user',
                'dojo_id': dojos[3].id
            },
            {
                'email': 'belohorizonte@kiaikido.com',
                'name': 'Responsável BH',
                'password': '123456',
                'role': 'dojo_user',
                'dojo_id': dojos[4].id
            },
            {
                'email': 'rio@kiaikido.com',
                'name': 'Responsável Rio',
                'password': '123456',
                'role': 'dojo_user',
                'dojo_id': dojos[5].id
            }
        ]
        
        for user_data in users_data:
            password = user_data.pop('password')
            user = User(**user_data)
            user.set_password(password)
            db.session.add(user)
        
        db.session.commit()
        
        # Criar eventos de exemplo
        admin_user = User.query.filter_by(email='admin@kiaikido.com').first()
        
        # Eventos administrativos (visíveis por todos)
        admin_events = [
            {
                'title': 'Seminário Nacional Ki Aikido 2025',
                'description': 'Seminário nacional com mestres convidados do Japão',
                'category': 'seminario',
                'event_type': 'admin',
                'dojo_id': None,
                'start_datetime': datetime(2025, 11, 15, 9, 0),
                'end_datetime': datetime(2025, 11, 15, 18, 0),
                'location': 'São Paulo, SP',
                'reminder_priority': 'high',
                'created_by': admin_user.id
            },
            {
                'title': 'Exame de Graduação Nacional',
                'description': 'Exame de graduação para faixas pretas',
                'category': 'exame',
                'event_type': 'admin',
                'dojo_id': None,
                'start_datetime': datetime(2025, 12, 10, 14, 0),
                'end_datetime': datetime(2025, 12, 10, 18, 0),
                'location': 'Rio de Janeiro, RJ',
                'reminder_priority': 'high',
                'created_by': admin_user.id
            },
            {
                'title': 'Aviso: Nova Política de Graduações',
                'description': 'Implementação de novos critérios para graduações a partir de 2026',
                'category': 'aviso',
                'event_type': 'admin',
                'dojo_id': None,
                'start_datetime': datetime(2026, 1, 1, 0, 0),
                'end_datetime': datetime(2026, 1, 1, 23, 59),
                'all_day': True,
                'reminder_priority': 'medium',
                'created_by': admin_user.id
            }
        ]
        
        for event_data in admin_events:
            event = Event(**event_data)
            db.session.add(event)
        
        # Eventos de dojos
        floripa_user = User.query.filter_by(email='florianopolis@kiaikido.com').first()
        
        # Aulas regulares - Florianópolis (terça e quinta 19h)
        recurring_event = Event(
            title='Aula Regular - Adultos',
            description='Treino regular de Ki Aikido para adultos',
            category='aula_regular',
            event_type='dojo',
            dojo_id=dojos[0].id,
            start_datetime=datetime(2025, 10, 21, 19, 0),  # próxima terça
            end_datetime=datetime(2025, 10, 21, 20, 30),
            location='Dojo Florianópolis',
            is_recurring=True,
            recurrence_pattern='weekly',
            recurrence_interval=1,
            recurrence_days='2,4',  # terça=2, quinta=4
            recurrence_end_date=datetime(2026, 10, 31, 23, 59),
            series_id=str(uuid.uuid4()),
            reminder_priority='low',
            created_by=floripa_user.id
        )
        db.session.add(recurring_event)
        
        # Evento especial - Exame de graduação Florianópolis
        exam_event = Event(
            title='Exame de Graduação - Kyu',
            description='Exame de graduação para alunos de kyu (faixas coloridas)',
            category='exame',
            event_type='dojo',
            dojo_id=dojos[0].id,
            start_datetime=datetime(2025, 11, 20, 18, 0),
            end_datetime=datetime(2025, 11, 20, 21, 0),
            location='Dojo Florianópolis',
            reminder_priority='high',
            created_by=floripa_user.id
        )
        db.session.add(exam_event)
        
        # Evento suspenso - Férias
        suspended_event = Event(
            title='Recesso de Fim de Ano',
            description='Aulas suspensas para recesso de fim de ano',
            category='aviso',
            event_type='dojo',
            dojo_id=dojos[0].id,
            start_datetime=datetime(2025, 12, 20, 0, 0),
            end_datetime=datetime(2026, 1, 5, 23, 59),
            all_day=True,
            status='active',
            reminder_priority='medium',
            created_by=floripa_user.id
        )
        db.session.add(suspended_event)
        
        # Evento social
        social_event = Event(
            title='Confraternização de Fim de Ano',
            description='Confraternização com todos os alunos e familiares',
            category='evento_social',
            event_type='dojo',
            dojo_id=dojos[0].id,
            start_datetime=datetime(2025, 12, 15, 19, 0),
            end_datetime=datetime(2025, 12, 15, 23, 0),
            location='Dojo Florianópolis',
            reminder_priority='medium',
            created_by=floripa_user.id
        )
        db.session.add(social_event)
        
        db.session.commit()
        
        # Criar avisos para eventos importantes
        high_priority_events = Event.query.filter_by(reminder_priority='high').all()
        for event in high_priority_events:
            # Avisos padrão: 7 dias, 3 dias, 1 dia, no dia
            for days in [7, 3, 1, 0]:
                reminder = EventReminder(
                    event_id=event.id,
                    days_before=days,
                    reminder_type='banner',
                    message=f'Lembrete: {event.title} em {days} dia(s)' if days > 0 else f'Hoje: {event.title}',
                    is_active=True
                )
                db.session.add(reminder)
        
        db.session.commit()
        
        print("Banco de dados inicializado com sucesso!")
        print("Usuários criados:")
        print("- admin@kiaikido.com / 123456 (Administrador)")
        print("- florianopolis@kiaikido.com / 123456 (Dojo Florianópolis)")
        print("- cdki@kiaikido.com / 123456 (Dojo CDKI)")
        print("- bage@kiaikido.com / 123456 (Dojo Bagé)")
        print("- shukikan@kiaikido.com / 123456 (Dojo Shukikan)")
        print("- belohorizonte@kiaikido.com / 123456 (Dojo BH)")
        print("- rio@kiaikido.com / 123456 (Dojo Rio)")
        print("\nEventos de exemplo criados!")
        print("- 3 eventos administrativos (visíveis para todos)")
        print("- 5 eventos do dojo Florianópolis (incluindo aulas regulares recorrentes)")

# Inicializar banco de dados
init_database()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """Serve arquivos estáticos do frontend"""
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return jsonify({
                'message': 'Ki Aikido Students API',
                'version': '1.0.0',
                'endpoints': {
                    'health': '/api/health',
                    'auth': '/api/auth/*',
                    'students': '/api/students',
                    'dojos': '/api/dojos'
                }
            }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

