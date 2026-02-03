import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import TableModal from './TableModal';
import TorneoParticipantsManager from './TorneoParticipantsManager';

const TableManager = ({ table }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedTorneo, setExpandedTorneo] = useState(null);
    const [tableInfo, setTableInfo] = useState(null);

    // Get the appropriate service
    const getService = () => {
        return adminService[table];
    };

    // Static table definitions (only when specific customizations are needed)
    const staticTableDefs = {
        torneos: {
            title: 'Torneios',
            columns: ['id', 'titulo', 'descricao', 'status'],
            displayColumns: ['ID', 'Título', 'Descrição', 'Status'],
            fields: [
                { name: 'titulo', label: 'Título', type: 'text', required: true },
                { name: 'descricao', label: 'Descrição', type: 'textarea' },
                { name: 'inicia_em', label: 'Data de Início', type: 'datetime-local' },
                { name: 'termina_em', label: 'Data de Término', type: 'datetime-local' },
                { name: 'maximo_participantes', label: 'Máximo de Participantes', type: 'number' },
                { name: 'status', label: 'Status', type: 'select', options: ['rascunho', 'agendado', 'ativo', 'finalizado', 'cancelado'] }
            ]
        },
        noticias: {
            title: 'Notícias',
            columns: ['id', 'titulo', 'conteudo', 'data_publicacao'],
            displayColumns: ['ID', 'Título', 'Conteúdo', 'Data'],
            fields: [
                { name: 'titulo', label: 'Título', type: 'text', required: true },
                { name: 'conteudo', label: 'Conteúdo', type: 'textarea', required: true },
                { name: 'data_publicacao', label: 'Data de Publicação', type: 'datetime-local' }
            ]
        },
        // ... keep other specific static definitions if desired
    };

    // Build a generic tableInfo from fetched data
    const buildTableInfoFromData = (rows) => {
        const first = Array.isArray(rows) && rows.length > 0 ? rows[0] : {};
        const cols = Object.keys(first);
        const displayColumns = cols.map(c => c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
        const fields = cols.filter(c => c !== 'id').map(c => {
            const sample = first[c];
            let type = 'text';
            if (typeof sample === 'number') type = 'number';
            else if (typeof sample === 'string') {
                // ISO datetime heuristic
                if (/^\d{4}-\d{2}-\d{2}T?/.test(sample)) type = 'datetime-local';
                else if (sample.length > 200) type = 'textarea';
            }
            return { name: c, label: c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), type };
        });

        return {
            title: table.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            columns: cols,
            displayColumns,
            fields
        };
    };

    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const service = getService();
            const result = await service.getAll();
            const rows = Array.isArray(result) ? result : (result ? [result] : []);
            setData(rows);

            // Determine tableInfo: prefer static if available, otherwise build from data
            if (staticTableDefs[table]) {
                setTableInfo(staticTableDefs[table]);
            } else {
                const built = buildTableInfoFromData(rows);
                setTableInfo(built);
            }
        } catch (err) {
            setError('Erro ao carregar dados');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [table]);

    const handleAdd = () => {
        setModalMode('create');
        setSelectedItem(null);
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setModalMode('edit');
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleDelete = (item) => {
        setModalMode('delete');
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedItem(null);
    };

    const handleModalSubmit = async (formData) => {
        try {
            const service = getService();
            if (modalMode === 'create') {
                await service.create(formData);
            } else if (modalMode === 'edit') {
                await service.update(selectedItem.id, formData);
            } else if (modalMode === 'delete') {
                await service.delete(selectedItem.id);
            }
            handleModalClose();
            await fetchData();
        } catch (err) {
            setError('Erro ao processar operação');
            console.error(err);
        }
    };

    // If tableInfo not ready yet
    if (loading && (!tableInfo || data.length === 0)) {
        return <div className="p-8 text-center">Carregando...</div>;
    }

    const info = tableInfo || { title: 'Tabela', columns: [], displayColumns: [], fields: [] };

    // Filter data
    const filteredData = data.filter(item =>
        Object.values(item).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-4">Gerenciamento de {info.title}</h2>
                <button
                    onClick={handleAdd}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                    + Adicionar {info.title.slice(0, -1)}
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            {info.displayColumns.map((col, idx) => (
                                <th key={idx} className="px-6 py-4 text-left font-semibold text-gray-700">
                                    {col}
                                </th>
                            ))}
                            <th className="px-6 py-4 text-right font-semibold text-gray-700">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={info.displayColumns.length + 1} className="px-6 py-8 text-center text-gray-500">
                                    Nenhum registro encontrado
                                </td>
                            </tr>
                        ) : (
                            filteredData.map(item => (
                                <React.Fragment key={item.id || JSON.stringify(item)}>
                                    <tr className="border-b hover:bg-gray-50 transition">
                                        {info.columns.map((col, idx) => (
                                            <td key={idx} className="px-6 py-4 text-sm">
                                                {String(item[col] ?? 'N/A').substring(0, 50)}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 text-right">
                                            {table === 'torneos' && (
                                                <button
                                                    onClick={() => setExpandedTorneo(expandedTorneo === item.id ? null : item.id)}
                                                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded mr-2 transition text-sm"
                                                >
                                                    👥 Participantes
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2 transition text-sm"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition text-sm"
                                            >
                                                Deletar
                                            </button>
                                        </td>
                                    </tr>
                                    {/* Expanded Participants Row for Torneos */}
                                    {table === 'torneos' && expandedTorneo === item.id && (
                                        <tr>
                                            <td colSpan={tableInfo.displayColumns.length + 1} className="px-6 py-4 bg-gray-50">
                                                <TorneoParticipantsManager 
                                                    torneoId={item.id} 
                                                    torneoTitle={item.titulo}
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <TableModal
                    mode={modalMode}
                    item={selectedItem}
                    tableInfo={tableInfo}
                    onClose={handleModalClose}
                    onSubmit={handleModalSubmit}
                />
            )}
        </div>
    );
};

export default TableManager;
