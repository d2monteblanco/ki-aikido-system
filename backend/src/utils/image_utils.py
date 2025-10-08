"""
Utilitários para processamento de imagens
Sistema Ki Aikido - Sprint 5

Funções para geração de thumbnails e otimização de imagens
"""

from PIL import Image
import os

# Tamanhos de thumbnail
THUMBNAIL_SIZES = {
    'small': (40, 40),      # Para tabelas
    'medium': (128, 128),   # Para modais  
    'large': (300, 300)     # Para visualização
}

def create_thumbnail(image_path, size_name='medium', output_path=None):
    """
    Cria um thumbnail de uma imagem
    
    Args:
        image_path: Caminho da imagem original
        size_name: Nome do tamanho (small, medium, large)
        output_path: Caminho de saída (opcional)
    
    Returns:
        Caminho do thumbnail criado ou None se erro
    """
    try:
        # Obter tamanho
        size = THUMBNAIL_SIZES.get(size_name, THUMBNAIL_SIZES['medium'])
        
        # Abrir imagem
        with Image.open(image_path) as img:
            # Converter RGBA para RGB se necessário
            if img.mode in ('RGBA', 'LA', 'P'):
                # Criar fundo branco
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Criar thumbnail mantendo proporção
            img.thumbnail(size, Image.Lanczos)
            
            # Determinar caminho de saída
            if not output_path:
                base, ext = os.path.splitext(image_path)
                output_path = f"{base}_thumb_{size_name}.jpg"
            
            # Salvar thumbnail com qualidade otimizada
            img.save(output_path, 'JPEG', quality=85, optimize=True)
            
            return output_path
            
    except Exception as e:
        print(f"Erro ao criar thumbnail: {e}")
        return None

def optimize_image(image_path, max_size=(1920, 1920), quality=85):
    """
    Otimiza uma imagem reduzindo tamanho e qualidade
    
    Args:
        image_path: Caminho da imagem
        max_size: Tamanho máximo (width, height)
        quality: Qualidade JPEG (0-100)
    
    Returns:
        True se otimizado com sucesso
    """
    try:
        with Image.open(image_path) as img:
            # Converter RGBA para RGB se necessário
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Redimensionar se maior que max_size
            if img.width > max_size[0] or img.height > max_size[1]:
                img.thumbnail(max_size, Image.Lanczos)
            
            # Salvar otimizado
            img.save(image_path, 'JPEG', quality=quality, optimize=True)
            
            return True
            
    except Exception as e:
        print(f"Erro ao otimizar imagem: {e}")
        return False

def get_image_info(image_path):
    """
    Obtém informações de uma imagem
    
    Args:
        image_path: Caminho da imagem
    
    Returns:
        Dict com informações ou None
    """
    try:
        with Image.open(image_path) as img:
            return {
                'format': img.format,
                'mode': img.mode,
                'size': img.size,
                'width': img.width,
                'height': img.height
            }
    except Exception as e:
        print(f"Erro ao obter info da imagem: {e}")
        return None

def is_valid_image(file_path):
    """
    Verifica se um arquivo é uma imagem válida
    
    Args:
        file_path: Caminho do arquivo
    
    Returns:
        True se é imagem válida
    """
    try:
        with Image.open(file_path) as img:
            img.verify()
        return True
    except:
        return False

def create_all_thumbnails(image_path, upload_folder):
    """
    Cria todos os tamanhos de thumbnail para uma imagem
    
    Args:
        image_path: Caminho da imagem original
        upload_folder: Pasta onde salvar thumbnails
    
    Returns:
        Dict com caminhos dos thumbnails criados
    """
    thumbnails = {}
    base_name = os.path.basename(image_path)
    name_without_ext = os.path.splitext(base_name)[0]
    
    for size_name in THUMBNAIL_SIZES.keys():
        thumb_filename = f"{name_without_ext}_thumb_{size_name}.jpg"
        thumb_path = os.path.join(upload_folder, thumb_filename)
        
        result = create_thumbnail(image_path, size_name, thumb_path)
        if result:
            thumbnails[size_name] = thumb_filename
    
    return thumbnails
