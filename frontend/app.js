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

// Document Uploaders
let memberPhotoUploader = null;
let graduationDocUploader = null;
let qualificationDocUploader = null;

// Seleção de registros nas tabelas
let selectedStudent = null;
let selectedMember = null;
let selectedUser = null;

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
            headers,
            credentials: 'include'  // Importante: envia cookies de sessão
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
// Funções auxiliares para imagens (com autenticação)
// =========================================

/**
 * Carrega uma imagem com autenticação e retorna uma URL blob
 * Uso: <img src="..." onerror="loadAuthenticatedImage(this, 'path/to/image')"
 */
async function loadAuthenticatedImage(imgElement, imagePath) {
    try {
        // Usar query parameter para imagens (mais simples que blob)
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Token não encontrado');
        }
        
        const url = `${API_BASE_URL}/documents/by-path/${imagePath}/view?token=${encodeURIComponent(token)}`;
        
        const response = await fetch(url, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar imagem');
        }
        
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        imgElement.src = blobUrl;
        
        // Limpar blob URL quando a imagem não for mais necessária
        imgElement.addEventListener('load', () => {
            // Manter o blob por 1 minuto antes de limpar
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        });
    } catch (error) {
        console.error('Erro ao carregar imagem autenticada:', error);
        // Mostrar placeholder em caso de erro
        imgElement.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EErro%3C/text%3E%3C/svg%3E';
    }
}

/**
 * Abre um documento em nova aba com autenticação
 * Uso: onclick="openAuthenticatedDocument('path/to/document')"
 */
async function openAuthenticatedDocument(documentPath) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            showNotification('Sessão expirada. Faça login novamente.', 'error');
            return;
        }
        
        const url = `${API_BASE_URL}/documents/by-path/${documentPath}/view?token=${encodeURIComponent(token)}`;
        
        const response = await fetch(url, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar documento');
        }
        
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        // Abrir em nova aba
        const newWindow = window.open(blobUrl, '_blank');
        
        // Limpar blob URL após alguns segundos
        setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
        }, 10000);
    } catch (error) {
        console.error('Erro ao abrir documento:', error);
        showNotification('Erro ao visualizar documento', 'error');
    }
}

/**
 * Retorna uma URL para thumbnail com autenticação via token em query param
 * (Alternativa temporária - idealmente usar loadAuthenticatedImage)
 */
function getAuthenticatedThumbnailUrl(imagePath, size = 'small') {
    const url = `${API_BASE_URL}/documents/by-path/${imagePath}/thumbnail/${size}`;
    if (authToken) {
        return `${url}?token=${encodeURIComponent(authToken)}`;
    }
    return url;
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
            document.getElementById('sidebarUsers').classList.add('hidden');
        } else {
            document.getElementById('sidebarDojos').classList.remove('hidden');
            document.getElementById('newDojoBtn')?.classList.remove('hidden');
            document.getElementById('sidebarUsers').classList.remove('hidden');
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
    // Resetar todas as seleções ao trocar de seção
    selectedStudent = null;
    selectedMember = null;
    selectedUser = null;
    
    // Atualizar estado dos botões
    // updateStudentActionButtons(); // Removido: botões agora estão nos modais
    // updateMemberActionButtons(); // Removido: botões agora estão nos modais
    // updateUserActionButtons(); // Removido: botões agora estão nos modais
    
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(el => el.classList.add('hidden'));
    
    // Remover classe active de todos os items da sidebar
    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
    
    // Mostrar seção selecionada
    const sectionMap = {
        'dashboard': 'dashboardSection',
        'students': 'studentsSection',
        'members': 'membersSection',
        'dojos': 'dojosSection',
        'profile': 'profileSection',
        'users': 'usersSection',
        'reports': 'reports'
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
    } else if (section === 'profile') {
        loadProfile();
    } else if (section === 'users') {
        loadUsers();
    } else if (section === 'reports') {
        loadReports();
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
        // Se for admin, mostra "Todos" + lista de dojos
        if (currentUser && currentUser.role === 'admin') {
            studentDojoFilter.innerHTML = '<option value="">Todos</option>';
            allDojos.forEach(dojo => {
                studentDojoFilter.innerHTML += `<option value="${dojo.id}">${dojo.name}</option>`;
            });
        } 
        // Se for usuário de dojo, mostra apenas o dojo dele (sem "Todos")
        else if (currentUser && currentUser.dojo_id) {
            studentDojoFilter.innerHTML = `<option value="${currentUser.dojo_id}">${currentUser.dojo_name}</option>`;
            studentDojoFilter.disabled = true; // Desabilita o select já que só tem uma opção
        }
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
                    <div class="flex flex-col gap-2">
                        <button onclick="editDojo(${dojo.id})" class="text-blue-600 hover:text-blue-800" title="Editar Dojo">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteDojo(${dojo.id}, '${dojo.name.replace(/'/g, "\\'")}')" class="text-red-600 hover:text-red-800" title="Excluir Dojo">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
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

async function deleteDojo(dojoId, dojoName) {
    // Confirmar exclusão
    const confirmed = confirm(
        `Tem certeza que deseja excluir o dojo "${dojoName}"?\n\n` +
        `ATENÇÃO: Esta ação não pode ser desfeita!\n` +
        `Todos os estudantes vinculados a este dojo também serão afetados.`
    );
    
    if (!confirmed) {
        return;
    }
    
    showLoading();
    
    try {
        await apiRequest(`/dojos/${dojoId}`, {
            method: 'DELETE'
        });
        
        showNotification('Dojo excluído com sucesso!', 'success');
        await loadDojos();
        
    } catch (error) {
        showNotification('Erro ao excluir dojo: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
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
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-users text-6xl text-gray-300 mb-4 block"></i>
                    Nenhum Cadastro Básico encontrado
                </td>
            </tr>
        `;
        selectedStudent = null;
        // updateStudentActionButtons(); // Removido: botões agora estão nos modais
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
        
        const isSelected = selectedStudent && selectedStudent.id === student.id;
        const rowClass = isSelected ? 'table-row table-row-selected' : 'table-row hover:bg-gray-50';
        
        return `
            <tr class="${rowClass}" onclick="selectStudent(${student.id})" style="cursor: pointer;">
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    ${statusDisplay}
                </td>
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
            </tr>
        `;
    }).join('');
}

// Função para selecionar um estudante
function selectStudent(studentId) {
    const student = allStudents.find(s => s.id === studentId);
    if (student) {
        selectedStudent = student;
        renderStudentsTable(allStudents);
        // Abrir modal de detalhes automaticamente
        viewStudentDetails(studentId);
    }
}

// Função para atualizar estado dos botões de ação (DESABILITADA - botões agora estão nos modais)
/*
function updateStudentActionButtons() {
    const viewBtn = document.getElementById('studentViewBtn');
    const editBtn = document.getElementById('studentEditBtn');
    const deleteBtn = document.getElementById('studentDeleteBtn');
    
    if (viewBtn && editBtn && deleteBtn) {
        const isDisabled = !selectedStudent;
        viewBtn.disabled = isDisabled;
        editBtn.disabled = isDisabled;
        deleteBtn.disabled = isDisabled;
    }
}
*/

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

function viewStudent(studentId = null) {
    const id = studentId || (selectedStudent ? selectedStudent.id : null);
    if (!id) {
        showNotification('Selecione um cadastro básico primeiro', 'warning');
        return;
    }
    viewStudentDetails(id);
}

async function viewStudentDetails(studentId) {
    showLoading();
    
    try {
        // Buscar dados completos do estudante
        const response = await apiRequest(`/students/${studentId}`);
        console.log('Student data received:', response);
        
        // Verificar se os dados vêm aninhados em uma propriedade 'student'
        const student = response.student || response;
        console.log('Student object extracted:', student);
        
        // Se o estudante tem registro de membro, buscar também
        let memberData = null;
        if (student.has_member_status) {
            try {
                const members = await apiRequest(`/member-status?student_id=${studentId}`);
                console.log('Member data received:', members);
                if (members.members && members.members.length > 0) {
                    memberData = members.members[0];
                    console.log('Member object extracted:', memberData);
                }
            } catch (error) {
                console.log('Membro não encontrado:', error);
            }
        }
        
        // Abrir modal de detalhes
        openStudentDetailsModal(student, memberData);
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        showNotification('Erro ao carregar detalhes do estudante: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function openStudentDetailsModal(student, memberData) {
    const modal = document.getElementById('studentDetailsModal');
    
    console.log('Opening student details modal with data:', student);
    console.log('Student name:', student.name);
    console.log('Student email:', student.email);
    
    // Preencher informações do cadastro básico
    document.getElementById('detailStudentFullName').textContent = student.name || 'N/A';
    document.getElementById('detailStudentEmailAddr').textContent = student.email || 'N/A';
    document.getElementById('detailStudentPhoneNum').textContent = student.phone || 'N/A';
    document.getElementById('detailStudentBirthDateVal').textContent = formatDate(student.birth_date);
    document.getElementById('detailStudentAddressVal').textContent = student.address || 'N/A';
    document.getElementById('detailStudentDojoName').textContent = student.dojo_name || 'N/A';
    document.getElementById('detailStudentRegNumber').textContent = student.registration_number || 'N/A';
    document.getElementById('detailStudentRegDate').textContent = formatDate(student.registration_date);
    document.getElementById('detailStudentStartYear').textContent = student.started_practicing_year || 'N/A';
    document.getElementById('detailStudentNotesVal').textContent = student.notes || 'Sem observações';
    document.getElementById('detailStudentUpdatedAt').textContent = formatDateTime(student.updated_at);
    
    // Preencher informações de membro se existir
    const memberSection = document.getElementById('studentMemberSection');
    const viewMemberHeaderBtn = document.getElementById('viewMemberDetailsHeaderBtn');
    
    if (memberData) {
        console.log('Member data to display:', memberData);
        console.log('Member registered_number:', memberData.registered_number);
        console.log('Member type display:', memberData.member_type_display);
        console.log('Member status display:', memberData.current_status_display);
        console.log('Member membership_date:', memberData.membership_date);
        
        memberSection.classList.remove('hidden');
        
        const numberEl = document.getElementById('detailStudentMemberNumber');
        const typeEl = document.getElementById('detailStudentMemberType');
        const statusEl = document.getElementById('detailStudentMemberStatus');
        const dateEl = document.getElementById('detailStudentMembershipDate');
        
        console.log('HTML Elements found:', {
            numberEl: !!numberEl,
            typeEl: !!typeEl,
            statusEl: !!statusEl,
            dateEl: !!dateEl
        });
        
        if (numberEl) numberEl.textContent = memberData.registered_number || 'N/A';
        if (typeEl) typeEl.textContent = memberData.member_type_display || 'N/A';
        if (statusEl) statusEl.textContent = memberData.current_status_display || 'N/A';
        if (dateEl) dateEl.textContent = memberData.membership_date ? formatDate(memberData.membership_date) : 'N/A';
        
        console.log('Values set:', {
            number: numberEl?.textContent,
            type: typeEl?.textContent,
            status: statusEl?.textContent,
            date: dateEl?.textContent
        });
        
        // Mostrar botão de ver detalhes do membro no header
        // Capturar o ID do membro no escopo correto
        const currentMemberId = memberData.id;
        console.log('=== DEBUG: Setting up member details button ===');
        console.log('Student name:', student.name);
        console.log('Member ID captured:', currentMemberId);
        console.log('Member data:', memberData);
        
        // Remover evento anterior se existir
        viewMemberHeaderBtn.onclick = null;
        
        viewMemberHeaderBtn.classList.remove('hidden');
        viewMemberHeaderBtn.onclick = async () => {
            console.log('=== DEBUG: Button clicked ===');
            console.log('Opening member details for ID:', currentMemberId);
            closeStudentDetailsModal();
            // Abrir diretamente o modal de detalhes do membro
            await viewMemberDetails(currentMemberId);
        };
    } else {
        console.log('No member data - hiding section and button');
        memberSection.classList.add('hidden');
        // Esconder botão de ver detalhes do membro no header e limpar evento
        viewMemberHeaderBtn.onclick = null;
        viewMemberHeaderBtn.classList.add('hidden');
    }
    
    // Mostrar modal
    modal.classList.remove('hidden');
}

function closeStudentDetailsModal() {
    document.getElementById('studentDetailsModal').classList.add('hidden');
}

function editStudent(studentId = null) {
    const id = studentId || (selectedStudent ? selectedStudent.id : null);
    if (!id) {
        showNotification('Selecione um cadastro básico primeiro', 'warning');
        return;
    }
    openStudentModal(id);
}

async function deleteStudent(studentId = null) {
    const id = studentId || (selectedStudent ? selectedStudent.id : null);
    if (!id) {
        showNotification('Selecione um cadastro básico primeiro', 'warning');
        return;
    }
    
    if (!confirm('Tem certeza que deseja excluir este Cadastro Básico?')) return;
    
    showLoading();
    
    try {
        await apiRequest(`/students/${id}`, { method: 'DELETE' });
        showNotification('Cadastro Básico excluído com sucesso!', 'success');
        selectedStudent = null;
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
        selectedMember = null;
        // updateMemberActionButtons(); // Removido: botões agora estão nos modais
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
        
        const isSelected = selectedMember && selectedMember.id === member.id;
        const rowClass = isSelected ? 'table-row table-row-selected' : 'table-row hover:bg-gray-50';
        
        // Avatar/foto do membro - usando thumbnail small para tabela
        const avatarHtml = member.has_photo 
            ? `<img src="${API_BASE_URL}/documents/by-path/${member.photo_path}/thumbnail/small?token=${encodeURIComponent(authToken)}" 
                    class="w-10 h-10 rounded-full object-cover border-2 border-gray-200 member-avatar" 
                    alt="${member.student_name}"
                    onerror="this.onerror=null; loadAuthenticatedImage(this, '${member.photo_path}');">`
            : `<div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                ${member.student_name ? member.student_name.charAt(0).toUpperCase() : '?'}
               </div>`;
        
        return `
            <tr class="${rowClass}" onclick="selectMember(${member.id})" style="cursor: pointer;">
                <td class="px-6 py-4 whitespace-nowrap">
                    ${avatarHtml}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    ${statusBadges[member.current_status] || member.current_status}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${member.registered_number || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${member.student_name}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    ${typeBadges[member.member_type] || member.member_type}
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                    ${graduationsText}
                </td>
            </tr>
        `;
    }).join('');
}

// Função para selecionar um membro
function selectMember(memberId) {
    const member = allMembers.find(m => m.id === memberId);
    if (member) {
        selectedMember = member;
        renderMembersTable(allMembers);
        // Abrir modal de detalhes automaticamente
        viewMemberDetails(memberId);
    }
}

// Função para atualizar estado dos botões de ação de membros (DESABILITADA - botões agora estão nos modais)
/*
function updateMemberActionButtons() {
    const viewBtn = document.getElementById('memberViewBtn');
    const editBtn = document.getElementById('memberEditBtn');
    const graduationsBtn = document.getElementById('memberGraduationsBtn');
    const qualificationsBtn = document.getElementById('memberQualificationsBtn');
    const deleteBtn = document.getElementById('memberDeleteBtn');
    
    if (viewBtn && editBtn && graduationsBtn && qualificationsBtn && deleteBtn) {
        const isDisabled = !selectedMember;
        viewBtn.disabled = isDisabled;
        editBtn.disabled = isDisabled;
        graduationsBtn.disabled = isDisabled;
        qualificationsBtn.disabled = isDisabled;
        deleteBtn.disabled = isDisabled;
    }
}
*/

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
            
            // Inicializar uploader de foto com foto existente
            memberPhotoUploader = new DocumentUploader('memberPhotoUploadArea', {
                documentType: 'member_photo',
                relatedId: member.id,
                existingPath: member.photo_path,
                onDelete: async () => {
                    // Atualizar member_status para remover photo_path
                    try {
                        await apiRequest(`/member-status/${member.id}`, {
                            method: 'PUT',
                            body: JSON.stringify({
                                student_id: member.student_id,
                                registered_number: member.registered_number,
                                membership_date: member.membership_date,
                                member_type: member.member_type,
                                current_status: member.current_status,
                                last_activity_year: member.last_activity_year,
                                photo_path: null
                            })
                        });
                        showNotification('Foto removida com sucesso!', 'success');
                        return true;
                    } catch (error) {
                        showNotification('Erro ao remover foto: ' + error.message, 'error');
                        return false;
                    }
                }
            });
            
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
        
        // Inicializar uploader de foto sem foto existente
        memberPhotoUploader = new DocumentUploader('memberPhotoUploadArea', {
            documentType: 'member_photo',
            relatedId: null
        });
    }
    
    modal.classList.remove('hidden');
}

function closeMemberModal() {
    document.getElementById('memberModal').classList.add('hidden');
    
    // Se o modal de detalhes do membro estiver aberto, recarregar os dados
    const memberDetailsModal = document.getElementById('memberDetailsModal');
    if (!memberDetailsModal.classList.contains('hidden') && currentMemberStatusId) {
        refreshMemberDetails(currentMemberStatusId);
    }
    
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

function viewMember(memberId = null) {
    const id = memberId || (selectedMember ? selectedMember.id : null);
    if (!id) {
        showNotification('Selecione um membro primeiro', 'warning');
        return;
    }
    viewMemberDetails(id);
}

async function viewMemberDetails(memberId) {
    console.log('=== DEBUG: viewMemberDetails called with ID:', memberId);
    showLoading();
    
    try {
        // Buscar dados completos do membro
        console.log('Fetching member from API:', `/member-status/${memberId}`);
        const memberResponse = await apiRequest(`/member-status/${memberId}`);
        console.log('Member data received:', memberResponse);
        const member = memberResponse; // Member já vem direto, não aninhado
        
        const studentResponse = await apiRequest(`/students/${member.student_id}`);
        console.log('Student data for member received:', studentResponse);
        const student = studentResponse.student || studentResponse; // Student vem aninhado em {student: {...}}
        
        const graduations = await apiRequest(`/member-status/${memberId}/graduations`);
        console.log('Graduations received:', graduations);
        
        const qualifications = await apiRequest(`/member-status/${memberId}/qualifications`);
        console.log('Qualifications received:', qualifications);
        
        console.log('Extracted objects:', { member, student, graduations, qualifications });
        
        // Abrir modal de detalhes
        openMemberDetailsModal(member, student, graduations, qualifications);
    } catch (error) {
        console.error('Erro ao carregar detalhes do membro:', error);
        showNotification('Erro ao carregar detalhes do membro: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Função para recarregar apenas os dados do modal de detalhes (sem fechar e abrir)
async function refreshMemberDetails(memberId) {
    if (!memberId) {
        console.warn('refreshMemberDetails: No memberId provided');
        return;
    }
    
    try {
        // Buscar dados atualizados
        const memberResponse = await apiRequest(`/member-status/${memberId}`);
        const member = memberResponse;
        
        const studentResponse = await apiRequest(`/students/${member.student_id}`);
        const student = studentResponse.student || studentResponse;
        
        const graduations = await apiRequest(`/member-status/${memberId}/graduations`);
        const qualifications = await apiRequest(`/member-status/${memberId}/qualifications`);
        
        // Atualizar apenas o conteúdo do modal (sem fechar/abrir)
        updateMemberDetailsContent(member, student, graduations, qualifications);
    } catch (error) {
        console.error('Erro ao recarregar detalhes do membro:', error);
        showNotification('Erro ao atualizar informações: ' + error.message, 'error');
    }
}

// Função para atualizar apenas o conteúdo do modal sem fechar/abrir
function updateMemberDetailsContent(member, student, graduations, qualifications) {
    // Atualizar selectedMember com os novos dados
    selectedMember = member;
    console.log('selectedMember updated to:', selectedMember);
    
    // Atualizar informações básicas do estudante
    document.getElementById('detailMemberStudentName').textContent = student.name || 'N/A';
    document.getElementById('detailMemberStudentDojo').textContent = student.dojo_name || 'N/A';
    document.getElementById('detailMemberStudentRegNumber').textContent = student.registration_number || 'N/A';
    
    // Atualizar informações do status de membro
    document.getElementById('detailMemberRegisteredNumber').textContent = member.registered_number || 'N/A';
    document.getElementById('detailMemberMembershipDate').textContent = formatDate(member.membership_date);
    document.getElementById('detailMemberType').textContent = member.member_type_display || 'N/A';
    document.getElementById('detailMemberStatus').textContent = member.current_status_display || 'N/A';
    document.getElementById('detailMemberLastActivityYear').textContent = member.last_activity_year || 'N/A';
    document.getElementById('detailMemberUpdatedAt').textContent = formatDateTime(member.updated_at);
    
    // Atualizar graduações e qualificações
    renderDetailsGraduations(graduations);
    renderDetailsQualifications(qualifications);
}

function openMemberDetailsModal(member, student, graduations, qualifications) {
    const modal = document.getElementById('memberDetailsModal');
    
    console.log('Opening member details modal with:', { member, student, graduations, qualifications });
    console.log('Student name for member:', student.name);
    console.log('Member registered_number:', member.registered_number);
    
    // Definir selectedMember para que os botões de ação funcionem
    selectedMember = member;
    console.log('selectedMember set to:', selectedMember);
    
    // Renderizar foto do membro - usando thumbnail medium no modal
    const photoContainer = document.getElementById('detailMemberPhotoContainer');
    if (member.has_photo) {
        photoContainer.innerHTML = `
            <img src="${API_BASE_URL}/documents/by-path/${member.photo_path}/thumbnail/medium?token=${encodeURIComponent(authToken)}" 
                 class="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity member-photo-large" 
                 alt="${student.name}"
                 onclick="openAuthenticatedDocument('${member.photo_path}')"
                 onerror="this.onerror=null; loadAuthenticatedImage(this, '${member.photo_path}');">
        `;
    } else {
        photoContainer.innerHTML = `
            <div class="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-5xl font-bold">
                ${student.name ? student.name.charAt(0).toUpperCase() : '?'}
            </div>
        `;
    }
    
    // Preencher informações básicas do estudante (apenas nome e dojo para referência)
    document.getElementById('detailMemberStudentName').textContent = student.name || 'N/A';
    document.getElementById('detailMemberStudentDojo').textContent = student.dojo_name || 'N/A';
    document.getElementById('detailMemberStudentRegNumber').textContent = student.registration_number || 'N/A';
    
    // Preencher informações do status de membro
    document.getElementById('detailMemberRegisteredNumber').textContent = member.registered_number || 'N/A';
    document.getElementById('detailMemberMembershipDate').textContent = formatDate(member.membership_date);
    document.getElementById('detailMemberType').textContent = member.member_type_display || 'N/A';
    document.getElementById('detailMemberStatus').textContent = member.current_status_display || 'N/A';
    document.getElementById('detailMemberLastActivityYear').textContent = member.last_activity_year || 'N/A';
    document.getElementById('detailMemberUpdatedAt').textContent = formatDateTime(member.updated_at);
    
        
    // Preencher histórico completo de graduações
    renderDetailsGraduations(graduations);
    
    // Preencher qualificações
    renderDetailsQualifications(qualifications);
    
    // Mostrar modal
    modal.classList.remove('hidden');
}

function closeMemberDetailsModal() {
    document.getElementById('memberDetailsModal').classList.add('hidden');
    selectedMember = null;
    console.log('selectedMember cleared');
}

function renderDetailsGraduations(graduations) {
    const aikidoContainer = document.getElementById('detailGraduationsAikido');
    const toitsudoContainer = document.getElementById('detailGraduationsToitsudo');
    
    if (!graduations || graduations.length === 0) {
        aikidoContainer.innerHTML = `
            <div class="text-center py-4 text-gray-500">
                <i class="fas fa-medal text-2xl text-gray-300 mb-2 block"></i>
                <p class="text-sm">Nenhuma graduação</p>
            </div>
        `;
        toitsudoContainer.innerHTML = `
            <div class="text-center py-4 text-gray-500">
                <i class="fas fa-medal text-2xl text-gray-300 mb-2 block"></i>
                <p class="text-sm">Nenhuma graduação</p>
            </div>
        `;
        return;
    }
    
    // Separar graduações por disciplina
    const aikidoGrads = graduations.filter(g => g.discipline === 'Shinshin Toitsu Aikido');
    const toitsudoGrads = graduations.filter(g => g.discipline === 'Shinshin Toitsudo');
    
    // Ordenar por rank_level (maior primeiro = grau superior)
    const sortByLevel = (a, b) => {
        const levelA = a.rank_level || 0;
        const levelB = b.rank_level || 0;
        return levelB - levelA; // Decrescente: níveis maiores primeiro
    };
    
    aikidoGrads.sort(sortByLevel);
    toitsudoGrads.sort(sortByLevel);
    
    // Função helper para renderizar card de graduação
    const renderGradCard = (grad) => `
        <div class="border rounded-lg p-4 ${grad.is_current ? 'border-purple-600 bg-purple-50' : 'border-gray-200 bg-white'}">
            <div class="flex items-start gap-4">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center mb-2">
                        <i class="fas fa-medal ${grad.is_current ? 'text-purple-600' : 'text-gray-400'} mr-2"></i>
                        <h4 class="font-bold text-gray-800">${grad.rank_display}</h4>
                        ${grad.is_current ? '<span class="ml-2 px-2 py-1 bg-purple-600 text-white text-xs rounded-full">Atual</span>' : ''}
                    </div>
                    <div class="space-y-1 text-sm text-gray-600">
                        <p><strong>Nível:</strong> ${grad.rank_level || 'N/A'}</p>
                        ${grad.examination_date ? `<p><strong>Data do Exame:</strong> ${formatDate(grad.examination_date)}</p>` : ''}
                        ${grad.certificate_number ? `<p><strong>Certificado:</strong> ${grad.certificate_number}</p>` : ''}
                        <p><strong>Status:</strong> ${grad.certificate_status_display}</p>
                    </div>
                </div>
                ${grad.has_document ? `
                    <div class="flex-shrink-0">
                        <img src="${getAuthenticatedThumbnailUrl(grad.document_path, 'small')}" 
                             class="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border-2 border-purple-300 shadow-sm" 
                             alt="Certificado"
                             onclick="openAuthenticatedDocument('${grad.document_path}')"
                             onerror="this.onerror=null; loadAuthenticatedImage(this, '${grad.document_path}');"
                             title="Clique para visualizar certificado">
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Renderizar Aikido
    if (aikidoGrads.length === 0) {
        aikidoContainer.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <i class="fas fa-medal text-3xl text-gray-300 mb-2 block"></i>
                <p class="text-sm">Nenhuma graduação</p>
            </div>
        `;
    } else {
        aikidoContainer.innerHTML = aikidoGrads.map(renderGradCard).join('');
    }
    
    // Renderizar Toitsudo
    if (toitsudoGrads.length === 0) {
        toitsudoContainer.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <i class="fas fa-medal text-3xl text-gray-300 mb-2 block"></i>
                <p class="text-sm">Nenhuma graduação</p>
            </div>
        `;
    } else {
        toitsudoContainer.innerHTML = toitsudoGrads.map(renderGradCard).join('');
    }
}

function renderDetailsQualifications(qualifications) {
    const container = document.getElementById('detailQualificationsList');
    
    if (!qualifications || qualifications.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-gray-500">
                <i class="fas fa-certificate text-2xl text-gray-300 mb-2 block"></i>
                <p class="text-sm">Nenhuma qualificação registrada</p>
            </div>
        `;
        return;
    }
    
    // Filtrar apenas qualificações ativas e pegar a mais alta de cada tipo
    const activeQuals = qualifications.filter(q => q.is_active);
    
    // Agrupar por tipo
    const byType = {};
    activeQuals.forEach(qual => {
        const type = qual.qualification_type;
        if (!byType[type]) {
            byType[type] = [];
        }
        byType[type].push(qual);
    });
    
    // Hierarquia de níveis (do mais alto para o mais baixo)
    const levelHierarchy = ['pleno', 'companheiro', 'assistente'];
    
    // Pegar a mais alta de cada tipo
    const highestQuals = [];
    Object.entries(byType).forEach(([type, quals]) => {
        // Ordenar por nível (pleno > companheiro > assistente)
        const sorted = quals.sort((a, b) => {
            const aIndex = levelHierarchy.indexOf(a.qualification_level?.toLowerCase());
            const bIndex = levelHierarchy.indexOf(b.qualification_level?.toLowerCase());
            
            // Se ambos têm nível, comparar pelo índice (menor índice = nível mais alto)
            if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
            }
            
            // Se um não tem nível, o que tem vem primeiro
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            
            // Se nenhum tem nível, ordenar por data (mais recente primeiro)
            if (a.date_obtained && b.date_obtained) {
                return new Date(b.date_obtained) - new Date(a.date_obtained);
            }
            
            return 0;
        });
        
        // Pegar a primeira (mais alta)
        if (sorted.length > 0) {
            highestQuals.push(sorted[0]);
        }
    });
    
    // Se não houver qualificações ativas, mostrar mensagem
    if (highestQuals.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-gray-500">
                <i class="fas fa-certificate text-2xl text-gray-300 mb-2 block"></i>
                <p class="text-sm">Nenhuma qualificação ativa</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = highestQuals.map(qual => `
        <div class="border rounded-lg p-4 border-green-600 bg-green-50">
            <div class="flex items-start gap-4">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center mb-2">
                        <i class="fas fa-certificate text-green-600 mr-2"></i>
                        <h4 class="font-bold text-gray-800">${qual.qualification_display}</h4>
                        <span class="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded-full">Ativa</span>
                    </div>
                    <div class="space-y-1 text-sm text-gray-600">
                        <p><strong>Tipo:</strong> ${qual.qualification_type_display || qual.qualification_type}</p>
                        ${qual.qualification_level ? `<p><strong>Nível:</strong> ${qual.qualification_level}</p>` : ''}
                        ${qual.date_obtained ? `<p><strong>Data de Obtenção:</strong> ${formatDate(qual.date_obtained)}</p>` : ''}
                        ${qual.certificate_number ? `<p><strong>Número do Certificado:</strong> ${qual.certificate_number}</p>` : ''}
                    </div>
                </div>
                ${qual.has_document ? `
                    <div class="flex-shrink-0">
                        <img src="${getAuthenticatedThumbnailUrl(qual.document_path, 'small')}" 
                             class="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border-2 border-green-300 shadow-sm" 
                             alt="Certificado"
                             onclick="openAuthenticatedDocument('${qual.document_path}')"
                             onerror="this.onerror=null; loadAuthenticatedImage(this, '${qual.document_path}');"
                             title="Clique para visualizar certificado">
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function editMember(memberId = null) {
    const id = memberId || (selectedMember ? selectedMember.id : null);
    if (!id) {
        showNotification('Selecione um membro primeiro', 'warning');
        return;
    }
    openMemberModal(id);
}

async function deleteMember(memberId = null) {
    const id = memberId || (selectedMember ? selectedMember.id : null);
    if (!id) {
        showNotification('Selecione um membro primeiro', 'warning');
        return;
    }
    
    if (!confirm('Tem certeza que deseja excluir este membro?')) return;
    
    showLoading();
    
    try {
        await apiRequest(`/member-status/${id}`, { method: 'DELETE' });
        showNotification('Membro excluído com sucesso!', 'success');
        selectedMember = null;
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
        let savedMemberId = memberId;
        
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
            savedMemberId = result.id;
            currentMemberStatusId = result.id;
            showNotification('Membro criado com sucesso!', 'success');
        }
        
        // Fazer upload da foto se houver
        if (memberPhotoUploader && memberPhotoUploader.hasFile()) {
            memberPhotoUploader.setRelatedId(savedMemberId);
            const uploadResult = await memberPhotoUploader.uploadFile();
            if (uploadResult) {
                showNotification('Foto enviada com sucesso!', 'success');
            }
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
// Gerenciamento de Graduações e Qualificações
// =========================================

// Funções para abrir modais de gerenciamento
async function manageMemberGraduations() {
    if (!selectedMember) return;
    
    const modal = document.getElementById('manageGraduationsModal');
    const memberName = document.getElementById('manageGraduationsMemberName');
    
    memberName.textContent = selectedMember.student_name;
    currentMemberStatusId = selectedMember.id;
    
    modal.classList.remove('hidden');
    
    // Carregar graduações do membro
    await loadGraduationsForManage(selectedMember.id);
}

function closeManageGraduationsModal() {
    document.getElementById('manageGraduationsModal').classList.add('hidden');
    
    // Se o modal de detalhes do membro estiver aberto, recarregar os dados
    const memberDetailsModal = document.getElementById('memberDetailsModal');
    if (!memberDetailsModal.classList.contains('hidden') && currentMemberStatusId) {
        refreshMemberDetails(currentMemberStatusId);
    }
    
    currentMemberStatusId = null;
}

async function manageMemberQualifications() {
    if (!selectedMember) return;
    
    const modal = document.getElementById('manageQualificationsModal');
    const memberName = document.getElementById('manageQualificationsMemberName');
    
    memberName.textContent = selectedMember.student_name;
    currentMemberStatusId = selectedMember.id;
    
    modal.classList.remove('hidden');
    
    // Carregar qualificações do membro
    await loadQualificationsForManage(selectedMember.id);
}

function closeManageQualificationsModal() {
    document.getElementById('manageQualificationsModal').classList.add('hidden');
    
    // Se o modal de detalhes do membro estiver aberto, recarregar os dados
    const memberDetailsModal = document.getElementById('memberDetailsModal');
    if (!memberDetailsModal.classList.contains('hidden') && currentMemberStatusId) {
        refreshMemberDetails(currentMemberStatusId);
    }
    
    currentMemberStatusId = null;
}

// Funções para carregar listas de gerenciamento
async function loadGraduationsForManage(memberStatusId) {
    try {
        const graduations = await apiRequest(`/member-status/${memberStatusId}/graduations`);
        renderManageGraduations(graduations);
    } catch (error) {
        console.error('Error loading graduations:', error);
        showNotification('Erro ao carregar graduações: ' + error.message, 'error');
    }
}

function renderManageGraduations(graduations) {
    const container = document.getElementById('manageGraduationsList');
    
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
            <div class="flex items-center gap-4">
                <div class="flex-1 min-w-0">
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
                ${grad.has_document ? `
                    <div class="flex-shrink-0">
                        <img src="${getAuthenticatedThumbnailUrl(grad.document_path, 'small')}" 
                             class="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border-2 border-purple-300 shadow-sm" 
                             alt="Certificado"
                             onclick="openAuthenticatedDocument('${grad.document_path}')"
                             onerror="this.onerror=null; loadAuthenticatedImage(this, '${grad.document_path}');"
                             title="Clique para visualizar certificado">
                    </div>
                ` : ''}
                <div class="flex flex-col space-y-2 flex-shrink-0">
                    <button onclick="editGraduationFromManage(${grad.id})" class="text-blue-600 hover:text-blue-900 p-1" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteGraduationFromManage(${grad.id})" class="text-red-600 hover:text-red-900 p-1" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function loadQualificationsForManage(memberStatusId) {
    try {
        const qualifications = await apiRequest(`/member-status/${memberStatusId}/qualifications`);
        renderManageQualifications(qualifications);
    } catch (error) {
        console.error('Error loading qualifications:', error);
        showNotification('Erro ao carregar qualificações: ' + error.message, 'error');
    }
}

function renderManageQualifications(qualifications) {
    const container = document.getElementById('manageQualificationsList');
    
    if (!qualifications || qualifications.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-certificate text-4xl text-gray-300 mb-2 block"></i>
                Nenhuma qualificação registrada
            </div>
        `;
        return;
    }
    
    container.innerHTML = qualifications.map(qual => {
        // Montar o título com tipo e nível
        let title = qual.qualification_type_display || qual.qualification_type || 'Qualificação';
        const level = qual.qualification_level || qual.level;
        if (level) {
            title += ` - ${level}`;
        }
        
        return `
            <div class="border rounded-lg p-4 ${qual.is_active ? 'border-green-600 bg-green-50' : 'border-gray-200'}">
                <div class="flex items-center gap-4">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center mb-2">
                            <i class="fas fa-certificate text-green-600 mr-2"></i>
                            <h4 class="font-bold text-gray-800">${title}</h4>
                            ${qual.is_active ? '<span class="ml-2 badge badge-success text-xs">Ativo</span>' : '<span class="ml-2 badge badge-danger text-xs">Inativo</span>'}
                        </div>
                        ${qual.date_obtained ? `<p class="text-sm text-gray-600"><strong>Data de Obtenção:</strong> ${formatDate(qual.date_obtained)}</p>` : ''}
                        ${qual.certificate_number ? `<p class="text-sm text-gray-600"><strong>Certificado:</strong> ${qual.certificate_number}</p>` : ''}
                    </div>
                    ${qual.has_document ? `
                        <div class="flex-shrink-0">
                            <img src="${getAuthenticatedThumbnailUrl(qual.document_path, 'small')}" 
                                 class="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border-2 border-green-300 shadow-sm" 
                                 alt="Certificado"
                                 onclick="openAuthenticatedDocument('${qual.document_path}')"
                                 onerror="this.onerror=null; loadAuthenticatedImage(this, '${qual.document_path}');"
                                 title="Clique para visualizar certificado">
                        </div>
                    ` : ''}
                    <div class="flex flex-col space-y-2 flex-shrink-0">
                        <button onclick="editQualificationFromManage(${qual.id})" class="text-blue-600 hover:text-blue-900 p-1" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteQualificationFromManage(${qual.id})" class="text-red-600 hover:text-red-900 p-1" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Funções para abrir modais de graduação/qualificação a partir do manage
function openGraduationModalFromManage() {
    openGraduationModal();
}

async function editGraduationFromManage(graduationId) {
    await loadGraduationForEdit(graduationId);
    
    // Inicializar uploader com certificado existente
    showLoading();
    try {
        const grad = await apiRequest(`/graduations/${graduationId}`);
        graduationDocUploader = new DocumentUploader('graduationDocUploadArea', {
            documentType: 'graduation',
            relatedId: graduationId,
            existingPath: grad.document_path,
            onDelete: async () => {
                // Atualizar graduação para remover document_path
                try {
                    await apiRequest(`/graduations/${graduationId}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            ...grad,
                            document_path: null
                        })
                    });
                    showNotification('Certificado removido com sucesso!', 'success');
                    return true;
                } catch (error) {
                    showNotification('Erro ao remover certificado: ' + error.message, 'error');
                    return false;
                }
            }
        });
    } catch (error) {
        console.error('Erro ao carregar graduação para uploader:', error);
    } finally {
        hideLoading();
    }
    
    document.getElementById('graduationModal').classList.remove('hidden');
}

async function deleteGraduationFromManage(graduationId) {
    if (!confirm('Tem certeza que deseja excluir esta graduação?')) return;
    
    showLoading();
    try {
        await apiRequest(`/graduations/${graduationId}`, { method: 'DELETE' });
        showNotification('Graduação excluída com sucesso!', 'success');
        await loadGraduationsForManage(currentMemberStatusId);
    } catch (error) {
        showNotification('Erro ao excluir graduação: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function openQualificationModalFromManage() {
    openQualificationModal();
}

async function editQualificationFromManage(qualificationId) {
    await loadQualificationForEdit(qualificationId);
    
    // Inicializar uploader com certificado existente
    showLoading();
    try {
        const qual = await apiRequest(`/qualifications/${qualificationId}`);
        qualificationDocUploader = new DocumentUploader('qualificationDocUploadArea', {
            documentType: 'qualification',
            relatedId: qualificationId,
            existingPath: qual.document_path,
            onDelete: async () => {
                // Atualizar qualificação para remover document_path
                try {
                    await apiRequest(`/qualifications/${qualificationId}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            ...qual,
                            document_path: null
                        })
                    });
                    showNotification('Certificado removido com sucesso!', 'success');
                    return true;
                } catch (error) {
                    showNotification('Erro ao remover certificado: ' + error.message, 'error');
                    return false;
                }
            }
        });
    } catch (error) {
        console.error('Erro ao carregar qualificação para uploader:', error);
    } finally {
        hideLoading();
    }
    
    document.getElementById('qualificationModal').classList.remove('hidden');
}

async function deleteQualificationFromManage(qualificationId) {
    if (!confirm('Tem certeza que deseja excluir esta qualificação?')) return;
    
    showLoading();
    try {
        await apiRequest(`/qualifications/${qualificationId}`, { method: 'DELETE' });
        showNotification('Qualificação excluída com sucesso!', 'success');
        await loadQualificationsForManage(currentMemberStatusId);
    } catch (error) {
        showNotification('Erro ao excluir qualificação: ' + error.message, 'error');
    } finally {
        hideLoading();
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
            <div class="flex items-center gap-4">
                <div class="flex-1 min-w-0">
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
                ${grad.has_document ? `
                    <div class="flex-shrink-0">
                        <img src="${getAuthenticatedThumbnailUrl(grad.document_path, 'small')}" 
                             class="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border-2 border-purple-300 shadow-sm" 
                             alt="Certificado"
                             onclick="openAuthenticatedDocument('${grad.document_path}')"
                             onerror="this.onerror=null; loadAuthenticatedImage(this, '${grad.document_path}');"
                             title="Clique para visualizar certificado">
                    </div>
                ` : ''}
                <div class="flex flex-col space-y-2 flex-shrink-0">
                    <button onclick="editGraduation(${grad.id})" class="text-blue-600 hover:text-blue-900 p-1" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteGraduation(${grad.id})" class="text-red-600 hover:text-red-900 p-1" title="Excluir">
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
    const title = document.getElementById('graduationModalTitle');
    
    form.reset();
    document.getElementById('graduationMemberStatusId').value = currentMemberStatusId;
    document.getElementById('graduationId').value = ''; // Limpar ID para garantir criação de novo registro
    
    if (graduationId) {
        title.innerHTML = '<i class="fas fa-medal mr-2"></i>Editar Graduação';
        // Carregar dados da graduação para edição
        await loadGraduationForEdit(graduationId);
        
        // Inicializar uploader com certificado existente
        showLoading();
        try {
            const grad = await apiRequest(`/graduations/${graduationId}`);
            graduationDocUploader = new DocumentUploader('graduationDocUploadArea', {
                documentType: 'graduation',
                relatedId: graduationId,
                existingPath: grad.document_path,
                onDelete: async () => {
                    // Atualizar graduação para remover document_path
                    try {
                        await apiRequest(`/graduations/${graduationId}`, {
                            method: 'PUT',
                            body: JSON.stringify({
                                ...grad,
                                document_path: null
                            })
                        });
                        showNotification('Certificado removido com sucesso!', 'success');
                        return true;
                    } catch (error) {
                        showNotification('Erro ao remover certificado: ' + error.message, 'error');
                        return false;
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao carregar graduação para uploader:', error);
        } finally {
            hideLoading();
        }
    } else {
        title.innerHTML = '<i class="fas fa-medal mr-2"></i>Nova Graduação';
        document.getElementById('graduationIsCurrent').checked = true;
        document.getElementById('graduationCertificateStatus').value = 'pending';
        
        // Inicializar uploader sem certificado existente
        graduationDocUploader = new DocumentUploader('graduationDocUploadArea', {
            documentType: 'graduation',
            relatedId: null
        });
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
        let savedGraduationId = graduationId;
        
        if (graduationId) {
            await apiRequest(`/graduations/${graduationId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            showNotification('Graduação atualizada com sucesso!', 'success');
        } else {
            const memberStatusId = document.getElementById('graduationMemberStatusId').value;
            const result = await apiRequest(`/member-status/${memberStatusId}/graduations`, {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            savedGraduationId = result.id;
            showNotification('Graduação criada com sucesso!', 'success');
        }
        
        // Fazer upload do certificado se houver
        if (graduationDocUploader && graduationDocUploader.hasFile()) {
            graduationDocUploader.setRelatedId(savedGraduationId);
            const uploadResult = await graduationDocUploader.uploadFile();
            if (uploadResult) {
                showNotification('Certificado enviado com sucesso!', 'success');
            }
        }
        
        closeGraduationModal();
        
        // Recarregar lista se estiver no modal de gerenciamento
        if (currentMemberStatusId && !document.getElementById('manageGraduationsModal').classList.contains('hidden')) {
            await loadGraduationsForManage(currentMemberStatusId);
        }
        
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
            <div class="flex items-center gap-4">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center mb-2">
                        <i class="fas fa-certificate text-green-600 mr-2"></i>
                        <h4 class="font-bold text-gray-800">${qual.qualification_display}</h4>
                        ${qual.is_active ? '<span class="ml-2 badge badge-success text-xs">Ativa</span>' : '<span class="ml-2 badge badge-danger text-xs">Inativa</span>'}
                    </div>
                    ${qual.date_obtained ? `<p class="text-sm text-gray-600"><strong>Data de Obtenção:</strong> ${formatDate(qual.date_obtained)}</p>` : ''}
                    ${qual.certificate_number ? `<p class="text-sm text-gray-600"><strong>Certificado:</strong> ${qual.certificate_number}</p>` : ''}
                </div>
                ${qual.has_document ? `
                    <div class="flex-shrink-0">
                        <img src="${getAuthenticatedThumbnailUrl(qual.document_path, 'small')}" 
                             class="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border-2 border-green-300 shadow-sm" 
                             alt="Certificado"
                             onclick="openAuthenticatedDocument('${qual.document_path}')"
                             onerror="this.onerror=null; loadAuthenticatedImage(this, '${qual.document_path}');"
                             title="Clique para visualizar certificado">
                    </div>
                ` : ''}
                <div class="flex flex-col space-y-2 flex-shrink-0">
                    <button onclick="editQualification(${qual.id})" class="text-blue-600 hover:text-blue-900 p-1" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteQualification(${qual.id})" class="text-red-600 hover:text-red-900 p-1" title="Excluir">
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
    const title = document.getElementById('qualificationModalTitle');
    
    form.reset();
    document.getElementById('qualificationMemberStatusId').value = currentMemberStatusId;
    document.getElementById('qualificationId').value = ''; // Limpar ID para garantir criação de novo registro
    
    if (qualificationId) {
        title.innerHTML = '<i class="fas fa-certificate mr-2"></i>Editar Qualificação';
        await loadQualificationForEdit(qualificationId);
        
        // Inicializar uploader com certificado existente
        showLoading();
        try {
            const qual = await apiRequest(`/qualifications/${qualificationId}`);
            qualificationDocUploader = new DocumentUploader('qualificationDocUploadArea', {
                documentType: 'qualification',
                relatedId: qualificationId,
                existingPath: qual.document_path,
                onDelete: async () => {
                    // Atualizar qualificação para remover document_path
                    try {
                        await apiRequest(`/qualifications/${qualificationId}`, {
                            method: 'PUT',
                            body: JSON.stringify({
                                ...qual,
                                document_path: null
                            })
                        });
                        showNotification('Certificado removido com sucesso!', 'success');
                        return true;
                    } catch (error) {
                        showNotification('Erro ao remover certificado: ' + error.message, 'error');
                        return false;
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao carregar qualificação para uploader:', error);
        } finally {
            hideLoading();
        }
    } else {
        title.innerHTML = '<i class="fas fa-certificate mr-2"></i>Nova Qualificação';
        document.getElementById('qualificationIsActive').checked = true;
        
        // Inicializar uploader sem certificado existente
        qualificationDocUploader = new DocumentUploader('qualificationDocUploadArea', {
            documentType: 'qualification',
            relatedId: null
        });
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
        let savedQualificationId = qualificationId;
        
        if (qualificationId) {
            await apiRequest(`/qualifications/${qualificationId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            showNotification('Qualificação atualizada com sucesso!', 'success');
        } else {
            const memberStatusId = document.getElementById('qualificationMemberStatusId').value;
            const result = await apiRequest(`/member-status/${memberStatusId}/qualifications`, {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            savedQualificationId = result.id;
            showNotification('Qualificação criada com sucesso!', 'success');
        }
        
        // Fazer upload do certificado se houver
        if (qualificationDocUploader && qualificationDocUploader.hasFile()) {
            qualificationDocUploader.setRelatedId(savedQualificationId);
            const uploadResult = await qualificationDocUploader.uploadFile();
            if (uploadResult) {
                showNotification('Certificado enviado com sucesso!', 'success');
            }
        }
        
        closeQualificationModal();
        
        // Recarregar lista se estiver no modal de gerenciamento
        if (currentMemberStatusId && !document.getElementById('manageQualificationsModal').classList.contains('hidden')) {
            await loadQualificationsForManage(currentMemberStatusId);
        }
        
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

// =========================================
// Gerenciamento de Perfil
// =========================================

async function loadProfile() {
    try {
        const data = await apiRequest('/profile');
        
        // Preencher formulário de perfil
        document.getElementById('profileName').value = data.name || '';
        document.getElementById('profileEmail').value = data.email || '';
        document.getElementById('profileRole').value = data.role === 'admin' ? 'Administrador' : 'Usuário de Dojo';
        
        if (data.dojo_name) {
            document.getElementById('profileDojo').value = data.dojo_name;
            document.getElementById('profileDojoDiv').classList.remove('hidden');
        } else {
            document.getElementById('profileDojoDiv').classList.add('hidden');
        }
        
    } catch (error) {
        showNotification('Erro ao carregar perfil: ' + error.message, 'error');
    }
}

async function updateProfile() {
    showLoading();
    
    try {
        const formData = {
            name: document.getElementById('profileName').value
        };
        
        await apiRequest('/profile', {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        // Atualizar dados do usuário atual
        currentUser.name = formData.name;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        document.getElementById('userName').textContent = currentUser.name;
        
        showNotification('Perfil atualizado com sucesso!', 'success');
        
    } catch (error) {
        showNotification('Erro ao atualizar perfil: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Event listener para formulário de alterar senha
document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validar senhas
    if (newPassword !== confirmPassword) {
        showNotification('As senhas não coincidem!', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('A nova senha deve ter pelo menos 6 caracteres!', 'error');
        return;
    }
    
    showLoading();
    
    try {
        await apiRequest('/profile/change-password', {
            method: 'POST',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });
        
        showNotification('Senha alterada com sucesso!', 'success');
        
        // Limpar formulário
        document.getElementById('changePasswordForm').reset();
        
    } catch (error) {
        showNotification('Erro ao alterar senha: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
});

// =========================================
// Gerenciamento de Usuários (Admin)
// =========================================

// Função para renderizar a tabela de usuários (sem fazer nova requisição)
function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                    <i class="fas fa-users text-4xl mb-2 opacity-50"></i>
                    <p>Nenhum usuário encontrado</p>
                </td>
            </tr>
        `;
        selectedUser = null;
        // updateUserActionButtons(); // Removido: botões agora estão nos modais
        return;
    }
    
    users.forEach(user => {
        const tr = document.createElement('tr');
        
        const roleText = user.role === 'admin' ? 'Administrador' : 'Usuário de Dojo';
        const statusBadge = user.is_active 
            ? '<span class="badge badge-success">Ativo</span>'
            : '<span class="badge badge-danger">Inativo</span>';
        
        const isSelected = selectedUser && selectedUser.id === user.id;
        tr.className = isSelected ? 'table-row table-row-selected' : 'table-row hover:bg-gray-50';
        tr.style.cursor = 'pointer';
        tr.onclick = () => selectUser(user.id);
        
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <i class="fas fa-user-circle text-2xl text-gray-400 mr-3"></i>
                    <div class="text-sm font-medium text-gray-900">${user.name}</div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${user.email}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${roleText}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${user.dojo_name || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
        `;
        
        // Armazenar dados do usuário no elemento para acesso posterior
        tr.dataset.userId = user.id;
        tr.dataset.userName = user.name;
        tr.dataset.userActive = user.is_active;
        
        tbody.appendChild(tr);
    });
}

async function loadUsers() {
    showLoading();
    
    try {
        const data = await apiRequest('/users');
        
        // Armazenar todos os usuários globalmente para seleção
        window.allUsers = data;
        
        // Renderizar tabela
        renderUsersTable(data);
        
    } catch (error) {
        showNotification('Erro ao carregar usuários: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Função para selecionar um usuário
function selectUser(userId) {
    const user = window.allUsers.find(u => u.id === userId);
    if (user) {
        selectedUser = user;
        renderUsersTable(window.allUsers);
        // Abrir modal de detalhes automaticamente
        viewUserDetails(userId);
    }
}

async function viewUserDetails(userId) {
    showLoading();
    
    try {
        const data = await apiRequest(`/users/${userId}`);
        console.log('User data received:', data);
        
        // O backend retorna o objeto user diretamente, não dentro de data.user
        const user = data.user || data;
        console.log('User object:', user);
        
        if (!user) {
            throw new Error('Dados do usuário não encontrados');
        }
        
        // Preencher informações do usuário
        document.getElementById('detailUserName').textContent = user.name || '-';
        document.getElementById('detailUserEmail').textContent = user.email || '-';
        
        // Role
        const roleBadges = {
            'admin': '<span class="badge badge-danger">Administrador</span>',
            'dojo_admin': '<span class="badge badge-warning">Gerente de Dojo</span>',
            'instructor': '<span class="badge badge-info">Instrutor</span>'
        };
        document.getElementById('detailUserRole').innerHTML = roleBadges[user.role] || user.role;
        
        // Status
        const statusBadge = user.is_active 
            ? '<span class="badge badge-success">Ativo</span>' 
            : '<span class="badge badge-danger">Inativo</span>';
        document.getElementById('detailUserStatus').innerHTML = statusBadge;
        
        // Dojo
        document.getElementById('detailUserDojo').textContent = user.dojo_name || 'Todos os Dojos (Admin)';
        
                
        // Abrir modal
        document.getElementById('userDetailsModal').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading user details:', error);
        showNotification('Erro ao carregar detalhes do usuário: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function closeUserDetailsModal() {
    document.getElementById('userDetailsModal').classList.add('hidden');
    selectedUser = null;
    renderUsersTable(window.allUsers);
}

// Função para atualizar estado dos botões de ação de usuários (DESABILITADA - botões agora estão nos modais)
/*
function updateUserActionButtons() {
    const editBtn = document.getElementById('userEditBtn');
    const resetPwdBtn = document.getElementById('userResetPasswordBtn');
    const toggleStatusBtn = document.getElementById('userToggleStatusBtn');
    const deleteBtn = document.getElementById('userDeleteBtn');
    
    if (editBtn && resetPwdBtn && toggleStatusBtn && deleteBtn) {
        const isDisabled = !selectedUser;
        const canDelete = selectedUser && currentUser && selectedUser.id !== currentUser.id;
        
        editBtn.disabled = isDisabled;
        resetPwdBtn.disabled = isDisabled;
        toggleStatusBtn.disabled = isDisabled;
        deleteBtn.disabled = !canDelete;
        
        // Atualizar texto e ícone do botão de toggle status
        if (selectedUser) {
            const icon = selectedUser.is_active ? 'ban' : 'check-circle';
            const title = selectedUser.is_active ? 'Desativar usuário' : 'Ativar usuário';
            
            toggleStatusBtn.innerHTML = `<i class="fas fa-${icon}"></i>`;
            toggleStatusBtn.title = title;
        }
    }
}
*/

function openUserModal(userId = null) {
    document.getElementById('userModal').classList.remove('hidden');
    
    if (userId) {
        document.getElementById('userModalTitle').innerHTML = '<i class="fas fa-user-edit mr-2"></i>Editar Usuário';
        document.getElementById('userPasswordDiv').classList.add('hidden');
        document.getElementById('userFormPassword').removeAttribute('required');
        loadUserData(userId);
    } else {
        document.getElementById('userModalTitle').innerHTML = '<i class="fas fa-user-plus mr-2"></i>Novo Usuário';
        document.getElementById('userPasswordDiv').classList.remove('hidden');
        document.getElementById('userFormPassword').setAttribute('required', 'required');
        document.getElementById('userForm').reset();
        document.getElementById('userId').value = '';
        updateUserDojoField();
    }
    
    // Carregar dojos no select
    loadDojosForUserForm();
}

function closeUserModal() {
    document.getElementById('userModal').classList.add('hidden');
    document.getElementById('userForm').reset();
}

async function loadDojosForUserForm() {
    try {
        const data = await apiRequest('/dojos');
        const select = document.getElementById('userFormDojo');
        select.innerHTML = '<option value="">Selecione...</option>';
        
        data.forEach(dojo => {
            const option = document.createElement('option');
            option.value = dojo.id;
            option.textContent = dojo.name;
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('Erro ao carregar dojos:', error);
    }
}

async function loadUserData(userId) {
    showLoading();
    
    try {
        const data = await apiRequest(`/users/${userId}`);
        
        document.getElementById('userId').value = data.id;
        document.getElementById('userFormName').value = data.name;
        document.getElementById('userFormEmail').value = data.email;
        document.getElementById('userFormRole').value = data.role;
        document.getElementById('userFormDojo').value = data.dojo_id || '';
        document.getElementById('userFormActive').checked = data.is_active;
        
        updateUserDojoField();
        
    } catch (error) {
        showNotification('Erro ao carregar dados do usuário: ' + error.message, 'error');
        closeUserModal();
    } finally {
        hideLoading();
    }
}

function updateUserDojoField() {
    const role = document.getElementById('userFormRole').value;
    const dojoDiv = document.getElementById('userDojoDiv');
    const dojoSelect = document.getElementById('userFormDojo');
    
    if (role === 'admin') {
        dojoDiv.classList.add('hidden');
        dojoSelect.removeAttribute('required');
        dojoSelect.value = '';
    } else {
        dojoDiv.classList.remove('hidden');
        dojoSelect.setAttribute('required', 'required');
    }
}

// Event listener para mudança no tipo de conta
document.getElementById('userFormRole').addEventListener('change', updateUserDojoField);

// Event listener para formulário de usuário
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    showLoading();
    
    const userId = document.getElementById('userId').value;
    const formData = {
        name: document.getElementById('userFormName').value,
        email: document.getElementById('userFormEmail').value,
        role: document.getElementById('userFormRole').value,
        dojo_id: document.getElementById('userFormDojo').value || null,
        is_active: document.getElementById('userFormActive').checked
    };
    
    // Adicionar senha apenas se for novo usuário
    if (!userId) {
        formData.password = document.getElementById('userFormPassword').value;
    }
    
    try {
        if (userId) {
            await apiRequest(`/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            showNotification('Usuário atualizado com sucesso!', 'success');
        } else {
            await apiRequest('/users', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showNotification('Usuário criado com sucesso!', 'success');
        }
        
        closeUserModal();
        await loadUsers();
        
    } catch (error) {
        showNotification('Erro ao salvar usuário: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
});

function editUser(userId = null) {
    const id = userId || (selectedUser ? selectedUser.id : null);
    if (!id) {
        showNotification('Selecione um usuário primeiro', 'warning');
        return;
    }
    openUserModal(id);
}

async function deleteUser(userId = null) {
    const id = userId || (selectedUser ? selectedUser.id : null);
    if (!id) {
        showNotification('Selecione um usuário primeiro', 'warning');
        return;
    }
    
    if (currentUser && id === currentUser.id) {
        showNotification('Você não pode excluir seu próprio usuário', 'error');
        return;
    }
    
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    showLoading();
    
    try {
        await apiRequest(`/users/${id}`, {
            method: 'DELETE'
        });
        
        showNotification('Usuário excluído com sucesso!', 'success');
        selectedUser = null;
        await loadUsers();
        
    } catch (error) {
        showNotification('Erro ao excluir usuário: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function toggleUserStatus(userId = null) {
    const id = userId || (selectedUser ? selectedUser.id : null);
    if (!id) {
        showNotification('Selecione um usuário primeiro', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const data = await apiRequest(`/users/${id}/toggle-status`, {
            method: 'POST'
        });
        
        showNotification(data.message, 'success');
        selectedUser = null;
        await loadUsers();
        
    } catch (error) {
        showNotification('Erro ao alterar status do usuário: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function openResetPasswordModal(userId = null, userName = null) {
    const id = userId || (selectedUser ? selectedUser.id : null);
    const name = userName || (selectedUser ? selectedUser.name : null);
    
    if (!id || !name) {
        showNotification('Selecione um usuário primeiro', 'warning');
        return;
    }
    
    document.getElementById('resetPasswordModal').classList.remove('hidden');
    document.getElementById('resetPasswordUserId').value = id;
    document.getElementById('resetPasswordUserName').textContent = name;
    document.getElementById('resetPasswordForm').reset();
}

function closeResetPasswordModal() {
    document.getElementById('resetPasswordModal').classList.add('hidden');
    document.getElementById('resetPasswordForm').reset();
}

// Event listener para formulário de reset de senha
document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('resetPasswordUserId').value;
    const newPassword = document.getElementById('resetPasswordNew').value;
    const confirmPassword = document.getElementById('resetPasswordConfirm').value;
    
    // Validar senhas
    if (newPassword !== confirmPassword) {
        showNotification('As senhas não coincidem!', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('A senha deve ter pelo menos 6 caracteres!', 'error');
        return;
    }
    
    showLoading();
    
    try {
        await apiRequest(`/users/${userId}/reset-password`, {
            method: 'POST',
            body: JSON.stringify({ new_password: newPassword })
        });
        
        showNotification('Senha resetada com sucesso!', 'success');
        closeResetPasswordModal();
        
    } catch (error) {
        showNotification('Erro ao resetar senha: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
});

// =========================================
// Relatórios (Sprint 4)
// =========================================

async function loadReports() {
    showLoading();
    try {
        // Carregar estatísticas
        const stats = await apiRequest('/reports/documents/statistics');
        
        // Atualizar estatísticas gerais
        document.getElementById('statMembersWithPhoto').textContent = stats.members.with_photo;
        document.getElementById('statMembersWithPhotoPerc').textContent = `${stats.members.percentage_with_photo}% do total`;
        
        document.getElementById('statGradsWithCert').textContent = stats.graduations.with_certificate;
        document.getElementById('statGradsWithCertPerc').textContent = `${stats.graduations.percentage_with_certificate}% do total`;
        
        document.getElementById('statQualsWithCert').textContent = stats.qualifications.with_certificate;
        document.getElementById('statQualsWithCertPerc').textContent = `${stats.qualifications.percentage_with_certificate}% do total`;
        
        const totalPending = stats.members.without_photo + stats.graduations.without_certificate + stats.qualifications.without_certificate;
        document.getElementById('statTotalPending').textContent = totalPending;
        
        // Carregar pendências
        const pending = await apiRequest('/reports/documents/pending');
        
        // Atualizar badges
        document.getElementById('badgeMembersPending').textContent = pending.statistics.total_members_without_photo;
        document.getElementById('badgeGradsPending').textContent = pending.statistics.total_graduations_without_certificate;
        document.getElementById('badgeQualsPending').textContent = pending.statistics.total_qualifications_without_certificate;
        
        // Renderizar listas
        renderMembersPending(pending.members_without_photo);
        renderGradsPending(pending.graduations_without_certificate);
        renderQualsPending(pending.qualifications_without_certificate);
        
    } catch (error) {
        showNotification('Erro ao carregar relatórios: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function renderMembersPending(members) {
    const container = document.getElementById('membersPendingList');
    
    if (members.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-check-circle text-4xl text-green-500 mb-2 block"></i>
                <p class="text-sm font-medium text-green-600">Todos os membros têm foto cadastrada!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = members.map(member => `
        <div class="pending-item flex items-center justify-between">
            <div class="flex-1">
                <p class="font-medium text-gray-900">${member.student_name}</p>
                <p class="text-sm text-gray-500">
                    Registro: ${member.registered_number || 'N/A'} • 
                    ${member.member_type}
                </p>
            </div>
            <button onclick="editMember(${member.id})" class="btn-primary text-white px-4 py-2 rounded-lg text-sm">
                <i class="fas fa-camera mr-1"></i>Adicionar Foto
            </button>
        </div>
    `).join('');
}

function renderGradsPending(graduations) {
    const container = document.getElementById('gradsPendingList');
    
    if (graduations.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-check-circle text-4xl text-green-500 mb-2 block"></i>
                <p class="text-sm font-medium text-green-600">Todas as graduações têm certificado!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = graduations.map(grad => `
        <div class="pending-item flex items-center justify-between">
            <div class="flex-1">
                <p class="font-medium text-gray-900">${grad.student_name}</p>
                <p class="text-sm text-gray-500">
                    ${grad.discipline} • ${grad.rank_name} ${grad.examination_date ? '• Exame: ' + formatDate(grad.examination_date) : ''}
                </p>
            </div>
            <button onclick="editGraduation(${grad.id})" class="btn-primary text-white px-4 py-2 rounded-lg text-sm">
                <i class="fas fa-file-upload mr-1"></i>Adicionar Certificado
            </button>
        </div>
    `).join('');
}

function renderQualsPending(qualifications) {
    const container = document.getElementById('qualsPendingList');
    
    if (qualifications.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-check-circle text-4xl text-green-500 mb-2 block"></i>
                <p class="text-sm font-medium text-green-600">Todas as qualificações têm certificado!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = qualifications.map(qual => `
        <div class="pending-item flex items-center justify-between">
            <div class="flex-1">
                <p class="font-medium text-gray-900">${qual.student_name}</p>
                <p class="text-sm text-gray-500">
                    ${qual.qualification_type} ${qual.qualification_level ? '• ' + qual.qualification_level : ''} ${qual.date_obtained ? '• ' + formatDate(qual.date_obtained) : ''}
                </p>
            </div>
            <button onclick="editQualification(${qual.id})" class="btn-primary text-white px-4 py-2 rounded-lg text-sm">
                <i class="fas fa-file-upload mr-1"></i>Adicionar Certificado
            </button>
        </div>
    `).join('');
}

function showReportTab(tabName) {
    // Remover active de todas as tabs
    document.querySelectorAll('.report-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Adicionar active à tab clicada
    document.querySelector(`.report-tab[data-tab="${tabName}"]`).classList.add('active');
    
    // Esconder todos os conteúdos
    document.querySelectorAll('.report-tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Mostrar conteúdo da tab selecionada
    document.getElementById(tabName).classList.remove('hidden');
}

