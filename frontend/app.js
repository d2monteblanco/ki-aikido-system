// Configuração da API
const API_BASE = 'http://localhost:5000/api';

// Estado da aplicação
let currentUser = null;
let authToken = null;

// Elementos DOM
const loginScreen = document.getElementById('loginScreen');
const mainApp = document.getElementById('mainApp');

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Utilitários para estados de carregamento
 */
const LoadingUtils = {
    show: function(containerId, message = 'Carregando...') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    },
    
    showError: function(containerId, message = 'Erro ao carregar dados') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8 text-red-500">
                    <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    },
    
    showEmpty: function(containerId, message = 'Nenhum item encontrado', actionButton = null) {
        const container = document.getElementById(containerId);
        if (container) {
            const buttonHtml = actionButton ? 
                `<button class="btn-primary text-white px-6 py-3 rounded-lg font-medium mt-4">
                    <i class="fas fa-plus mr-2"></i>${actionButton.text}
                </button>` : '';
            
            container.innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-4"></i>
                    <h3 class="text-lg font-medium mb-2">${message}</h3>
                    ${buttonHtml}
                </div>
            `;
            
            if (actionButton && actionButton.onclick) {
                const button = container.querySelector('button');
                if (button) {
                    button.addEventListener('click', actionButton.onclick);
                }
            }
        }
    }
};

/**
 * Classe genérica para gerenciamento de modais
 */
class ModalManager {
    constructor(modalId) {
        this.modalId = modalId;
        this.modal = document.getElementById(modalId);
        this.form = this.modal ? this.modal.querySelector('form') : null;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        if (!this.modal) return;
        
        // Fechar modal ao clicar no X ou botão cancelar
        const closeButtons = this.modal.querySelectorAll('[data-close-modal]');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => this.hide());
        });
        
        // Fechar modal ao clicar fora
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });
    }
    
    show() {
        if (this.modal) {
            this.modal.classList.remove('hidden');
            // Focar no primeiro input
            const firstInput = this.modal.querySelector('input, textarea, select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }
    
    hide() {
        if (this.modal) {
            this.modal.classList.add('hidden');
            this.clearForm();
        }
    }
    
    clearForm() {
        if (this.form) {
            this.form.reset();
            // Limpar campos hidden também
            const hiddenInputs = this.form.querySelectorAll('input[type="hidden"]');
            hiddenInputs.forEach(input => input.value = '');
        }
    }
    
    populateForm(data) {
        if (!this.form || !data) return;
        
        Object.keys(data).forEach(key => {
            const field = this.form.querySelector(`[name="${key}"], #${key}`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = Boolean(data[key]);
                } else if (field.type === 'radio') {
                    const radio = this.form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                    if (radio) radio.checked = true;
                } else {
                    field.value = data[key] || '';
                }
            }
        });
    }
    
    getFormData() {
        if (!this.form) return {};
        
        const formData = new FormData(this.form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }
    
    setLoading(isLoading, buttonSelector = 'button[type="submit"]') {
        const button = this.modal.querySelector(buttonSelector);
        if (button) {
            if (isLoading) {
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processando...';
            } else {
                button.disabled = false;
                // Restaurar texto original (assumindo que está em data-original-text)
                const originalText = button.getAttribute('data-original-text') || 'Salvar';
                button.innerHTML = originalText;
            }
        }
    }
}

/**
 * Utilitários para notificações
 */
const NotificationUtils = {
    show: function(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${this.getTypeClasses(type)}`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${this.getTypeIcon(type)} mr-2"></i>
                <span>${message}</span>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover após duração especificada
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, duration);
        }
        
        return notification;
    },
    
    getTypeClasses: function(type) {
        const classes = {
            'success': 'bg-green-500 text-white',
            'error': 'bg-red-500 text-white',
            'warning': 'bg-yellow-500 text-white',
            'info': 'bg-blue-500 text-white'
        };
        return classes[type] || classes.info;
    },
    
    getTypeIcon: function(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || icons.info;
    },
    
    success: function(message, duration = 5000) {
        return this.show(message, 'success', duration);
    },
    
    error: function(message, duration = 7000) {
        return this.show(message, 'error', duration);
    },
    
    warning: function(message, duration = 6000) {
        return this.show(message, 'warning', duration);
    },
    
    info: function(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }
};

/**
 * Utilitários para validação de formulários
 */
const ValidationUtils = {
    email: function(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },
    
    phone: function(phone) {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 10 && cleaned.length <= 11;
    },
    
    required: function(value) {
        return value && value.toString().trim().length > 0;
    },
    
    minLength: function(value, min) {
        return value && value.toString().length >= min;
    },
    
    maxLength: function(value, max) {
        return !value || value.toString().length <= max;
    },
    
    date: function(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    },
    
    validateForm: function(formElement, rules) {
        const errors = [];
        
        Object.keys(rules).forEach(fieldName => {
            const field = formElement.querySelector(`[name="${fieldName}"]`);
            const fieldRules = rules[fieldName];
            const value = field ? field.value : '';
            
            fieldRules.forEach(rule => {
                if (typeof rule === 'function') {
                    if (!rule(value)) {
                        errors.push(`Campo ${fieldName} é inválido`);
                    }
                } else if (typeof rule === 'object') {
                    const { validator, message } = rule;
                    if (!validator(value)) {
                        errors.push(message || `Campo ${fieldName} é inválido`);
                    }
                }
            });
        });
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },
    
    showFieldError: function(fieldName, message) {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (field) {
            // Remover erro anterior
            this.clearFieldError(fieldName);
            
            // Adicionar classe de erro
            field.classList.add('border-red-500');
            
            // Criar elemento de erro
            const errorElement = document.createElement('div');
            errorElement.className = 'text-red-500 text-sm mt-1';
            errorElement.textContent = message;
            errorElement.setAttribute('data-error-for', fieldName);
            
            // Inserir após o campo
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
    },
    
    clearFieldError: function(fieldName) {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.classList.remove('border-red-500');
            const errorElement = document.querySelector(`[data-error-for="${fieldName}"]`);
            if (errorElement) {
                errorElement.remove();
            }
        }
    },
    
    clearAllErrors: function(formElement) {
        const errorElements = formElement.querySelectorAll('[data-error-for]');
        errorElements.forEach(element => element.remove());
        
        const errorFields = formElement.querySelectorAll('.border-red-500');
        errorFields.forEach(field => field.classList.remove('border-red-500'));
    }
};

/**
 * Utilitários para formatação
 */
const FormatUtils = {
    phone: function(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return phone;
    },
    
    date: function(dateString, format = 'DD/MM/YYYY') {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date)) return dateString;
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        return format
            .replace('DD', day)
            .replace('MM', month)
            .replace('YYYY', year);
    },
    
    currency: function(value, currency = 'BRL') {
        const number = parseFloat(value);
        if (isNaN(number)) return value;
        
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency
        }).format(number);
    }
};

// ===== FIM DAS FUNÇÕES UTILITÁRIAS =====


const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const loginBtnText = document.getElementById('loginBtnText');
const loginSpinner = document.getElementById('loginSpinner');
const loginError = document.getElementById('loginError');
const loginErrorText = document.getElementById('loginErrorText');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');
const userRole = document.getElementById('userRole');
const loadingOverlay = document.getElementById('loadingOverlay');

// Elementos das abas
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema Ki Aikido iniciado');
    
    // Verificar se já existe token salvo
    checkExistingAuth();
    
    // Event listeners
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Login form
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Tab navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Botões de aluno
    const addStudentBtn = document.getElementById('addStudentBtn');
    const addStudentForm = document.getElementById('addStudentForm');
    const closeAddStudentModal = document.getElementById('closeAddStudentModal');
    const cancelAddStudent = document.getElementById('cancelAddStudent');
    
    const editStudentForm = document.getElementById('editStudentForm');
    const closeEditStudentModal = document.getElementById('closeEditStudentModal');
    const cancelEditStudent = document.getElementById('cancelEditStudent');

    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', showAddStudentModal);
    }
    if (addStudentForm) {
        addStudentForm.addEventListener('submit', handleAddStudent);
    }
    if (closeAddStudentModal) {
        closeAddStudentModal.addEventListener('click', hideAddStudentModal);
    }
    if (cancelAddStudent) {
        cancelAddStudent.addEventListener('click', hideAddStudentModal);
    }
    
    if (editStudentForm) {
        editStudentForm.addEventListener('submit', handleEditStudent);
    }
    if (closeEditStudentModal) {
        closeEditStudentModal.addEventListener('click', hideEditStudentModal);
    }
    if (cancelEditStudent) {
        cancelEditStudent.addEventListener('click', hideEditStudentModal);
    }

    // Botões de status/graduações
    const addMemberBtn = document.getElementById('addMemberBtn');
    const addMemberStatusForm = document.getElementById('addMemberStatusForm');
    const closeAddMemberStatusModal = document.getElementById('closeAddMemberStatusModal');
    const cancelAddMemberStatus = document.getElementById('cancelAddMemberStatus');
    const memberStatusDiscipline = document.getElementById('memberStatusDiscipline');

    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', showAddMemberStatusModal);
    }
    if (addMemberStatusForm) {
        addMemberStatusForm.addEventListener('submit', handleAddMemberStatus);
    }
    if (closeAddMemberStatusModal) {
        closeAddMemberStatusModal.addEventListener('click', hideAddMemberStatusModal);
    }
    if (cancelAddMemberStatus) {
        cancelAddMemberStatus.addEventListener('click', hideAddMemberStatusModal);
    }
    if (memberStatusDiscipline) {
        memberStatusDiscipline.addEventListener('change', updateRankOptions);
    }

    // Filtros de membros
    const memberSearch = document.getElementById('memberSearch');
    const memberTypeFilter = document.getElementById('memberTypeFilter');
    const memberStatusFilter = document.getElementById('memberStatusFilter');

    if (memberSearch) {
        memberSearch.addEventListener('input', debounce(filterMembers, 300));
    }
    if (memberTypeFilter) {
        memberTypeFilter.addEventListener('change', filterMembers);
    }
    if (memberStatusFilter) {
        memberStatusFilter.addEventListener('change', filterMembers);
    }
}

// Verificar autenticação existente
async function checkExistingAuth() {
    const token = localStorage.getItem('authToken');
    if (token) {
        authToken = token;
        try {
            const response = await apiRequest('/auth/me', 'GET');
            if (response.user) {
                currentUser = response.user;
                showMainApp();
                return;
            }
        } catch (error) {
            console.log('Token inválido, removendo...');
            localStorage.removeItem('authToken');
        }
    }
    showLoginScreen();
}

// Mostrar tela de login
function showLoginScreen() {
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (mainApp) mainApp.classList.add('hidden');
}

// Mostrar aplicação principal
function showMainApp() {
    if (loginScreen) loginScreen.classList.add('hidden');
    if (mainApp) mainApp.classList.remove('hidden');
    
    // Atualizar informações do usuário
    updateUserInfo();
    
    // Controlar visibilidade do card de dojos baseado no role do usuário
    updateDojosCardVisibility();
    
    // Carregar perfil do usuário
    loadUserProfile();
    
    // Carregar estatísticas administrativas se for admin
    if (currentUser && currentUser.role === 'admin') {
        loadAdminStats();
    }
    
    // Carregar dados do dashboard
    loadDashboardData();
}

// Atualizar informações do usuário no header
function updateUserInfo() {
    if (currentUser && userName && userRole) {
        userName.textContent = currentUser.name || 'Usuário';
        userRole.textContent = getRoleDisplayName(currentUser.role) || 'Usuário';
    }
}

// Obter nome de exibição da função
function getRoleDisplayName(role) {
    const roles = {
        'admin': 'Administrador Geral',
        'dojo_admin': 'Administrador do Dojo',
        'instructor': 'Instrutor',
        'user': 'Usuário'
    };
    return roles[role] || role;
}

// Controlar visibilidade do card de dojos baseado no role do usuário
function updateDojosCardVisibility() {
    const dojosCard = document.getElementById('dojosStatsCard');
    if (dojosCard) {
        // Mostrar card apenas para administradores
        if (currentUser && currentUser.role === 'admin') {
            dojosCard.classList.remove('hidden');
        } else {
            dojosCard.classList.add('hidden');
        }
    }
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showError('Por favor, preencha email e senha');
        return;
    }

    setLoading(true);
    hideError();

    try {
        const response = await apiRequest('/auth/login', 'POST', {
            email: email,
            password: password
        });

        if (response.token && response.user) {
            authToken = response.token;
            currentUser = response.user;
            
            // Salvar token
            localStorage.setItem('authToken', authToken);
            
            console.log('Login realizado com sucesso');
            showMainApp();
        } else {
            throw new Error('Resposta inválida do servidor');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showError(error.message || 'Erro ao fazer login');
    } finally {
        setLoading(false);
    }
}

// Handle logout
async function handleLogout() {
    try {
        // Chamar endpoint de logout
        await apiRequest('/auth/logout', 'POST');
    } catch (error) {
        console.log('Erro no logout (ignorado):', error);
    } finally {
        // Limpar dados locais
        authToken = null;
        currentUser = null;
        localStorage.removeItem('authToken');
        
        console.log('Logout realizado');
        showLoginScreen();
        
        // Limpar formulário
        if (loginForm) {
            loginForm.reset();
        }
    }
}

// Função para preencher credenciais de demonstração
function fillCredentials(email, password) {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) emailInput.value = email;
    if (passwordInput) passwordInput.value = password;
}

// Mostrar/ocultar loading
function setLoading(loading) {
    if (loginBtn && loginBtnText && loginSpinner) {
        if (loading) {
            loginBtn.disabled = true;
            loginBtnText.textContent = 'Entrando...';
            loginSpinner.classList.remove('hidden');
        } else {
            loginBtn.disabled = false;
            loginBtnText.textContent = 'Entrar';
            loginSpinner.classList.add('hidden');
        }
    }
}

// Mostrar erro
function showError(message) {
    if (loginError && loginErrorText) {
        loginErrorText.textContent = message;
        loginError.classList.remove('hidden');
    }
}

// Ocultar erro
function hideError() {
    if (loginError) {
        loginError.classList.add('hidden');
    }
}

// Mostrar loading overlay
function showLoadingOverlay() {
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
}

// Ocultar loading overlay
function hideLoadingOverlay() {
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

// Fazer requisição para API
async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE}${endpoint}`;
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    // Adicionar token de autenticação se disponível
    if (authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    // Adicionar dados se fornecidos
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        const responseData = await response.json();
        
        if (!response.ok) {
            throw new Error(responseData.error || `HTTP ${response.status}`);
        }
        
        return responseData;
    } catch (error) {
        console.error(`Erro na requisição ${method} ${endpoint}:`, error);
        throw error;
    }
}

// Navegação por abas
function switchTab(tabName) {
    // Atualizar botões das abas
    tabButtons.forEach(button => {
        const isActive = button.getAttribute('data-tab') === tabName;
        button.classList.toggle('tab-active', isActive);
        button.classList.toggle('tab-inactive', !isActive);
    });
    
    // Mostrar/ocultar conteúdo das abas
    tabContents.forEach(content => {
        const contentId = content.id.replace('Tab', '');
        content.classList.toggle('hidden', contentId !== tabName);
    });
    
    // Carregar dados específicos da aba
    switch (tabName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'students':
            loadStudentsData();
            break;
        case 'members':
            loadMembersData();
            break;
        case 'admin':
            loadAdminStats();
            loadDojosList();
            break;
        case 'profile':
            loadUserProfile();
            break;
    }
}

// Carregar dados do dashboard
async function loadDashboardData() {
    try {
        // Carregar estatísticas
        const stats = await apiRequest('/students/stats');
        updateDashboardStats(stats);
        
        // Carregar preview de alunos
        loadStudentsPreview();
        
        // Carregar preview de membros
        loadMembersPreview();
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

// Atualizar estatísticas do dashboard
function updateDashboardStats(stats) {
    const totalStudentsEl = document.getElementById('totalStudents');
    const activeMembersEl = document.getElementById('activeMembers');
    const instructorsEl = document.getElementById('instructors');
    const totalDojosEl = document.getElementById('totalDojosStats');
    
    if (totalStudentsEl) totalStudentsEl.textContent = stats.total_students || '0';
    if (activeMembersEl) activeMembersEl.textContent = stats.active_members || '0';
    if (instructorsEl) instructorsEl.textContent = stats.instructors || '0';
    if (totalDojosEl) totalDojosEl.textContent = stats.total_dojos || '6';
}

// Carregar preview de alunos
async function loadStudentsPreview() {
    const container = document.getElementById('studentsPreview');
    if (!container) return;
    
    try {
        const response = await apiRequest('/students?limit=5');
        const students = response.students || [];
        
        if (students.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-user-plus text-3xl mb-3"></i>
                    <h4 class="font-medium mb-2">Nenhum aluno encontrado</h4>
                    <p class="text-sm">Comece cadastrando o primeiro aluno.</p>
                </div>
            `;
        } else {
            container.innerHTML = students.map(student => `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <div class="font-medium text-gray-800">${student.name}</div>
                        <div class="text-sm text-gray-500">${student.email}</div>
                    </div>
                    <div class="text-sm text-gray-500">
                        ${student.registration_number || 'N/A'}
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Erro ao carregar preview de alunos:', error);
        container.innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                <p>Erro ao carregar alunos</p>
            </div>
        `;
    }
}

// Carregar preview de membros
async function loadMembersPreview() {
    const container = document.getElementById('membersPreview');
    if (!container) return;
    
    try {
        const response = await apiRequest('/member-status?limit=5');
        const members = response.members || [];
        
        if (members.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-graduation-cap text-3xl mb-3"></i>
                    <h4 class="font-medium mb-2">Nenhum membro encontrado</h4>
                    <p class="text-sm">Comece criando o primeiro status de membro.</p>
                </div>
            `;
        } else {
            container.innerHTML = members.map(member => `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <div class="font-medium text-gray-800">${member.student_name || 'N/A'}</div>
                        <div class="text-sm text-gray-500">${member.member_type || 'N/A'}</div>
                    </div>
                    <div class="text-sm">
                        <span class="px-2 py-1 rounded-full text-xs ${getStatusColor(member.current_status)}">
                            ${member.current_status || 'N/A'}
                        </span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Erro ao carregar preview de membros:', error);
        container.innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                <p>Erro ao carregar membros</p>
            </div>
        `;
    }
}

// Carregar dados de alunos

// Filtrar membros
function filterMembers() {
    // Implementar filtros de membros
    console.log('Filtros aplicados');
    loadMembersData();
}

// Obter cor do status

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Funções globais para uso no HTML
window.fillCredentials = fillCredentials;
window.loadStudentsData = loadStudentsData;
window.loadMembersData = loadMembersData;


// ===== FUNÇÕES DE MODAL DE ALUNO =====

// Mostrar modal de adicionar aluno
async function showAddStudentModal() {
    const modal = document.getElementById('addStudentModal');
    if (!modal) return;
    
    // Carregar dojos no select
    await loadDojosInSelect('studentDojo');
    
    // Limpar formulário
    document.getElementById('addStudentForm').reset();
    
    // Mostrar modal
    modal.classList.remove('hidden');
}

// Esconder modal de adicionar aluno
function hideAddStudentModal() {
    const modal = document.getElementById('addStudentModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Mostrar modal de editar aluno
async function showEditStudentModal(studentId) {
    try {
        // Buscar dados atualizados do aluno
        const response = await apiRequest(`/students/${studentId}`);
        const student = response.student;
        
        if (!student) {
            throw new Error('Aluno não encontrado');
        }
        
        const modal = document.getElementById('editStudentModal');
        if (!modal) return;
        
        // Carregar dojos no select
        await loadDojosInSelect('editStudentDojo');
        
        // Preencher formulário com dados do aluno
        document.getElementById('editStudentId').value = student.id;
        document.getElementById('editStudentName').value = student.name || '';
        document.getElementById('editStudentEmail').value = student.email || '';
        document.getElementById('editStudentBirthDate').value = student.birth_date || '';
        document.getElementById('editStudentPhone').value = student.phone || '';
        document.getElementById('editStudentAddress').value = student.address || '';
        document.getElementById('editStudentDojo').value = student.dojo_id || '';
        
        // Mostrar modal
        modal.classList.remove('hidden');
    } catch (error) {
        console.error('Erro ao carregar dados do aluno:', error);
        alert('Erro ao carregar dados do aluno: ' + error.message);
    }
}

// Esconder modal de editar aluno
function hideEditStudentModal() {
    const modal = document.getElementById('editStudentModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Carregar dojos no select
async function loadDojosInSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    try {
        const response = await apiRequest('/dojos');
        const dojos = response.dojos || [];
        
        // Limpar opções existentes (exceto a primeira)
        select.innerHTML = '<option value="">Selecione um dojo</option>';
        
        // Adicionar dojos
        dojos.forEach(dojo => {
            const option = document.createElement('option');
            option.value = dojo.id;
            option.textContent = dojo.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar dojos:', error);
    }
}

// Lidar com adição de aluno
async function handleAddStudent(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const btnText = document.getElementById('addStudentBtnText');
    const spinner = document.getElementById('addStudentSpinner');
    
    // Mostrar loading
    btnText.textContent = 'Adicionando...';
    spinner.classList.remove('hidden');
    submitBtn.disabled = true;
    
    try {
        const formData = {
            name: document.getElementById('studentName').value.trim(),
            email: document.getElementById('studentEmail').value.trim(),
            birth_date: document.getElementById('studentBirthDate').value,
            phone: document.getElementById('studentPhone').value.trim(),
            address: document.getElementById('studentAddress').value.trim(),
            dojo_id: parseInt(document.getElementById('studentDojo').value)
        };
        
        // Validar dados
        if (!formData.name || !formData.email || !formData.birth_date || !formData.address || !formData.dojo_id) {
            throw new Error('Por favor, preencha todos os campos obrigatórios');
        }
        
        // Enviar para API
        await apiRequest('/students', 'POST', formData);
        
        // Sucesso
        hideAddStudentModal();
        loadStudentsData(); // Recarregar lista
        showSuccessMessage('Aluno adicionado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao adicionar aluno:', error);
        showErrorMessage(error.message || 'Erro ao adicionar aluno');
    } finally {
        // Restaurar botão
        btnText.textContent = 'Adicionar Aluno';
        spinner.classList.add('hidden');
        submitBtn.disabled = false;
    }
}

// Lidar com edição de aluno
async function handleEditStudent(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const btnText = document.getElementById('editStudentBtnText');
    const spinner = document.getElementById('editStudentSpinner');
    
    // Mostrar loading
    btnText.textContent = 'Salvando...';
    spinner.classList.remove('hidden');
    submitBtn.disabled = true;
    
    try {
        const studentId = document.getElementById('editStudentId').value;
        const formData = {
            name: document.getElementById('editStudentName').value.trim(),
            email: document.getElementById('editStudentEmail').value.trim(),
            birth_date: document.getElementById('editStudentBirthDate').value,
            phone: document.getElementById('editStudentPhone').value.trim(),
            address: document.getElementById('editStudentAddress').value.trim(),
            dojo_id: parseInt(document.getElementById('editStudentDojo').value)
        };
        
        // Validar dados
        if (!formData.name || !formData.email || !formData.birth_date || !formData.address || !formData.dojo_id) {
            throw new Error('Por favor, preencha todos os campos obrigatórios');
        }
        
        // Enviar para API
        await apiRequest(`/students/${studentId}`, 'PUT', formData);
        
        // Sucesso
        hideEditStudentModal();
        loadStudentsData(); // Recarregar lista
        showSuccessMessage('Aluno atualizado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao editar aluno:', error);
        showErrorMessage(error.message || 'Erro ao editar aluno');
    } finally {
        // Restaurar botão
        btnText.textContent = 'Salvar Alterações';
        spinner.classList.add('hidden');
        submitBtn.disabled = false;
    }
}

// Excluir aluno
async function deleteStudent(studentId, studentName) {
    if (!confirm(`Tem certeza que deseja excluir o aluno "${studentName}"?`)) {
        return;
    }
    
    try {
        await apiRequest(`/students/${studentId}`, 'DELETE');
        loadStudentsData(); // Recarregar lista
        showSuccessMessage('Aluno excluído com sucesso!');
    } catch (error) {
        console.error('Erro ao excluir aluno:', error);
        showErrorMessage(error.message || 'Erro ao excluir aluno');
    }
}

// Mostrar mensagem de sucesso
function showSuccessMessage(message) {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-check-circle mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Mostrar mensagem de erro
function showErrorMessage(message) {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-exclamation-circle mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Expor funções globalmente

window.deleteStudent = deleteStudent;


// ===== FUNÇÕES DE MODAL DE STATUS/GRADUAÇÕES =====

// Mostrar modal de adicionar status de membro
async function showAddMemberStatusModal() {
    const modal = document.getElementById('addMemberStatusModal');
    if (!modal) return;
    
    // Carregar alunos no select
    await loadStudentsInSelect('memberStatusStudent');
    
    // Limpar formulário
    document.getElementById('addMemberStatusForm').reset();
    
    // Limpar opções de graduação
    const rankSelect = document.getElementById('memberStatusRank');
    if (rankSelect) {
        rankSelect.innerHTML = '<option value="">Selecione a graduação</option>';
    }
    
    // Mostrar modal
    modal.classList.remove('hidden');
}

// Esconder modal de adicionar status de membro
function hideAddMemberStatusModal() {
    const modal = document.getElementById('addMemberStatusModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Carregar alunos no select
async function loadStudentsInSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    try {
        const response = await apiRequest('/students');
        const students = response.students || [];
        
        // Limpar opções existentes (exceto a primeira)
        select.innerHTML = '<option value="">Selecione um aluno</option>';
        
        // Adicionar alunos
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = `${student.name} (${student.registration_number})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar alunos:', error);
    }
}

// Atualizar opções de graduação baseado na disciplina
async function updateRankOptions() {
    const disciplineSelect = document.getElementById('memberStatusDiscipline');
    const rankSelect = document.getElementById('memberStatusRank');
    
    if (!disciplineSelect || !rankSelect) return;
    
    const discipline = disciplineSelect.value;
    
    // Limpar opções
    rankSelect.innerHTML = '<option value="">Selecione a graduação</option>';
    
    if (!discipline) return;
    
    try {
        const response = await apiRequest('/member-status/constants');
        let ranks = {};
        
        if (discipline === 'Shinshin Toitsu Aikido') {
            ranks = response.aikido_ranks || {};
        } else if (discipline === 'Shinshin Toitsudo') {
            ranks = response.toitsudo_ranks || {};
        }
        
        // Adicionar graduações ordenadas por nível
        const sortedRanks = Object.entries(ranks).sort((a, b) => a[1].level - b[1].level);
        
        sortedRanks.forEach(([key, rank]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = rank.display;
            rankSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Erro ao carregar graduações:', error);
    }
}

// Lidar com adição de status de membro
async function handleAddMemberStatus(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const btnText = document.getElementById('addMemberStatusBtnText');
    const spinner = document.getElementById('addMemberStatusSpinner');
    
    // Mostrar loading
    btnText.textContent = 'Adicionando...';
    spinner.classList.remove('hidden');
    submitBtn.disabled = true;
    
    try {
        const studentId = parseInt(document.getElementById('memberStatusStudent').value);
        
        // Validar dados obrigatórios
        if (!studentId) {
            throw new Error('Por favor, selecione um aluno');
        }
        
        const memberType = document.getElementById('memberStatusType').value;
        const currentStatus = document.getElementById('memberStatusStatus').value;
        
        if (!memberType || !currentStatus) {
            throw new Error('Por favor, preencha todos os campos obrigatórios');
        }
        
        // Dados do status de membro
        const memberStatusData = {
            student_id: studentId,
            member_type: memberType,
            current_status: currentStatus,
            registered_number: document.getElementById('memberStatusRegisteredNumber').value.trim() || null,
            membership_date: document.getElementById('memberStatusMembershipDate').value || null,
            last_activity_year: parseInt(document.getElementById('memberStatusLastActivityYear').value) || null
        };
        
        // Adicionar status de membro
        await apiRequest('/member-status', 'POST', memberStatusData);
        
        // Dados opcionais de graduação
        const discipline = document.getElementById('memberStatusDiscipline').value;
        const rank = document.getElementById('memberStatusRank').value;
        
        // Se há dados de graduação, adicionar separadamente
        if (discipline && rank) {
            const graduationData = {
                student_id: studentId,
                discipline: discipline,
                rank_name: rank,
                examination_date: document.getElementById('memberStatusExaminationDate').value || null,
                certificate_status: document.getElementById('memberStatusCertificate').value || 'pending',
                certificate_number: document.getElementById('memberStatusCertificateNumber').value.trim() || null
            };
            
            await apiRequest('/member-graduations', 'POST', graduationData);
        }
        
        // Sucesso
        hideAddMemberStatusModal();
        loadMembersData(); // Recarregar lista
        showSuccessMessage('Status/graduação adicionado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao adicionar status:', error);
        showErrorMessage(error.message || 'Erro ao adicionar status');
    } finally {
        // Restaurar botão
        btnText.textContent = 'Adicionar Status';
        spinner.classList.add('hidden');
        submitBtn.disabled = false;
    }
}

// Corrigir função loadMembersData

// Funções auxiliares para exibição
function getMemberTypeDisplay(type) {
    const types = {
        'student': 'Estudante',
        'instructor': 'Instrutor',
        'assistant': 'Assistente',
        'chief_instructor': 'Instrutor Chefe'
    };
    return types[type] || type;
}

function getStatusDisplay(status) {
    const statuses = {
        'active': 'Ativo',
        'inactive': 'Inativo',
        'pending': 'Pendente'
    };
    return statuses[status] || status;
}

function getStatusColor(status) {
    const colors = {
        'active': 'bg-green-100 text-green-800',
        'inactive': 'bg-red-100 text-red-800',
        'pending': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

// Funções para editar e excluir status
async function editMemberStatus(id) {
    try {
        // Buscar dados do status atual
        const response = await apiRequest(`/member-status/${id}`);
        const memberStatus = response;
        
        // Mostrar modal de edição
        showEditMemberStatusModal(memberStatus);
    } catch (error) {
        console.error('Erro ao carregar status:', error);
        showErrorMessage('Erro ao carregar dados do status');
    }
}

async function deleteMemberStatus(id) {
    if (!confirm('Tem certeza que deseja excluir este status de membro?')) {
        return;
    }
    
    try {
        await apiRequest(`/member-status/${id}`, 'DELETE');
        loadMembersData(); // Recarregar lista
        showSuccessMessage('Status de membro excluído com sucesso!');
    } catch (error) {
        console.error('Erro ao excluir status:', error);
        showErrorMessage(error.message || 'Erro ao excluir status');
    }
}

// Expor funções globalmente
window.showAddStudentModal = showAddStudentModal;

window.deleteStudent = deleteStudent;
window.showAddMemberStatusModal = showAddMemberStatusModal;
window.editMemberStatus = editMemberStatus;
window.deleteMemberStatus = deleteMemberStatus;



// ===== FUNÇÕES DE MODAL DE EDIÇÃO DE STATUS =====

// Mostrar modal de editar status de membro
async function showEditMemberStatusModal(memberStatus) {
    const modal = document.getElementById('editMemberStatusModal');
    if (!modal) {
        // Se o modal não existe, criar dinamicamente
        createEditMemberStatusModal();
        return showEditMemberStatusModal(memberStatus);
    }
    
    // Preencher formulário com dados existentes
    document.getElementById('editMemberStatusId').value = memberStatus.id;
    document.getElementById('editMemberStatusType').value = memberStatus.member_type || '';
    document.getElementById('editMemberStatusStatus').value = memberStatus.current_status || '';
    document.getElementById('editMemberStatusRegisteredNumber').value = memberStatus.registered_number || '';
    document.getElementById('editMemberStatusMembershipDate').value = memberStatus.membership_date || '';
    document.getElementById('editMemberStatusLastActivityYear').value = memberStatus.last_activity_year || '';
    
    // Mostrar modal
    modal.classList.remove('hidden');
}

// Esconder modal de editar status de membro
function hideEditMemberStatusModal() {
    const modal = document.getElementById('editMemberStatusModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Criar modal de edição de status dinamicamente
function createEditMemberStatusModal() {
    const modalHTML = `
        <!-- Modal de Editar Status de Membro -->
        <div id="editMemberStatusModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">Editar Status de Membro</h3>
                    <button id="closeEditMemberStatusModal" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="editMemberStatusForm">
                    <input type="hidden" id="editMemberStatusId">
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Membro *</label>
                        <select id="editMemberStatusType" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                            <option value="">Selecione o tipo</option>
                            <option value="student">Estudante</option>
                            <option value="instructor">Instrutor</option>
                            <option value="chief_instructor">Instrutor Chefe</option>
                        </select>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Status Atual *</label>
                        <select id="editMemberStatusStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                            <option value="">Selecione o status</option>
                            <option value="active">Ativo</option>
                            <option value="inactive">Inativo</option>
                            <option value="suspended">Suspenso</option>
                        </select>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Número de Registro</label>
                        <input type="text" id="editMemberStatusRegisteredNumber" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Data de Adesão</label>
                        <input type="date" id="editMemberStatusMembershipDate" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Último Ano de Atividade</label>
                        <input type="number" id="editMemberStatusLastActivityYear" min="2000" max="2030" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    
                    <div class="flex gap-3">
                        <button type="button" id="cancelEditMemberStatus" class="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" class="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                            <span id="editMemberStatusSpinner" class="fas fa-spinner fa-spin mr-2 hidden"></span>
                            <span id="editMemberStatusBtnText">Salvar Alterações</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Adicionar event listeners
    document.getElementById('closeEditMemberStatusModal').addEventListener('click', hideEditMemberStatusModal);
    document.getElementById('cancelEditMemberStatus').addEventListener('click', hideEditMemberStatusModal);
    document.getElementById('editMemberStatusForm').addEventListener('submit', handleEditMemberStatus);
}

// Lidar com edição de status de membro
async function handleEditMemberStatus(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const btnText = document.getElementById('editMemberStatusBtnText');
    const spinner = document.getElementById('editMemberStatusSpinner');
    
    // Mostrar loading
    btnText.textContent = 'Salvando...';
    spinner.classList.remove('hidden');
    submitBtn.disabled = true;
    
    try {
        const statusId = document.getElementById('editMemberStatusId').value;
        const formData = {
            member_type: document.getElementById('editMemberStatusType').value,
            current_status: document.getElementById('editMemberStatusStatus').value,
            registered_number: document.getElementById('editMemberStatusRegisteredNumber').value.trim() || null,
            membership_date: document.getElementById('editMemberStatusMembershipDate').value || null,
            last_activity_year: parseInt(document.getElementById('editMemberStatusLastActivityYear').value) || null
        };
        
        // Validar dados obrigatórios
        if (!formData.member_type || !formData.current_status) {
            throw new Error('Por favor, preencha todos os campos obrigatórios');
        }
        
        // Enviar para API
        await apiRequest(`/member-status/${statusId}`, 'PUT', formData);
        
        // Sucesso
        hideEditMemberStatusModal();
        loadMembersData(); // Recarregar lista
        showSuccessMessage('Status de membro atualizado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao editar status:', error);
        showErrorMessage(error.message || 'Erro ao editar status');
    } finally {
        // Restaurar botão
        btnText.textContent = 'Salvar Alterações';
        spinner.classList.add('hidden');
        submitBtn.disabled = false;
    }
}

// ===== FUNÇÕES DE DETALHES DE MEMBRO =====

// Mostrar detalhes de um membro
async function showMemberDetails(memberId) {
    try {
        // Buscar dados do membro
        const memberResponse = await apiRequest(`/member-status/${memberId}`);
        const member = memberResponse;
        
        // Buscar graduações do membro
        const graduationsResponse = await apiRequest(`/member-status/${memberId}/graduations`);
        const graduations = graduationsResponse;
        
        // Buscar qualificações do membro
        const qualificationsResponse = await apiRequest(`/member-status/${memberId}/qualifications`);
        const qualifications = qualificationsResponse;
        
        // Criar e mostrar modal de detalhes
        createMemberDetailsModal(member, graduations, qualifications);
        
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        showErrorMessage('Erro ao carregar detalhes do membro');
    }
}

// Criar modal de detalhes do membro
function createMemberDetailsModal(member, graduations, qualifications) {
    // Remover modal existente se houver
    const existingModal = document.getElementById('memberDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalHTML = `
        <!-- Modal de Detalhes do Membro -->
        <div id="memberDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-semibold text-gray-800">Detalhes do Membro</h3>
                    <button id="closeMemberDetailsModal" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <!-- Informações do Membro -->
                <div class="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 class="font-semibold text-gray-800 mb-3">Informações Básicas</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span class="text-sm text-gray-600">Nome:</span>
                            <p class="font-medium">${member.student_name || 'N/A'}</p>
                        </div>
                        <div>
                            <span class="text-sm text-gray-600">Email:</span>
                            <p class="font-medium">${member.student_email || 'N/A'}</p>
                        </div>
                        <div>
                            <span class="text-sm text-gray-600">Tipo:</span>
                            <p class="font-medium">${getMemberTypeDisplay(member.member_type)}</p>
                        </div>
                        <div>
                            <span class="text-sm text-gray-600">Status:</span>
                            <span class="px-2 py-1 rounded-full text-xs ${getStatusColor(member.current_status)}">
                                ${getStatusDisplay(member.current_status)}
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- Abas -->
                <div class="border-b border-gray-200 mb-4">
                    <nav class="-mb-px flex space-x-8">
                        <button class="member-detail-tab py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm" data-tab="graduations">
                            Graduações
                        </button>
                        <button class="member-detail-tab py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm" data-tab="qualifications">
                            Qualificações
                        </button>
                    </nav>
                </div>
                
                <!-- Conteúdo das Abas -->
                <div id="graduationsTab" class="member-detail-content">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="font-semibold text-gray-800">Graduações</h4>
                        <button onclick="showAddGraduationModal(${member.id})" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm">
                            <i class="fas fa-plus mr-2"></i>Adicionar Graduação
                        </button>
                    </div>
                    <div id="graduationsList">
                        ${renderGraduationsList(graduations)}
                    </div>
                </div>
                
                <div id="qualificationsTab" class="member-detail-content hidden">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="font-semibold text-gray-800">Qualificações</h4>
                        <button onclick="showAddQualificationModal(${member.id})" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm">
                            <i class="fas fa-plus mr-2"></i>Adicionar Qualificação
                        </button>
                    </div>
                    <div id="qualificationsList">
                        ${renderQualificationsList(qualifications)}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Adicionar event listeners
    document.getElementById('closeMemberDetailsModal').addEventListener('click', () => {
        document.getElementById('memberDetailsModal').remove();
    });
    
    // Event listeners para as abas
    document.querySelectorAll('.member-detail-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchMemberDetailTab(tabName);
        });
    });
}

// Alternar entre abas de detalhes
function switchMemberDetailTab(tabName) {
    // Atualizar botões das abas
    document.querySelectorAll('.member-detail-tab').forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('border-blue-500', 'text-blue-600');
            tab.classList.remove('border-transparent', 'text-gray-500');
        } else {
            tab.classList.remove('border-blue-500', 'text-blue-600');
            tab.classList.add('border-transparent', 'text-gray-500');
        }
    });
    
    // Mostrar/ocultar conteúdo
    document.querySelectorAll('.member-detail-content').forEach(content => {
        if (content.id === `${tabName}Tab`) {
            content.classList.remove('hidden');
        } else {
            content.classList.add('hidden');
        }
    });
}

// Renderizar lista de graduações
function renderGraduationsList(graduations) {
    if (graduations.length === 0) {
        return `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-graduation-cap text-3xl mb-3"></i>
                <p>Nenhuma graduação cadastrada</p>
            </div>
        `;
    }
    
    return `
        <div class="space-y-3">
            ${graduations.map(grad => `
                <div class="bg-white border rounded-lg p-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h5 class="font-medium text-gray-800">${grad.discipline}</h5>
                            <p class="text-sm text-gray-600">${grad.rank_name}</p>
                            <p class="text-xs text-gray-500">
                                ${grad.examination_date ? `Exame: ${new Date(grad.examination_date).toLocaleDateString('pt-BR')}` : 'Sem data de exame'}
                            </p>
                            ${grad.is_current ? '<span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">Atual</span>' : ''}
                        </div>
                        <div class="flex gap-2">
                            <button onclick="editGraduation(${grad.id})" class="text-blue-600 hover:text-blue-800 text-sm">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteGraduation(${grad.id})" class="text-red-600 hover:text-red-800 text-sm">
                                <i class="fas fa-trash"></i>
                            </button>
                            ${!grad.is_current ? `<button onclick="setGraduationAsCurrent(${grad.id})" class="text-green-600 hover:text-green-800 text-sm" title="Definir como atual">
                                <i class="fas fa-star"></i>
                            </button>` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Renderizar lista de qualificações
function renderQualificationsList(qualifications) {
    if (qualifications.length === 0) {
        return `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-certificate text-3xl mb-3"></i>
                <p>Nenhuma qualificação cadastrada</p>
            </div>
        `;
    }
    
    return `
        <div class="space-y-3">
            ${qualifications.map(qual => `
                <div class="bg-white border rounded-lg p-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h5 class="font-medium text-gray-800">${qual.qualification_display}</h5>
                            <p class="text-sm text-gray-600">${qual.certificate_number || 'Sem número de certificado'}</p>
                            <p class="text-xs text-gray-500">
                                ${qual.date_obtained ? `Obtida em: ${new Date(qual.date_obtained).toLocaleDateString('pt-BR')}` : 'Sem data'}
                            </p>
                            ${qual.is_active ? '<span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">Ativa</span>' : '<span class="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full mt-1">Inativa</span>'}
                        </div>
                        <div class="flex gap-2">
                            <button onclick="editQualification(${qual.id})" class="text-blue-600 hover:text-blue-800 text-sm">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteQualification(${qual.id})" class="text-red-600 hover:text-red-800 text-sm">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}



// ===== FUNÇÕES CRUD PARA GRADUAÇÕES =====

// Mostrar modal de adicionar graduação
async function showAddGraduationModal(memberStatusId) {
    const modal = document.getElementById('addGraduationModal');
    if (!modal) {
        createAddGraduationModal();
    }
    
    // Definir o member_status_id
    document.getElementById('graduationMemberStatusId').value = memberStatusId;
    
    // Carregar constantes
    await loadGraduationConstants();
    
    // Limpar formulário
    document.getElementById('addGraduationForm').reset();
    document.getElementById('graduationMemberStatusId').value = memberStatusId;
    
    // Mostrar modal
    document.getElementById('addGraduationModal').classList.remove('hidden');
}

// Criar modal de adicionar graduação
function createAddGraduationModal() {
    const modalHTML = `
        <!-- Modal de Adicionar Graduação -->
        <div id="addGraduationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">Adicionar Graduação</h3>
                    <button id="closeAddGraduationModal" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="addGraduationForm">
                    <input type="hidden" id="graduationMemberStatusId">
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Disciplina *</label>
                        <select id="graduationDiscipline" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                            <option value="">Selecione a disciplina</option>
                            <option value="Shinshin Toitsu Aikido">Shinshin Toitsu Aikido</option>
                            <option value="Shinshin Toitsudo">Shinshin Toitsudo</option>
                        </select>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Graduação *</label>
                        <select id="graduationRank" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                            <option value="">Selecione a graduação</option>
                        </select>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Data do Exame</label>
                        <input type="date" id="graduationExaminationDate" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Número do Certificado</label>
                        <input type="text" id="graduationCertificateNumber" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Status do Certificado</label>
                        <select id="graduationCertificateStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="pending">Pendente</option>
                            <option value="issued">Emitido</option>
                            <option value="received">Recebido</option>
                        </select>
                    </div>
                    
                    <div class="mb-6">
                        <label class="flex items-center">
                            <input type="checkbox" id="graduationIsCurrent" class="mr-2">
                            <span class="text-sm text-gray-700">Definir como graduação atual</span>
                        </label>
                    </div>
                    
                    <div class="flex gap-3">
                        <button type="button" id="cancelAddGraduation" class="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" class="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                            <span id="addGraduationSpinner" class="fas fa-spinner fa-spin mr-2 hidden"></span>
                            <span id="addGraduationBtnText">Adicionar Graduação</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Event listeners
    document.getElementById('closeAddGraduationModal').addEventListener('click', hideAddGraduationModal);
    document.getElementById('cancelAddGraduation').addEventListener('click', hideAddGraduationModal);
    document.getElementById('addGraduationForm').addEventListener('submit', handleAddGraduation);
    document.getElementById('graduationDiscipline').addEventListener('change', updateGraduationRankOptions);
}

// Esconder modal de adicionar graduação
function hideAddGraduationModal() {
    const modal = document.getElementById('addGraduationModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Carregar constantes de graduação
async function loadGraduationConstants() {
    try {
        const response = await apiRequest('/member-status/constants');
        window.graduationConstants = response;
    } catch (error) {
        console.error('Erro ao carregar constantes:', error);
    }
}

// Atualizar opções de graduação baseado na disciplina
function updateGraduationRankOptions() {
    const disciplineSelect = document.getElementById('graduationDiscipline');
    const rankSelect = document.getElementById('graduationRank');
    
    if (!disciplineSelect || !rankSelect || !window.graduationConstants) return;
    
    const discipline = disciplineSelect.value;
    
    // Limpar opções
    rankSelect.innerHTML = '<option value="">Selecione a graduação</option>';
    
    if (!discipline) return;
    
    let ranks = {};
    if (discipline === 'Shinshin Toitsu Aikido') {
        ranks = window.graduationConstants.aikido_ranks || {};
    } else if (discipline === 'Shinshin Toitsudo') {
        ranks = window.graduationConstants.toitsudo_ranks || {};
    }
    
    // Adicionar graduações ordenadas por nível
    const sortedRanks = Object.entries(ranks).sort((a, b) => a[1].level - b[1].level);
    
    sortedRanks.forEach(([key, rank]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = rank.display;
        rankSelect.appendChild(option);
    });
}

// Lidar com adição de graduação
async function handleAddGraduation(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const btnText = document.getElementById('addGraduationBtnText');
    const spinner = document.getElementById('addGraduationSpinner');
    
    // Mostrar loading
    btnText.textContent = 'Adicionando...';
    spinner.classList.remove('hidden');
    submitBtn.disabled = true;
    
    try {
        const memberStatusId = document.getElementById('graduationMemberStatusId').value;
        const formData = {
            discipline: document.getElementById('graduationDiscipline').value,
            rank_name: document.getElementById('graduationRank').value,
            examination_date: document.getElementById('graduationExaminationDate').value || null,
            certificate_number: document.getElementById('graduationCertificateNumber').value.trim() || null,
            certificate_status: document.getElementById('graduationCertificateStatus').value,
            is_current: document.getElementById('graduationIsCurrent').checked
        };
        
        // Validar dados obrigatórios
        if (!formData.discipline || !formData.rank_name) {
            throw new Error('Por favor, preencha todos os campos obrigatórios');
        }
        
        // Enviar para API
        await apiRequest(`/member-status/${memberStatusId}/graduations`, 'POST', formData);
        
        // Sucesso
        hideAddGraduationModal();
        showSuccessMessage('Graduação adicionada com sucesso!');
        
        // Recarregar detalhes se o modal estiver aberto
        const detailsModal = document.getElementById('memberDetailsModal');
        if (detailsModal) {
            showMemberDetails(memberStatusId);
        }
        
    } catch (error) {
        console.error('Erro ao adicionar graduação:', error);
        showErrorMessage(error.message || 'Erro ao adicionar graduação');
    } finally {
        // Restaurar botão
        btnText.textContent = 'Adicionar Graduação';
        spinner.classList.add('hidden');
        submitBtn.disabled = false;
    }
}

// Editar graduação

// Excluir graduação

// Definir graduação como atual


// ===== FUNÇÕES CRUD PARA QUALIFICAÇÕES =====

// Mostrar modal de adicionar qualificação
async function showAddQualificationModal(memberStatusId) {
    const modal = document.getElementById('addQualificationModal');
    if (!modal) {
        createAddQualificationModal();
    }
    
    // Definir o member_status_id
    document.getElementById('qualificationMemberStatusId').value = memberStatusId;
    
    // Carregar constantes
    await loadQualificationConstants();
    
    // Limpar formulário
    document.getElementById('addQualificationForm').reset();
    document.getElementById('qualificationMemberStatusId').value = memberStatusId;
    
    // Mostrar modal
    document.getElementById('addQualificationModal').classList.remove('hidden');
}

// Criar modal de adicionar qualificação
function createAddQualificationModal() {
    const modalHTML = `
        <!-- Modal de Adicionar Qualificação -->
        <div id="addQualificationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">Adicionar Qualificação</h3>
                    <button id="closeAddQualificationModal" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="addQualificationForm">
                    <input type="hidden" id="qualificationMemberStatusId">
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Qualificação *</label>
                        <select id="qualificationType" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" required>
                            <option value="">Selecione o tipo</option>
                        </select>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nível</label>
                        <select id="qualificationLevel" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                            <option value="">Selecione o nível</option>
                        </select>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Data de Obtenção</label>
                        <input type="date" id="qualificationDateObtained" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Número do Certificado</label>
                        <input type="text" id="qualificationCertificateNumber" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    </div>
                    
                    <div class="mb-6">
                        <label class="flex items-center">
                            <input type="checkbox" id="qualificationIsActive" class="mr-2" checked>
                            <span class="text-sm text-gray-700">Qualificação ativa</span>
                        </label>
                    </div>
                    
                    <div class="flex gap-3">
                        <button type="button" id="cancelAddQualification" class="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" class="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                            <span id="addQualificationSpinner" class="fas fa-spinner fa-spin mr-2 hidden"></span>
                            <span id="addQualificationBtnText">Adicionar Qualificação</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Event listeners
    document.getElementById('closeAddQualificationModal').addEventListener('click', hideAddQualificationModal);
    document.getElementById('cancelAddQualification').addEventListener('click', hideAddQualificationModal);
    document.getElementById('addQualificationForm').addEventListener('submit', handleAddQualification);
    document.getElementById('qualificationType').addEventListener('change', updateQualificationLevelOptions);
}

// Esconder modal de adicionar qualificação
function hideAddQualificationModal() {
    const modal = document.getElementById('addQualificationModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Carregar constantes de qualificação
async function loadQualificationConstants() {
    try {
        const response = await apiRequest('/qualifications/constants');
        window.qualificationConstants = response;
        
        // Preencher tipos de qualificação
        const typeSelect = document.getElementById('qualificationType');
        if (typeSelect && response.qualification_types) {
            typeSelect.innerHTML = '<option value="">Selecione o tipo</option>';
            Object.entries(response.qualification_types).forEach(([key, value]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = value;
                typeSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar constantes de qualificação:', error);
    }
}

// Atualizar opções de nível baseado no tipo
function updateQualificationLevelOptions() {
    const typeSelect = document.getElementById('qualificationType');
    const levelSelect = document.getElementById('qualificationLevel');
    
    if (!typeSelect || !levelSelect || !window.qualificationConstants) return;
    
    const type = typeSelect.value;
    
    // Limpar opções
    levelSelect.innerHTML = '<option value="">Selecione o nível</option>';
    
    if (!type) return;
    
    let levels = {};
    if (type === 'examiner' || type === 'special_examiner') {
        levels = window.qualificationConstants.examiner_levels || {};
    } else if (type === 'instructor') {
        levels = window.qualificationConstants.instructor_levels || {};
    }
    
    // Adicionar níveis
    Object.entries(levels).forEach(([key, value]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = value;
        levelSelect.appendChild(option);
    });
}

// Lidar com adição de qualificação
async function handleAddQualification(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const btnText = document.getElementById('addQualificationBtnText');
    const spinner = document.getElementById('addQualificationSpinner');
    
    // Mostrar loading
    btnText.textContent = 'Adicionando...';
    spinner.classList.remove('hidden');
    submitBtn.disabled = true;
    
    try {
        const memberStatusId = document.getElementById('qualificationMemberStatusId').value;
        const formData = {
            qualification_type: document.getElementById('qualificationType').value,
            qualification_level: document.getElementById('qualificationLevel').value || null,
            date_obtained: document.getElementById('qualificationDateObtained').value || null,
            certificate_number: document.getElementById('qualificationCertificateNumber').value.trim() || null,
            is_active: document.getElementById('qualificationIsActive').checked
        };
        
        // Validar dados obrigatórios
        if (!formData.qualification_type) {
            throw new Error('Por favor, selecione o tipo de qualificação');
        }
        
        // Enviar para API
        await apiRequest(`/member-status/${memberStatusId}/qualifications`, 'POST', formData);
        
        // Sucesso
        hideAddQualificationModal();
        showSuccessMessage('Qualificação adicionada com sucesso!');
        
        // Recarregar detalhes se o modal estiver aberto
        const detailsModal = document.getElementById('memberDetailsModal');
        if (detailsModal) {
            showMemberDetails(memberStatusId);
        }
        
    } catch (error) {
        console.error('Erro ao adicionar qualificação:', error);
        showErrorMessage(error.message || 'Erro ao adicionar qualificação');
    } finally {
        // Restaurar botão
        btnText.textContent = 'Adicionar Qualificação';
        spinner.classList.add('hidden');
        submitBtn.disabled = false;
    }
}

// Editar qualificação

// Excluir qualificação

// Atualizar a lista de membros para incluir botão de detalhes
function updateMembersListWithDetails() {
    // Modificar a função loadMembersData para incluir botão de detalhes
    const originalLoadMembersData = window.loadMembersData;
    
    window.loadMembersData = async function() {
        const container = document.getElementById('membersList');
        if (!container) return;
        
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                <p>Carregando membros...</p>
            </div>
        `;
        
        try {
            const response = await apiRequest('/member-status');
            const members = response.members || [];
            
            if (members.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12 text-gray-500">
                        <i class="fas fa-user-graduate text-4xl mb-4"></i>
                        <h3 class="text-lg font-medium mb-2">Nenhum status cadastrado</h3>
                        <p class="mb-4">Comece adicionando o primeiro status de membro.</p>
                        <button onclick="showAddMemberStatusModal()" class="btn-primary text-white px-6 py-3 rounded-lg font-medium">
                            <i class="fas fa-plus mr-2"></i>Adicionar Primeiro Status
                        </button>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Graduação</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${members.map(member => `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="font-medium text-gray-900">${member.student_name || 'N/A'}</div>
                                            <div class="text-sm text-gray-500">${member.student_email || ''}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                                            ${getMemberTypeDisplay(member.member_type)}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="px-2 py-1 rounded-full text-xs ${getStatusColor(member.current_status)}">
                                                ${getStatusDisplay(member.current_status)}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                                            ${member.latest_rank || 'Sem graduação'}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onclick="showMemberDetails(${member.id})" class="text-green-600 hover:text-green-900 mr-3">
                                                <i class="fas fa-eye mr-1"></i>Detalhes
                                            </button>
                                            <button onclick="editMemberStatus(${member.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                                                <i class="fas fa-edit mr-1"></i>Editar
                                            </button>
                                            <button onclick="deleteMemberStatus(${member.id})" class="text-red-600 hover:text-red-900">
                                                <i class="fas fa-trash mr-1"></i>Excluir
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Erro ao carregar membros:', error);
            container.innerHTML = `
                <div class="text-center py-12 text-red-500">
                    <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                    <h3 class="text-lg font-medium mb-2">Erro ao carregar membros</h3>
                    <p class="mb-4">${error.message}</p>
                    <button onclick="loadMembersData()" class="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600">
                        <i class="fas fa-redo mr-2"></i>Tentar Novamente
                    </button>
                </div>
            `;
        }
    };
}

// Chamar a função para atualizar a lista
updateMembersListWithDetails();

// Expor funções globalmente
window.showMemberDetails = showMemberDetails;
window.showAddGraduationModal = showAddGraduationModal;
window.showAddQualificationModal = showAddQualificationModal;
window.editGraduation = editGraduation;
window.deleteGraduation = deleteGraduation;
window.setGraduationAsCurrent = setGraduationAsCurrent;
window.editQualification = editQualification;
window.deleteQualification = deleteQualification;


// ===== SISTEMA DE PAGINAÇÃO E FILTROS PARA ALUNOS =====

// Estado da paginação de alunos
let studentsState = {
    currentPage: 1,
    perPage: 20,
    totalPages: 0,
    totalItems: 0,
    filters: {
        search: '',
        dojo_id: '',
        status: ''
    }
};

// Carregar dados de alunos com paginação e filtros
async function loadStudentsData(page = 1) {
    const container = document.getElementById('studentsList');
    const paginationContainer = document.getElementById('studentsPagination');
    const countElement = document.getElementById('studentsCount');
    
    if (!container) return;
    
    // Mostrar loading se for primeira página
    if (page === 1) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                <p>Carregando alunos...</p>
            </div>
        `;
    }
    
    try {
        // Construir parâmetros da query
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: studentsState.perPage.toString()
        });
        
        // Adicionar filtros se preenchidos
        if (studentsState.filters.search.trim()) {
            params.append('search', studentsState.filters.search.trim());
        }
        if (studentsState.filters.dojo_id) {
            params.append('dojo_id', studentsState.filters.dojo_id);
        }
        if (studentsState.filters.status) {
            params.append('status', studentsState.filters.status);
        }
        
        const response = await apiRequest(`/students?${params.toString()}`);
        const students = response.students || [];
        const pagination = response.pagination || {};
        
        // Atualizar estado
        studentsState.currentPage = pagination.page || 1;
        studentsState.totalPages = pagination.pages || 1;
        studentsState.totalItems = pagination.total || 0;
        
        // Atualizar contador
        if (countElement) {
            countElement.textContent = `${studentsState.totalItems} ${studentsState.totalItems === 1 ? 'aluno' : 'alunos'}`;
        }
        
        // Renderizar lista
        if (students.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-user-graduate text-4xl mb-4"></i>
                    <h3 class="text-lg font-medium mb-2">Nenhum aluno encontrado</h3>
                    <p class="mb-4">
                        ${studentsState.filters.search || studentsState.filters.dojo_id || studentsState.filters.status 
                            ? 'Tente ajustar os filtros de busca.' 
                            : 'Comece adicionando o primeiro aluno.'}
                    </p>
                    ${!studentsState.filters.search && !studentsState.filters.dojo_id && !studentsState.filters.status 
                        ? `<button onclick="showAddStudentModal()" class="btn-primary text-white px-6 py-3 rounded-lg font-medium">
                            <i class="fas fa-plus mr-2"></i>Adicionar Primeiro Aluno
                        </button>` 
                        : ''}
                </div>
            `;
            paginationContainer?.classList.add('hidden');
        } else {
            container.innerHTML = `
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dojo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${students.map(student => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="font-medium text-gray-900">${student.name}</div>
                                        <div class="text-sm text-gray-500">${student.email}</div>
                                        ${student.phone ? `<div class="text-xs text-gray-400">${student.phone}</div>` : ''}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${student.registration_number}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${student.dojo_name || 'N/A'}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 rounded-full text-xs ${getStatusColor(student.status)}">
                                            ${getStatusDisplay(student.status)}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onclick="showEditStudentModal(${student.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                                            <i class="fas fa-edit mr-1"></i>Editar
                                        </button>
                                        <button onclick="deleteStudent(${student.id})" class="text-red-600 hover:text-red-900">
                                            <i class="fas fa-trash mr-1"></i>Excluir
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            
            // Mostrar e atualizar paginação
            updateStudentsPagination();
        }
        
    } catch (error) {
        console.error('Erro ao carregar alunos:', error);
        container.innerHTML = `
            <div class="text-center py-12 text-red-500">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <h3 class="text-lg font-medium mb-2">Erro ao carregar alunos</h3>
                <p class="mb-4">${error.message}</p>
                <button onclick="loadStudentsData()" class="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600">
                    <i class="fas fa-redo mr-2"></i>Tentar Novamente
                </button>
            </div>
        `;
        paginationContainer?.classList.add('hidden');
    }
}

// Atualizar paginação de alunos
function updateStudentsPagination() {
    const paginationContainer = document.getElementById('studentsPagination');
    const pagesContainer = document.getElementById('studentsPagesContainer');
    const prevButton = document.getElementById('studentsPrevPage');
    const nextButton = document.getElementById('studentsNextPage');
    const showingStart = document.getElementById('studentsShowingStart');
    const showingEnd = document.getElementById('studentsShowingEnd');
    const totalElement = document.getElementById('studentsTotal');
    
    if (!paginationContainer || studentsState.totalPages <= 1) {
        paginationContainer?.classList.add('hidden');
        return;
    }
    
    paginationContainer.classList.remove('hidden');
    
    // Atualizar informações de exibição
    const start = (studentsState.currentPage - 1) * studentsState.perPage + 1;
    const end = Math.min(studentsState.currentPage * studentsState.perPage, studentsState.totalItems);
    
    if (showingStart) showingStart.textContent = start.toString();
    if (showingEnd) showingEnd.textContent = end.toString();
    if (totalElement) totalElement.textContent = studentsState.totalItems.toString();
    
    // Atualizar botões anterior/próximo
    if (prevButton) {
        prevButton.disabled = studentsState.currentPage <= 1;
        prevButton.onclick = () => {
            if (studentsState.currentPage > 1) {
                loadStudentsData(studentsState.currentPage - 1);
            }
        };
    }
    
    if (nextButton) {
        nextButton.disabled = studentsState.currentPage >= studentsState.totalPages;
        nextButton.onclick = () => {
            if (studentsState.currentPage < studentsState.totalPages) {
                loadStudentsData(studentsState.currentPage + 1);
            }
        };
    }
    
    // Gerar botões de páginas
    if (pagesContainer) {
        pagesContainer.innerHTML = generatePageButtons(studentsState.currentPage, studentsState.totalPages, (page) => {
            loadStudentsData(page);
        });
    }
}

// Aplicar filtros de alunos
function applyStudentsFilters() {
    // Coletar valores dos filtros
    studentsState.filters.search = document.getElementById('studentSearch')?.value || '';
    studentsState.filters.dojo_id = document.getElementById('studentDojoFilter')?.value || '';
    studentsState.filters.status = document.getElementById('studentStatusFilter')?.value || '';
    
    // Resetar para primeira página e carregar
    loadStudentsData(1);
}

// Limpar filtros de alunos
function clearStudentsFilters() {
    document.getElementById('studentSearch').value = '';
    document.getElementById('studentDojoFilter').value = '';
    document.getElementById('studentStatusFilter').value = '';
    
    studentsState.filters = {
        search: '',
        dojo_id: '',
        status: ''
    };
    
    loadStudentsData(1);
}

// Carregar opções de dojos para filtro
async function loadDojoOptions() {
    try {
        const response = await apiRequest('/dojos');
        let dojos = response.dojos || [];
        
        // Filtrar dojos baseado nas permissões do usuário
        dojos = filterDataByPermissions(dojos, 'dojos');
        
        const studentDojoFilter = document.getElementById('studentDojoFilter');
        const studentDojoSelect = document.getElementById('studentDojo'); // Para modal de adicionar
        
        // Atualizar filtro de dojos
        if (studentDojoFilter) {
            // Limpar opções existentes (exceto "Todos os dojos")
            studentDojoFilter.innerHTML = '<option value="">Todos os dojos</option>';
            
            dojos.forEach(dojo => {
                const option = document.createElement('option');
                option.value = dojo.id;
                option.textContent = dojo.name;
                studentDojoFilter.appendChild(option);
            });
        }
        
        // Atualizar select do modal de adicionar estudante
        if (studentDojoSelect) {
            // Limpar opções existentes
            studentDojoSelect.innerHTML = '<option value="">Selecione um dojo</option>';
            
            dojos.forEach(dojo => {
                const option = document.createElement('option');
                option.value = dojo.id;
                option.textContent = dojo.name;
                studentDojoSelect.appendChild(option);
            });
            
            // Se usuário não é admin, selecionar automaticamente seu dojo
            if (currentUser && currentUser.role !== 'admin' && currentUser.dojo_id) {
                studentDojoSelect.value = currentUser.dojo_id;
            }
        }
        
    } catch (error) {
        console.error('Erro ao carregar dojos:', error);
    }
}

// ===== SISTEMA DE PAGINAÇÃO E FILTROS PARA MEMBROS =====

// Estado da paginação de membros
let membersState = {
    currentPage: 1,
    perPage: 20,
    totalPages: 0,
    totalItems: 0,
    filters: {
        search: '',
        member_type: '',
        current_status: ''
    }
};

// Carregar dados de membros com paginação e filtros
async function loadMembersData(page = 1) {
    const container = document.getElementById('membersList');
    const paginationContainer = document.getElementById('membersPagination');
    const countElement = document.getElementById('membersCount');
    
    if (!container) return;
    
    // Mostrar loading se for primeira página
    if (page === 1) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                <p>Carregando membros...</p>
            </div>
        `;
    }
    
    try {
        // Construir parâmetros da query
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: membersState.perPage.toString()
        });
        
        // Adicionar filtros se preenchidos
        if (membersState.filters.search.trim()) {
            params.append('search', membersState.filters.search.trim());
        }
        if (membersState.filters.member_type) {
            params.append('member_type', membersState.filters.member_type);
        }
        if (membersState.filters.current_status) {
            params.append('current_status', membersState.filters.current_status);
        }
        
        const response = await apiRequest(`/member-status?${params.toString()}`);
        const members = response.members || [];
        const pagination = response.pagination || {};
        
        // Atualizar estado
        membersState.currentPage = pagination.page || 1;
        membersState.totalPages = pagination.pages || 1;
        membersState.totalItems = pagination.total || 0;
        
        // Atualizar contador
        if (countElement) {
            countElement.textContent = `${membersState.totalItems} ${membersState.totalItems === 1 ? 'membro' : 'membros'}`;
        }
        
        // Renderizar lista
        if (members.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-user-graduate text-4xl mb-4"></i>
                    <h3 class="text-lg font-medium mb-2">Nenhum membro encontrado</h3>
                    <p class="mb-4">
                        ${membersState.filters.search || membersState.filters.member_type || membersState.filters.current_status
                            ? 'Tente ajustar os filtros de busca.'
                            : 'Comece adicionando o primeiro status de membro.'}
                    </p>
                    ${!membersState.filters.search && !membersState.filters.member_type && !membersState.filters.current_status
                        ? `<button onclick="showAddMemberStatusModal()" class="btn-primary text-white px-6 py-3 rounded-lg font-medium">
                            <i class="fas fa-plus mr-2"></i>Adicionar Primeiro Status
                        </button>`
                        : ''}
                </div>
            `;
            paginationContainer?.classList.add('hidden');
        } else {
            container.innerHTML = `
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Graduação</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${members.map(member => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="font-medium text-gray-900">${member.student_name || 'N/A'}</div>
                                        <div class="text-sm text-gray-500">${member.student_email || ''}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                                        ${getMemberTypeDisplay(member.member_type)}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 rounded-full text-xs ${getStatusColor(member.current_status)}">
                                            ${getStatusDisplay(member.current_status)}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                                        ${member.latest_rank || 'Sem graduação'}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onclick="showMemberDetails(${member.id})" class="text-green-600 hover:text-green-900 mr-3">
                                            <i class="fas fa-eye mr-1"></i>Detalhes
                                        </button>
                                        <button onclick="editMemberStatus(${member.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                                            <i class="fas fa-edit mr-1"></i>Editar
                                        </button>
                                        <button onclick="deleteMemberStatus(${member.id})" class="text-red-600 hover:text-red-900">
                                            <i class="fas fa-trash mr-1"></i>Excluir
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            
            // Mostrar e atualizar paginação
            updateMembersPagination();
        }
        
    } catch (error) {
        console.error('Erro ao carregar membros:', error);
        container.innerHTML = `
            <div class="text-center py-12 text-red-500">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <h3 class="text-lg font-medium mb-2">Erro ao carregar membros</h3>
                <p class="mb-4">${error.message}</p>
                <button onclick="loadMembersData()" class="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600">
                    <i class="fas fa-redo mr-2"></i>Tentar Novamente
                </button>
            </div>
        `;
        paginationContainer?.classList.add('hidden');
    }
}

// Atualizar paginação de membros
function updateMembersPagination() {
    const paginationContainer = document.getElementById('membersPagination');
    const pagesContainer = document.getElementById('membersPagesContainer');
    const prevButton = document.getElementById('membersPrevPage');
    const nextButton = document.getElementById('membersNextPage');
    const showingStart = document.getElementById('membersShowingStart');
    const showingEnd = document.getElementById('membersShowingEnd');
    const totalElement = document.getElementById('membersTotal');
    
    if (!paginationContainer || membersState.totalPages <= 1) {
        paginationContainer?.classList.add('hidden');
        return;
    }
    
    paginationContainer.classList.remove('hidden');
    
    // Atualizar informações de exibição
    const start = (membersState.currentPage - 1) * membersState.perPage + 1;
    const end = Math.min(membersState.currentPage * membersState.perPage, membersState.totalItems);
    
    if (showingStart) showingStart.textContent = start.toString();
    if (showingEnd) showingEnd.textContent = end.toString();
    if (totalElement) totalElement.textContent = membersState.totalItems.toString();
    
    // Atualizar botões anterior/próximo
    if (prevButton) {
        prevButton.disabled = membersState.currentPage <= 1;
        prevButton.onclick = () => {
            if (membersState.currentPage > 1) {
                loadMembersData(membersState.currentPage - 1);
            }
        };
    }
    
    if (nextButton) {
        nextButton.disabled = membersState.currentPage >= membersState.totalPages;
        nextButton.onclick = () => {
            if (membersState.currentPage < membersState.totalPages) {
                loadMembersData(membersState.currentPage + 1);
            }
        };
    }
    
    // Gerar botões de páginas
    if (pagesContainer) {
        pagesContainer.innerHTML = generatePageButtons(membersState.currentPage, membersState.totalPages, (page) => {
            loadMembersData(page);
        });
    }
}

// Aplicar filtros de membros
function applyMembersFilters() {
    // Coletar valores dos filtros
    membersState.filters.search = document.getElementById('memberSearch')?.value || '';
    membersState.filters.member_type = document.getElementById('memberTypeFilter')?.value || '';
    membersState.filters.current_status = document.getElementById('memberStatusFilter')?.value || '';
    
    // Resetar para primeira página e carregar
    loadMembersData(1);
}

// Limpar filtros de membros
function clearMembersFilters() {
    document.getElementById('memberSearch').value = '';
    document.getElementById('memberTypeFilter').value = '';
    document.getElementById('memberStatusFilter').value = '';
    
    membersState.filters = {
        search: '',
        member_type: '',
        current_status: ''
    };
    
    loadMembersData(1);
}

// Função utilitária para gerar botões de páginas
function generatePageButtons(currentPage, totalPages, onPageClick) {
    const buttons = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Ajustar se não há páginas suficientes no final
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Primeira página
    if (startPage > 1) {
        buttons.push(`
            <button onclick="(${onPageClick})(1)" class="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                1
            </button>
        `);
        if (startPage > 2) {
            buttons.push('<span class="px-2 text-gray-500">...</span>');
        }
    }
    
    // Páginas visíveis
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        buttons.push(`
            <button 
                onclick="(${onPageClick})(${i})" 
                class="px-3 py-1 border rounded text-sm ${isActive 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'border-gray-300 hover:bg-gray-50'}"
            >
                ${i}
            </button>
        `);
    }
    
    // Última página
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            buttons.push('<span class="px-2 text-gray-500">...</span>');
        }
        buttons.push(`
            <button onclick="(${onPageClick})(${totalPages})" class="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                ${totalPages}
            </button>
        `);
    }
    
    return buttons.join('');
}


// ===== EVENT LISTENERS PARA FILTROS E PAGINAÇÃO =====

// Inicializar event listeners quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners para filtros de alunos
    const studentSearch = document.getElementById('studentSearch');
    const studentDojoFilter = document.getElementById('studentDojoFilter');
    const studentStatusFilter = document.getElementById('studentStatusFilter');
    const clearStudentFiltersBtn = document.getElementById('clearStudentFilters');
    const studentsPerPageSelect = document.getElementById('studentsPerPage');
    
    if (studentSearch) {
        // Debounce para busca
        let searchTimeout;
        studentSearch.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                applyStudentsFilters();
            }, 500);
        });
    }
    
    if (studentDojoFilter) {
        studentDojoFilter.addEventListener('change', applyStudentsFilters);
    }
    
    if (studentStatusFilter) {
        studentStatusFilter.addEventListener('change', applyStudentsFilters);
    }
    
    if (clearStudentFiltersBtn) {
        clearStudentFiltersBtn.addEventListener('click', clearStudentsFilters);
    }
    
    if (studentsPerPageSelect) {
        studentsPerPageSelect.addEventListener('change', function() {
            studentsState.perPage = parseInt(this.value);
            loadStudentsData(1);
        });
    }
    
    // Event listeners para filtros de membros
    const memberSearch = document.getElementById('memberSearch');
    const memberTypeFilter = document.getElementById('memberTypeFilter');
    const memberStatusFilter = document.getElementById('memberStatusFilter');
    const clearMemberFiltersBtn = document.getElementById('clearMemberFilters');
    const membersPerPageSelect = document.getElementById('membersPerPage');
    
    if (memberSearch) {
        // Debounce para busca
        let searchTimeout;
        memberSearch.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                applyMembersFilters();
            }, 500);
        });
    }
    
    if (memberTypeFilter) {
        memberTypeFilter.addEventListener('change', applyMembersFilters);
    }
    
    if (memberStatusFilter) {
        memberStatusFilter.addEventListener('change', applyMembersFilters);
    }
    
    if (clearMemberFiltersBtn) {
        clearMemberFiltersBtn.addEventListener('click', clearMembersFilters);
    }
    
    if (membersPerPageSelect) {
        membersPerPageSelect.addEventListener('change', function() {
            membersState.perPage = parseInt(this.value);
            loadMembersData(1);
        });
    }
    
    // Carregar opções de dojos
    loadDojoOptions();
});

// Sobrescrever as funções originais de carregamento para usar as novas com paginação
window.loadStudentsData = loadStudentsData;
window.loadMembersData = loadMembersData;

// Expor funções globalmente
window.applyStudentsFilters = applyStudentsFilters;
window.clearStudentsFilters = clearStudentsFilters;
window.applyMembersFilters = applyMembersFilters;
window.clearMembersFilters = clearMembersFilters;


// ===== FUNCIONALIDADES DE ADMINISTRAÇÃO =====

// Controle de acesso baseado em role
function updateUIBasedOnUserRole(user) {
    if (!user) return;
    
    const adminTab = document.getElementById('adminTabButton');
    const isAdmin = user.role === 'admin';
    
    // Controle da aba de administração
    if (isAdmin) {
        adminTab?.classList.remove('hidden');
    } else {
        adminTab?.classList.add('hidden');
    }
    
    // Controle de elementos específicos por role
    updateElementsVisibility(user);
    
    // Atualizar filtros baseado na role
    updateFiltersBasedOnRole(user);
}

// Atualizar visibilidade de elementos baseado na role
function updateElementsVisibility(user) {
    const isAdmin = user.role === 'admin';
    
    // Elementos que só admins podem ver
    const adminOnlyElements = document.querySelectorAll('[data-admin-only="true"]');
    adminOnlyElements.forEach(element => {
        if (isAdmin) {
            element.classList.remove('hidden');
            element.disabled = false;
        } else {
            element.classList.add('hidden');
            element.disabled = true;
        }
    });
    
    // Elementos que só usuários de dojo podem ver
    const dojoOnlyElements = document.querySelectorAll('[data-dojo-only="true"]');
    dojoOnlyElements.forEach(element => {
        if (!isAdmin) {
            element.classList.remove('hidden');
            element.disabled = false;
        } else {
            element.classList.add('hidden');
            element.disabled = true;
        }
    });
    
    // Campos condicionais no formulário de estudantes
    updateStudentFormFields(user);
}

// Atualizar campos do formulário de estudantes baseado na role
function updateStudentFormFields(user) {
    const dojoSelectContainer = document.querySelector('[data-field="dojo-select"]');
    const dojoSelect = document.getElementById('studentDojo');
    
    if (user.role === 'admin') {
        // Admin pode selecionar qualquer dojo
        if (dojoSelectContainer) {
            dojoSelectContainer.classList.remove('hidden');
        }
        if (dojoSelect) {
            dojoSelect.disabled = false;
            dojoSelect.required = true;
        }
    } else {
        // Usuário de dojo não pode alterar o dojo
        if (dojoSelectContainer) {
            dojoSelectContainer.classList.add('hidden');
        }
        if (dojoSelect) {
            dojoSelect.disabled = true;
            dojoSelect.required = false;
            dojoSelect.value = user.dojo_id || '';
        }
    }
}

// Atualizar filtros baseado na role do usuário
function updateFiltersBasedOnRole(user) {
    if (!user) return;
    
    const isAdmin = user.role === 'admin';
    
    // Controle do filtro de dojo para estudantes
    const studentDojoFilter = document.getElementById('studentDojoFilter');
    const studentDojoFilterContainer = studentDojoFilter?.closest('[data-admin-only="true"]');
    
    if (isAdmin) {
        // Admin pode filtrar por qualquer dojo
        if (studentDojoFilterContainer) {
            studentDojoFilterContainer.classList.remove('hidden');
        }
        if (studentDojoFilter) {
            studentDojoFilter.disabled = false;
        }
    } else {
        // Usuário de dojo não precisa do filtro de dojo (só vê seu próprio dojo)
        if (studentDojoFilterContainer) {
            studentDojoFilterContainer.classList.add('hidden');
        }
        if (studentDojoFilter) {
            studentDojoFilter.disabled = true;
            studentDojoFilter.value = user.dojo_id || '';
        }
    }
    
    // Ajustar layout do grid de filtros quando elementos são ocultados
    adjustFilterGridLayout();
    
    // Configurar filtros padrão baseado na role
    setDefaultFiltersForRole(user);
}

// Ajustar layout do grid de filtros quando elementos são ocultados
function adjustFilterGridLayout() {
    const filterGrids = document.querySelectorAll('.grid');
    
    filterGrids.forEach(grid => {
        const visibleChildren = Array.from(grid.children).filter(child => 
            !child.classList.contains('hidden')
        );
        
        // Ajustar classes do grid baseado no número de elementos visíveis
        grid.classList.remove('md:grid-cols-2', 'md:grid-cols-3', 'md:grid-cols-4');
        
        if (visibleChildren.length <= 2) {
            grid.classList.add('md:grid-cols-2');
        } else if (visibleChildren.length === 3) {
            grid.classList.add('md:grid-cols-3');
        } else {
            grid.classList.add('md:grid-cols-4');
        }
    });
}

// Configurar filtros padrão baseado na role
function setDefaultFiltersForRole(user) {
    if (!user) return;
    
    // Para usuários não-admin, definir dojo padrão nos filtros
    if (user.role !== 'admin' && user.dojo_id) {
        // Filtro de estudantes
        const studentDojoFilter = document.getElementById('studentDojoFilter');
        if (studentDojoFilter) {
            studentDojoFilter.value = user.dojo_id.toString();
        }
        
        // Atualizar estados de filtros
        if (typeof studentsState !== 'undefined') {
            studentsState.filters.dojo_id = user.dojo_id.toString();
        }
    }
}

// Verificar permissões antes de executar ações
function checkPermissionForAction(action, targetDojoId = null) {
    if (!currentUser) {
        showErrorMessage('Usuário não autenticado');
        return false;
    }
    
    const isAdmin = currentUser.role === 'admin';
    
    switch (action) {
        case 'create_student':
        case 'edit_student':
        case 'delete_student':
            // Admin pode gerenciar estudantes de qualquer dojo
            // Usuário de dojo só pode gerenciar estudantes do seu dojo
            if (isAdmin) return true;
            if (targetDojoId && targetDojoId !== currentUser.dojo_id) {
                showErrorMessage('Você não tem permissão para gerenciar estudantes de outros dojos');
                return false;
            }
            return true;
            
        case 'manage_dojos':
            // Apenas admin pode gerenciar dojos
            if (!isAdmin) {
                showErrorMessage('Apenas administradores podem gerenciar dojos');
                return false;
            }
            return true;
            
        case 'view_admin_stats':
            // Apenas admin pode ver estatísticas administrativas
            if (!isAdmin) {
                showErrorMessage('Acesso negado');
                return false;
            }
            return true;
            
        default:
            return true;
    }
}

// Filtrar dados baseado nas permissões do usuário
function filterDataByPermissions(data, dataType) {
    if (!currentUser || !data) return data;
    
    const isAdmin = currentUser.role === 'admin';
    
    switch (dataType) {
        case 'students':
            // Usuários não-admin só veem estudantes do seu dojo
            if (!isAdmin && currentUser.dojo_id) {
                return data.filter(student => student.dojo_id === currentUser.dojo_id);
            }
            return data;
            
        case 'members':
            // Usuários não-admin só veem membros do seu dojo
            if (!isAdmin && currentUser.dojo_id) {
                return data.filter(member => member.dojo_id === currentUser.dojo_id);
            }
            return data;
            
        case 'dojos':
            // Apenas admin pode ver todos os dojos
            if (!isAdmin && currentUser.dojo_id) {
                return data.filter(dojo => dojo.id === currentUser.dojo_id);
            }
            return data;
            
        default:
            return data;
    }
}

// Carregar estatísticas administrativas
async function loadAdminStats() {
    try {
        // Carregar estatísticas de dojos
        const dojosResponse = await apiRequest('/dojos');
        const dojos = dojosResponse.dojos || [];
        const activeDojos = dojos.filter(dojo => dojo.is_active);
        
        document.getElementById('totalDojos').textContent = dojos.length;
        document.getElementById('dojosAtivos').textContent = activeDojos.length;
        
        // Carregar estatísticas de alunos
        const studentsResponse = await apiRequest('/students/stats');
        const studentsStats = studentsResponse.stats || {};
        
        document.getElementById('totalAlunosAdmin').textContent = studentsStats.total || 0;
        
        // Carregar estatísticas de membros
        const membersResponse = await apiRequest('/member-status?per_page=1');
        const membersPagination = membersResponse.pagination || {};
        
        document.getElementById('totalMembrosAdmin').textContent = membersPagination.total || 0;
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas administrativas:', error);
    }
}

// Carregar lista de dojos
async function loadDojosList() {
    const container = document.getElementById('dojosList');
    if (!container) return;
    
    container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
            <p>Carregando dojos...</p>
        </div>
    `;
    
    try {
        const response = await apiRequest('/dojos');
        const dojos = response.dojos || [];
        
        if (dojos.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-building text-4xl mb-4"></i>
                    <h3 class="text-lg font-medium mb-2">Nenhum dojo cadastrado</h3>
                    <p class="mb-4">Comece adicionando o primeiro dojo.</p>
                    <button onclick="showAddDojoModal()" class="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600">
                        <i class="fas fa-plus mr-2"></i>Adicionar Primeiro Dojo
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dojo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alunos</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${dojos.map(dojo => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="font-medium text-gray-900">${dojo.name}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${dojo.address || 'N/A'}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${dojo.contact_email || 'N/A'}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 rounded-full text-xs ${dojo.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                            ${dojo.is_active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${dojo.student_count || 0}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onclick="showDojoDetails(${dojo.id})" class="text-green-600 hover:text-green-900 mr-3">
                                            <i class="fas fa-eye mr-1"></i>Detalhes
                                        </button>
                                        <button onclick="editDojo(${dojo.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                                            <i class="fas fa-edit mr-1"></i>Editar
                                        </button>
                                        <button onclick="toggleDojoStatus(${dojo.id}, ${!dojo.is_active})" class="text-orange-600 hover:text-orange-900">
                                            <i class="fas fa-toggle-${dojo.is_active ? 'off' : 'on'} mr-1"></i>${dojo.is_active ? 'Desativar' : 'Ativar'}
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Erro ao carregar dojos:', error);
        container.innerHTML = `
            <div class="text-center py-12 text-red-500">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <h3 class="text-lg font-medium mb-2">Erro ao carregar dojos</h3>
                <p class="mb-4">${error.message}</p>
                <button onclick="loadDojosList()" class="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600">
                    <i class="fas fa-redo mr-2"></i>Tentar Novamente
                </button>
            </div>
        `;
    }
}

// Mostrar modal de adicionar dojo
function showAddDojoModal() {
    // Criar modal dinamicamente se não existir
    if (!document.getElementById('addDojoModal')) {
        createAddDojoModal();
    }
    
    // Limpar formulário
    document.getElementById('addDojoForm').reset();
    
    // Mostrar modal
    document.getElementById('addDojoModal').classList.remove('hidden');
}

// Criar modal de adicionar dojo
function createAddDojoModal() {
    const modalHTML = `
        <!-- Modal de Adicionar Dojo -->
        <div id="addDojoModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">Adicionar Dojo</h3>
                    <button id="closeAddDojoModal" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="addDojoForm">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Dojo *</label>
                        <input type="text" id="dojoName" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Endereço *</label>
                        <input type="text" id="dojoAddress" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email de Contato *</label>
                        <input type="email" id="dojoContactEmail" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                        <input type="text" id="dojoContactPhone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    
                    <div class="mb-6">
                        <label class="flex items-center">
                            <input type="checkbox" id="dojoIsActive" class="mr-2" checked>
                            <span class="text-sm text-gray-700">Dojo ativo</span>
                        </label>
                    </div>
                    
                    <div class="flex gap-3">
                        <button type="button" id="cancelAddDojo" class="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" class="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                            <span id="addDojoSpinner" class="fas fa-spinner fa-spin mr-2 hidden"></span>
                            <span id="addDojoBtnText">Adicionar Dojo</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Event listeners
    document.getElementById('closeAddDojoModal').addEventListener('click', hideAddDojoModal);
    document.getElementById('cancelAddDojo').addEventListener('click', hideAddDojoModal);
    document.getElementById('addDojoForm').addEventListener('submit', handleAddDojo);
}

// Esconder modal de adicionar dojo
function hideAddDojoModal() {
    const modal = document.getElementById('addDojoModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Lidar com adição de dojo
async function handleAddDojo(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const btnText = document.getElementById('addDojoBtnText');
    const spinner = document.getElementById('addDojoSpinner');
    
    // Mostrar loading
    btnText.textContent = 'Adicionando...';
    spinner.classList.remove('hidden');
    submitBtn.disabled = true;
    
    try {
        const formData = {
            name: document.getElementById('dojoName').value.trim(),
            address: document.getElementById('dojoAddress').value.trim(),
            contact_email: document.getElementById('dojoContactEmail').value.trim(),
            contact_phone: document.getElementById('dojoContactPhone').value.trim() || null,
            is_active: document.getElementById('dojoIsActive').checked
        };
        
        // Validar dados obrigatórios
        if (!formData.name || !formData.address || !formData.contact_email) {
            throw new Error('Por favor, preencha todos os campos obrigatórios');
        }
        
        // Enviar para API
        await apiRequest('/dojos', 'POST', formData);
        
        // Sucesso
        hideAddDojoModal();
        loadDojosList(); // Recarregar lista
        loadAdminStats(); // Atualizar estatísticas
        showSuccessMessage('Dojo adicionado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao adicionar dojo:', error);
        showErrorMessage(error.message || 'Erro ao adicionar dojo');
    } finally {
        // Restaurar botão
        btnText.textContent = 'Adicionar Dojo';
        spinner.classList.add('hidden');
        submitBtn.disabled = false;
    }
}

// Alternar status do dojo
async function toggleDojoStatus(dojoId, newStatus) {
    const action = newStatus ? 'ativar' : 'desativar';
    
    if (!confirm(`Tem certeza que deseja ${action} este dojo?`)) {
        return;
    }
    
    try {
        await apiRequest(`/dojos/${dojoId}`, 'PUT', { is_active: newStatus });
        loadDojosList(); // Recarregar lista
        loadAdminStats(); // Atualizar estatísticas
        showSuccessMessage(`Dojo ${action === 'ativar' ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
        console.error('Erro ao alterar status do dojo:', error);
        showErrorMessage(error.message || 'Erro ao alterar status do dojo');
    }
}

// ===== FUNCIONALIDADES DE PERFIL =====

// Carregar informações do perfil
async function loadUserProfile() {
    try {
        const response = await apiRequest('/auth/me');
        const user = response.user;
        
        if (user) {
            // Preencher informações do usuário
            document.getElementById('profileUserName').textContent = user.name || 'N/A';
            document.getElementById('profileUserEmail').textContent = user.email || 'N/A';
            document.getElementById('profileUserRole').textContent = user.role === 'admin' ? 'Administrador' : 'Usuário de Dojo';
            
            // Mostrar informações do dojo se aplicável
            if (user.dojo_name) {
                document.getElementById('userDojo').textContent = user.dojo_name;
                document.getElementById('userDojoInfo').classList.remove('hidden');
            } else {
                document.getElementById('userDojoInfo').classList.add('hidden');
            }
            
            // Formatar data de criação
            if (user.created_at) {
                const createdDate = new Date(user.created_at);
                document.getElementById('userCreatedAt').textContent = createdDate.toLocaleDateString('pt-BR');
            }
            
            // Atualizar UI baseado na role
            updateUIBasedOnUserRole(user);
        }
        
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        showErrorMessage('Erro ao carregar informações do perfil');
    }
}

// Lidar com alteração de senha
async function handleChangePassword(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const btnText = document.getElementById('changePasswordBtnText');
    const spinner = document.getElementById('changePasswordSpinner');
    
    // Mostrar loading
    btnText.textContent = 'Alterando...';
    spinner.classList.remove('hidden');
    submitBtn.disabled = true;
    
    try {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validações
        if (!currentPassword || !newPassword || !confirmPassword) {
            throw new Error('Por favor, preencha todos os campos');
        }
        
        if (newPassword !== confirmPassword) {
            throw new Error('A nova senha e a confirmação não coincidem');
        }
        
        if (newPassword.length < 6) {
            throw new Error('A nova senha deve ter pelo menos 6 caracteres');
        }
        
        // Enviar para API
        await apiRequest('/auth/change-password', 'POST', {
            current_password: currentPassword,
            new_password: newPassword
        });
        
        // Sucesso
        document.getElementById('changePasswordForm').reset();
        showSuccessMessage('Senha alterada com sucesso!');
        
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        showErrorMessage(error.message || 'Erro ao alterar senha');
    } finally {
        // Restaurar botão
        btnText.textContent = 'Alterar Senha';
        spinner.classList.add('hidden');
        submitBtn.disabled = false;
    }
}

// Event listeners para perfil
document.addEventListener('DOMContentLoaded', function() {
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
    }
    
    // Event listeners já estão configurados via onclick no HTML
});

// Expor funções globalmente
window.loadAdminStats = loadAdminStats;
window.loadDojosList = loadDojosList;
window.loadUserProfile = loadUserProfile;
window.showAddDojoModal = showAddDojoModal;
window.toggleDojoStatus = toggleDojoStatus;


// ===== INTEGRAÇÃO COM SISTEMA DE AUTENTICAÇÃO =====

// Sobrescrever a função updateUserInfo para incluir controle de acesso
const originalUpdateUserInfo = window.updateUserInfo;
window.updateUserInfo = function() {
    if (originalUpdateUserInfo) {
        originalUpdateUserInfo();
    }
    
    // Aplicar controle de acesso visual
    if (currentUser) {
        updateUIBasedOnUserRole(currentUser);
    }
};

// Sobrescrever a função showMainApp para garantir controle de acesso
const originalShowMainApp = window.showMainApp;
window.showMainApp = function() {
    if (originalShowMainApp) {
        originalShowMainApp();
    }
    
    // Aplicar controle de acesso visual após mostrar a aplicação
    setTimeout(() => {
        if (currentUser) {
            updateUIBasedOnUserRole(currentUser);
        }
    }, 100);
};

// Função para recarregar dados quando a role do usuário muda
function refreshDataBasedOnRole(user) {
    if (!user) return;
    
    // Recarregar dados de estudantes se estiver na aba de estudantes
    const studentsTab = document.getElementById('studentsTab');
    if (studentsTab && !studentsTab.classList.contains('hidden')) {
        loadStudentsData(1);
    }
    
    // Recarregar dados de membros se estiver na aba de membros
    const membersTab = document.getElementById('membersTab');
    if (membersTab && !membersTab.classList.contains('hidden')) {
        loadMembersData(1);
    }
    
    // Recarregar dados administrativos se for admin
    if (user.role === 'admin') {
        const adminTab = document.getElementById('adminTabButton');
        if (adminTab && !adminTab.classList.contains('hidden')) {
            loadAdminStats();
            loadDojosList();
        }
    }
}

// Expor funções globalmente
window.updateUIBasedOnUserRole = updateUIBasedOnUserRole;
window.refreshDataBasedOnRole = refreshDataBasedOnRole;


// ===== GESTÃO DE DOJOS =====

// Função para abrir modal de adicionar dojo
function openAddDojoModal() {
    document.getElementById('addDojoModal').classList.remove('hidden');
    document.getElementById('addDojoForm').reset();
    document.getElementById('dojoIsActive').checked = true;
}

// Função para fechar modal de adicionar dojo
function closeAddDojoModal() {
    document.getElementById('addDojoModal').classList.add('hidden');
}

// Função para abrir modal de editar dojo
function openEditDojoModal(dojo) {
    document.getElementById('editDojoModal').classList.remove('hidden');
    document.getElementById('editDojoId').value = dojo.id;
    document.getElementById('editDojoName').value = dojo.name;
    document.getElementById('editDojoAddress').value = dojo.address;
    document.getElementById('editDojoContactEmail').value = dojo.contact_email || '';
    document.getElementById('editDojoContactPhone').value = dojo.contact_phone || '';
    document.getElementById('editDojoIsActive').checked = dojo.is_active;
}

// Função para fechar modal de editar dojo
function closeEditDojoModal() {
    document.getElementById('editDojoModal').classList.add('hidden');
}

// Função para adicionar novo dojo
async function addDojo(event) {
    event.preventDefault();
    
    const btnText = document.getElementById('addDojoBtnText');
    const spinner = document.getElementById('addDojoSpinner');
    
    btnText.textContent = 'Adicionando...';
    spinner.classList.remove('hidden');
    
    try {
        const dojoData = {
            name: document.getElementById('dojoName').value,
            address: document.getElementById('dojoAddress').value,
            contact_email: document.getElementById('dojoContactEmail').value || null,
            contact_phone: document.getElementById('dojoContactPhone').value || null,
            is_active: document.getElementById('dojoIsActive').checked
        };
        
        const response = await apiRequest('/dojos', {
            method: 'POST',
            body: JSON.stringify(dojoData)
        });
        
        if (response.message) {
            showNotification('Dojo adicionado com sucesso!', 'success');
            closeAddDojoModal();
            loadAdminStats(); // Recarregar estatísticas
            loadDojosData(); // Recarregar lista de dojos
        }
    } catch (error) {
        console.error('Erro ao adicionar dojo:', error);
        showNotification('Erro ao adicionar dojo. Tente novamente.', 'error');
    } finally {
        btnText.textContent = 'Adicionar Dojo';
        spinner.classList.add('hidden');
    }
}

// Função para editar dojo
async function editDojo(event) {
    event.preventDefault();
    
    const btnText = document.getElementById('editDojoBtnText');
    const spinner = document.getElementById('editDojoSpinner');
    
    btnText.textContent = 'Salvando...';
    spinner.classList.remove('hidden');
    
    try {
        const dojoId = document.getElementById('editDojoId').value;
        const dojoData = {
            name: document.getElementById('editDojoName').value,
            address: document.getElementById('editDojoAddress').value,
            contact_email: document.getElementById('editDojoContactEmail').value || null,
            contact_phone: document.getElementById('editDojoContactPhone').value || null,
            is_active: document.getElementById('editDojoIsActive').checked
        };
        
        const response = await apiRequest(`/dojos/${dojoId}`, {
            method: 'PUT',
            body: JSON.stringify(dojoData)
        });
        
        if (response.message) {
            showNotification('Dojo atualizado com sucesso!', 'success');
            closeEditDojoModal();
            loadAdminStats(); // Recarregar estatísticas
            loadDojosData(); // Recarregar lista de dojos
        }
    } catch (error) {
        console.error('Erro ao editar dojo:', error);
        showNotification('Erro ao editar dojo. Tente novamente.', 'error');
    } finally {
        btnText.textContent = 'Salvar Alterações';
        spinner.classList.add('hidden');
    }
}

// Função para deletar dojo
async function deleteDojo(dojoId, dojoName) {
    if (!confirm(`Tem certeza que deseja excluir o dojo "${dojoName}"? Esta ação não pode ser desfeita.`)) {
        return;
    }
    
    try {
        const response = await apiRequest(`/dojos/${dojoId}`, {
            method: 'DELETE'
        });
        
        if (response.message) {
            showNotification('Dojo excluído com sucesso!', 'success');
            loadAdminStats(); // Recarregar estatísticas
            loadDojosData(); // Recarregar lista de dojos
        }
    } catch (error) {
        console.error('Erro ao deletar dojo:', error);
        showNotification('Erro ao deletar dojo. Tente novamente.', 'error');
    }
}

// Função para carregar dados dos dojos na aba admin
async function loadDojosData() {
    try {
        const response = await apiRequest('/dojos');
        const dojos = response.dojos || [];
        
        const dojosTableBody = document.getElementById('dojosTableBody');
        if (!dojosTableBody) return;
        
        dojosTableBody.innerHTML = '';
        
        dojos.forEach(dojo => {
            const row = document.createElement('tr');
            row.className = 'border-b border-gray-200 hover:bg-gray-50';
            
            row.innerHTML = `
                <td class="px-4 py-3 text-sm text-gray-900">${dojo.name}</td>
                <td class="px-4 py-3 text-sm text-gray-600">${dojo.address}</td>
                <td class="px-4 py-3 text-sm text-gray-600">${dojo.contact_email || '-'}</td>
                <td class="px-4 py-3 text-sm text-gray-600">${dojo.contact_phone || '-'}</td>
                <td class="px-4 py-3">
                    <span class="px-2 py-1 text-xs rounded-full ${dojo.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${dojo.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm">
                    <div class="flex space-x-2">
                        <button onclick="openEditDojoModal(${JSON.stringify(dojo).replace(/"/g, '&quot;')})" 
                                class="text-blue-600 hover:text-blue-800">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteDojo(${dojo.id}, '${dojo.name}')" 
                                class="text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            dojosTableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Erro ao carregar dojos:', error);
        showNotification('Erro ao carregar lista de dojos.', 'error');
    }
}

// Event listeners para modais de dojos
document.addEventListener('DOMContentLoaded', function() {
    // Modal adicionar dojo
    const addDojoModal = document.getElementById('addDojoModal');
    const closeAddDojoBtn = document.getElementById('closeAddDojoModal');
    const cancelAddDojoBtn = document.getElementById('cancelAddDojo');
    const addDojoForm = document.getElementById('addDojoForm');
    
    if (closeAddDojoBtn) closeAddDojoBtn.addEventListener('click', closeAddDojoModal);
    if (cancelAddDojoBtn) cancelAddDojoBtn.addEventListener('click', closeAddDojoModal);
    if (addDojoForm) addDojoForm.addEventListener('submit', addDojo);
    
    // Modal editar dojo
    const editDojoModal = document.getElementById('editDojoModal');
    const closeEditDojoBtn = document.getElementById('closeEditDojoModal');
    const cancelEditDojoBtn = document.getElementById('cancelEditDojo');
    const editDojoForm = document.getElementById('editDojoForm');
    
    if (closeEditDojoBtn) closeEditDojoBtn.addEventListener('click', closeEditDojoModal);
    if (cancelEditDojoBtn) cancelEditDojoBtn.addEventListener('click', closeEditDojoModal);
    if (editDojoForm) editDojoForm.addEventListener('submit', editDojo);
    
    // Fechar modais ao clicar fora
    if (addDojoModal) {
        addDojoModal.addEventListener('click', function(e) {
            if (e.target === addDojoModal) closeAddDojoModal();
        });
    }
    
    if (editDojoModal) {
        editDojoModal.addEventListener('click', function(e) {
            if (e.target === editDojoModal) closeEditDojoModal();
        });
    }
});

// Expor funções globalmente
window.openAddDojoModal = openAddDojoModal;
window.openEditDojoModal = openEditDojoModal;
window.deleteDojo = deleteDojo;
window.loadDojosData = loadDojosData;


// ===== GESTÃO DE GRADUAÇÕES =====

// Função para abrir modal de adicionar graduação
function openAddGraduationModal(memberStatusId) {
    document.getElementById('addGraduationModal').classList.remove('hidden');
    document.getElementById('addGraduationForm').reset();
    document.getElementById('graduationMemberStatusId').value = memberStatusId;
    document.getElementById('graduationCertificateStatus').value = 'pending';
}

// Função para fechar modal de adicionar graduação
function closeAddGraduationModal() {
    document.getElementById('addGraduationModal').classList.add('hidden');
}

// Função para abrir modal de editar graduação
function openEditGraduationModal(graduation) {
    document.getElementById('editGraduationModal').classList.remove('hidden');
    document.getElementById('editGraduationId').value = graduation.id;
    document.getElementById('editGraduationDiscipline').value = graduation.discipline;
    document.getElementById('editGraduationRank').value = graduation.rank_name;
    document.getElementById('editGraduationExaminationDate').value = graduation.examination_date;
    document.getElementById('editGraduationCertificateNumber').value = graduation.certificate_number || '';
    document.getElementById('editGraduationCertificateStatus').value = graduation.certificate_status;
    document.getElementById('editGraduationIsCurrent').checked = graduation.is_current;
}

// Função para fechar modal de editar graduação
function closeEditGraduationModal() {
    document.getElementById('editGraduationModal').classList.add('hidden');
}

// Função para adicionar nova graduação
async function addGraduation(event) {
    event.preventDefault();
    
    const btnText = document.getElementById('addGraduationBtnText');
    const spinner = document.getElementById('addGraduationSpinner');
    
    btnText.textContent = 'Adicionando...';
    spinner.classList.remove('hidden');
    
    try {
        const memberStatusId = document.getElementById('graduationMemberStatusId').value;
        const graduationData = {
            discipline: document.getElementById('graduationDiscipline').value,
            rank_name: document.getElementById('graduationRank').value,
            examination_date: document.getElementById('graduationExaminationDate').value,
            certificate_number: document.getElementById('graduationCertificateNumber').value || null,
            certificate_status: document.getElementById('graduationCertificateStatus').value,
            is_current: document.getElementById('graduationIsCurrent').checked
        };
        
        const response = await apiRequest(`/member-status/${memberStatusId}/graduations`, {
            method: 'POST',
            body: JSON.stringify(graduationData)
        });
        
        if (response.message) {
            showNotification('Graduação adicionada com sucesso!', 'success');
            closeAddGraduationModal();
            // Recarregar dados do membro se estiver na tela de detalhes
            if (typeof loadMemberGraduations === 'function') {
                loadMemberGraduations(memberStatusId);
            }
        }
    } catch (error) {
        console.error('Erro ao adicionar graduação:', error);
        showNotification('Erro ao adicionar graduação. Tente novamente.', 'error');
    } finally {
        btnText.textContent = 'Adicionar Graduação';
        spinner.classList.add('hidden');
    }
}

// Função para editar graduação
async function editGraduation(event) {
    event.preventDefault();
    
    const btnText = document.getElementById('editGraduationBtnText');
    const spinner = document.getElementById('editGraduationSpinner');
    
    btnText.textContent = 'Salvando...';
    spinner.classList.remove('hidden');
    
    try {
        const graduationId = document.getElementById('editGraduationId').value;
        const graduationData = {
            discipline: document.getElementById('editGraduationDiscipline').value,
            rank_name: document.getElementById('editGraduationRank').value,
            examination_date: document.getElementById('editGraduationExaminationDate').value,
            certificate_number: document.getElementById('editGraduationCertificateNumber').value || null,
            certificate_status: document.getElementById('editGraduationCertificateStatus').value,
            is_current: document.getElementById('editGraduationIsCurrent').checked
        };
        
        const response = await apiRequest(`/graduations/${graduationId}`, {
            method: 'PUT',
            body: JSON.stringify(graduationData)
        });
        
        if (response.message) {
            showNotification('Graduação atualizada com sucesso!', 'success');
            closeEditGraduationModal();
            // Recarregar dados do membro se estiver na tela de detalhes
            if (typeof loadMemberGraduations === 'function') {
                const memberStatusId = response.graduation?.member_status_id;
                if (memberStatusId) {
                    loadMemberGraduations(memberStatusId);
                }
            }
        }
    } catch (error) {
        console.error('Erro ao editar graduação:', error);
        showNotification('Erro ao editar graduação. Tente novamente.', 'error');
    } finally {
        btnText.textContent = 'Salvar Alterações';
        spinner.classList.add('hidden');
    }
}

// Função para deletar graduação
async function deleteGraduation(graduationId, rankName) {
    if (!confirm(`Tem certeza que deseja excluir a graduação "${rankName}"? Esta ação não pode ser desfeita.`)) {
        return;
    }
    
    try {
        const response = await apiRequest(`/graduations/${graduationId}`, {
            method: 'DELETE'
        });
        
        if (response.message) {
            showNotification('Graduação excluída com sucesso!', 'success');
            // Recarregar dados do membro se estiver na tela de detalhes
            if (typeof loadMemberGraduations === 'function') {
                const memberStatusId = response.member_status_id;
                if (memberStatusId) {
                    loadMemberGraduations(memberStatusId);
                }
            }
        }
    } catch (error) {
        console.error('Erro ao deletar graduação:', error);
        showNotification('Erro ao deletar graduação. Tente novamente.', 'error');
    }
}

// Função para definir graduação como atual
async function setGraduationAsCurrent(graduationId) {
    try {
        const response = await apiRequest(`/graduations/${graduationId}/set-current`, {
            method: 'POST'
        });
        
        if (response.message) {
            showNotification('Graduação definida como atual!', 'success');
            // Recarregar dados do membro se estiver na tela de detalhes
            if (typeof loadMemberGraduations === 'function') {
                const memberStatusId = response.member_status_id;
                if (memberStatusId) {
                    loadMemberGraduations(memberStatusId);
                }
            }
        }
    } catch (error) {
        console.error('Erro ao definir graduação como atual:', error);
        showNotification('Erro ao definir graduação como atual. Tente novamente.', 'error');
    }
}

// Event listeners para modais de graduações
document.addEventListener('DOMContentLoaded', function() {
    // Modal adicionar graduação
    const addGraduationModal = document.getElementById('addGraduationModal');
    const closeAddGraduationBtn = document.getElementById('closeAddGraduationModal');
    const cancelAddGraduationBtn = document.getElementById('cancelAddGraduation');
    const addGraduationForm = document.getElementById('addGraduationForm');
    
    if (closeAddGraduationBtn) closeAddGraduationBtn.addEventListener('click', closeAddGraduationModal);
    if (cancelAddGraduationBtn) cancelAddGraduationBtn.addEventListener('click', closeAddGraduationModal);
    if (addGraduationForm) addGraduationForm.addEventListener('submit', addGraduation);
    
    // Modal editar graduação
    const editGraduationModal = document.getElementById('editGraduationModal');
    const closeEditGraduationBtn = document.getElementById('closeEditGraduationModal');
    const cancelEditGraduationBtn = document.getElementById('cancelEditGraduation');
    const editGraduationForm = document.getElementById('editGraduationForm');
    
    if (closeEditGraduationBtn) closeEditGraduationBtn.addEventListener('click', closeEditGraduationModal);
    if (cancelEditGraduationBtn) cancelEditGraduationBtn.addEventListener('click', closeEditGraduationModal);
    if (editGraduationForm) editGraduationForm.addEventListener('submit', editGraduation);
    
    // Fechar modais ao clicar fora
    if (addGraduationModal) {
        addGraduationModal.addEventListener('click', function(e) {
            if (e.target === addGraduationModal) closeAddGraduationModal();
        });
    }
    
    if (editGraduationModal) {
        editGraduationModal.addEventListener('click', function(e) {
            if (e.target === editGraduationModal) closeEditGraduationModal();
        });
    }
});

// Expor funções globalmente
window.openAddGraduationModal = openAddGraduationModal;
window.openEditGraduationModal = openEditGraduationModal;
window.deleteGraduation = deleteGraduation;
window.setGraduationAsCurrent = setGraduationAsCurrent;


// ===== GESTÃO DE QUALIFICAÇÕES =====

// Função para abrir modal de adicionar qualificação
function openAddQualificationModal(memberStatusId) {
    document.getElementById('addQualificationModal').classList.remove('hidden');
    document.getElementById('addQualificationForm').reset();
    document.getElementById('qualificationMemberStatusId').value = memberStatusId;
    document.getElementById('qualificationIsActive').checked = true;
}

// Função para fechar modal de adicionar qualificação
function closeAddQualificationModal() {
    document.getElementById('addQualificationModal').classList.add('hidden');
}

// Função para abrir modal de editar qualificação
function openEditQualificationModal(qualification) {
    document.getElementById('editQualificationModal').classList.remove('hidden');
    document.getElementById('editQualificationId').value = qualification.id;
    document.getElementById('editQualificationType').value = qualification.qualification_type;
    document.getElementById('editQualificationLevel').value = qualification.level;
    document.getElementById('editQualificationDateObtained').value = qualification.date_obtained;
    document.getElementById('editQualificationCertificateNumber').value = qualification.certificate_number || '';
    document.getElementById('editQualificationIsActive').checked = qualification.is_active;
}

// Função para fechar modal de editar qualificação
function closeEditQualificationModal() {
    document.getElementById('editQualificationModal').classList.add('hidden');
}

// Função para adicionar nova qualificação
async function addQualification(event) {
    event.preventDefault();
    
    const btnText = document.getElementById('addQualificationBtnText');
    const spinner = document.getElementById('addQualificationSpinner');
    
    btnText.textContent = 'Adicionando...';
    spinner.classList.remove('hidden');
    
    try {
        const memberStatusId = document.getElementById('qualificationMemberStatusId').value;
        const qualificationData = {
            qualification_type: document.getElementById('qualificationType').value,
            level: document.getElementById('qualificationLevel').value,
            date_obtained: document.getElementById('qualificationDateObtained').value,
            certificate_number: document.getElementById('qualificationCertificateNumber').value || null,
            is_active: document.getElementById('qualificationIsActive').checked
        };
        
        const response = await apiRequest(`/member-status/${memberStatusId}/qualifications`, {
            method: 'POST',
            body: JSON.stringify(qualificationData)
        });
        
        if (response.message) {
            showNotification('Qualificação adicionada com sucesso!', 'success');
            closeAddQualificationModal();
            // Recarregar dados do membro se estiver na tela de detalhes
            if (typeof loadMemberQualifications === 'function') {
                loadMemberQualifications(memberStatusId);
            }
        }
    } catch (error) {
        console.error('Erro ao adicionar qualificação:', error);
        showNotification('Erro ao adicionar qualificação. Tente novamente.', 'error');
    } finally {
        btnText.textContent = 'Adicionar Qualificação';
        spinner.classList.add('hidden');
    }
}

// Função para editar qualificação
async function editQualification(event) {
    event.preventDefault();
    
    const btnText = document.getElementById('editQualificationBtnText');
    const spinner = document.getElementById('editQualificationSpinner');
    
    btnText.textContent = 'Salvando...';
    spinner.classList.remove('hidden');
    
    try {
        const qualificationId = document.getElementById('editQualificationId').value;
        const qualificationData = {
            qualification_type: document.getElementById('editQualificationType').value,
            level: document.getElementById('editQualificationLevel').value,
            date_obtained: document.getElementById('editQualificationDateObtained').value,
            certificate_number: document.getElementById('editQualificationCertificateNumber').value || null,
            is_active: document.getElementById('editQualificationIsActive').checked
        };
        
        const response = await apiRequest(`/qualifications/${qualificationId}`, {
            method: 'PUT',
            body: JSON.stringify(qualificationData)
        });
        
        if (response.message) {
            showNotification('Qualificação atualizada com sucesso!', 'success');
            closeEditQualificationModal();
            // Recarregar dados do membro se estiver na tela de detalhes
            if (typeof loadMemberQualifications === 'function') {
                const memberStatusId = response.qualification?.member_status_id;
                if (memberStatusId) {
                    loadMemberQualifications(memberStatusId);
                }
            }
        }
    } catch (error) {
        console.error('Erro ao editar qualificação:', error);
        showNotification('Erro ao editar qualificação. Tente novamente.', 'error');
    } finally {
        btnText.textContent = 'Salvar Alterações';
        spinner.classList.add('hidden');
    }
}

// Função para deletar qualificação
async function deleteQualification(qualificationId, qualificationType) {
    const typeNames = {
        'examiner': 'Examinador',
        'instructor': 'Instrutor',
        'chief_instructor': 'Instrutor Chefe',
        'regional_representative': 'Representante Regional',
        'national_representative': 'Representante Nacional'
    };
    
    const typeName = typeNames[qualificationType] || qualificationType;
    
    if (!confirm(`Tem certeza que deseja excluir a qualificação "${typeName}"? Esta ação não pode ser desfeita.`)) {
        return;
    }
    
    try {
        const response = await apiRequest(`/qualifications/${qualificationId}`, {
            method: 'DELETE'
        });
        
        if (response.message) {
            showNotification('Qualificação excluída com sucesso!', 'success');
            // Recarregar dados do membro se estiver na tela de detalhes
            if (typeof loadMemberQualifications === 'function') {
                const memberStatusId = response.member_status_id;
                if (memberStatusId) {
                    loadMemberQualifications(memberStatusId);
                }
            }
        }
    } catch (error) {
        console.error('Erro ao deletar qualificação:', error);
        showNotification('Erro ao deletar qualificação. Tente novamente.', 'error');
    }
}

// Event listeners para modais de qualificações
document.addEventListener('DOMContentLoaded', function() {
    // Modal adicionar qualificação
    const addQualificationModal = document.getElementById('addQualificationModal');
    const closeAddQualificationBtn = document.getElementById('closeAddQualificationModal');
    const cancelAddQualificationBtn = document.getElementById('cancelAddQualification');
    const addQualificationForm = document.getElementById('addQualificationForm');
    
    if (closeAddQualificationBtn) closeAddQualificationBtn.addEventListener('click', closeAddQualificationModal);
    if (cancelAddQualificationBtn) cancelAddQualificationBtn.addEventListener('click', closeAddQualificationModal);
    if (addQualificationForm) addQualificationForm.addEventListener('submit', addQualification);
    
    // Modal editar qualificação
    const editQualificationModal = document.getElementById('editQualificationModal');
    const closeEditQualificationBtn = document.getElementById('closeEditQualificationModal');
    const cancelEditQualificationBtn = document.getElementById('cancelEditQualification');
    const editQualificationForm = document.getElementById('editQualificationForm');
    
    if (closeEditQualificationBtn) closeEditQualificationBtn.addEventListener('click', closeEditQualificationModal);
    if (cancelEditQualificationBtn) cancelEditQualificationBtn.addEventListener('click', closeEditQualificationModal);
    if (editQualificationForm) editQualificationForm.addEventListener('submit', editQualification);
    
    // Fechar modais ao clicar fora
    if (addQualificationModal) {
        addQualificationModal.addEventListener('click', function(e) {
            if (e.target === addQualificationModal) closeAddQualificationModal();
        });
    }
    
    if (editQualificationModal) {
        editQualificationModal.addEventListener('click', function(e) {
            if (e.target === editQualificationModal) closeEditQualificationModal();
        });
    }
});

// Expor funções globalmente
window.openAddQualificationModal = openAddQualificationModal;
window.openEditQualificationModal = openEditQualificationModal;
window.deleteQualification = deleteQualification;


// ===== MODAL DE DETALHES DE MEMBROS =====

// Variável global para armazenar o ID do status de membro atual
window.currentMemberStatusId = null;

// Função para abrir modal de detalhes do membro
async function openMemberDetailsModal(memberStatusId) {
    window.currentMemberStatusId = memberStatusId;
    document.getElementById('memberDetailsModal').classList.remove('hidden');
    
    try {
        // Carregar dados do membro
        await loadMemberDetails(memberStatusId);
        await loadMemberGraduations(memberStatusId);
        await loadMemberQualifications(memberStatusId);
    } catch (error) {
        console.error('Erro ao carregar detalhes do membro:', error);
        showNotification('Erro ao carregar detalhes do membro.', 'error');
    }
}

// Função para fechar modal de detalhes do membro
function closeMemberDetailsModal() {
    document.getElementById('memberDetailsModal').classList.add('hidden');
    window.currentMemberStatusId = null;
}

// Função para carregar detalhes básicos do membro
async function loadMemberDetails(memberStatusId) {
    try {
        const response = await apiRequest(`/member-status/${memberStatusId}`);
        const memberStatus = response.member_status;
        const student = memberStatus.student;
        
        // Preencher informações básicas
        document.getElementById('memberDetailName').textContent = student.name;
        document.getElementById('memberDetailEmail').textContent = student.email;
        document.getElementById('memberDetailPhone').textContent = student.phone || '-';
        document.getElementById('memberDetailDojo').textContent = student.dojo_name;
        document.getElementById('memberDetailRegistration').textContent = student.registration_number;
        
        // Status do estudante
        const statusEl = document.getElementById('memberDetailStatus');
        const statusClass = student.status === 'active' ? 'bg-green-100 text-green-800' : 
                           student.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                           'bg-red-100 text-red-800';
        const statusText = student.status === 'active' ? 'Ativo' : 
                          student.status === 'pending' ? 'Pendente' : 'Inativo';
        statusEl.className = `px-2 py-1 text-xs rounded-full ${statusClass}`;
        statusEl.textContent = statusText;
        
        // Informações de membro
        document.getElementById('memberDetailMemberNumber').textContent = memberStatus.registered_number || '-';
        document.getElementById('memberDetailMembershipDate').textContent = 
            memberStatus.membership_date ? new Date(memberStatus.membership_date).toLocaleDateString('pt-BR') : '-';
        
        const memberTypeNames = {
            'student': 'Estudante',
            'instructor': 'Instrutor',
            'chief_instructor': 'Instrutor Chefe'
        };
        document.getElementById('memberDetailMemberType').textContent = 
            memberTypeNames[memberStatus.member_type] || memberStatus.member_type;
        
        document.getElementById('memberDetailLastActivity').textContent = 
            memberStatus.last_activity_year || '-';
            
    } catch (error) {
        console.error('Erro ao carregar detalhes do membro:', error);
        throw error;
    }
}

// Função para carregar graduações do membro
async function loadMemberGraduations(memberStatusId) {
    try {
        const response = await apiRequest(`/member-status/${memberStatusId}/graduations`);
        const graduations = response.graduations || [];
        
        const graduationsList = document.getElementById('memberGraduationsList');
        graduationsList.innerHTML = '';
        
        if (graduations.length === 0) {
            graduationsList.innerHTML = `
                <div class="text-center py-4 text-gray-500">
                    <i class="fas fa-graduation-cap text-2xl mb-2"></i>
                    <p>Nenhuma graduação registrada</p>
                </div>
            `;
            return;
        }
        
        graduations.forEach(graduation => {
            const graduationEl = document.createElement('div');
            graduationEl.className = 'bg-gray-50 rounded-lg p-3 flex justify-between items-center';
            
            const disciplineNames = {
                'aikido': 'Aikido',
                'toitsudo': 'Toitsudo'
            };
            
            const statusNames = {
                'pending': 'Pendente',
                'issued': 'Emitido',
                'received': 'Recebido'
            };
            
            graduationEl.innerHTML = `
                <div class="flex-1">
                    <div class="flex items-center space-x-2">
                        <span class="font-medium text-gray-900">${graduation.rank_name}</span>
                        <span class="text-sm text-gray-600">(${disciplineNames[graduation.discipline] || graduation.discipline})</span>
                        ${graduation.is_current ? '<span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Atual</span>' : ''}
                    </div>
                    <div class="text-sm text-gray-600 mt-1">
                        <span>Exame: ${new Date(graduation.examination_date).toLocaleDateString('pt-BR')}</span>
                        ${graduation.certificate_number ? ` • Certificado: ${graduation.certificate_number}` : ''}
                        <span> • Status: ${statusNames[graduation.certificate_status] || graduation.certificate_status}</span>
                    </div>
                </div>
                <div class="flex space-x-2">
                    ${!graduation.is_current ? `
                        <button onclick="setGraduationAsCurrent(${graduation.id})" 
                                class="text-green-600 hover:text-green-800 text-sm" title="Definir como atual">
                            <i class="fas fa-star"></i>
                        </button>
                    ` : ''}
                    <button onclick="openEditGraduationModal(${JSON.stringify(graduation).replace(/"/g, '&quot;')})" 
                            class="text-blue-600 hover:text-blue-800" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteGraduation(${graduation.id}, '${graduation.rank_name}')" 
                            class="text-red-600 hover:text-red-800" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            graduationsList.appendChild(graduationEl);
        });
        
    } catch (error) {
        console.error('Erro ao carregar graduações:', error);
        document.getElementById('memberGraduationsList').innerHTML = `
            <div class="text-center py-4 text-red-500">
                <i class="fas fa-exclamation-triangle"></i>
                <p class="mt-2">Erro ao carregar graduações</p>
            </div>
        `;
    }
}

// Função para carregar qualificações do membro
async function loadMemberQualifications(memberStatusId) {
    try {
        const response = await apiRequest(`/member-status/${memberStatusId}/qualifications`);
        const qualifications = response.qualifications || [];
        
        const qualificationsList = document.getElementById('memberQualificationsList');
        qualificationsList.innerHTML = '';
        
        if (qualifications.length === 0) {
            qualificationsList.innerHTML = `
                <div class="text-center py-4 text-gray-500">
                    <i class="fas fa-certificate text-2xl mb-2"></i>
                    <p>Nenhuma qualificação registrada</p>
                </div>
            `;
            return;
        }
        
        const typeNames = {
            'examiner': 'Examinador',
            'instructor': 'Instrutor',
            'chief_instructor': 'Instrutor Chefe',
            'regional_representative': 'Representante Regional',
            'national_representative': 'Representante Nacional'
        };
        
        qualifications.forEach(qualification => {
            const qualificationEl = document.createElement('div');
            qualificationEl.className = 'bg-gray-50 rounded-lg p-3 flex justify-between items-center';
            
            qualificationEl.innerHTML = `
                <div class="flex-1">
                    <div class="flex items-center space-x-2">
                        <span class="font-medium text-gray-900">${typeNames[qualification.qualification_type] || qualification.qualification_type}</span>
                        <span class="text-sm text-gray-600">(${qualification.level})</span>
                        ${qualification.is_active ? '<span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Ativo</span>' : '<span class="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Inativo</span>'}
                    </div>
                    <div class="text-sm text-gray-600 mt-1">
                        <span>Obtido em: ${new Date(qualification.date_obtained).toLocaleDateString('pt-BR')}</span>
                        ${qualification.certificate_number ? ` • Certificado: ${qualification.certificate_number}` : ''}
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="openEditQualificationModal(${JSON.stringify(qualification).replace(/"/g, '&quot;')})" 
                            class="text-blue-600 hover:text-blue-800" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteQualification(${qualification.id}, '${qualification.qualification_type}')" 
                            class="text-red-600 hover:text-red-800" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            qualificationsList.appendChild(qualificationEl);
        });
        
    } catch (error) {
        console.error('Erro ao carregar qualificações:', error);
        document.getElementById('memberQualificationsList').innerHTML = `
            <div class="text-center py-4 text-red-500">
                <i class="fas fa-exclamation-triangle"></i>
                <p class="mt-2">Erro ao carregar qualificações</p>
            </div>
        `;
    }
}

// Event listeners para modal de detalhes
document.addEventListener('DOMContentLoaded', function() {
    const memberDetailsModal = document.getElementById('memberDetailsModal');
    const closeMemberDetailsBtn = document.getElementById('closeMemberDetailsModal');
    
    if (closeMemberDetailsBtn) {
        closeMemberDetailsBtn.addEventListener('click', closeMemberDetailsModal);
    }
    
    // Fechar modal ao clicar fora
    if (memberDetailsModal) {
        memberDetailsModal.addEventListener('click', function(e) {
            if (e.target === memberDetailsModal) {
                closeMemberDetailsModal();
            }
        });
    }
});

// Expor funções globalmente
window.openMemberDetailsModal = openMemberDetailsModal;
window.closeMemberDetailsModal = closeMemberDetailsModal;
window.loadMemberGraduations = loadMemberGraduations;
window.loadMemberQualifications = loadMemberQualifications;


// Expor função globalmente
window.showEditStudentModal = showEditStudentModal;


// ===== INICIALIZAÇÃO DOS MODAIS =====
let addStudentModal, editStudentModal, addMemberStatusModal;

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar modais
    addStudentModal = new ModalManager('addStudentModal');
    editStudentModal = new ModalManager('editStudentModal');
    addMemberStatusModal = new ModalManager('addMemberStatusModal');
    
    // Configurar botões de ação originais para usar os novos modais
    const addStudentBtn = document.getElementById('addStudentBtn');
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', () => {
            addStudentModal.show();
            loadDojosInSelect('addStudentDojo');
        });
    }
});

// Funções de compatibilidade para manter o código existente funcionando
function showAddStudentModal() {
    if (addStudentModal) {
        addStudentModal.show();
        loadDojosInSelect('addStudentDojo');
    }
}

function hideAddStudentModal() {
    if (addStudentModal) {
        addStudentModal.hide();
    }
}

function hideEditStudentModal() {
    if (editStudentModal) {
        editStudentModal.hide();
    }
}

function showAddMemberStatusModal() {
    if (addMemberStatusModal) {
        addMemberStatusModal.show();
    }
}

function hideAddMemberStatusModal() {
    if (addMemberStatusModal) {
        addMemberStatusModal.hide();
    }
}
