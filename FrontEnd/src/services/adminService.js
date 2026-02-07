import axios from 'axios';

const API_URL = 'http://localhost:3000/api/admin'; // Adjust the URL based on your backend server

const createApiClient = (token) => {
    return axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
};

const createCrudClient = (modelName, token, pathOverride = null) => {
    const apiClient = createApiClient(token);
    const url = pathOverride || `/${modelName}`;

    return {
        getAll: () => apiClient.get(url).then(res => res.data),
        getById: (id) => apiClient.get(`${url}/${id}`).then(res => res.data),
        create: (data) => apiClient.post(url, data).then(res => res.data),
        update: (id, data) => apiClient.put(`${url}/${id}`, data).then(res => res.data),
        delete: (id) => apiClient.delete(`${url}/${id}`).then(res => res.data)
    };
};

const adminService = (token) => {
    const services = {};
    const modelNames = [
        'user',
        'torneio',
        'noticia',
        'funcao',
        'ticketsuporte',
        'conquista',
        'configuracaousuario',
        'conquistausuario',
        'notificacao',
        'pergunta',
        'questaoingles',
        'questaomatematica',
        'questoes_programacao',
        'redefinicaosenha',
        'tentativateste',
    ];

    const routeOverrides = {
        user: '/users',
        torneio: '/torneos',
    };

    modelNames.forEach(modelName => {
        services[modelName] = createCrudClient(modelName, token, routeOverrides[modelName] || null);
    });

    const apiClient = createApiClient(token);
    services.getModels = () => apiClient.get('/models').then(res => res.data);

    return services;
};

export default adminService;
