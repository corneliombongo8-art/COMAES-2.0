import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import TableManager from '../../components/admin/TableManager';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('users');

    const menuItems = [
        { id: 'users', label: 'Usuários', icon: '👤' },
        { id: 'torneos', label: 'Torneios', icon: '🏆' },
        { id: 'noticias', label: 'Notícias', icon: '📰' },
        { id: 'funcoes', label: 'Funções', icon: '🔑' },
        { id: 'tickets', label: 'Tickets', icon: '🎫' },
        { id: 'conquistas', label: 'Conquistas', icon: '⭐' },
        { id: 'configuracoes_usuario', label: 'Config. Usuário', icon: '⚙️' },
        { id: 'conquistas_usuario', label: 'Conquistas Usuário', icon: '🎖️' },
        { id: 'notificacoes', label: 'Notificações', icon: '🔔' },
        { id: 'perguntas', label: 'Perguntas', icon: '❓' },
        { id: 'questoes_ingles', label: 'Questões Inglês', icon: '🇬🇧' },
        { id: 'questoes_matematica', label: 'Questões Matemática', icon: '🔢' },
        { id: 'questoes_programacao', label: 'Questões Prog.', icon: '💻' },
        { id: 'redefinicoes_senha', label: 'Redefinições', icon: '🔐' },
        { id: 'tentativas_teste', label: 'Tentativas', icon: '✏️' },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white shadow-lg flex flex-col">
                <div className="p-6 border-b border-gray-700">
                    <h1 className="text-2xl font-bold">Admin Panel</h1>
                    <p className="text-sm text-gray-400 mt-2">COMAES Platform</p>
                </div>

                <nav className="mt-8 flex-1 overflow-y-auto">
                    {menuItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`px-6 py-3 cursor-pointer transition text-sm ${
                                activeTab === item.id
                                    ? 'bg-blue-600 border-r-4 border-blue-400'
                                    : 'hover:bg-gray-800'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{item.icon}</span>
                                <span className="font-semibold">{item.label}</span>
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Sidebar Footer - Dados dinâmicos do usuário */}
                <div className="border-t border-gray-700 p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                            <p className="text-sm font-semibold truncate">{user?.name || 'Administrador'}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email || 'admin@comaes.com'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white shadow-sm border-b">
                    <div className="px-8 py-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {menuItems.find(m => m.id === activeTab)?.label || 'Painel'}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Gerencie todos os aspectos da plataforma COMAES
                            </p>
                        </div>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
                            Sair
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-auto">
                    <TableManager table={activeTab} />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
