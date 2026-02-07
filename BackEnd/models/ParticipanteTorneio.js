import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ParticipanteTorneio = sequelize.define('ParticipanteTorneio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  torneio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { 
      model: 'torneios', 
      key: 'id' 
    },
    onDelete: 'CASCADE'
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { 
      model: 'usuarios', 
      key: 'id' 
    },
    onDelete: 'CASCADE'
  },
  entrou_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM('pendente', 'confirmado', 'removido', 'desclassificado'),
    defaultValue: 'pendente',
    validate: {
      isIn: {
        args: [['pendente', 'confirmado', 'removido', 'desclassificado']],
        msg: 'Status inválido'
      }
    }
  },
  pontuacao: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'A pontuação não pode ser negativa'
      }
    }
  },
  posicao: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [1],
        msg: 'A posição deve ser pelo menos 1'
      }
    }
  },
  casos_resolvidos: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'O número de casos resolvidos não pode ser negativo'
      }
    }
  },
  disciplina_competida: {
    type: DataTypes.ENUM('Matemática', 'Inglês', 'Programação'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['Matemática', 'Inglês', 'Programação']],
        msg: 'Disciplina inválida'
      }
    }
  },
  ultima_atividade: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  tempo_total: {
    type: DataTypes.INTEGER, // em segundos
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'O tempo total não pode ser negativo'
      }
    }
  },
  precisao: {
    type: DataTypes.DECIMAL(5, 2), // porcentagem
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'A precisão não pode ser negativa'
      },
      max: {
        args: [100],
        msg: 'A precisão não pode exceder 100%'
      }
    }
  },
  nivel_atual: {
    type: DataTypes.ENUM('iniciante', 'intermediário', 'avançado', 'expert'),
    defaultValue: 'iniciante',
    validate: {
      isIn: {
        args: [['iniciante', 'intermediário', 'avançado', 'expert']],
        msg: 'Nível inválido'
      }
    }
  },
  conquistas: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  historico_pontuacao: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  metadados: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      dispositivo: null,
      navegador: null,
      ip: null,
      preferencias: {}
    }
  },
}, {
  tableName: 'participantes_torneios',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em',
  indexes: [
    { 
      fields: ['torneio_id'] 
    },
    { 
      fields: ['usuario_id'] 
    },
    { 
      unique: true, 
      fields: ['torneio_id', 'usuario_id', 'disciplina_competida'],
      name: 'unique_participacao_disciplina'
    },
    { 
      fields: ['pontuacao'] 
    },
    { 
      fields: ['posicao'] 
    },
    { 
      fields: ['status'] 
    },
    { 
      fields: ['disciplina_competida'] 
    }
  ],
  hooks: {
    beforeCreate: async (participante) => {
      const existente = await ParticipanteTorneio.findOne({
        where: {
          torneio_id: participante.torneio_id,
          usuario_id: participante.usuario_id,
          disciplina_competida: participante.disciplina_competida
        }
      });
      if (existente) {
        throw new Error('Usuário já está participando deste torneio nesta disciplina');
      }
    },
    
    beforeUpdate: (participante) => {
      if (participante.changed('pontuacao') || participante.changed('casos_resolvidos')) {
        participante.ultima_atividade = new Date();
      }
      
      if (participante.changed('casos_resolvidos')) {
        const totalTentativas = participante.metadados?.total_tentativas || 0;
        if (totalTentativas > 0) {
          participante.precisao = (participante.casos_resolvidos / totalTentativas) * 100;
        }
      }
      
      if (participante.changed('pontuacao')) {
        const pontuacao = parseFloat(participante.pontuacao);
        if (pontuacao >= 1000) participante.nivel_atual = 'expert';
        else if (pontuacao >= 500) participante.nivel_atual = 'avançado';
        else if (pontuacao >= 200) participante.nivel_atual = 'intermediário';
        else participante.nivel_atual = 'iniciante';
      }
    }
  }
});

// Métodos de instância
ParticipanteTorneio.prototype.adicionarPontuacao = function(pontos, descricao = '') {
  const novaPontuacao = parseFloat(this.pontuacao) + parseFloat(pontos);
  this.pontuacao = novaPontuacao;
  
  const historico = this.historico_pontuacao || [];
  historico.push({
    pontos: parseFloat(pontos),
    total: novaPontuacao,
    descricao,
    data: new Date().toISOString()
  });
  
  this.historico_pontuacao = historico.slice(-50);
  
  return this.save();
};

ParticipanteTorneio.prototype.incrementarCasosResolvidos = function(quantidade = 1) {
  this.casos_resolvidos += quantidade;
  
  const metadados = this.metadados || {};
  metadados.total_tentativas = (metadados.total_tentativas || 0) + 1;
  this.metadados = metadados;
  
  return this.save();
};

ParticipanteTorneio.prototype.adicionarConquista = function(conquistaId, nome, descricao) {
  const conquistas = this.conquistas || [];
  
  if (!conquistas.some(c => c.id === conquistaId)) {
    conquistas.push({
      id: conquistaId,
      nome,
      descricao,
      data: new Date().toISOString()
    });
    
    this.conquistas = conquistas;
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Métodos estáticos
ParticipanteTorneio.calcularRanking = async function(torneioId, disciplina) {
  const participantes = await this.findAll({
    where: {
      torneio_id: torneioId,
      disciplina_competida: disciplina,
      status: 'confirmado'
    },
    order: [['pontuacao', 'DESC']]
  });
  
  let posicaoAnterior = null;
  let posicaoReal = 0;
  
  const ranking = participantes.map((participante, index) => {
    const pontuacaoAtual = parseFloat(participante.pontuacao);
    
    if (posicaoAnterior !== pontuacaoAtual) {
      posicaoReal = index + 1;
    }
    
    posicaoAnterior = pontuacaoAtual;
    participante.posicao = posicaoReal;
    
    return participante;
  });
  
  await Promise.all(ranking.map(p => p.save()));
  
  return ranking;
};

ParticipanteTorneio.buscarPorUsuarioDisciplina = function(usuarioId, disciplina) {
  return this.findOne({
    where: {
      usuario_id: usuarioId,
      disciplina_competida: disciplina,
      status: 'confirmado'
    },
    order: [['criado_em', 'DESC']]
  });
};

export default ParticipanteTorneio;
