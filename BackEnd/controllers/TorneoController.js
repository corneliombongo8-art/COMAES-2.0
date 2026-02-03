import Torneio from '../models/Torneio.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import Usuario from '../models/User.js';

export const TorneoController = {
    // Get all tournaments
    getAllTorneos: async (req, res) => {
        try {
            const torneos = await Torneio.findAll({
                include: [{ model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] }]
            });
            res.status(200).json(torneos);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao obter torneios', error: error.message });
        }
    },

    // Create tournament with 3 disciplines
    createTorneo: async (req, res) => {
        try {
            const { titulo, descricao, inicia_em, termina_em, maximo_participantes, criado_por, status, publico } = req.body;

            if (!titulo) {
                return res.status(400).json({ message: 'Título é obrigatório' });
            }

            // Create main tournament
            const slug = titulo.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            
            const novoTorneo = await Torneio.create({
                titulo,
                slug,
                descricao,
                inicia_em,
                termina_em,
                maximo_participantes,
                criado_por: criado_por || 1,
                status: status || 'rascunho',
                publico: publico !== false
            });

            res.status(201).json({
                message: 'Torneio criado com sucesso! As 3 disciplinas (Matemática, Inglês e Programação) foram ativadas automaticamente.',
                torneio: novoTorneo
            });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao criar torneio', error: error.message });
        }
    },

    // Update tournament
    updateTorneo: async (req, res) => {
        try {
            const { id } = req.params;
            const { titulo, descricao, inicia_em, termina_em, maximo_participantes, status, publico } = req.body;

            const [updated] = await Torneio.update(
                { titulo, descricao, inicia_em, termina_em, maximo_participantes, status, publico },
                { where: { id } }
            );

            if (updated) {
                const torneo = await Torneio.findOne({ where: { id } });
                res.status(200).json(torneo);
            } else {
                res.status(404).json({ message: 'Torneio não encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Erro ao atualizar torneio', error: error.message });
        }
    },

    // Delete tournament
    deleteTorneo: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Delete all participants first
            await ParticipanteTorneio.destroy({ where: { torneio_id: id } });
            
            const deleted = await Torneio.destroy({ where: { id } });
            if (deleted) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Torneio não encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Erro ao deletar torneio', error: error.message });
        }
    },

    // Register participant in tournament with discipline
    registerParticipant: async (req, res) => {
        try {
            const { torneio_id, usuario_id, disciplina_competida } = req.body;

            if (!torneio_id || !usuario_id) {
                return res.status(400).json({ message: 'Torneio ID e Usuário ID são obrigatórios' });
            }

            if (!['Matemática', 'Inglês', 'Programação'].includes(disciplina_competida)) {
                return res.status(400).json({ message: 'Disciplina inválida. Use: Matemática, Inglês ou Programação' });
            }

            // Check if already registered
            const existing = await ParticipanteTorneio.findOne({
                where: { torneio_id, usuario_id }
            });

            if (existing) {
                // Update discipline if already registered
                existing.disciplina_competida = disciplina_competida;
                await existing.save();
                return res.status(200).json({ message: 'Participante atualizado com nova disciplina', participant: existing });
            }

            // Create new participant registration
            const novoParticipante = await ParticipanteTorneio.create({
                torneio_id,
                usuario_id,
                disciplina_competida,
                status: 'confirmado'
            });

            res.status(201).json({ message: 'Participante registrado com sucesso', participant: novoParticipante });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao registrar participante', error: error.message });
        }
    },

    // Get tournament participants
    getTorneoParticipants: async (req, res) => {
        try {
            const { id } = req.params;
            const participants = await ParticipanteTorneio.findAll({
                where: { torneio_id: id },
                include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] }]
            });
            res.status(200).json(participants);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao obter participantes', error: error.message });
        }
    }
};

export default TorneoController;
