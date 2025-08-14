#!/usr/bin/env python3
"""
Migração para adicionar tabelas de status/graduação dos membros
"""

import os
import sys

# Adicionar o diretório pai ao path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from src.main import app
from src.models import db, MemberStatus, MemberGraduation, MemberQualification

def run_migration():
    """Executa a migração para criar as novas tabelas"""
    with app.app_context():
        print("Iniciando migração para adicionar tabelas de status/graduação dos membros...")
        
        try:
            # Criar as novas tabelas
            db.create_all()
            print("✅ Tabelas criadas com sucesso:")
            print("   - member_status")
            print("   - member_graduation") 
            print("   - member_qualification")
            
            # Verificar se as tabelas foram criadas
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            
            required_tables = ['member_status', 'member_graduation', 'member_qualification']
            for table in required_tables:
                if table in tables:
                    print(f"✅ Tabela '{table}' confirmada")
                else:
                    print(f"❌ Tabela '{table}' não encontrada")
            
            print("\n🎉 Migração concluída com sucesso!")
            print("\nPróximos passos:")
            print("1. Reiniciar a aplicação")
            print("2. Acessar /api/member-status/constants para ver as constantes disponíveis")
            print("3. Começar a cadastrar status de membros através da API")
            
        except Exception as e:
            print(f"❌ Erro durante a migração: {str(e)}")
            return False
    
    return True

if __name__ == '__main__':
    success = run_migration()
    sys.exit(0 if success else 1)

