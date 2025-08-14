import sys
sys.path.append(".")
from src.main import app, init_database
with app.app_context():
    init_database()
    print("✅ Banco de dados inicializado!")

