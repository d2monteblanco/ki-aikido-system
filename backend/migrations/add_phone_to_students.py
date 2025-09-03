#!/usr/bin/env python3
"""
Migração: Adicionar campo 'phone' à tabela students
Data: 2025-01-09
Descrição: Adiciona o campo telefone ao modelo Student para resolver inconsistência entre frontend e backend
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from src.main import app, db
from sqlalchemy import text

def run_migration():
    """Executa a migração para adicionar campo phone"""
    with app.app_context():
        try:
            # Verificar se a coluna já existe
            result = db.session.execute(text("""
                SELECT COUNT(*) as count 
                FROM pragma_table_info('student') 
                WHERE name = 'phone'
            """)).fetchone()
            
            if result.count > 0:
                print("✅ Campo 'phone' já existe na tabela 'student'")
                return True
            
            # Adicionar a coluna phone
            print("📝 Adicionando campo 'phone' à tabela 'student'...")
            db.session.execute(text("""
                ALTER TABLE student 
                ADD COLUMN phone VARCHAR(20)
            """))
            
            db.session.commit()
            print("✅ Campo 'phone' adicionado com sucesso!")
            
            # Verificar se a migração foi bem-sucedida
            result = db.session.execute(text("""
                SELECT COUNT(*) as count 
                FROM pragma_table_info('student') 
                WHERE name = 'phone'
            """)).fetchone()
            
            if result.count > 0:
                print("✅ Migração verificada com sucesso!")
                return True
            else:
                print("❌ Erro: Campo não foi adicionado corretamente")
                return False
                
        except Exception as e:
            print(f"❌ Erro na migração: {e}")
            db.session.rollback()
            return False

if __name__ == '__main__':
    print("🔄 Executando migração: Adicionar campo 'phone' à tabela students")
    success = run_migration()
    if success:
        print("🎉 Migração concluída com sucesso!")
    else:
        print("💥 Migração falhou!")
        sys.exit(1)

