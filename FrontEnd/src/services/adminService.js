const API_BASE_URL = 'http://localhost:3000/api/admin';

// Get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('comaes_token');
};

// Create headers with authentication token
const getHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Generic CRUD function
const genericCRUD = (endpoint) => ({
    getAll: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: getHeaders()
            });
            if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            throw error;
        }
    },

    create: async (data) => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`Failed to create ${endpoint}`);
            return await response.json();
        } catch (error) {
            console.error(`Error creating ${endpoint}:`, error);
            throw error;
        }
    },

    update: async (id, data) => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`Failed to update ${endpoint}`);
            return await response.json();
        } catch (error) {
            console.error(`Error updating ${endpoint}:`, error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!response.ok) throw new Error(`Failed to delete ${endpoint}`);
            return response.status === 204 ? null : await response.json();
        } catch (error) {
            console.error(`Error deleting ${endpoint}:`, error);
            throw error;
        }
    }
});

// Admin Service
export const adminService = {
    // Usuários
    users: genericCRUD('/users'),

    // Torneios
    torneos: genericCRUD('/torneos'),
    registerParticipant: async (torneio_id, usuario_id, disciplina_competida) => {
        try {
            const response = await fetch(`${API_BASE_URL}/torneos/register-participant`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    torneio_id,
                    usuario_id,
                    disciplina_competida
                })
            });
            if (!response.ok) throw new Error('Failed to register participant');
            return await response.json();
        } catch (error) {
            console.error('Error registering participant:', error);
            throw error;
        }
    },

    getTorneoParticipants: async (torneoId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/torneos/${torneoId}/participants`, {
                method: 'GET',
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch participants');
            return await response.json();
        } catch (error) {
            console.error('Error fetching participants:', error);
            throw error;
        }
    },

    // Notícias
    noticias: genericCRUD('/noticias'),

    // Testes
    testes: genericCRUD('/testes'),

    // Funções/Papéis
    funcoes: genericCRUD('/funcoes'),

    // Tickets de Suporte
    tickets: genericCRUD('/tickets'),

    // Conquistas
    conquistas: genericCRUD('/conquistas'),

    // Comentários
    comentarios: genericCRUD('/comentarios'),

    // Configurações de Usuário
    configuracoes_usuario: genericCRUD('/configuracoes-usuario'),

    // Conquistas de Usuário
    conquistas_usuario: genericCRUD('/conquistas-usuario'),

    // Logs de Atividade
    logs_atividade: genericCRUD('/logs-atividade'),

    // Mídia
    midia: genericCRUD('/midia'),

    // Notificações
    notificacoes: genericCRUD('/notificacoes'),

    // Participantes de Torneio
    participantes_torneio: genericCRUD('/participantes-torneio'),

    // Perguntas
    perguntas: genericCRUD('/perguntas'),

    // Questões de Inglês
    questoes_ingles: genericCRUD('/questoes-ingles'),

    // Questões de Matemática
    questoes_matematica: genericCRUD('/questoes-matematica'),

    // Questões de Programação
    questoes_programacao: genericCRUD('/questoes-programacao'),

    // Redefinição de Senha
    redefinicoes_senha: genericCRUD('/redefinicoes-senha'),

    // Sessões
    sessoes: genericCRUD('/sessoes'),

    // Tentativas de Teste
    tentativas_teste: genericCRUD('/tentativas-teste')
};

export default adminService;
