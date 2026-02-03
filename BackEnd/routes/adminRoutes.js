import express from 'express';
import isAdmin from '../middlewares/isAdmin.js';
import UserController from '../controllers/UserController.js';
import TorneoController from '../controllers/TorneoController.js';
import { 
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
} from '../controllers/GenericController.js';

const router = express.Router();

// ===== ROTAS PARA USUÁRIOS =====
router.get('/users', isAdmin, UserController.getAllUsers);
router.post('/users', isAdmin, UserController.createUser);
router.put('/users/:id', isAdmin, UserController.updateUser);
router.delete('/users/:id', isAdmin, UserController.deleteUser);

// ===== ROTAS PARA TORNEIOS =====
router.get('/torneos', isAdmin, TorneoController.getAllTorneos);
router.post('/torneos', isAdmin, TorneoController.createTorneo);
router.put('/torneos/:id', isAdmin, TorneoController.updateTorneo);
router.delete('/torneos/:id', isAdmin, TorneoController.deleteTorneo);
router.get('/torneos/:id/participants', isAdmin, TorneoController.getTorneoParticipants);
router.post('/torneos/register-participant', isAdmin, TorneoController.registerParticipant);

// ===== ROTAS PARA NOTÍCIAS =====
router.get('/noticias', isAdmin, NoticiaController.getAll);
router.post('/noticias', isAdmin, NoticiaController.create);
router.put('/noticias/:id', isAdmin, NoticiaController.update);
router.delete('/noticias/:id', isAdmin, NoticiaController.delete);

// ===== ROTAS PARA TESTES =====
router.get('/testes', isAdmin, TesteController.getAll);
router.post('/testes', isAdmin, TesteController.create);
router.put('/testes/:id', isAdmin, TesteController.update);
router.delete('/testes/:id', isAdmin, TesteController.delete);

// ===== ROTAS PARA FUNÇÕES =====
router.get('/funcoes', isAdmin, FuncaoController.getAll);
router.post('/funcoes', isAdmin, FuncaoController.create);
router.put('/funcoes/:id', isAdmin, FuncaoController.update);
router.delete('/funcoes/:id', isAdmin, FuncaoController.delete);

// ===== ROTAS PARA TICKETS DE SUPORTE =====
router.get('/tickets', isAdmin, TicketSupportController.getAll);
router.post('/tickets', isAdmin, TicketSupportController.create);
router.put('/tickets/:id', isAdmin, TicketSupportController.update);
router.delete('/tickets/:id', isAdmin, TicketSupportController.delete);

// ===== ROTAS PARA CONQUISTAS =====
router.get('/conquistas', isAdmin, ConquistaController.getAll);
router.post('/conquistas', isAdmin, ConquistaController.create);
router.put('/conquistas/:id', isAdmin, ConquistaController.update);
router.delete('/conquistas/:id', isAdmin, ConquistaController.delete);

// ===== ROTAS PARA COMENTÁRIOS =====
router.get('/comentarios', isAdmin, ComentarioController.getAll);
router.post('/comentarios', isAdmin, ComentarioController.create);
router.put('/comentarios/:id', isAdmin, ComentarioController.update);
router.delete('/comentarios/:id', isAdmin, ComentarioController.delete);

// ===== ROTAS PARA CONFIGURAÇÕES DE USUÁRIO =====
router.get('/configuracoes-usuario', isAdmin, ConfiguracaoUsuarioController.getAll);
router.post('/configuracoes-usuario', isAdmin, ConfiguracaoUsuarioController.create);
router.put('/configuracoes-usuario/:id', isAdmin, ConfiguracaoUsuarioController.update);
router.delete('/configuracoes-usuario/:id', isAdmin, ConfiguracaoUsuarioController.delete);

// ===== ROTAS PARA CONQUISTAS DE USUÁRIO =====
router.get('/conquistas-usuario', isAdmin, ConquistaUsuarioController.getAll);
router.post('/conquistas-usuario', isAdmin, ConquistaUsuarioController.create);
router.put('/conquistas-usuario/:id', isAdmin, ConquistaUsuarioController.update);
router.delete('/conquistas-usuario/:id', isAdmin, ConquistaUsuarioController.delete);

// ===== ROTAS PARA LOGS DE ATIVIDADE =====
router.get('/logs-atividade', isAdmin, LogAtividadeController.getAll);
router.post('/logs-atividade', isAdmin, LogAtividadeController.create);
router.put('/logs-atividade/:id', isAdmin, LogAtividadeController.update);
router.delete('/logs-atividade/:id', isAdmin, LogAtividadeController.delete);

// ===== ROTAS PARA MÍDIA =====
router.get('/midia', isAdmin, MidiaController.getAll);
router.post('/midia', isAdmin, MidiaController.create);
router.put('/midia/:id', isAdmin, MidiaController.update);
router.delete('/midia/:id', isAdmin, MidiaController.delete);

// ===== ROTAS PARA NOTIFICAÇÕES =====
router.get('/notificacoes', isAdmin, NotificacaoController.getAll);
router.post('/notificacoes', isAdmin, NotificacaoController.create);
router.put('/notificacoes/:id', isAdmin, NotificacaoController.update);
router.delete('/notificacoes/:id', isAdmin, NotificacaoController.delete);

// ===== ROTAS PARA PARTICIPANTES DE TORNEIO =====
router.get('/participantes-torneio', isAdmin, ParticipanteTorneoController.getAll);
router.post('/participantes-torneio', isAdmin, ParticipanteTorneoController.create);
router.put('/participantes-torneio/:id', isAdmin, ParticipanteTorneoController.update);
router.delete('/participantes-torneio/:id', isAdmin, ParticipanteTorneoController.delete);

// ===== ROTAS PARA PERGUNTAS =====
router.get('/perguntas', isAdmin, PerguntaController.getAll);
router.post('/perguntas', isAdmin, PerguntaController.create);
router.put('/perguntas/:id', isAdmin, PerguntaController.update);
router.delete('/perguntas/:id', isAdmin, PerguntaController.delete);

// ===== ROTAS PARA QUESTÕES DE INGLÊS =====
router.get('/questoes-ingles', isAdmin, QuestaoInglesController.getAll);
router.post('/questoes-ingles', isAdmin, QuestaoInglesController.create);
router.put('/questoes-ingles/:id', isAdmin, QuestaoInglesController.update);
router.delete('/questoes-ingles/:id', isAdmin, QuestaoInglesController.delete);

// ===== ROTAS PARA QUESTÕES DE MATEMÁTICA =====
router.get('/questoes-matematica', isAdmin, QuestaoMatematicaController.getAll);
router.post('/questoes-matematica', isAdmin, QuestaoMatematicaController.create);
router.put('/questoes-matematica/:id', isAdmin, QuestaoMatematicaController.update);
router.delete('/questoes-matematica/:id', isAdmin, QuestaoMatematicaController.delete);

// ===== ROTAS PARA QUESTÕES DE PROGRAMAÇÃO =====
router.get('/questoes-programacao', isAdmin, QuestaoProgramacaoController.getAll);
router.post('/questoes-programacao', isAdmin, QuestaoProgramacaoController.create);
router.put('/questoes-programacao/:id', isAdmin, QuestaoProgramacaoController.update);
router.delete('/questoes-programacao/:id', isAdmin, QuestaoProgramacaoController.delete);

// ===== ROTAS PARA REDEFINIÇÃO DE SENHA =====
router.get('/redefinicoes-senha', isAdmin, RedefinicaoSenhaController.getAll);
router.post('/redefinicoes-senha', isAdmin, RedefinicaoSenhaController.create);
router.put('/redefinicoes-senha/:id', isAdmin, RedefinicaoSenhaController.update);
router.delete('/redefinicoes-senha/:id', isAdmin, RedefinicaoSenhaController.delete);

// ===== ROTAS PARA SESSÕES =====
router.get('/sessoes', isAdmin, SessaoController.getAll);
router.post('/sessoes', isAdmin, SessaoController.create);
router.put('/sessoes/:id', isAdmin, SessaoController.update);
router.delete('/sessoes/:id', isAdmin, SessaoController.delete);

// ===== ROTAS PARA TENTATIVAS DE TESTE =====
router.get('/tentativas-teste', isAdmin, TentativaTesteController.getAll);
router.post('/tentativas-teste', isAdmin, TentativaTesteController.create);
router.put('/tentativas-teste/:id', isAdmin, TentativaTesteController.update);
router.delete('/tentativas-teste/:id', isAdmin, TentativaTesteController.delete);

export default router;