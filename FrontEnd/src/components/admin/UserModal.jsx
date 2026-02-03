import React, { useState } from 'react';

const UserModal = ({ mode, user, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        nome: user?.nome || '',
        email: user?.email || '',
        senha: '',
        funcao_id: user?.funcao_id || 1
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const validateForm = () => {
        if (!formData.nome.trim()) {
            setError('Nome é obrigatório');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Email é obrigatório');
            return false;
        }
        if (mode === 'create' && !formData.senha.trim()) {
            setError('Senha é obrigatória para novo usuário');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Email inválido');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        try {
            const dataToSubmit = { ...formData };
            // Only include password if it's provided (for edit) or if creating
            if (!dataToSubmit.senha) {
                delete dataToSubmit.senha;
            }
            
            await onSubmit(dataToSubmit);
        } catch (err) {
            setError('Erro ao processar requisição');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getModalTitle = () => {
        switch (mode) {
            case 'create': return 'Adicionar Novo Usuário';
            case 'edit': return 'Editar Usuário';
            case 'delete': return 'Confirmar Exclusão';
            default: return 'Modal';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="border-b px-6 py-4">
                    <h3 className="text-xl font-bold">{getModalTitle()}</h3>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                    {mode === 'delete' ? (
                        <div>
                            <p className="text-gray-700 mb-4">
                                Tem certeza que deseja deletar o usuário <strong>{user?.nome}</strong>?
                            </p>
                            <p className="text-red-600 text-sm">
                                Esta ação não pode ser desfeita.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {/* Nome */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nome
                                </label>
                                <input
                                    type="text"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Digite o nome"
                                />
                            </div>

                            {/* Email */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Digite o email"
                                />
                            </div>

                            {/* Senha */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Senha {mode === 'edit' && '(deixe em branco para não alterar)'}
                                </label>
                                <input
                                    type="password"
                                    name="senha"
                                    value={formData.senha}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Digite a senha"
                                />
                            </div>

                            {/* Função */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Função
                                </label>
                                <select
                                    name="funcao_id"
                                    value={formData.funcao_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={1}>Usuário</option>
                                    <option value={2}>Professor</option>
                                    <option value={3}>Administrador</option>
                                </select>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                                    {error}
                                </div>
                            )}
                        </form>
                    )}

                    {/* Error for delete mode */}
                    {mode === 'delete' && error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={mode === 'delete' ? handleSubmit : undefined}
                        onSubmit={mode !== 'delete' ? handleSubmit : undefined}
                        type={mode === 'delete' ? 'button' : 'submit'}
                        form={mode === 'delete' ? undefined : 'userForm'}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg text-white font-semibold transition disabled:opacity-50 ${
                            mode === 'delete'
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {loading ? 'Processando...' : mode === 'create' ? 'Criar' : mode === 'edit' ? 'Atualizar' : 'Deletar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserModal;
