import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import { Op } from 'sequelize';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ===== IMPORTAR TODOS OS MODELS =====
import Usuario from "./models/User.js";
import Funcao from "./models/Funcao.js";
import RedefinicaoSenha from "./models/RedefinicaoSenha.js";
import ConfiguracaoUsuario from "./models/ConfiguracaoUsuario.js";
import Torneio from "./models/Torneio.js";
import ParticipanteTorneio from "./models/ParticipanteTorneio.js";
import Noticia from "./models/Noticia.js";
import Pergunta from "./models/Pergunta.js";
import QuestaoMatematica from "./models/QuestaoMatematica.js";
import QuestaoProgramacao from "./models/QuestaoProgramacao.js";
import QuestaoIngles from "./models/QuestaoIngles.js";
import TentativaTeste from "./models/TentativaTeste.js";
import TicketSuporte from "./models/TicketSuporte.js";
import Notificacao from "./models/Notificacao.js";
import Conquista from "./models/Conquista.js";
import ConquistaUsuario from "./models/ConquistaUsuario.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ===== MIDDLEWARES =====
app.use(express.json());
app.use(cors());

// ===== UPLOAD & STORAGE =====
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ===== ASSOCIAÇÕES DO SEQUELIZE =====
const setupAssociations = () => {
  // Usuario <-> Funcao
  Funcao.hasMany(Usuario, { foreignKey: 'funcao_id', as: 'usuarios' });
  Usuario.belongsTo(Funcao, { foreignKey: 'funcao_id', as: 'funcao' });

  // Usuario <-> RedefinicaoSenha
  Usuario.hasMany(RedefinicaoSenha, { foreignKey: 'usuario_id', as: 'redefinicoes' });
  RedefinicaoSenha.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  // Usuario <-> ConfiguracaoUsuario (1:1)
  Usuario.hasOne(ConfiguracaoUsuario, { foreignKey: 'usuario_id', as: 'configuracao' });
  ConfiguracaoUsuario.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  // Torneio <-> Usuario (criador)
  Usuario.hasMany(Torneio, { foreignKey: 'criado_por', as: 'torneiosCriados' });
  Torneio.belongsTo(Usuario, { foreignKey: 'criado_por', as: 'criador' });

  // Torneio <-> ParticipanteTorneio
  Torneio.hasMany(ParticipanteTorneio, { foreignKey: 'torneio_id', as: 'participantes' });
  ParticipanteTorneio.belongsTo(Torneio, { foreignKey: 'torneio_id', as: 'torneio' });

  // ParticipanteTorneio <-> Usuario
  Usuario.hasMany(ParticipanteTorneio, { foreignKey: 'usuario_id', as: 'torneios' });
  ParticipanteTorneio.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  // Noticia <-> Usuario (autor)
  Usuario.hasMany(Noticia, { foreignKey: 'autor_id', as: 'noticias' });
  Noticia.belongsTo(Usuario, { foreignKey: 'autor_id', as: 'autor' });

  // Torneio <-> QuestãoMatematica
  Torneio.hasMany(QuestaoMatematica, { foreignKey: 'torneio_id', as: 'questoesMat' });
  QuestaoMatematica.belongsTo(Torneio, { foreignKey: 'torneio_id', as: 'torneio' });

  // Torneio <-> QuestaoProgramacao
  Torneio.hasMany(QuestaoProgramacao, { foreignKey: 'torneio_id', as: 'questoesProg' });
  QuestaoProgramacao.belongsTo(Torneio, { foreignKey: 'torneio_id', as: 'torneio' });

  // Torneio <-> QuestaoIngles
  Torneio.hasMany(QuestaoIngles, { foreignKey: 'torneio_id', as: 'questoesEng' });
  QuestaoIngles.belongsTo(Torneio, { foreignKey: 'torneio_id', as: 'torneio' });

  // TentativaTeste <-> Usuario
  Usuario.hasMany(TentativaTeste, { foreignKey: 'usuario_id', as: 'tentativas' });
  TentativaTeste.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  // TicketSuporte <-> Usuario (autor)
  Usuario.hasMany(TicketSuporte, { foreignKey: 'usuario_id', as: 'ticketsEnviados' });
  TicketSuporte.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario', onDelete: 'SET NULL' });

  // TicketSuporte <-> Usuario (atribuído_para)
  Usuario.hasMany(TicketSuporte, { foreignKey: 'atribuido_para', as: 'ticketsAtribuidos' });
  TicketSuporte.belongsTo(Usuario, { foreignKey: 'atribuido_para', as: 'atribuido', onDelete: 'SET NULL' });

  // Notificacao <-> Usuario
  Usuario.hasMany(Notificacao, { foreignKey: 'usuario_id', as: 'notificacoes' });
  Notificacao.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  // ConquistaUsuario <-> Usuario
  Usuario.hasMany(ConquistaUsuario, { foreignKey: 'usuario_id', as: 'conquistas' });
  ConquistaUsuario.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  // ConquistaUsuario <-> Conquista
  Conquista.hasMany(ConquistaUsuario, { foreignKey: 'conquista_id', as: 'usuarios' });
  ConquistaUsuario.belongsTo(Conquista, { foreignKey: 'conquista_id', as: 'conquista' });

  // ConquistaUsuario <-> Usuario (concedido_por)
  Usuario.hasMany(ConquistaUsuario, { foreignKey: 'concedido_por', as: 'conquistasConcedidas' });
  ConquistaUsuario.belongsTo(Usuario, { foreignKey: 'concedido_por', as: 'concedidoPor', onDelete: 'SET NULL' });
};

// ===== ROTAS PÚBLICAS =====
app.get("/", (req, res) => {
  res.json({
    message: "API Comaes funcionando!",
    status: "online",
    version: "2.0",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message
    });
  }
});

// ===== NOVOS ENDPOINTS PARA TORNEIO ÚNICO COM 3 DISCIPLINAS =====

// 1. Verificar torneio ativo (CORRIGIDO - busca apenas por status 'ativo')
app.get('/api/torneios/ativo', async (req, res) => {
  try {
    const agora = new Date();
    
    console.log('🔍 Verificando torneio ativo...');
    console.log('📅 Data atual:', agora.toISOString());
    
    // Buscar QUALQUER torneio com status 'ativo' (não verificar datas)
    const torneio = await Torneio.findOne({
      where: {
        status: 'ativo'
      },
      order: [['inicia_em', 'DESC']] // Pega o mais recente
    });
    
    console.log('🏆 Torneio encontrado:', torneio ? 
      `ID: ${torneio.id}, Título: "${torneio.titulo}", Status: ${torneio.status}` : 
      'Nenhum');
    
    if (!torneio) {
      return res.json({ 
        success: true, 
        ativo: false, 
        message: 'Nenhum torneio ativo encontrado' 
      });
    }
    
    // Verificar se está dentro do período (apenas para informação)
    const inicio = new Date(torneio.inicia_em);
    const fim = new Date(torneio.termina_em);
    
    const dentroDoPeriodo = agora >= inicio && agora <= fim;
    
    console.log('⏰ Período do torneio:');
    console.log('   Início:', inicio.toISOString());
    console.log('   Término:', fim.toISOString());
    console.log('   Agora:', agora.toISOString());
    console.log('   Dentro do período?', dentroDoPeriodo);
    
    res.json({ 
      success: true, 
      ativo: true, 
      dentroDoPeriodo,
      torneio,
      mensagem: dentroDoPeriodo ? 
        'Torneio ativo e em andamento' : 
        'Torneio marcado como ativo mas fora do período programado'
    });
  } catch (error) {
    console.error('❌ Erro ao verificar torneio ativo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Registrar participante
app.post('/api/participantes/registrar', async (req, res) => {
  try {
    const { id_usuario, disciplina_competida } = req.body;
    
    console.log('👤 Registrando participante:', { id_usuario, disciplina_competida });
    
    // Primeiro, encontrar torneio ativo
    const torneio = await Torneio.findOne({
      where: {
        status: 'ativo'
      }
    });
    
    if (!torneio) {
      return res.status(404).json({ 
        success: false, 
        error: 'Nenhum torneio ativo encontrado' 
      });
    }
    
    console.log('🎯 Torneio encontrado para registro:', torneio.id);
    
    // Formatar disciplina (primeira letra maiúscula)
    const disciplinaFormatada = disciplina_competida.charAt(0).toUpperCase() + disciplina_competida.slice(1);
    
    // Verificar se já existe registro para este usuário nesta disciplina
    const existente = await ParticipanteTorneio.findOne({
      where: { 
        usuario_id: id_usuario, 
        torneio_id: torneio.id,
        disciplina_competida: disciplinaFormatada
      }
    });
    
    if (existente) {
      console.log('✅ Participante já registrado:', existente.id);
      return res.json({ 
        success: true, 
        data: existente, 
        message: 'Participante já registrado nesta disciplina' 
      });
    }
    
    // Criar novo registro
    const novoParticipante = await ParticipanteTorneio.create({
      torneio_id: torneio.id,
      usuario_id: id_usuario,
      disciplina_competida: disciplinaFormatada,
      entrou_em: new Date(),
      status: 'confirmado',
      pontuacao: 0,
      casos_resolvidos: 0
    });
    
    console.log('🎉 Novo participante criado:', novoParticipante.id);
    
    res.status(201).json({ 
      success: true, 
      data: novoParticipante,
      message: 'Participante registrado com sucesso' 
    });
  } catch (error) {
    console.error('❌ Erro ao registrar participante:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Buscar ranking por disciplina
app.get('/api/participantes/ranking/:disciplina', async (req, res) => {
  try {
    const { disciplina } = req.params;
    const disciplinaFormatada = disciplina.charAt(0).toUpperCase() + disciplina.slice(1);
    
    console.log('📊 Buscando ranking para disciplina:', disciplinaFormatada);
    
    // Primeiro encontrar torneio ativo
    const torneio = await Torneio.findOne({
      where: {
        status: 'ativo'
      }
    });
    
    if (!torneio) {
      console.log('⚠️ Nenhum torneio ativo para ranking');
      return res.json({ success: true, data: [] });
    }
    
    // Buscar participantes do torneio na disciplina específica
    const participantes = await ParticipanteTorneio.findAll({
      where: { 
        torneio_id: torneio.id,
        disciplina_competida: disciplinaFormatada,
        status: 'confirmado'
      },
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nome', 'imagem']
      }],
      order: [['pontuacao', 'DESC']],
      limit: 20
    });
    
    console.log(`👥 Encontrados ${participantes.length} participantes para ${disciplinaFormatada}`);
    
    // Adicionar posição
    const ranking = participantes.map((p, index) => ({
      ...p.toJSON(),
      posicao: index + 1
    }));
    
    res.json({ success: true, data: ranking });
  } catch (error) {
    console.error('❌ Erro ao buscar ranking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Buscar dados do usuário no torneio por disciplina
app.get('/api/participantes/usuario/:userId/:disciplina', async (req, res) => {
  try {
    const { userId, disciplina } = req.params;
    const disciplinaFormatada = disciplina.charAt(0).toUpperCase() + disciplina.slice(1);
    
    console.log('🔎 Buscando dados do usuário:', { userId, disciplina: disciplinaFormatada });
    
    // Encontrar torneio ativo
    const torneio = await Torneio.findOne({
      where: {
        status: 'ativo'
      }
    });
    
    if (!torneio) {
      return res.status(404).json({ success: false, error: 'Torneio não encontrado' });
    }
    
    // Buscar participante
    const participante = await ParticipanteTorneio.findOne({
      where: { 
        usuario_id: userId, 
        torneio_id: torneio.id,
        disciplina_competida: disciplinaFormatada
      },
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nome', 'imagem', 'email']
      }]
    });
    
    if (!participante) {
      console.log('⚠️ Participante não encontrado');
      return res.status(404).json({ success: false, error: 'Participante não encontrado' });
    }
    
    // Calcular posição no ranking desta disciplina
    const todosParticipantes = await ParticipanteTorneio.findAll({
      where: { 
        torneio_id: torneio.id,
        disciplina_competida: disciplinaFormatada,
        status: 'confirmado'
      },
      order: [['pontuacao', 'DESC']]
    });
    
    const posicao = todosParticipantes.findIndex(p => p.usuario_id == userId) + 1;
    
    console.log('✅ Dados do participante encontrados, posição:', posicao);
    
    res.json({ 
      success: true, 
      data: {
        ...participante.toJSON(),
        posicao: posicao || todosParticipantes.length + 1
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar dados do usuário:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Atualizar pontuação do participante
app.post('/api/participantes/atualizar-pontuacao', async (req, res) => {
  try {
    const { usuario_id, disciplina_competida, pontuacao_adicionada, casos_adicionados } = req.body;
    
    console.log('📈 Atualizando pontuação:', { usuario_id, disciplina_competida, pontuacao_adicionada });
    
    // Encontrar torneio ativo
    const torneio = await Torneio.findOne({
      where: {
        status: 'ativo'
      }
    });
    
    if (!torneio) {
      return res.status(404).json({ success: false, error: 'Torneio não encontrado' });
    }
    
    const participante = await ParticipanteTorneio.findOne({
      where: { 
        usuario_id, 
        torneio_id: torneio.id,
        disciplina_competida
      }
    });
    
    if (!participante) {
      return res.status(404).json({ success: false, error: 'Participante não encontrado' });
    }
    
    // Atualizar pontuação
    const novaPontuacao = (Number(participante.pontuacao) || 0) + (Number(pontuacao_adicionada) || 0);
    const novosCasos = (Number(participante.casos_resolvidos) || 0) + (Number(casos_adicionados) || 0);
    
    participante.pontuacao = novaPontuacao;
    participante.casos_resolvidos = novosCasos;
    
    await participante.save();
    
    console.log('✅ Pontuação atualizada:', { 
      usuario_id, 
      disciplina: disciplina_competida, 
      novaPontuacao, 
      novosCasos 
    });
    
    res.json({ 
      success: true, 
      data: participante,
      message: 'Pontuação atualizada com sucesso' 
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar pontuação:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Buscar todos torneios ativos
app.get('/api/torneios/ativos', async (req, res) => {
  try {
    const torneios = await Torneio.findAll({
      where: {
        status: 'ativo'
      },
      order: [['inicia_em', 'DESC']]
    });
    
    res.json({ success: true, data: torneios });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Dashboard de estatísticas
app.get('/api/torneios/dashboard', async (req, res) => {
  try {
    // Buscar torneio ativo
    const torneioAtivo = await Torneio.findOne({
      where: {
        status: 'ativo'
      }
    });
    
    if (!torneioAtivo) {
      return res.json({ 
        success: true, 
        data: { 
          torneio_ativo: false,
          mensagem: 'Nenhum torneio ativo no momento'
        }
      });
    }
    
    const agora = new Date();
    const inicio = new Date(torneioAtivo.inicia_em);
    const fim = new Date(torneioAtivo.termina_em);
    
    // Verificar se está dentro do período
    const dentroDoPeriodo = agora >= inicio && agora <= fim;
    
    // Contar participantes por disciplina
    const participantesMatematica = await ParticipanteTorneio.count({
      where: { 
        torneio_id: torneioAtivo.id,
        disciplina_competida: 'Matemática',
        status: 'confirmado'
      }
    });
    
    const participantesIngles = await ParticipanteTorneio.count({
      where: { 
        torneio_id: torneioAtivo.id,
        disciplina_competida: 'Inglês',
        status: 'confirmado'
      }
    });
    
    const participantesProgramacao = await ParticipanteTorneio.count({
      where: { 
        torneio_id: torneioAtivo.id,
        disciplina_competida: 'Programação',
        status: 'confirmado'
      }
    });
    
    // Calcular progresso (se estiver dentro do período)
    let progresso = 0;
    if (dentroDoPeriodo) {
      const inicioMs = inicio.getTime();
      const fimMs = fim.getTime();
      const agoraMs = agora.getTime();
      progresso = Math.min(100, Math.max(0, ((agoraMs - inicioMs) / (fimMs - inicioMs)) * 100));
    }
    
    res.json({ 
      success: true, 
      data: {
        torneio_ativo: true,
        dentro_do_periodo: dentroDoPeriodo,
        torneio: {
          id: torneioAtivo.id,
          titulo: torneioAtivo.titulo,
          inicio: torneioAtivo.inicia_em,
          termino: torneioAtivo.termina_em,
          progresso: parseFloat(progresso.toFixed(2))
        },
        estatisticas: {
          total_participantes: participantesMatematica + participantesIngles + participantesProgramacao,
          por_disciplina: {
            matematica: participantesMatematica,
            ingles: participantesIngles,
            programacao: participantesProgramacao
          }
        }
      }
    });
  } catch (error) {
    console.error('❌ Erro no dashboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Endpoint DEBUG: Mostrar todos torneios com detalhes
app.get('/api/debug/torneios', async (req, res) => {
  try {
    const agora = new Date();
    
    const torneios = await Torneio.findAll({
      order: [['id', 'ASC']]
    });
    
    const torneiosComDetalhes = torneios.map(t => {
      const torneioObj = t.toJSON();
      const inicio = new Date(torneioObj.inicia_em);
      const fim = new Date(torneioObj.termina_em);
      
      return {
        ...torneioObj,
        inicio_iso: inicio.toISOString(),
        fim_iso: fim.toISOString(),
        agora_iso: agora.toISOString(),
        dentro_periodo: agora >= inicio && agora <= fim,
        status_verificado: torneioObj.status === 'ativo' && (agora >= inicio && agora <= fim) ? '✅ ATIVO E DENTRO DO PERÍODO' :
                          torneioObj.status === 'ativo' ? '⚠️ ATIVO MAS FORA DO PERÍODO' :
                          torneioObj.status === 'indisponivel' ? '❌ INDISPONÍVEL' :
                          torneioObj.status === 'finalizado' ? '🏁 FINALIZADO' :
                          '❓ DESCONHECIDO'
      };
    });
    
    res.json({ 
      success: true, 
      agora: agora.toISOString(),
      data: torneiosComDetalhes 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== AUTENTICAÇÃO =====
app.post('/auth/registro', async (req, res) => {
  try {
    const { nome, telefone, email, nascimento, sexo, escola, password } = req.body;

    if (!nome || !telefone || !email || !nascimento || !sexo || !password) {
      return res.status(400).json({ success: false, error: 'Campos obrigatórios em falta.' });
    }

    const exists = await Usuario.findOne({ where: { [Op.or]: [{ email }, { telefone }] } });
    if (exists) {
      return res.status(409).json({ success: false, error: 'Email ou telefone já registado.' });
    }

    const hash_senha = await bcrypt.hash(password, 10);
    const novoUsuario = await Usuario.create({
      nome,
      telefone,
      email,
      nascimento,
      sexo,
      escola: escola || null,
      password: hash_senha
    });

    res.status(201).json({ success: true, message: 'Usuário criado com sucesso', data: novoUsuario });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { usuario, senha } = req.body;
    if (!usuario || !senha) return res.status(400).json({ success: false, error: 'Dados incompletos.' });

    const user = await Usuario.unscoped().findOne({
      where: { [Op.or]: [{ email: usuario }, { telefone: usuario }] }
    });
    if (!user) return res.status(401).json({ success: false, error: 'Usuário não encontrado.' });

    const match = await bcrypt.compare(senha, user.password);
    if (!match) return res.status(401).json({ success: false, error: 'Senha inválida.' });

    const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    const { password, ...userSafe } = user.get({ plain: true });

    res.json({ success: true, data: userSafe, token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== UPLOAD AVATAR =====
app.post('/usuarios/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const userId = String(req.params.id);
    const auth = req.headers.authorization || '';
    const token = auth.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, error: 'Token ausente.' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Token inválido.' });
    }

    if (String(payload.id) !== userId) return res.status(403).json({ success: false, error: 'Permissão negada.' });
    if (!req.file) return res.status(400).json({ success: false, error: 'Arquivo não enviado.' });

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    await Usuario.update({ imagem: fileUrl }, { where: { id: userId } });

    const updated = await Usuario.findByPk(userId);
    const { password, ...safe } = updated.get({ plain: true });

    res.json({ success: true, data: safe });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/usuarios/:id', async (req, res) => {
  try {
    const userId = String(req.params.id);
    const auth = req.headers.authorization || '';
    const token = auth.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, error: 'Token ausente.' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Token inválido.' });
    }

    if (String(payload.id) !== userId) return res.status(403).json({ success: false, error: 'Permissão negada.' });

    const { nome, email, biografia } = req.body;
    const updates = {};

    if (typeof nome === 'string') {
      const trimmed = nome.trim();
      if (!trimmed) return res.status(400).json({ success: false, error: 'Nome inválido.' });
      updates.nome = trimmed;
    }

    if (typeof email === 'string') {
      const trimmed = email.trim();
      if (!trimmed) return res.status(400).json({ success: false, error: 'Email inválido.' });
      updates.email = trimmed;
    }

    if (biografia !== undefined) {
      updates.biografia = biografia;
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ success: false, error: 'Nenhum dado para atualizar.' });
    }

    if (updates.email) {
      const numericId = Number(userId);
      const conflict = await Usuario.findOne({
        where: { email: updates.email, id: { [Op.ne]: numericId } }
      });
      if (conflict) {
        return res.status(409).json({ success: false, error: 'Email já em uso.' });
      }
    }

    await Usuario.update(updates, { where: { id: userId } });

    const updated = await Usuario.findByPk(userId);
    if (!updated) return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });
    const { password, ...safe } = updated.get({ plain: true });

    res.json({ success: true, data: safe });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== CRUD USUARIOS =====
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.json({ success: true, count: usuarios.length, data: usuarios });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });
    res.json({ success: true, data: usuario });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Notificações do usuário
app.get('/usuarios/:id/notificacoes', async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const notificacoes = await Notificacao.findAll({
      where: { usuario_id: usuarioId },
      order: [['criado_em', 'DESC']],
      limit: 50
    });
    res.json({ success: true, data: notificacoes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/notificacoes/:id/lido', async (req, res) => {
  try {
    const { id } = req.params;
    await Notificacao.update(
      { lido: true, lido_em: new Date() },
      { where: { id } }
    );
    res.json({ success: true, message: 'Notificação marcada como lida.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/usuarios/:id/notificacoes/lido-todas', async (req, res) => {
  try {
    const usuarioId = req.params.id;
    await Notificacao.update(
      { lido: true, lido_em: new Date() },
      { where: { usuario_id: usuarioId, lido: false } }
    );
    res.json({ success: true, message: 'Todas as notificações marcadas como lidas.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/usuarios/:id/notificacoes/nao-lidas/count', async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const count = await Notificacao.count({
      where: { usuario_id: usuarioId, lido: false }
    });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Configurações do usuário
app.get('/usuarios/:id/configuracao', async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const configuracao = await ConfiguracaoUsuario.findOne({
      where: { usuario_id: usuarioId }
    });
    res.json({ success: true, data: configuracao });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Participações do usuário em torneios
app.get('/usuarios/:id/participacoes', async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const participacoes = await ParticipanteTorneio.findAll({
      where: { usuario_id: usuarioId },
      include: [{
        model: Torneio,
        as: 'torneio',
        attributes: ['id', 'titulo', 'descricao', 'inicia_em', 'termina_em', 'status']
      }]
    });
    res.json({ success: true, data: participacoes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== CRUD TORNEIOS =====
app.get('/torneios', async (req, res) => {
  try {
    const torneios = await Torneio.findAll({ include: ['criador', 'participantes'] });
    res.json({ success: true, data: torneios });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/torneios/:id', async (req, res) => {
  try {
    const torneio = await Torneio.findByPk(req.params.id, { include: ['criador', 'participantes'] });
    if (!torneio) return res.status(404).json({ success: false, error: 'Torneio não encontrado.' });
    res.json({ success: true, data: torneio });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== TORNEIOS: JOIN, PARTICIPANTES, RANKING, SUBMIT respostas =====
app.post('/torneios/:id/join', async (req, res) => {
  try {
    const torneioId = req.params.id;
    const { usuario_id, disciplina_competida } = req.body;
    if (!usuario_id) return res.status(400).json({ success: false, error: 'usuario_id é obrigatório.' });

    const torneio = await Torneio.findByPk(torneioId);
    if (!torneio) return res.status(404).json({ success: false, error: 'Torneio não encontrado.' });

    const usuario = await Usuario.findByPk(usuario_id);
    if (!usuario) return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });

    const count = await ParticipanteTorneio.count({ where: { torneio_id: torneioId, status: 'confirmado' } });
    if (torneio.maximo_participantes && count >= torneio.maximo_participantes) {
      return res.status(400).json({ success: false, error: 'Torneio atingiu o limite de participantes.' });
    }

    const exists = await ParticipanteTorneio.findOne({ where: { torneio_id: torneioId, usuario_id } });
    if (exists) {
      const existsWithUser = await ParticipanteTorneio.findOne({
        where: { torneio_id: torneioId, usuario_id },
        include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'imagem', 'email'] }]
      });
      return res.json({ success: true, data: existsWithUser, message: 'Já inscrito.' });
    }

    const participante = await ParticipanteTorneio.create({ 
      torneio_id: torneioId, 
      usuario_id, 
      status: 'confirmado',
      disciplina_competida: disciplina_competida || null,
      pontuacao: 0,
      casos_resolvidos: 0
    });

    const participanteWithUser = await ParticipanteTorneio.findByPk(participante.id, {
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'imagem', 'email'] }]
    });

    res.status(201).json({ success: true, data: participanteWithUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/torneios/:id/participantes', async (req, res) => {
  try {
    const torneioId = req.params.id;
    const participantes = await ParticipanteTorneio.findAll({ where: { torneio_id: torneioId }, include: ['usuario'] });
    res.json({ success: true, data: participantes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/torneios/:id/questoes/matematica', async (req, res) => {
  try {
    const torneioId = req.params.id;
    const questoes = await QuestaoMatematica.findAll({ 
      where: { torneio_id: torneioId },
      attributes: ['id', 'titulo', 'descricao', 'dificuldade', 'pontos', 'opcoes', 'midia']
    });
    res.json({ success: true, data: questoes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/torneios/:id/questoes/programacao', async (req, res) => {
  try {
    const torneioId = req.params.id;
    const questoes = await QuestaoProgramacao.findAll({ 
      where: { torneio_id: torneioId },
      attributes: ['id', 'titulo', 'descricao', 'dificuldade', 'pontos', 'opcoes', 'midia', 'linguagem']
    });
    res.json({ success: true, data: questoes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/torneios/:id/questoes/ingles', async (req, res) => {
  try {
    const torneioId = req.params.id;
    const questoes = await QuestaoIngles.findAll({ 
      where: { torneio_id: torneioId },
      attributes: ['id', 'titulo', 'descricao', 'dificuldade', 'pontos', 'opcoes', 'midia']
    });
    res.json({ success: true, data: questoes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/torneios/:id/ranking', async (req, res) => {
  try {
    const torneioId = req.params.id;
    const participantes = await ParticipanteTorneio.findAll({ 
      where: { torneio_id: torneioId, status: 'confirmado' },
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'imagem', 'email'] }], 
      order: [['pontuacao', 'DESC']] 
    });
    
    let pos = 1;
    const ranked = participantes.map(p => ({ 
      id: p.id,
      posicao: pos++, 
      usuario: p.usuario, 
      pontuacao: Number(p.pontuacao),
      casos_resolvidos: p.casos_resolvidos,
      disciplina_competida: p.disciplina_competida
    }));
    res.json({ success: true, data: ranked });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== NOTICIAS =====
app.get('/noticias', async (req, res) => {
  try {
    const noticias = await Noticia.findAll({
      include: [{ model: Usuario, as: 'autor', attributes: ['id', 'nome', 'imagem'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: noticias });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== INICIALIZAÇÃO =====
async function startServer() {
  try {
    console.log("🔄 Inicializando servidor...");

    await sequelize.authenticate();
    console.log("✅ Banco de dados conectado!");

    // Setup associações
    setupAssociations();

    // Sincronizar modelos
    await sequelize.sync();
    console.log("✅ Modelos sincronizados!");

    app.listen(port, () => {
      console.log(`🚀 Servidor rodando: http://localhost:${port}`);
      console.log(`📡 Health: http://localhost:${port}/health`);
      console.log(`🏆 Torneio Ativo: http://localhost:${port}/api/torneios/ativo`);
      console.log(`📊 Dashboard: http://localhost:${port}/api/torneios/dashboard`);
      console.log(`🐛 Debug Torneios: http://localhost:${port}/api/debug/torneios`);
      console.log(`👥 Ranking Inglês: http://localhost:3000/api/participantes/ranking/ingles`);
    });
  } catch (error) {
    console.error("❌ Erro na inicialização:", error.message);
    process.exit(1);
  }
}

startServer();