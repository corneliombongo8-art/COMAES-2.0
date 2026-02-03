import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const TorneoParticipantsManager = ({ torneoId, torneoTitle }) => {
    const [participants, setParticipants] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        usuario_id: '',
        disciplina_competida: 'Matemática'
    });

    // Fetch participants and users
    useEffect(() => {
        fetchData();
    }, [torneoId]);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [participantsData, usersData] = await Promise.all([
                adminService.getTorneoParticipants(torneoId),
                adminService.users.getAll()
            ]);
            setParticipants(Array.isArray(participantsData) ? participantsData : [participantsData]);
            setUsers(Array.isArray(usersData) ? usersData : [usersData]);
        } catch (err) {
            setError('Erro ao carregar dados');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.usuario_id || !formData.disciplina_competida) {
            setError('Preencha todos os campos');
            return;
        }

        try {
            await adminService.registerParticipant(
                torneoId,
                parseInt(formData.usuario_id),
                formData.disciplina_competida
            );
            setFormData({ usuario_id: '', disciplina_competida: 'Matemática' });
            setShowForm(false);
            await fetchData();
        } catch (err) {
            setError('Erro ao registrar participante');
            console.error(err);
        }
    };

    const getUserName = (usuarioId) => {
        const user = users.find(u => u.id === usuarioId);
        return user ? user.nome : 'Usuário ' + usuarioId;
    };

    const disciplinaColors = {
        'Matemática': 'bg-blue-100 text-blue-800',
        'Inglês': 'bg-green-100 text-green-800',
        'Programação': 'bg-purple-100 text-purple-800'
    };

    if (loading && participants.length === 0) {
        return <div className="p-4 text-center">Carregando...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
            <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">Participantes - {torneoTitle}</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                >
                    {showForm ? '✖ Cancelar' : '+ Adicionar Participante'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Usuário *</label>
                            <select
                                name="usuario_id"
                                value={formData.usuario_id}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecione um usuário</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.nome} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Disciplina *</label>
                            <select
                                name="disciplina_competida"
                                value={formData.disciplina_competida}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Matemática">Matemática</option>
                                <option value="Inglês">Inglês</option>
                                <option value="Programação">Programação</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition font-semibold"
                            >
                                Registrar
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                            {error}
                        </div>
                    )}
                </form>
            )}

            {/* Participants List */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold">Usuário</th>
                            <th className="px-4 py-3 text-left font-semibold">Disciplina</th>
                            <th className="px-4 py-3 text-left font-semibold">Status</th>
                            <th className="px-4 py-3 text-left font-semibold">Pontuação</th>
                            <th className="px-4 py-3 text-left font-semibold">Posição</th>
                        </tr>
                    </thead>
                    <tbody>
                        {participants.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                                    Nenhum participante registrado
                                </td>
                            </tr>
                        ) : (
                            participants.map(participant => (
                                <tr key={participant.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium">{getUserName(participant.usuario_id)}</p>
                                            <p className="text-xs text-gray-500">ID: {participant.usuario_id}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${disciplinaColors[participant.disciplina_competida] || 'bg-gray-100'}`}>
                                            {participant.disciplina_competida || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                            participant.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                                            participant.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {participant.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-semibold">{participant.pontuacao || 0}</td>
                                    <td className="px-4 py-3">{participant.posicao || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TorneoParticipantsManager;
