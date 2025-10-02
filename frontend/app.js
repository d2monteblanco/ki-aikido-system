// =========================================
// Sistema Ki Aikido - JavaScript Principal
// =========================================

// Configuração Global
const API_BASE_URL = 'http://localhost:5000/api';
let authToken = null;
let currentUser = null;
let currentPage = { students: 1, members: 1 };
let currentFilters = { students: {}, members: {} };
let allDojos = [];
let allStudents = [];
let constants = null;
let currentMemberStatusId = null;

// =========================================
// Utilitários
// =========================================

function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const icon = document.getElementById('notificationIcon');
    const messageEl = document.getElementById('notificationMessage');
    
    messageEl.textContent = message;
    
    const icons = {
        success: '<i class="fas fa-check-circle text-2xl text-green-500"></i>',
        error: '<i class="fas fa-exclamation-circle text-2xl text-red-500"></i>',
        warning: '<i class="fas fa-exclamation-triangle text-2xl text-yellow-500"></i>',
        info: '<i class="fas fa-info-circle text-2xl text-blue-500"></i>'
    };
    
    icon.innerHTML = icons[type] || icons.info;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        hideNotification();
    }, type === 'error' ? 7000 : 5000);
}

function hideNotification() {
    document.getElementById('notification').classList.add('hidden');
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
}

// =========================================
// API Requests
// =========================================

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro na requisição');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// =========================================
// Autenticação
// =========================================

function fillLoginCredentials(email, password) {
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').value = password;
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    showLoading();
    
    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        authToken = data.token;
        currentUser = data.user;
        
        // Armazenar token
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showNotification('Login realizado com sucesso!', 'success');
        
        // Mostrar sistema principal
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainSystem').classList.remove('hidden');
        
        // Carregar dados iniciais
        await loadInitialData();
        
    } catch (error) {
        showNotification('Erro ao fazer login: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
});

async function logout() {
    if (!confirm('Tem certeza que deseja sair?')) return;
    
    showLoading();
    
    try {
        await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    // Limpar dados
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    // Voltar para tela de login
    document.getElementById('mainSystem').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    
    hideLoading();
    showNotification('Logout realizado com sucesso!', 'success');
}

// =========================================
// Inicialização
// =========================================

async function loadInitialData() {
    showLoading();
    
    try {
        // Configurar nome do usuário
        document.getElementById('userName').textContent = currentUser.name;
        
        // Configurar visibilidade de menu
        if (currentUser.role !== 'admin') {
            document.getElementById('sidebarDojos').classList.add('hidden');
            document.getElementById('newDojoBtn')?.classList.add('hidden');
        }
        
        // Carregar constantes
        await loadConstants();
        
        // Carregar dojos
        await loadDojos();
        
        // Carregar estatísticas
        await loadStats();
        
        // Carregar Cadastros Básicos
        await loadStudents();
        
    } catch (error) {
        showNotification('Erro ao carregar dados iniciais: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function loadConstants() {
    try {
        console.log('Carregando constantes...');
        constants = await apiRequest('/member-status/constants');
        console.log('Constantes carregadas:', constants);
        
        // Validar se as constantes foram carregadas corretamente
        if (!constants || !constants.toitsudo_ranks || !constants.aikido_ranks) {
            console.error('Constantes incompletas:', constants);
            throw new Error('Constantes não foram carregadas corretamente');
        }
        
        console.log('✅ Constantes validadas com sucesso');
    } catch (error) {
        console.error('❌ Erro ao carregar constantes:', error);
        // Definir constantes padrão como fallback
        constants = null;
    }
}

async function loadStats() {
    try {
        const stats = await apiRequest('/students/stats');
        
        document.getElementById('statTotalStudents').textContent = stats.total_students || 0;
        document.getElementById('statActiveMembers').textContent = stats.active_members || 0;
        document.getElementById('statInstructors').textContent = stats.instructors || 0;
        document.getElementById('statTotalDojos').textContent = stats.total_dojos || 0;
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// =========================================
// Navegação
// =========================================

function showSection(section) {
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(el => el.classList.add('hidden'));
    
    // Remover classe active de todos os items da sidebar
    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
    
    // Mostrar seção selecionada
    const sectionMap = {
        'dashboard': 'dashboardSection',
        'students': 'studentsSection',
        'members': 'membersSection',
        'dojos': 'dojosSection'
    };
    
    document.getElementById(sectionMap[section]).classList.remove('hidden');
    
    // Adicionar classe active ao item clicado
    event.target.closest('.sidebar-item').classList.add('active');
    
    // Carregar dados da seção
    if (section === 'students') {
        loadStudents();
    } else if (section === 'members') {
        loadMembers();
    } else if (section === 'dojos') {
        loadDojos();
    } else if (section === 'dashboard') {
        loadStats();
    }
}

// =========================================
// Dojos
// =========================================

async function loadDojos() {
    try {
        const data = await apiRequest('/dojos');
        allDojos = data.dojos || [];
        
        // Atualizar filtro de dojos na tela de Cadastro Básico
        updateDojoFilters();
        
        // Atualizar grid de dojos
        renderDojosGrid();
        
    } catch (error) {
        showNotification('Erro ao carregar dojos: ' + error.message, 'error');
    }
}

function updateDojoFilters() {
    const studentDojoFilter = document.getElementById('studentDojoFilter');
    const studentDojoSelect = document.getElementById('studentDojo');
    const memberStudentSelect = document.getElementById('memberStudentSelect');
    
    // Filtro de Cadastro Básicos
    if (studentDojoFilter) {
        studentDojoFilter.innerHTML = '<option value="">Todos</option>';
        allDojos.forEach(dojo => {
            studentDojoFilter.innerHTML += `<option value="${dojo.id}">${dojo.name}</option>`;
        });
    }
    
    // Select de dojo no formulário de Cadastro Básico
    if (studentDojoSelect) {
        studentDojoSelect.innerHTML = '<option value="">Selecione...</option>';
        allDojos.forEach(dojo => {
            studentDojoSelect.innerHTML += `<option value="${dojo.id}">${dojo.name}</option>`;
        });
    }
}

function renderDojosGrid() {
    const grid = document.getElementById('dojosGrid');
    if (!grid) return;
    
    if (allDojos.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-building text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 text-lg">Nenhum dojo cadastrado</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = allDojos.map(dojo => `
        <div class="card p-6">
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">
                        <i class="fas fa-building text-purple-600 mr-2"></i>
                        ${dojo.name}
                    </h3>
                    <p class="text-sm text-gray-600">
                        <i class="fas fa-map-marker-alt mr-2"></i>
                        ${dojo.address || 'Endereço não informado'}
                    </p>
                </div>
                ${currentUser.role === 'admin' ? `
                    <button onclick="editDojo(${dojo.id})" class="text-blue-600 hover:text-blue-800">
                        <i class="fas fa-edit"></i>
                    </button>
                ` : ''}
            </div>
            
            <div class="space-y-2 mb-4">
                ${dojo.contact_email ? `
                    <p class="text-sm text-gray-600">
                        <i class="fas fa-envelope mr-2"></i>
                        ${dojo.contact_email}
                    </p>
                ` : ''}
                ${dojo.contact_phone ? `
                    <p class="text-sm text-gray-600">
                        <i class="fas fa-phone mr-2"></i>
                        ${dojo.contact_phone}
                    </p>
                ` : ''}
                ${dojo.responsible_instructor ? `
                    <p class="text-sm text-gray-600">
                        <i class="fas fa-user-tie mr-2"></i>
                        ${dojo.responsible_instructor}
                    </p>
                ` : ''}
            </div>
            
            <div class="pt-4 border-t">
                <div class="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p class="text-2xl font-bold text-purple-600">${dojo.student_count || 0}</p>
                        <p class="text-xs text-gray-600">Cadastro Básico</p>
                    </div>
                    <div>
                        <p class="text-2xl font-bold text-blue-600">${dojo.active_members || 0}</p>
                        <p class="text-xs text-gray-600">Ativos</p>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function openDojoModal(dojoId = null) {
    const modal = document.getElementById('dojoModal');
    const form = document.getElementById('dojoForm');
    const title = document.getElementById('dojoModalTitle');
    
    form.reset();
    
    if (dojoId) {
        title.innerHTML = '<i class="fas fa-building mr-2"></i>Editar Dojo';
        const dojo = allDojos.find(d => d.id === dojoId);
        if (dojo) {
            document.getElementById('dojoId').value = dojo.id;
            document.getElementById('dojoName').value = dojo.name;
            document.getElementById('dojoAddress').value = dojo.address || '';
            document.getElementById('dojoContactEmail').value = dojo.contact_email || '';
            document.getElementById('dojoContactPhone').value = dojo.contact_phone || '';
            document.getElementById('dojoResponsibleInstructor').value = dojo.responsible_instructor || '';
            document.getElementById('dojoRegistrationNumber').value = dojo.registration_number || '';
        }
    } else {
        title.innerHTML = '<i class="fas fa-building mr-2"></i>Novo Dojo';
    }
    
    modal.classList.remove('hidden');
}

function closeDojoModal() {
    document.getElementById('dojoModal').classList.add('hidden');
}

function editDojo(dojoId) {
    openDojoModal(dojoId);
}

document.getElementById('dojoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const dojoId = document.getElementById('dojoId').value;
    const formData = {
        name: document.getElementById('dojoName').value,
        address: document.getElementById('dojoAddress').value,
        contact_email: document.getElementById('dojoContactEmail').value,
        contact_phone: document.getElementById('dojoContactPhone').value,
        responsible_instructor: document.getElementById('dojoResponsibleInstructor').value,
        registration_number: document.getElementById('dojoRegistrationNumber').value
    };
    
    showLoading();
    
    try {
        if (dojoId) {
            await apiRequest(`/dojos/${dojoId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            showNotification('Dojo atualizado com sucesso!', 'success');
        } else {
            await apiRequest('/dojos', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showNotification('Dojo criado com sucesso!', 'success');
        }
        
        closeDojoModal();
        await loadDojos();
        
    } catch (error) {
        showNotification('Erro ao salvar dojo: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
});

// =========================================
// Cadastro Básicos
// =========================================

async function loadStudents(page = 1) {
    showLoading();
    
    try {
        const params = new URLSearchParams({
            page: page,
            per_page: 20,
            ...currentFilters.students
        });
        
        const data = await apiRequest(`/students?${params}`);
        allStudents = data.students || [];
        
        renderStudentsTable(allStudents);
        renderStudentsPagination(data.pagination);
        
    } catch (error) {
        showNotification('Erro ao carregar Cadastro Básico: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function renderStudentsTable(students) {
    const tbody = document.getElementById('studentsTableBody');
    
    if (students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-users text-6xl text-gray-300 mb-4 block"></i>
                    Nenhum Cadastro Básico encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = students.map(student => {
        const statusBadges = {
            active: '<span class="badge badge-success">Ativo</span>',
            pending: '<span class="badge badge-warning">Pendente</span>',
            inactive: '<span class="badge badge-danger">Inativo</span>'
        };
        
        // Se o estudante não tem member_status, mostra botão para criar
        let statusDisplay;
        if (!student.has_member_status) {
            statusDisplay = `
                <button 
                    onclick="openMemberModalForStudent(${student.id}, '${student.name.replace(/'/g, "\\'")}')" 
                    class="btn-primary text-white px-3 py-1 rounded text-xs"
                    title="Criar registro de membro"
                >
                    <i class="fas fa-user-plus mr-1"></i>Criar Membro
                </button>
            `;
        } else {
            statusDisplay = statusBadges[student.status] || student.status;
        }
        
        return `
            <tr class="table-row">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${student.registration_number}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${student.name}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${student.email}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${student.dojo_name || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    ${statusDisplay}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onclick="viewStudent(${student.id})" class="text-blue-600 hover:text-blue-900" title="Visualizar">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editStudent(${student.id})" class="text-green-600 hover:text-green-900" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteStudent(${student.id})" class="text-red-600 hover:text-red-900" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderStudentsPagination(pagination) {
    const info = document.getElementById('studentsPaginationInfo');
    const paginationDiv = document.getElementById('studentsPagination');
    
    if (!pagination) return;
    
    info.textContent = `${pagination.total} de ${pagination.total}`;
    
    if (pagination.pages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }
    
    let buttons = '';
    
    if (pagination.has_prev) {
        buttons += `<button onclick="loadStudents(${pagination.page - 1})" class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Anterior</button>`;
    }
    
    for (let i = 1; i <= pagination.pages; i++) {
        if (i === pagination.page) {
            buttons += `<button class="px-3 py-1 bg-purple-600 text-white rounded">${i}</button>`;
        } else {
            buttons += `<button onclick="loadStudents(${i})" class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">${i}</button>`;
        }
    }
    
    if (pagination.has_next) {
        buttons += `<button onclick="loadStudents(${pagination.page + 1})" class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Próxima</button>`;
    }
    
    paginationDiv.innerHTML = buttons;
}

let searchTimeout;
function searchStudents() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const search = document.getElementById('studentSearch').value;
        currentFilters.students.search = search;
        loadStudents(1);
    }, 500);
}

function filterStudents() {
    const dojoId = document.getElementById('studentDojoFilter').value;
    
    currentFilters.students.dojo_id = dojoId;
    
    loadStudents(1);
}

function openStudentModal(studentId = null) {
    const modal = document.getElementById('studentModal');
    const form = document.getElementById('studentForm');
    const title = document.getElementById('studentModalTitle');
    
    form.reset();
    
    if (studentId) {
        title.innerHTML = '<i class="fas fa-user-edit mr-2"></i>Editar Cadastro Básico';
        const student = allStudents.find(s => s.id === studentId);
        if (student) {
            document.getElementById('studentId').value = student.id;
            document.getElementById('studentName').value = student.name;
            document.getElementById('studentEmail').value = student.email;
            document.getElementById('studentPhone').value = student.phone || '';
            document.getElementById('studentBirthDate').value = student.birth_date;
            document.getElementById('studentDojo').value = student.dojo_id;
            document.getElementById('studentStartYear').value = student.started_practicing_year || '';
            document.getElementById('studentAddress').value = student.address;
            document.getElementById('studentNotes').value = student.notes || '';
        }
    } else {
        title.innerHTML = '<i class="fas fa-user-plus mr-2"></i>Novo Cadastro Básico';
    }
    
    modal.classList.remove('hidden');
}

function closeStudentModal() {
    document.getElementById('studentModal').classList.add('hidden');
}

function viewStudent(studentId) {
    editStudent(studentId);
}

function editStudent(studentId) {
    openStudentModal(studentId);
}

async function deleteStudent(studentId) {
    if (!confirm('Tem certeza que deseja excluir este Cadastro Básico?')) return;
    
    showLoading();
    
    try {
        await apiRequest(`/students/${studentId}`, { method: 'DELETE' });
        showNotification('Cadastro Básico excluído com sucesso!', 'success');
        await loadStudents(currentPage.students);
        await loadStats();
    } catch (error) {
        showNotification('Erro ao excluir Cadastro Básico: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

document.getElementById('studentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const studentId = document.getElementById('studentId').value;
    const formData = {
        name: document.getElementById('studentName').value,
        email: document.getElementById('studentEmail').value,
        phone: document.getElementById('studentPhone').value,
        birth_date: document.getElementById('studentBirthDate').value,
        dojo_id: parseInt(document.getElementById('studentDojo').value),
        started_practicing_year: document.getElementById('studentStartYear').value ? parseInt(document.getElementById('studentStartYear').value) : null,
        address: document.getElementById('studentAddress').value,
        notes: document.getElementById('studentNotes').value
    };
    
    showLoading();
    
    try {
        if (studentId) {
            await apiRequest(`/students/${studentId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            showNotification('Cadastro Básico atualizado com sucesso!', 'success');
        } else {
            await apiRequest('/students', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showNotification('Cadastro Básico criado com sucesso!', 'success');
        }
        
        closeStudentModal();
        await loadStudents(currentPage.students);
        await loadStats();
        
    } catch (error) {
        showNotification('Erro ao salvar Cadastro Básico: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
});

// =========================================
// Membros
// =========================================

let allMembers = [];

async function loadMembers(page = 1) {
    showLoading();
    
    try {
        const params = new URLSearchParams({
            page: page,
            per_page: 20,
            ...currentFilters.members
        });
        
        const data = await apiRequest(`/member-status?${params}`);
        allMembers = data.members || [];
        
        renderMembersTable(allMembers);
        renderMembersPagination(data.pagination);
        
    } catch (error) {
        showNotification('Erro ao carregar membros: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function renderMembersTable(members) {
    const tbody = document.getElementById('membersTableBody');
    
    if (members.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-id-card text-6xl text-gray-300 mb-4 block"></i>
                    Nenhum membro encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = members.map(member => {
        const statusBadges = {
            active: '<span class="badge badge-success">Ativo</span>',
            inactive: '<span class="badge badge-danger">Inativo</span>',
            pending: '<span class="badge badge-warning">Pendente</span>'
        };
        
        const typeBadges = {
            student: '<span class="badge badge-info">Estudante</span>',
            instructor: '<span class="badge badge-success">Instrutor</span>',
            chief_instructor: '<span class="badge badge-warning">Instrutor Chefe</span>'
        };
        
        let graduationsText = '';
        if (member.current_graduations) {
            const grads = Object.entries(member.current_graduations);
            graduationsText = grads.map(([disc, grad]) => `${grad.rank_name}`).join(', ') || 'Nenhuma';
        }
        
        return `
            <tr class="table-row">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${member.registered_number || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${member.student_name}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    ${typeBadges[member.member_type] || member.member_type}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    ${statusBadges[member.current_status] || member.current_status}
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                    ${graduationsText}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onclick="viewMember(${member.id})" class="text-blue-600 hover:text-blue-900" title="Visualizar">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editMember(${member.id})" class="text-green-600 hover:text-green-900" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteMember(${member.id})" class="text-red-600 hover:text-red-900" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderMembersPagination(pagination) {
    const info = document.getElementById('membersPaginationInfo');
    const paginationDiv = document.getElementById('membersPagination');
    
    if (!pagination) return;
    
    info.textContent = `${pagination.total} de ${pagination.total}`;
    
    if (pagination.pages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }
    
    let buttons = '';
    
    if (pagination.has_prev) {
        buttons += `<button onclick="loadMembers(${pagination.page - 1})" class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Anterior</button>`;
    }
    
    for (let i = 1; i <= pagination.pages; i++) {
        if (i === pagination.page) {
            buttons += `<button class="px-3 py-1 bg-purple-600 text-white rounded">${i}</button>`;
        } else {
            buttons += `<button onclick="loadMembers(${i})" class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">${i}</button>`;
        }
    }
    
    if (pagination.has_next) {
        buttons += `<button onclick="loadMembers(${pagination.page + 1})" class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Próxima</button>`;
    }
    
    paginationDiv.innerHTML = buttons;
}

let memberSearchTimeout;
function searchMembers() {
    clearTimeout(memberSearchTimeout);
    memberSearchTimeout = setTimeout(() => {
        const search = document.getElementById('memberSearch').value;
        currentFilters.members.search = search;
        loadMembers(1);
    }, 500);
}

function filterMembers() {
    const memberType = document.getElementById('memberTypeFilter').value;
    const status = document.getElementById('memberStatusFilter').value;
    
    currentFilters.members.member_type = memberType;
    currentFilters.members.current_status = status;
    
    loadMembers(1);
}

async function openMemberModal(memberId = null) {
    const modal = document.getElementById('memberModal');
    const form = document.getElementById('memberForm');
    const title = document.getElementById('memberModalTitle');
    
    form.reset();
    
    // Carregar lista de Cadastros Básicos para seleção
    await loadStudentsForMemberSelect();
    
    if (memberId) {
        title.innerHTML = '<i class="fas fa-id-card-alt mr-2"></i>Editar Membro';
        
        showLoading();
        try {
            const member = await apiRequest(`/member-status/${memberId}`);
            
            document.getElementById('memberId').value = member.id;
            document.getElementById('memberStudentId').value = member.student_id;
            document.getElementById('memberStudentSelect').value = member.student_id;
            document.getElementById('memberStudentSelect').disabled = true;
            document.getElementById('memberRegisteredNumber').value = member.registered_number || '';
            document.getElementById('memberMembershipDate').value = member.membership_date || '';
            document.getElementById('memberType').value = member.member_type;
            document.getElementById('memberStatus').value = member.current_status;
            document.getElementById('memberLastActivityYear').value = member.last_activity_year || '';
            
            currentMemberStatusId = member.id;
            
            // Carregar graduações e qualificações
            await loadMemberGraduations(member.id);
            await loadMemberQualifications(member.id);
            
        } catch (error) {
            showNotification('Erro ao carregar membro: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    } else {
        title.innerHTML = '<i class="fas fa-id-card mr-2"></i>Novo Membro';
        document.getElementById('memberStudentSelect').disabled = false;
        document.getElementById('memberType').value = 'student';
        document.getElementById('memberStatus').value = 'active';
        currentMemberStatusId = null;
    }
    
    modal.classList.remove('hidden');
    showMemberTab('info');
}

function closeMemberModal() {
    document.getElementById('memberModal').classList.add('hidden');
    currentMemberStatusId = null;
}

async function openMemberModalForStudent(studentId, studentName) {
    // Esconde todas as seções
    document.querySelectorAll('.section').forEach(el => el.classList.add('hidden'));
    
    // Remove active de todos os sidebar items
    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
    
    // Mostra a seção de membros
    document.getElementById('membersSection').classList.remove('hidden');
    
    // Adiciona active no sidebar item de membros (terceiro item)
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    if (sidebarItems[2]) {
        sidebarItems[2].classList.add('active');
    }
    
    // Carrega membros
    await loadMembers();
    
    // Aguarda um pouco para garantir que tudo foi carregado
    setTimeout(async () => {
        await openMemberModal();
        
        // Pré-seleciona o estudante
        const selectElement = document.getElementById('memberStudentSelect');
        if (selectElement) {
            selectElement.value = studentId;
        }
        
        const hiddenElement = document.getElementById('memberStudentId');
        if (hiddenElement) {
            hiddenElement.value = studentId;
        }
        
        // Mensagem de ajuda
        showNotification(`Criando registro de membro para: ${studentName}`, 'info');
    }, 300);
}

function viewMember(memberId) {
    editMember(memberId);
}

function editMember(memberId) {
    openMemberModal(memberId);
}

async function deleteMember(memberId) {
    if (!confirm('Tem certeza que deseja excluir este membro?')) return;
    
    showLoading();
    
    try {
        await apiRequest(`/member-status/${memberId}`, { method: 'DELETE' });
        showNotification('Membro excluído com sucesso!', 'success');
        await loadMembers(currentPage.members);
        await loadStats();
    } catch (error) {
        showNotification('Erro ao excluir membro: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function loadStudentsForMemberSelect() {
    try {
        const data = await apiRequest('/students?per_page=1000');
        const select = document.getElementById('memberStudentSelect');
        
        select.innerHTML = '<option value="">Selecione um Cadastro Básico...</option>';
        data.students.forEach(student => {
            select.innerHTML += `<option value="${student.id}">${student.name} - ${student.registration_number}</option>`;
        });
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

document.getElementById('memberForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const memberId = document.getElementById('memberId').value;
    const membershipDateValue = document.getElementById('memberMembershipDate').value;
    
    const formData = {
        student_id: parseInt(document.getElementById('memberStudentSelect').value),
        registered_number: document.getElementById('memberRegisteredNumber').value,
        membership_date: membershipDateValue ? membershipDateValue : null,
        member_type: document.getElementById('memberType').value,
        current_status: document.getElementById('memberStatus').value,
        last_activity_year: document.getElementById('memberLastActivityYear').value ? parseInt(document.getElementById('memberLastActivityYear').value) : null
    };
    
    showLoading();
    
    try {
        if (memberId) {
            await apiRequest(`/member-status/${memberId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            showNotification('Membro atualizado com sucesso!', 'success');
        } else {
            const result = await apiRequest('/member-status', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            currentMemberStatusId = result.id;
            showNotification('Membro criado com sucesso!', 'success');
        }
        
        await loadMembers(currentPage.members);
        await loadStats();
        
        // Não fechar o modal se estiver criando, para permitir adicionar graduações/qualificações
        if (memberId) {
            closeMemberModal();
        } else {
            // Recarregar o membro recém-criado
            await openMemberModal(currentMemberStatusId);
        }
        
    } catch (error) {
        showNotification('Erro ao salvar membro: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
});

// =========================================
// Tabs do Modal de Membro
// =========================================

function showMemberTab(tab) {
    // Esconder todos os conteúdos
    document.getElementById('memberInfoTabContent').classList.add('hidden');
    document.getElementById('memberGraduationsTabContent').classList.add('hidden');
    document.getElementById('memberQualificationsTabContent').classList.add('hidden');
    
    // Remover active de todas as tabs
    document.getElementById('memberInfoTab').classList.remove('border-purple-600', 'text-purple-600');
    document.getElementById('memberInfoTab').classList.add('text-gray-500');
    document.getElementById('memberGraduationsTab').classList.remove('border-purple-600', 'text-purple-600');
    document.getElementById('memberGraduationsTab').classList.add('text-gray-500');
    document.getElementById('memberQualificationsTab').classList.remove('border-purple-600', 'text-purple-600');
    document.getElementById('memberQualificationsTab').classList.add('text-gray-500');
    
    // Mostrar conteúdo selecionado
    if (tab === 'info') {
        document.getElementById('memberInfoTabContent').classList.remove('hidden');
        document.getElementById('memberInfoTab').classList.add('border-purple-600', 'text-purple-600');
        document.getElementById('memberInfoTab').classList.remove('text-gray-500');
    } else if (tab === 'graduations') {
        document.getElementById('memberGraduationsTabContent').classList.remove('hidden');
        document.getElementById('memberGraduationsTab').classList.add('border-purple-600', 'text-purple-600');
        document.getElementById('memberGraduationsTab').classList.remove('text-gray-500');
        
        if (currentMemberStatusId) {
            loadMemberGraduations(currentMemberStatusId);
        }
    } else if (tab === 'qualifications') {
        document.getElementById('memberQualificationsTabContent').classList.remove('hidden');
        document.getElementById('memberQualificationsTab').classList.add('border-purple-600', 'text-purple-600');
        document.getElementById('memberQualificationsTab').classList.remove('text-gray-500');
        
        if (currentMemberStatusId) {
            loadMemberQualifications(currentMemberStatusId);
        }
    }
}

// =========================================
// Graduações
// =========================================

async function loadMemberGraduations(memberStatusId) {
    try {
        const graduations = await apiRequest(`/member-status/${memberStatusId}/graduations`);
        renderMemberGraduations(graduations);
    } catch (error) {
        console.error('Error loading graduations:', error);
    }
}

function renderMemberGraduations(graduations) {
    const container = document.getElementById('memberGraduationsList');
    
    if (!graduations || graduations.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-medal text-4xl text-gray-300 mb-2 block"></i>
                Nenhuma graduação registrada
            </div>
        `;
        return;
    }
    
    container.innerHTML = graduations.map(grad => `
        <div class="border rounded-lg p-4 ${grad.is_current ? 'border-purple-600 bg-purple-50' : 'border-gray-200'}">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <i class="fas fa-medal text-purple-600 mr-2"></i>
                        <h4 class="font-bold text-gray-800">${grad.rank_display}</h4>
                        ${grad.is_current ? '<span class="ml-2 badge badge-success text-xs">Atual</span>' : ''}
                    </div>
                    <p class="text-sm text-gray-600"><strong>Disciplina:</strong> ${grad.discipline}</p>
                    ${grad.examination_date ? `<p class="text-sm text-gray-600"><strong>Data do Exame:</strong> ${formatDate(grad.examination_date)}</p>` : ''}
                    ${grad.certificate_number ? `<p class="text-sm text-gray-600"><strong>Certificado:</strong> ${grad.certificate_number}</p>` : ''}
                    <p class="text-sm text-gray-600"><strong>Status:</strong> ${grad.certificate_status_display}</p>
                </div>
                <div class="flex flex-col space-y-2">
                    <button onclick="editGraduation(${grad.id})" class="text-blue-600 hover:text-blue-900" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteGraduation(${grad.id})" class="text-red-600 hover:text-red-900" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function openGraduationModal(graduationId = null) {
    if (!currentMemberStatusId && !graduationId) {
        showNotification('Salve o membro primeiro antes de adicionar graduações', 'warning');
        return;
    }
    
    // Garantir que constantes estejam carregadas
    if (!constants) {
        console.log('Constantes não disponíveis, carregando antes de abrir modal...');
        showLoading();
        try {
            await loadConstants();
        } catch (error) {
            hideLoading();
            showNotification('Erro ao carregar dados necessários. Tente novamente.', 'error');
            return;
        }
        hideLoading();
    }
    
    const modal = document.getElementById('graduationModal');
    const form = document.getElementById('graduationForm');
    
    form.reset();
    document.getElementById('graduationMemberStatusId').value = currentMemberStatusId;
    
    if (graduationId) {
        // Carregar dados da graduação para edição
        loadGraduationForEdit(graduationId);
    } else {
        document.getElementById('graduationIsCurrent').checked = true;
        document.getElementById('graduationCertificateStatus').value = 'pending';
    }
    
    modal.classList.remove('hidden');
}

function closeGraduationModal() {
    document.getElementById('graduationModal').classList.add('hidden');
}

async function loadGraduationForEdit(graduationId) {
    showLoading();
    try {
        const grad = await apiRequest(`/graduations/${graduationId}`);
        
        document.getElementById('graduationId').value = grad.id;
        document.getElementById('graduationMemberStatusId').value = grad.member_status_id;
        document.getElementById('graduationDiscipline').value = grad.discipline;
        updateRankOptions();
        document.getElementById('graduationRankName').value = grad.rank_name;
        document.getElementById('graduationExamDate').value = grad.examination_date || '';
        document.getElementById('graduationCertificateNumber').value = grad.certificate_number || '';
        document.getElementById('graduationCertificateStatus').value = grad.certificate_status;
        document.getElementById('graduationIsCurrent').checked = grad.is_current;
        
    } catch (error) {
        showNotification('Erro ao carregar graduação: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function updateRankOptions() {
    const discipline = document.getElementById('graduationDiscipline').value;
    const select = document.getElementById('graduationRankName');
    
    console.log('updateRankOptions chamado:', { discipline, constants: !!constants });
    
    if (!discipline) {
        select.innerHTML = '<option value="">Selecione uma disciplina primeiro...</option>';
        return;
    }
    
    if (!constants) {
        select.innerHTML = '<option value="">Carregando constantes...</option>';
        console.warn('Constantes não disponíveis, tentando carregar...');
        
        // Tentar carregar as constantes
        try {
            await loadConstants();
            
            // Tentar novamente após carregar
            if (constants) {
                updateRankOptions();
            } else {
                select.innerHTML = '<option value="">Erro ao carregar graduações</option>';
                showNotification('Erro ao carregar lista de graduações. Recarregue a página.', 'error');
            }
        } catch (error) {
            console.error('Erro ao carregar constantes:', error);
            select.innerHTML = '<option value="">Erro ao carregar graduações</option>';
            showNotification('Erro ao carregar lista de graduações. Recarregue a página.', 'error');
        }
        return;
    }
    
    select.innerHTML = '<option value="">Selecione...</option>';
    
    const ranks = discipline === 'Shinshin Toitsudo' ? constants.toitsudo_ranks : constants.aikido_ranks;
    
    console.log('Ranks para disciplina', discipline, ':', ranks);
    
    if (ranks) {
        Object.entries(ranks).forEach(([key, value]) => {
            select.innerHTML += `<option value="${key}">${value.display}</option>`;
        });
        console.log('✅ Opções de graduação populadas:', Object.keys(ranks).length);
    } else {
        console.error('Ranks não encontrado para disciplina:', discipline);
        select.innerHTML = '<option value="">Nenhuma graduação disponível</option>';
    }
}

async function editGraduation(graduationId) {
    openGraduationModal(graduationId);
}

async function deleteGraduation(graduationId) {
    if (!confirm('Tem certeza que deseja excluir esta graduação?')) return;
    
    showLoading();
    
    try {
        await apiRequest(`/graduations/${graduationId}`, { method: 'DELETE' });
        showNotification('Graduação excluída com sucesso!', 'success');
        await loadMemberGraduations(currentMemberStatusId);
    } catch (error) {
        showNotification('Erro ao excluir graduação: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

document.getElementById('graduationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const graduationId = document.getElementById('graduationId').value;
    const formData = {
        discipline: document.getElementById('graduationDiscipline').value,
        rank_name: document.getElementById('graduationRankName').value,
        examination_date: document.getElementById('graduationExamDate').value || null,
        certificate_number: document.getElementById('graduationCertificateNumber').value || null,
        certificate_status: document.getElementById('graduationCertificateStatus').value,
        is_current: document.getElementById('graduationIsCurrent').checked
    };
    
    showLoading();
    
    try {
        if (graduationId) {
            await apiRequest(`/graduations/${graduationId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            showNotification('Graduação atualizada com sucesso!', 'success');
        } else {
            const memberStatusId = document.getElementById('graduationMemberStatusId').value;
            await apiRequest(`/member-status/${memberStatusId}/graduations`, {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showNotification('Graduação criada com sucesso!', 'success');
        }
        
        closeGraduationModal();
        await loadMemberGraduations(currentMemberStatusId);
        
    } catch (error) {
        showNotification('Erro ao salvar graduação: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
});

// =========================================
// Qualificações
// =========================================

async function loadMemberQualifications(memberStatusId) {
    try {
        const qualifications = await apiRequest(`/member-status/${memberStatusId}/qualifications`);
        renderMemberQualifications(qualifications);
    } catch (error) {
        console.error('Error loading qualifications:', error);
    }
}

function renderMemberQualifications(qualifications) {
    const container = document.getElementById('memberQualificationsList');
    
    if (!qualifications || qualifications.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-certificate text-4xl text-gray-300 mb-2 block"></i>
                Nenhuma qualificação registrada
            </div>
        `;
        return;
    }
    
    container.innerHTML = qualifications.map(qual => `
        <div class="border rounded-lg p-4 ${qual.is_active ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-gray-50'}">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <i class="fas fa-certificate text-green-600 mr-2"></i>
                        <h4 class="font-bold text-gray-800">${qual.qualification_display}</h4>
                        ${qual.is_active ? '<span class="ml-2 badge badge-success text-xs">Ativa</span>' : '<span class="ml-2 badge badge-danger text-xs">Inativa</span>'}
                    </div>
                    ${qual.date_obtained ? `<p class="text-sm text-gray-600"><strong>Data de Obtenção:</strong> ${formatDate(qual.date_obtained)}</p>` : ''}
                    ${qual.certificate_number ? `<p class="text-sm text-gray-600"><strong>Certificado:</strong> ${qual.certificate_number}</p>` : ''}
                </div>
                <div class="flex flex-col space-y-2">
                    <button onclick="editQualification(${qual.id})" class="text-blue-600 hover:text-blue-900" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteQualification(${qual.id})" class="text-red-600 hover:text-red-900" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function openQualificationModal(qualificationId = null) {
    if (!currentMemberStatusId && !qualificationId) {
        showNotification('Salve o membro primeiro antes de adicionar qualificações', 'warning');
        return;
    }
    
    // Garantir que constantes estejam carregadas
    if (!constants) {
        console.log('Constantes não disponíveis, carregando antes de abrir modal...');
        showLoading();
        try {
            await loadConstants();
        } catch (error) {
            hideLoading();
            showNotification('Erro ao carregar dados necessários. Tente novamente.', 'error');
            return;
        }
        hideLoading();
    }
    
    const modal = document.getElementById('qualificationModal');
    const form = document.getElementById('qualificationForm');
    
    form.reset();
    document.getElementById('qualificationMemberStatusId').value = currentMemberStatusId;
    
    if (qualificationId) {
        loadQualificationForEdit(qualificationId);
    } else {
        document.getElementById('qualificationIsActive').checked = true;
    }
    
    modal.classList.remove('hidden');
}

function closeQualificationModal() {
    document.getElementById('qualificationModal').classList.add('hidden');
}

async function loadQualificationForEdit(qualificationId) {
    showLoading();
    try {
        const qual = await apiRequest(`/qualifications/${qualificationId}`);
        
        document.getElementById('qualificationId').value = qual.id;
        document.getElementById('qualificationMemberStatusId').value = qual.member_status_id;
        document.getElementById('qualificationType').value = qual.qualification_type;
        updateQualificationLevelOptions();
        document.getElementById('qualificationLevel').value = qual.qualification_level || '';
        document.getElementById('qualificationDateObtained').value = qual.date_obtained || '';
        document.getElementById('qualificationCertificateNumber').value = qual.certificate_number || '';
        document.getElementById('qualificationIsActive').checked = qual.is_active;
        
    } catch (error) {
        showNotification('Erro ao carregar qualificação: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function updateQualificationLevelOptions() {
    const type = document.getElementById('qualificationType').value;
    const select = document.getElementById('qualificationLevel');
    
    console.log('updateQualificationLevelOptions chamado:', { type, constants: !!constants });
    
    if (!type) {
        select.innerHTML = '<option value="">Selecione um tipo primeiro...</option>';
        return;
    }
    
    if (!constants) {
        select.innerHTML = '<option value="">Carregando constantes...</option>';
        console.warn('Constantes não disponíveis, tentando carregar...');
        
        // Tentar carregar as constantes
        try {
            await loadConstants();
            
            // Tentar novamente após carregar
            if (constants) {
                updateQualificationLevelOptions();
            } else {
                select.innerHTML = '<option value="">Erro ao carregar níveis</option>';
                showNotification('Erro ao carregar lista de níveis. Recarregue a página.', 'error');
            }
        } catch (error) {
            console.error('Erro ao carregar constantes:', error);
            select.innerHTML = '<option value="">Erro ao carregar níveis</option>';
            showNotification('Erro ao carregar lista de níveis. Recarregue a página.', 'error');
        }
        return;
    }
    
    select.innerHTML = '<option value="">Selecione...</option>';
    
    const levels = type === 'examiner' ? constants.examiner_levels : constants.lecturer_levels;
    
    console.log('Níveis para tipo', type, ':', levels);
    
    if (levels) {
        Object.entries(levels).forEach(([key, value]) => {
            select.innerHTML += `<option value="${key}">${value}</option>`;
        });
        console.log('✅ Opções de nível populadas:', Object.keys(levels).length);
    } else {
        console.error('Níveis não encontrados para tipo:', type);
        select.innerHTML = '<option value="">Nenhum nível disponível</option>';
    }
}

async function editQualification(qualificationId) {
    openQualificationModal(qualificationId);
}

async function deleteQualification(qualificationId) {
    if (!confirm('Tem certeza que deseja excluir esta qualificação?')) return;
    
    showLoading();
    
    try {
        await apiRequest(`/qualifications/${qualificationId}`, { method: 'DELETE' });
        showNotification('Qualificação excluída com sucesso!', 'success');
        await loadMemberQualifications(currentMemberStatusId);
    } catch (error) {
        showNotification('Erro ao excluir qualificação: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

document.getElementById('qualificationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const qualificationId = document.getElementById('qualificationId').value;
    const formData = {
        qualification_type: document.getElementById('qualificationType').value,
        qualification_level: document.getElementById('qualificationLevel').value || null,
        date_obtained: document.getElementById('qualificationDateObtained').value || null,
        certificate_number: document.getElementById('qualificationCertificateNumber').value || null,
        is_active: document.getElementById('qualificationIsActive').checked
    };
    
    showLoading();
    
    try {
        if (qualificationId) {
            await apiRequest(`/qualifications/${qualificationId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            showNotification('Qualificação atualizada com sucesso!', 'success');
        } else {
            const memberStatusId = document.getElementById('qualificationMemberStatusId').value;
            await apiRequest(`/member-status/${memberStatusId}/qualifications`, {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showNotification('Qualificação criada com sucesso!', 'success');
        }
        
        closeQualificationModal();
        await loadMemberQualifications(currentMemberStatusId);
        
    } catch (error) {
        showNotification('Erro ao salvar qualificação: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
});

// =========================================
// Inicialização ao Carregar
// =========================================

window.addEventListener('DOMContentLoaded', () => {
    // Verificar se há token salvo
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        
        // Mostrar sistema principal
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainSystem').classList.remove('hidden');
        
        // Carregar dados iniciais
        loadInitialData();
    }
});
