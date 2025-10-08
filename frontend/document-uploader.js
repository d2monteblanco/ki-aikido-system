/**
 * Componente de Upload de Documentos
 * Sistema Ki Aikido - Sprint 2
 * 
 * Componente reutilizável para upload de fotos e certificados
 */

class DocumentUploader {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container ${containerId} não encontrado`);
            return;
        }
        
        this.options = {
            documentType: options.documentType || 'member_photo', // 'member_photo', 'graduation', 'qualification'
            relatedId: options.relatedId || null,
            existingPath: options.existingPath || null,
            maxSize: options.maxSize || 5 * 1024 * 1024, // 5MB
            acceptedTypes: options.acceptedTypes || this.getAcceptedTypes(options.documentType),
            onUpload: options.onUpload || null,
            onDelete: options.onDelete || null,
            onChange: options.onChange || null
        };
        
        this.selectedFile = null;
        this.previewUrl = null;
        this.currentDocumentId = null;
        
        this.render();
        this.attachEvents();
    }
    
    getAcceptedTypes(documentType) {
        if (documentType === 'member_photo') {
            return 'image/jpeg,image/jpg,image/png';
        }
        return 'application/pdf,image/jpeg,image/jpg,image/png';
    }
    
    getAcceptedExtensions(documentType) {
        if (documentType === 'member_photo') {
            return '.jpg, .jpeg, .png';
        }
        return '.pdf, .jpg, .jpeg, .png';
    }
    
    render() {
        const hasExisting = this.options.existingPath && this.options.existingPath.trim() !== '';
        
        this.container.innerHTML = `
            <div class="document-uploader border-2 border-dashed rounded-lg p-4 transition-all">
                ${hasExisting ? this.renderExistingDocument() : this.renderUploadArea()}
            </div>
        `;
    }
    
    renderUploadArea() {
        const isPhoto = this.options.documentType === 'member_photo';
        const icon = isPhoto ? 'fa-camera' : 'fa-file-upload';
        const label = isPhoto ? 'Foto do Membro' : 'Certificado';
        const extensions = this.getAcceptedExtensions(this.options.documentType);
        
        return `
            <div class="upload-area" id="uploadArea_${this.container.id}">
                <input type="file" 
                       id="fileInput_${this.container.id}" 
                       class="hidden" 
                       accept="${this.options.acceptedTypes}">
                
                <div class="text-center py-6 cursor-pointer" onclick="document.getElementById('fileInput_${this.container.id}').click()">
                    <i class="fas ${icon} text-4xl text-gray-400 mb-3"></i>
                    <p class="text-sm font-medium text-gray-700 mb-1">
                        Clique para selecionar ${label.toLowerCase()} ou arraste aqui
                    </p>
                    <p class="text-xs text-gray-500">
                        Formatos aceitos: ${extensions} • Tamanho máximo: 5MB
                    </p>
                    ${this.selectedFile ? `
                        <div class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p class="text-sm text-blue-800 font-medium">
                                <i class="fas fa-file-alt mr-2"></i>${this.selectedFile.name}
                            </p>
                            <p class="text-xs text-blue-600 mt-1">
                                ${this.formatFileSize(this.selectedFile.size)}
                            </p>
                        </div>
                    ` : ''}
                </div>
                
                ${this.previewUrl ? this.renderPreview() : ''}
            </div>
        `;
    }
    
    renderExistingDocument() {
        const isPhoto = this.options.documentType === 'member_photo';
        const icon = isPhoto ? 'fa-image' : 'fa-file-pdf';
        const label = isPhoto ? 'Foto cadastrada' : 'Certificado cadastrado';
        
        return `
            <div class="existing-document bg-green-50 border-green-300">
                <div class="flex items-center justify-between p-3">
                    <div class="flex items-center space-x-3">
                        <i class="fas ${icon} text-2xl text-green-600"></i>
                        <div>
                            <p class="text-sm font-medium text-green-800">${label}</p>
                            <p class="text-xs text-green-600">Clique em "Ver" para visualizar</p>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button type="button" class="btn-view px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                            <i class="fas fa-eye mr-1"></i>Ver
                        </button>
                        <button type="button" class="btn-replace px-3 py-1.5 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700">
                            <i class="fas fa-sync-alt mr-1"></i>Substituir
                        </button>
                        <button type="button" class="btn-remove px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                            <i class="fas fa-trash mr-1"></i>Remover
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderPreview() {
        if (!this.previewUrl) return '';
        
        const isImage = this.selectedFile && this.selectedFile.type.startsWith('image/');
        
        return `
            <div class="preview-area mt-4 p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                    <p class="text-sm font-medium text-gray-700">Preview:</p>
                    <button type="button" class="btn-cancel-preview text-red-600 hover:text-red-800 text-sm">
                        <i class="fas fa-times mr-1"></i>Cancelar
                    </button>
                </div>
                ${isImage ? `
                    <img src="${this.previewUrl}" alt="Preview" class="max-w-full max-h-64 mx-auto rounded-lg shadow-md">
                ` : `
                    <div class="text-center py-4">
                        <i class="fas fa-file-pdf text-5xl text-red-600 mb-2"></i>
                        <p class="text-sm text-gray-600">${this.selectedFile.name}</p>
                        <p class="text-xs text-gray-500 mt-1">${this.formatFileSize(this.selectedFile.size)}</p>
                    </div>
                `}
            </div>
        `;
    }
    
    attachEvents() {
        const fileInput = document.getElementById(`fileInput_${this.container.id}`);
        const uploadArea = document.getElementById(`uploadArea_${this.container.id}`);
        
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        
        if (uploadArea) {
            // Drag and drop
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('border-blue-500', 'bg-blue-50');
            });
            
            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('border-blue-500', 'bg-blue-50');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('border-blue-500', 'bg-blue-50');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFile(files[0]);
                }
            });
        }
        
        // Botões de documento existente
        const btnView = this.container.querySelector('.btn-view');
        const btnReplace = this.container.querySelector('.btn-replace');
        const btnRemove = this.container.querySelector('.btn-remove');
        
        if (btnView) {
            btnView.addEventListener('click', () => this.viewDocument());
        }
        
        if (btnReplace) {
            btnReplace.addEventListener('click', () => this.replaceDocument());
        }
        
        if (btnRemove) {
            btnRemove.addEventListener('click', () => this.deleteDocument());
        }
        
        // Cancelar preview
        const btnCancelPreview = this.container.querySelector('.btn-cancel-preview');
        if (btnCancelPreview) {
            btnCancelPreview.addEventListener('click', () => this.cancelPreview());
        }
    }
    
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.handleFile(file);
        }
    }
    
    handleFile(file) {
        // Validar tamanho
        if (file.size > this.options.maxSize) {
            showNotification('Arquivo muito grande. Tamanho máximo: 5MB', 'error');
            return;
        }
        
        // Validar tipo
        const acceptedTypes = this.options.acceptedTypes.split(',');
        if (!acceptedTypes.includes(file.type)) {
            const isPhoto = this.options.documentType === 'member_photo';
            const msg = isPhoto 
                ? 'Apenas imagens JPG e PNG são permitidas' 
                : 'Apenas arquivos PDF, JPG e PNG são permitidos';
            showNotification(msg, 'error');
            return;
        }
        
        this.selectedFile = file;
        
        // Gerar preview para imagens
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.previewUrl = e.target.result;
                this.render();
                this.attachEvents();
                
                if (this.options.onChange) {
                    this.options.onChange(file, this.previewUrl);
                }
            };
            reader.readAsDataURL(file);
        } else {
            this.previewUrl = null;
            this.render();
            this.attachEvents();
            
            if (this.options.onChange) {
                this.options.onChange(file, null);
            }
        }
    }
    
    viewDocument() {
        if (this.options.existingPath) {
            // Usar função global de autenticação
            if (typeof openAuthenticatedDocument === 'function') {
                openAuthenticatedDocument(this.options.existingPath);
            } else {
                // Fallback para window.open direto (não recomendado)
                const url = `${API_BASE_URL}/documents/by-path/${this.options.existingPath}/view`;
                window.open(url, '_blank');
            }
        }
    }
    
    replaceDocument() {
        this.options.existingPath = null;
        this.render();
        this.attachEvents();
    }
    
    async deleteDocument() {
        if (!confirm('Tem certeza que deseja remover este documento?')) {
            return;
        }
        
        if (this.options.onDelete) {
            const result = await this.options.onDelete();
            if (result) {
                this.options.existingPath = null;
                this.render();
                this.attachEvents();
            }
        }
    }
    
    cancelPreview() {
        this.selectedFile = null;
        this.previewUrl = null;
        this.render();
        this.attachEvents();
        
        if (this.options.onChange) {
            this.options.onChange(null, null);
        }
    }
    
    async uploadFile() {
        if (!this.selectedFile) {
            return null;
        }
        
        if (!this.options.relatedId) {
            showNotification('ID do registro não definido. Salve o registro antes de fazer upload.', 'warning');
            return null;
        }
        
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('document_type', this.options.documentType);
        formData.append('related_id', this.options.relatedId);
        
        try {
            // Obter token de autenticação
            const authToken = localStorage.getItem('authToken');
            const headers = {};
            
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }
            
            // Usar fetch diretamente para upload de FormData
            const response = await fetch(`${API_BASE_URL}/documents/upload`, {
                method: 'POST',
                credentials: 'include',
                headers: headers,
                body: formData
                // NÃO definir Content-Type - deixar o browser definir com boundary
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao fazer upload');
            }
            
            const result = await response.json();
            
            if (this.options.onUpload) {
                this.options.onUpload(result);
            }
            
            return result;
        } catch (error) {
            showNotification('Erro ao fazer upload: ' + error.message, 'error');
            return null;
        }
    }
    
    getFile() {
        return this.selectedFile;
    }
    
    hasFile() {
        return this.selectedFile !== null;
    }
    
    setRelatedId(id) {
        this.options.relatedId = id;
    }
    
    setExistingPath(path) {
        this.options.existingPath = path;
        this.render();
        this.attachEvents();
    }
    
    reset() {
        this.selectedFile = null;
        this.previewUrl = null;
        this.render();
        this.attachEvents();
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}
