// ===== IMPORTAR TODOS OS MODELOS =====
import Noticia from '../models/Noticia.js';
import Teste from '../models/Teste.js';
import Funcao from '../models/Funcao.js';
import TicketSuporte from '../models/TicketSuporte.js';
import Conquista from '../models/Conquista.js';
import Comentario from '../models/Comentario.js';
import ConfiguracaoUsuario from '../models/ConfiguracaoUsuario.js';
import ConquistaUsuario from '../models/ConquistaUsuario.js';
import LogAtividade from '../models/LogAtividade.js';
import Midia from '../models/Midia.js';
import Notificacao from '../models/Notificacao.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import Pergunta from '../models/Pergunta.js';
import QuestaoIngles from '../models/QuestaoIngles.js';
import QuestaoMatematica from '../models/QuestaoMatematica.js';
import QuestaoProgramacao from '../models/QuestaoProgramacao.js';
import RedefinicaoSenha from '../models/RedefinicaoSenha.js';
import Sessao from '../models/Sessao.js';
import TentativaTeste from '../models/TentativaTeste.js';

// Generic CRUD methods factory
const createGenericController = (Model, modelName) => ({
    getAll: async (req, res) => {
        try {
            const data = await Model.findAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: `Erro ao obter ${modelName}`, error: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const newRecord = await Model.create(req.body);
            res.status(201).json(newRecord);
        } catch (error) {
            res.status(500).json({ message: `Erro ao criar ${modelName}`, error: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const [updated] = await Model.update(req.body, { where: { id } });
            if (updated) {
                const record = await Model.findOne({ where: { id } });
                res.status(200).json(record);
            } else {
                res.status(404).json({ message: `${modelName} não encontrado` });
            }
        } catch (error) {
            res.status(500).json({ message: `Erro ao atualizar ${modelName}`, error: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await Model.destroy({ where: { id } });
            if (deleted) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: `${modelName} não encontrado` });
            }
        } catch (error) {
            res.status(500).json({ message: `Erro ao deletar ${modelName}`, error: error.message });
        }
    }
});

// ===== CONTROLLERS PARA TODAS AS TABELAS =====
export const NoticiaController = createGenericController(Noticia, 'Notícia');
export const TesteController = createGenericController(Teste, 'Teste');
export const FuncaoController = createGenericController(Funcao, 'Função');
export const TicketSupportController = createGenericController(TicketSuporte, 'Ticket de Suporte');
export const ConquistaController = createGenericController(Conquista, 'Conquista');
export const ComentarioController = createGenericController(Comentario, 'Comentário');
export const ConfiguracaoUsuarioController = createGenericController(ConfiguracaoUsuario, 'Configuração de Usuário');
export const ConquistaUsuarioController = createGenericController(ConquistaUsuario, 'Conquista de Usuário');
export const LogAtividadeController = createGenericController(LogAtividade, 'Log de Atividade');
export const MidiaController = createGenericController(Midia, 'Mídia');
export const NotificacaoController = createGenericController(Notificacao, 'Notificação');
export const ParticipanteTorneoController = createGenericController(ParticipanteTorneio, 'Participante do Torneio');
export const PerguntaController = createGenericController(Pergunta, 'Pergunta');
export const QuestaoInglesController = createGenericController(QuestaoIngles, 'Questão de Inglês');
export const QuestaoMatematicaController = createGenericController(QuestaoMatematica, 'Questão de Matemática');
export const QuestaoProgramacaoController = createGenericController(QuestaoProgramacao, 'Questão de Programação');
export const RedefinicaoSenhaController = createGenericController(RedefinicaoSenha, 'Redefinição de Senha');
export const SessaoController = createGenericController(Sessao, 'Sessão');
export const TentativaTesteController = createGenericController(TentativaTeste, 'Tentativa de Teste');

export default {
    NoticiaController,
    TesteController,
    FuncaoController,
    TicketSupportController,
    ConquistaController,
    ComentarioController,
    ConfiguracaoUsuarioController,
    ConquistaUsuarioController,
    LogAtividadeController,
    MidiaController,
    NotificacaoController,
    ParticipanteTorneoController,
    PerguntaController,
    QuestaoInglesController,
    QuestaoMatematicaController,
    QuestaoProgramacaoController,
    RedefinicaoSenhaController,
    SessaoController,
    TentativaTesteController
};
