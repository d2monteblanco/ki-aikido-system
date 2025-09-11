// ===== CONSTANTES DO SISTEMA KI AIKIDO =====

/**
 * Mensagens do sistema
 */
export const MESSAGES = {
    LOADING: {
        DEFAULT: 'Carregando...',
        STUDENTS: 'Carregando alunos...',
        MEMBERS: 'Carregando membros...',
        DOJOS: 'Carregando dojos...',
        GRADUATIONS: 'Carregando graduações...',
        QUALIFICATIONS: 'Carregando qualificações...'
    },
    
    ERROR: {
        DEFAULT: 'Erro ao carregar dados',
        NETWORK: 'Erro de conexão. Verifique sua internet.',
        AUTH: 'Erro de autenticação. Faça login novamente.',
        PERMISSION: 'Você não tem permissão para esta ação',
        VALIDATION: 'Dados inválidos. Verifique os campos.',
        NOT_FOUND: 'Item não encontrado'
    },
    
    SUCCESS: {
        SAVE: 'Dados salvos com sucesso!',
        DELETE: 'Item excluído com sucesso!',
        UPDATE: 'Dados atualizados com sucesso!',
        LOGIN: 'Login realizado com sucesso!',
        LOGOUT: 'Logout realizado com sucesso!'
    },
    
    CONFIRMATION: {
        DELETE: 'Tem certeza que deseja excluir este item?',
        LOGOUT: 'Tem certeza que deseja sair do sistema?',
        UNSAVED_CHANGES: 'Há alterações não salvas. Deseja continuar?'
    },
    
    EMPTY_STATES: {
        NO_STUDENTS: 'Nenhum aluno cadastrado',
        NO_MEMBERS: 'Nenhum membro encontrado',
        NO_DOJOS: 'Nenhum dojo cadastrado',
        NO_GRADUATIONS: 'Nenhuma graduação registrada',
        NO_QUALIFICATIONS: 'Nenhuma qualificação registrada'
    }
};

/**
 * Configurações da API
 */
export const API_CONFIG = {
    BASE_URL: '/api',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout',
            REFRESH: '/auth/refresh'
        },
        STUDENTS: {
            LIST: '/students',
            CREATE: '/students',
            UPDATE: '/students/{id}',
            DELETE: '/students/{id}',
            GET: '/students/{id}'
        },
        DOJOS: {
            LIST: '/dojos',
            CREATE: '/dojos',
            UPDATE: '/dojos/{id}',
            DELETE: '/dojos/{id}'
        },
        MEMBERS: {
            LIST: '/member-status',
            CREATE: '/member-status',
            UPDATE: '/member-status/{id}',
            DELETE: '/member-status/{id}'
        }
    }
};

/**
 * Configurações de UI
 */
export const UI_CONFIG = {
    PAGINATION: {
        DEFAULT_PER_PAGE: 10,
        OPTIONS: [10, 20, 50, 100]
    },
    
    MODAL: {
        ANIMATION_DURATION: 300,
        AUTO_FOCUS: true
    },
    
    NOTIFICATION: {
        DEFAULT_DURATION: 5000,
        ERROR_DURATION: 7000,
        SUCCESS_DURATION: 3000
    },
    
    DEBOUNCE: {
        SEARCH: 500,
        RESIZE: 250,
        SCROLL: 100
    }
};

/**
 * Validação
 */
export const VALIDATION = {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/,
    
    MIN_PASSWORD_LENGTH: 6,
    MAX_NAME_LENGTH: 100,
    MAX_EMAIL_LENGTH: 255,
    MAX_ADDRESS_LENGTH: 500,
    
    REQUIRED_FIELDS: {
        STUDENT: ['name', 'email', 'dojo_id'],
        USER: ['name', 'email', 'password'],
        DOJO: ['name', 'address']
    }
};

/**
 * Status e tipos do sistema
 */
export const SYSTEM_TYPES = {
    USER_ROLES: {
        ADMIN: 'admin',
        DOJO_ADMIN: 'dojo_admin',
        INSTRUCTOR: 'instructor',
        STUDENT: 'student'
    },
    
    MEMBER_STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        SUSPENDED: 'suspended',
        PENDING: 'pending'
    },
    
    QUALIFICATION_TYPES: {
        INSTRUCTOR: 'instructor',
        EXAMINER: 'examiner'
    },
    
    QUALIFICATION_LEVELS: {
        ASSISTENTE: 'assistente',
        COMPANHEIRO: 'companheiro',
        PLENO: 'pleno'
    }
};

/**
 * Classes CSS comuns
 */
export const CSS_CLASSES = {
    BUTTONS: {
        PRIMARY: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors',
        SECONDARY: 'bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors',
        SUCCESS: 'bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors',
        DANGER: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors',
        WARNING: 'bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors'
    },
    
    FORMS: {
        INPUT: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
        LABEL: 'block text-sm font-medium text-gray-700 mb-1',
        ERROR: 'border-red-500 focus:ring-red-500',
        SUCCESS: 'border-green-500 focus:ring-green-500'
    },
    
    LAYOUT: {
        CONTAINER: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        CARD: 'bg-white rounded-lg shadow-md p-6',
        LOADING: 'text-center py-8 text-gray-500',
        ERROR: 'text-center py-8 text-red-500',
        EMPTY: 'text-center py-12 text-gray-500'
    }
};

/**
 * Utilitários para URLs
 */
export const URL_UTILS = {
    buildApiUrl: function(endpoint, params = {}) {
        let url = API_CONFIG.BASE_URL + endpoint;
        
        // Substituir parâmetros na URL
        Object.keys(params).forEach(key => {
            url = url.replace(`{${key}}`, params[key]);
        });
        
        return url;
    },
    
    addQueryParams: function(url, params = {}) {
        const urlObj = new URL(url, window.location.origin);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                urlObj.searchParams.set(key, params[key]);
            }
        });
        return urlObj.toString();
    }
};
