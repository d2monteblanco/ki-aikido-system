// Configuração da API
const API_BASE = 'http://localhost:5000/api';

// Estado da aplicação
let currentUser = null;
let authToken = null;

// Elementos DOM
const loginScreen = document.getElementById('loginScreen');
const mainApp = document.getElementById('mainApp');
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
    const totalDojosEl = document.getElementById('totalDojos');
    
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
async function loadStudentsData() {
    const container = document.getElementById('studentsList');
    if (!container) return;
    
    container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
            <p>Carregando alunos...</p>
        </div>
    `;
    
    try {
        const response = await apiRequest('/students');
        const students = response.students || [];
        
        if (students.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-user-plus text-4xl mb-4"></i>
                    <h3 class="text-lg font-medium mb-2">Nenhum aluno cadastrado</h3>
                    <p class="mb-4">Comece adicionando o primeiro aluno ao sistema.</p>
                    <button class="btn-primary text-white px-6 py-3 rounded-lg font-medium">
                        <i class="fas fa-plus mr-2"></i>Adicionar Primeiro Aluno
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dojo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${students.map(student => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="font-medium text-gray-900">${student.name}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                                        ${student.email}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                                        ${student.registration_number || 'N/A'}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                                        ${student.dojo_name || 'N/A'}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onclick="showEditStudentModal(${JSON.stringify(student).replace(/"/g, '&quot;')})" class="text-blue-600 hover:text-blue-900 mr-3">
                                            <i class="fas fa-edit mr-1"></i>Editar
                                        </button>
                                        <button onclick="deleteStudent(${student.id}, '${student.name.replace(/'/g, "\\'")}')" class="text-red-600 hover:text-red-900">
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
    }
}

// Filtrar membros
function filterMembers() {
    // Implementar filtros de membros
    console.log('Filtros aplicados');
    loadMembersData();
}

// Obter cor do status
function getStatusColor(status) {
    const colors = {
        'active': 'bg-green-100 text-green-800',
        'inactive': 'bg-gray-100 text-gray-800',
        'suspended': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

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
async function showEditStudentModal(student) {
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
window.showEditStudentModal = showEditStudentModal;
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
        
        // Dados do status de membro
        const memberStatusData = {
            student_id: studentId,
            member_type: document.getElementById('memberStatusType').value,
            current_status: document.getElementById('memberStatusStatus').value
        };
        
        // Dados opcionais de graduação
        const discipline = document.getElementById('memberStatusDiscipline').value;
        const rank = document.getElementById('memberStatusRank').value;
        const examDate = document.getElementById('memberStatusExamDate').value;
        const certificateStatus = document.getElementById('memberStatusCertificate').value;
        const notes = document.getElementById('memberStatusNotes').value.trim();
        
        // Validar dados obrigatórios
        if (!memberStatusData.student_id || !memberStatusData.member_type || !memberStatusData.current_status) {
            throw new Error('Por favor, preencha todos os campos obrigatórios');
        }
        
        // Adicionar status de membro
        await apiRequest('/member-status', 'POST', memberStatusData);
        
        // Se há dados de graduação, adicionar separadamente
        if (discipline && rank) {
            const graduationData = {
                student_id: studentId,
                discipline: discipline,
                rank_name: rank,
                exam_date: examDate || null,
                certificate_status: certificateStatus || 'pending',
                notes: notes
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
async function loadMembersData() {
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
}

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

// Funções placeholder para editar e excluir status
function editMemberStatus(id) {
    showErrorMessage('Funcionalidade de edição em desenvolvimento');
}

function deleteMemberStatus(id) {
    showErrorMessage('Funcionalidade de exclusão em desenvolvimento');
}

// Expor funções globalmente
window.showAddStudentModal = showAddStudentModal;
window.showEditStudentModal = showEditStudentModal;
window.deleteStudent = deleteStudent;
window.showAddMemberStatusModal = showAddMemberStatusModal;
window.editMemberStatus = editMemberStatus;
window.deleteMemberStatus = deleteMemberStatus;

