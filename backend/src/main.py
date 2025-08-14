import sys
import os
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from src.models import db, User, Dojo, Student, MemberStatus, MemberGraduation, MemberQualification
from src.routes.auth import auth_bp
from src.routes.students import students_bp
from src.routes.dojos import dojos_bp
from src.routes.member_status import member_status_bp
from src.routes.member_graduations import member_graduations_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Configurações
app.config['SECRET_KEY'] = 'ki-aikido-secret-key-2024'
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configuração de sessão
app.config['SESSION_COOKIE_SECURE'] = False  # Para desenvolvimento
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# CORS para permitir requisições do frontend
CORS(app, 
     supports_credentials=True,
     origins=["http://localhost:3000", "http://127.0.0.1:3000", "null", "https://5000-izgjrvq6mcow7rda4z9gz-53bb438c.manus.computer"],  # null para file://
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(students_bp, url_prefix='/api')
app.register_blueprint(dojos_bp, url_prefix='/api')
app.register_blueprint(member_status_bp, url_prefix='/api')
app.register_blueprint(member_graduations_bp, url_prefix='/api')

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
        print("Banco de dados inicializado com sucesso!")
        print("Usuários criados:")
        print("- admin@kiaikido.com / 123456 (Administrador)")
        print("- florianopolis@kiaikido.com / 123456 (Dojo Florianópolis)")
        print("- cdki@kiaikido.com / 123456 (Dojo CDKI)")
        print("- bage@kiaikido.com / 123456 (Dojo Bagé)")
        print("- shukikan@kiaikido.com / 123456 (Dojo Shukikan)")
        print("- belohorizonte@kiaikido.com / 123456 (Dojo BH)")
        print("- rio@kiaikido.com / 123456 (Dojo Rio)")

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

