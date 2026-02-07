// src/Paginas/Tercearios.jsx/ModeloOriginal/InglesOriginal.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { FaSignOutAlt } from "react-icons/fa";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const TEMPO_QUESTAO = 120;
const DISCIPLINA = 'ingles';

const usefulPhrases = [
  "In my opinion,", "Firstly,", "Secondly,", "Furthermore,", 
  "However,", "Therefore,", "In conclusion,", "For example,",
  "On the other hand,", "As a result,", "Moreover,", "Additionally,",
  "To summarize,", "It is important to", "One advantage is",
  "Another aspect is", "This means that", "In addition to",
  "Despite this,", "Consequently,"
];

const questoesExemplo = [
  {
    id: 1,
    enunciado: "Write an essay about the importance of learning English in today's globalized world. Discuss at least three benefits and provide examples.",
    nivel: "Médio",
    pontos: 15
  },
  {
    id: 2,
    enunciado: "Describe your favorite holiday destination. Include details about the location, activities, and why it is special to you.",
    nivel: "Fácil",
    pontos: 10
  },
  {
    id: 3,
    enunciado: "Compare and contrast traditional education with online learning. Discuss advantages and disadvantages of each approach.",
    nivel: "Difícil",
    pontos: 20
  }
];

export default function InglesOriginal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  // Estados do torneio (igual ao EntrarTorneio.jsx)
  const [torneio, setTorneio] = useState(null);
  const [participante, setParticipante] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progresso, setProgresso] = useState(0);
  const [tempoRestante, setTempoRestante] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
  const [dentroDoPeriodo, setDentroDoPeriodo] = useState(false);
  const [error, setError] = useState(null);

  // Estados locais
  const [questoes, setQuestoes] = useState(questoesExemplo);
  const [questaoIndex, setQuestaoIndex] = useState(0);
  const [questaoTime, setQuestaoTime] = useState(TEMPO_QUESTAO);
  const [resposta, setResposta] = useState("");
  const [nivelSelecionado, setNivelSelecionado] = useState("facil");
  const [resultado, setResultado] = useState("");
  const [pontuacao, setPontuacao] = useState(null);
  const [mostrarRanking, setMostrarRanking] = useState(false);
  const [mostrarDados, setMostrarDados] = useState(false);

  // 1. VERIFICAR TORNEIO ATIVO (igual ao EntrarTorneio.jsx)
  useEffect(() => {
    const verificarTorneioAtivo = async () => {
      try {
        console.log('🔍 Verificando torneio ativo para Inglês...');
        const response = await fetch('http://localhost:3000/api/torneios/ativo');
        const data = await response.json();
        
        console.log('📊 Resposta torneio ativo:', data);
        
        if (data.ativo && data.torneio) {
          console.log('✅ Torneio ativo encontrado:', data.torneio.titulo);
          setTorneio(data.torneio);
          
          // Calcular progresso e tempo restante
          calcularProgressoTempo(data.torneio);
          
          // Buscar dados do usuário
          if (user?.id) {
            await buscarDadosUsuario(data.torneio.id, user.id);
          }
          
          // Buscar ranking
          await buscarRanking(data.torneio.id);
          
          // Buscar questões
          await buscarQuestoes(data.torneio.id);
          
        } else {
          setError(data.message || "Nenhum torneio ativo no momento.");
        }
      } catch (err) {
        console.error('❌ Erro ao verificar torneio ativo:', err);
        setError("Erro ao conectar com o servidor. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    verificarTorneioAtivo();
  }, [user]);

  // Função para calcular progresso e tempo restante
  const calcularProgressoTempo = (torneioData) => {
    if (!torneioData?.inicia_em || !torneioData?.termina_em) return;
    
    const inicio = new Date(torneioData.inicia_em).getTime();
    const fim = new Date(torneioData.termina_em).getTime();
    const agora = new Date().getTime();
    
    const estaDentroDoPeriodo = agora >= inicio && agora <= fim;
    setDentroDoPeriodo(estaDentroDoPeriodo);
    
    if (!estaDentroDoPeriodo) {
      setProgresso(agora > fim ? 100 : 0);
      setTempoRestante({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
      return;
    }
    
    // Calcular progresso
    const totalDuracao = fim - inicio;
    const tempoDecorrido = agora - inicio;
    const progressoPercentual = Math.min(100, Math.max(0, (tempoDecorrido / totalDuracao) * 100));
    setProgresso(progressoPercentual);

    // Calcular tempo restante
    const tempoRestanteMs = fim - agora;
    if (tempoRestanteMs > 0) {
      const dias = Math.floor(tempoRestanteMs / (1000 * 60 * 60 * 24));
      const horas = Math.floor((tempoRestanteMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((tempoRestanteMs % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((tempoRestanteMs % (1000 * 60)) / 1000);
      setTempoRestante({ dias, horas, minutos, segundos });
    }
  };

  // Buscar dados do usuário
  const buscarDadosUsuario = async (torneioId, userId) => {
    try {
      console.log('👤 Buscando dados do usuário...');
      const response = await fetch(
        `http://localhost:3000/api/participantes/usuario/${userId}/${DISCIPLINA}`
      );
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('✅ Dados do participante encontrados:', data.data);
        setParticipante(data.data);
      } else if (response.status === 404) {
        console.log('⚠️ Usuário não encontrado como participante');
        // Tentar registrar automaticamente
        await registrarParticipante(userId);
      }
    } catch (err) {
      console.error('❌ Erro ao buscar dados do usuário:', err);
    }
  };

  // Registrar participante
  const registrarParticipante = async (userId) => {
    try {
      console.log('👤 Registrando participante automaticamente...');
      const response = await fetch('http://localhost:3000/api/participantes/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          id_usuario: userId,
          disciplina_competida: DISCIPLINA
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('✅ Participante registrado:', data.data);
        setParticipante(data.data);
      }
    } catch (err) {
      console.error('❌ Erro ao registrar participante:', err);
    }
  };

  // Buscar ranking
  const buscarRanking = async (torneioId) => {
    try {
      console.log('📊 Buscando ranking...');
      const response = await fetch(
        `http://localhost:3000/api/participantes/ranking/${DISCIPLINA}`
      );
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Ranking recebido: ${data.data?.length || 0} participantes`);
        setRanking(data.data || []);
      }
    } catch (err) {
      console.error('❌ Erro ao buscar ranking:', err);
    }
  };

  // Buscar questões
  const buscarQuestoes = async (torneioId) => {
    try {
      const response = await fetch(`http://localhost:3000/torneios/${torneioId}/questoes/ingles`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setQuestoes(data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar questões:', err);
    }
  };

  // Atualizar pontuação
  const atualizarPontuacao = async (pontosAdicionados, casosAdicionados = 1) => {
    if (!participante?.usuario_id || !user?.id) {
      console.log('⚠️ Dados insuficientes para atualizar pontuação');
      return null;
    }
    
    try {
      console.log('📈 Atualizando pontuação...');
      
      const response = await fetch('http://localhost:3000/api/participantes/atualizar-pontuacao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          usuario_id: user.id,
          disciplina_competida: DISCIPLINA.charAt(0).toUpperCase() + DISCIPLINA.slice(1),
          pontuacao_adicionada: pontosAdicionados,
          casos_adicionados: casosAdicionados
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('✅ Pontuação atualizada com sucesso');
        setParticipante(data.data);
        
        // Atualizar ranking
        if (torneio?.id) {
          await buscarRanking(torneio.id);
        }
        
        return data.data;
      }
      return null;
    } catch (err) {
      console.error('❌ Erro ao atualizar pontuação:', err);
      return null;
    }
  };

  // Temporizador da questão
  useEffect(() => {
    if (questoes.length === 0) return;
    
    const interval = setInterval(() => {
      setQuestaoTime((prev) => {
        if (prev <= 0) {
          handleNextQuestao();
          return TEMPO_QUESTAO;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [questaoIndex, questoes]);

  const formatTime = () => {
    const { dias, horas, minutos, segundos } = tempoRestante;
    if (dias > 0) {
      return `${dias.toString().padStart(2, '0')}d ${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    }
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  };

  const formatSeconds = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleResposta = (value) => setResposta((prev) => prev + value + " ");

  const handleNextQuestao = () => {
    setResposta("");
    setResultado("");
    setPontuacao(null);
    setQuestaoIndex((prev) => (prev + 1 < questoes.length ? prev + 1 : 0));
    setQuestaoTime(TEMPO_QUESTAO);
  };

  const executarResposta = async () => {
    const wordCount = resposta.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    let pontuacaoCalculada = 0;
    let resultadoTexto = "";
    
    if (wordCount > 100) {
      resultadoTexto = "Excellent! Your essay is well-developed with good structure and vocabulary.";
      pontuacaoCalculada = 15;
    } else if (wordCount > 70) {
      resultadoTexto = "Good essay! You have clear ideas but could expand more on some points.";
      pontuacaoCalculada = 10;
    } else if (wordCount > 40) {
      resultadoTexto = "Fair attempt. Try to write more details and improve sentence structure.";
      pontuacaoCalculada = 7;
    } else if (resposta.length > 0) {
      resultadoTexto = "Basic response. You need to write more and develop your ideas further.";
      pontuacaoCalculada = 3;
    } else {
      resultadoTexto = "Please write your essay in the text area provided.";
      pontuacaoCalculada = 0;
    }
    
    setResultado(resultadoTexto);
    setPontuacao(pontuacaoCalculada);
    
    // Atualizar pontuação no banco de dados
    if (participante && pontuacaoCalculada > 0) {
      await atualizarPontuacao(pontuacaoCalculada, 1);
    }
  };

  // Timer para atualizar progresso a cada minuto
  useEffect(() => {
    if (!torneio) return;
    
    const interval = setInterval(() => {
      calcularProgressoTempo(torneio);
    }, 60000); // Atualiza a cada minuto
    
    return () => clearInterval(interval);
  }, [torneio]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando torneio de Inglês...</p>
        </div>
      </div>
    );
  }

  if (error || !torneio) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Torneio Indisponível</h2>
          <p className="text-gray-600 mb-6">
            {error || "Não há torneio de Inglês ativo no momento."}
          </p>
          <button 
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* HEADER */}
      <div className="bg-blue-600 text-white shadow-md">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => navigate("/")} 
            className="flex items-center gap-1 border border-white px-2 py-1 text-[10px] sm:px-3 sm:py-1.5 sm:text-xs md:px-4 md:py-2 md:text-sm rounded hover:bg-white hover:text-blue-600 transition"
          >
            <FaSignOutAlt className="text-xs sm:text-sm md:text-base" />
            Sair do Torneio
          </button>

          <div className="flex flex-col items-center" translate="no">
            <p className="text-xs md:text-xs lg:text-sm">Tempo restante do torneio</p>
            <h2 className="text-lg md:text-base lg:text-xl font-bold">{formatTime()}</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white text-blue-600 font-bold px-2 py-1 text-[10px] sm:px-3 sm:py-1.5 sm:text-xs md:px-4 md:py-2 md:text-sm rounded-full flex items-center gap-1 shadow-md">
              English Tournament
            </div>
          </div>
        </div>

        {/* Barra de progresso dinâmica */}
        <div className="w-full h-3 bg-white/30">
          <div 
            className="h-3 transition-all duration-1000 bg-gradient-to-r from-green-400 to-blue-500"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR ESQUERDA - RANKING DINÂMICO */}
        <div className="hidden lg:block w-80 bg-black text-white shadow-lg p-3 overflow-y-auto" translate="no">
          <h2 className="text-xl font-bold mb-4 text-center border-b border-gray-700 pb-1">Student Ranking</h2>
          <table className="w-full table-auto text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="w-1/6 px-2 py-2 text-left">Pos</th>
                <th className="px-2 py-2 text-left">Name</th>
                <th className="w-1/6 px-2 py-2 text-left">Pts</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {ranking.length > 0 ? (
                ranking.map((participanteRank) => (
                  <tr key={participanteRank.id} className="border-b border-gray-700 hover:bg-gray-900">
                    <td className="px-2 py-2 font-semibold">
                      {participanteRank.posicao === 1 ? '🥇' : 
                       participanteRank.posicao === 2 ? '🥈' : 
                       participanteRank.posicao === 3 ? '🥉' : 
                       participanteRank.posicao}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        {participanteRank.usuario?.imagem ? (
                          <img 
                            src={participanteRank.usuario.imagem} 
                            alt={participanteRank.usuario.nome}
                            className="w-7 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                            {participanteRank.usuario?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                          </div>
                        )}
                        <span className="truncate">{participanteRank.usuario?.nome || 'Usuário'}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-blue-400 font-semibold">{participanteRank.pontuacao || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-2 py-4 text-center text-gray-400">
                    Nenhum participante ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ÁREA DE EXERCÍCIO */}
        <div className="flex-1 flex flex-col items-center p-4 overflow-auto space-y-4" translate="no">
          {/* HEADER */}
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-lg md:text-xl lg:text-2xl font-normal text-gray-800 text-center">
              {torneio?.titulo || 'English Writing Tournament'}
            </h1>
            
            {/* NÍVEIS */}
            <div className="flex gap-2 flex-wrap justify-center">
              {[
                { nivel: "Easy", pts: 5 },
                { nivel: "Medium", pts: 10 },
                { nivel: "Hard", pts: 20 }
              ].map((item) => (
                <button 
                  key={item.nivel} 
                  onClick={() => setNivelSelecionado(item.nivel.toLowerCase())}
                  className={`px-3 py-1.5 text-xs md:text-sm rounded-full font-semibold transition-all ${
                    nivelSelecionado === item.nivel.toLowerCase()
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {item.nivel} • {item.pts} pts
                </button>
              ))}
            </div>
          </div>

          {/* ENUNCIADO */}
          <div className="w-full max-w-4xl bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600 rounded-xl shadow p-4">
            <p className="text-sm md:text-base font-medium text-gray-800">
              {questoes[questaoIndex]?.descricao || questoes[questaoIndex]?.enunciado}
            </p>
            <div className="mt-2 text-xs text-gray-500">
              Word Count: {resposta.trim().split(/\s+/).filter(w => w.length > 0).length}
              {questoes[questaoIndex]?.pontos && (
                <span className="ml-4 font-semibold text-blue-600">
                  {questoes[questaoIndex].pontos} pontos
                </span>
              )}
            </div>
          </div>

          {/* EDITOR */}
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-4 space-y-3">
            {/* FRASES ÚTEIS */}
            <div className="flex gap-1 md:gap-2 flex-wrap justify-center border-b pb-3 overflow-x-auto">
              {usefulPhrases.map((phrase) => (
                <button 
                  key={phrase} 
                  onClick={() => handleResposta(phrase)}
                  className="px-2 py-1 text-xs md:text-sm bg-gray-100 hover:bg-blue-100 text-gray-800 rounded-md transition"
                >
                  {phrase}
                </button>
              ))}
            </div>

            {/* TEXTAREA */}
            <textarea 
              value={resposta} 
              onChange={(e) => setResposta(e.target.value)}
              className="w-full h-80 resize-none p-3 text-sm md:text-base bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your essay here. Grammar, spelling, structure and coherence will be evaluated..."
              spellCheck="true" 
            />
          </div>

          {/* TEMPORIZADOR */}
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-4">
            <div className="flex justify-between items-center mb-2 text-sm md:text-base font-semibold text-gray-700">
              <span>Time remaining for this question</span>
              <span className="px-2 py-0.5 rounded bg-gray-100">{formatSeconds(questaoTime)}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${questaoTime < 10 ? "bg-red-500" : "bg-blue-600"}`}
                style={{ width: `${(questaoTime / TEMPO_QUESTAO) * 100}%` }} 
              />
            </div>
          </div>

          {/* BOTÃO SUBMIT */}
          <button 
            onClick={executarResposta}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 w-full sm:w-auto sm:min-w-[160px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm md:text-base">Submit Essay</span>
          </button>

          {/* RESULTADO / AVALIAÇÃO */}
          {resultado && (
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-600">
              <h3 className="text-gray-700 font-semibold mb-2">Your Essay Evaluation</h3>
              <p className="text-gray-800 mb-2">{resultado}</p>
              {pontuacao !== null && (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700">Score:</span>
                  <span className={`font-bold px-2 py-1 rounded ${
                    pontuacao >= 12 ? "bg-green-200 text-green-800" :
                    pontuacao >= 8 ? "bg-yellow-200 text-yellow-800" :
                    "bg-red-200 text-red-800"
                  }`}>
                    {pontuacao} pts
                  </span>
                  <span className="text-sm text-gray-500 ml-auto">
                    Pontuação adicionada ao seu ranking
                  </span>
                </div>
              )}
            </div>
          )}

          {/* BOTÕES MOBILE */}
          <div className="flex flex-col sm:flex-row w-full max-w-5xl justify-between gap-3 mt-4 lg:hidden">
            <button 
              onClick={() => setMostrarRanking(true)} 
              className="flex-1 bg-black hover:bg-gray-900 text-white px-4 py-3 rounded-lg shadow-md text-sm transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Ver Ranking
            </button>
            <button 
              onClick={() => setMostrarDados(true)} 
              className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Ver seus Dados
            </button>
          </div>
        </div>

        {/* SIDEBAR DIREITA - INFO USUÁRIO DINÂMICA */}
        <div className="hidden lg:flex w-64 bg-white text-gray-800 shadow-lg p-4 overflow-y-auto flex-col items-center space-y-3">
          {/* Foto e Identidade */}
          <div className="flex flex-col items-center mb-3">
            {participante?.usuario?.imagem ? (
              <img 
                src={participante.usuario.imagem} 
                alt={participante.usuario.nome}
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-400 mb-2"
              />
            ) : (
              <div className="w-20 h-20 rounded-full mb-2 border-2 border-blue-400 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold">
                {participante?.usuario?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || user?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
              </div>
            )}
            <h3 className="text-lg font-bold mt-2">{participante?.usuario?.nome || user?.nome || "Usuário"}</h3>
            <p className="text-sm text-gray-500">Participante do Torneio</p>
          </div>

          {/* Estatísticas */}
          {participante ? (
            <div className="w-full flex flex-col gap-4 items-center">
              {[
                { valor: participante.pontuacao || 0, label: "Pontuação", cor: "#3b82f6", max: 10000 },
                { valor: participante.posicao || 0, label: "Posição", cor: "#3b82f6", max: 100 },
                { valor: participante.casos_resolvidos || 0, label: "Casos Resolvidos", cor: "#3b82f6", max: 100 }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-3xl border border-blue-200 p-2 flex flex-col items-center gap-1 w-40">
                  <div className="w-14 h-14">
                    <CircularProgressbar 
                      value={item.valor} 
                      maxValue={item.max} 
                      text={`${item.valor}`} 
                      styles={buildStyles({ 
                        textSize: '18px', 
                        textColor: '#333', 
                        pathColor: item.cor, 
                        trailColor: '#e5e5e5' 
                      })} 
                    />
                  </div>
                  <span className="text-xs font-semibold text-center">{item.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-gray-600 mb-3">Você ainda não está participando deste torneio</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Entrar no Torneio
              </button>
            </div>
          )}
        </div>
      </div>

      {/* OVERLAY SIDEBAR ESQUERDA (RANKING MOBILE) */}
      {mostrarRanking && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="absolute inset-0 bg-black/60" 
            onClick={() => setMostrarRanking(false)}
          />
          <div className="relative w-80 bg-black text-white p-4 overflow-y-auto">
            <button 
              onClick={() => setMostrarRanking(false)} 
              className="absolute top-2 right-2 text-white text-xl"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-center border-b border-gray-700 pb-1">Student Ranking</h2>
            <table className="w-full table-auto text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="w-1/6 px-2 py-2 text-left">Pos</th>
                  <th className="px-2 py-2 text-left">Name</th>
                  <th className="w-1/6 px-2 py-2 text-left">Pts</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {ranking.length > 0 ? (
                  ranking.map((participanteRank) => (
                    <tr key={participanteRank.id} className="border-b border-gray-700 hover:bg-gray-900">
                      <td className="px-2 py-2 font-semibold">{participanteRank.posicao}</td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          {participanteRank.usuario?.imagem ? (
                            <img 
                              src={participanteRank.usuario.imagem} 
                              alt={participanteRank.usuario.nome}
                              className="w-7 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-7 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                              {participanteRank.usuario?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                            </div>
                          )}
                          <span className="truncate">{participanteRank.usuario?.nome || 'Usuário'}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-blue-400 font-semibold">{participanteRank.pontuacao || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-2 py-4 text-center text-gray-400">
                      Nenhum participante ainda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OVERLAY SIDEBAR DIREITA (DADOS USUÁRIO MOBILE) */}
      {mostrarDados && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div 
            className="absolute inset-0 bg-black/60" 
            onClick={() => setMostrarDados(false)}
          />
          <div className="relative w-72 bg-white text-gray-800 p-4 overflow-y-auto">
            <button 
              onClick={() => setMostrarDados(false)} 
              className="absolute top-2 right-2 text-xl"
            >
              ✕
            </button>
            <div className="flex flex-col items-center mb-3">
              {participante?.usuario?.imagem ? (
                <img 
                  src={participante.usuario.imagem} 
                  alt={participante.usuario.nome}
                  className="w-20 h-20 rounded-full object-cover border-2 border-blue-400 mb-2"
                />
              ) : (
                <div className="w-20 h-20 rounded-full mb-2 border-2 border-blue-400 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold">
                  {participante?.usuario?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || user?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                </div>
              )}
              <h3 className="text-lg font-bold mt-2">{participante?.usuario?.nome || user?.nome || "Usuário"}</h3>
            </div>
            
            {participante ? (
              <div className="w-full flex flex-col mt-4 gap-4 items-center">
                {[
                  { valor: participante.pontuacao || 0, label: "Pontuação", cor: "#3b82f6", max: 10000 },
                  { valor: participante.posicao || 0, label: "Posição", cor: "#3b82f6", max: 100 },
                  { valor: participante.casos_resolvidos || 0, label: "Casos Resolvidos", cor: "#3b82f6", max: 100 }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white rounded-3xl border border-blue-200 p-2 flex flex-col items-center gap-1 w-40">
                    <div className="w-14 h-14">
                      <CircularProgressbar 
                        value={item.valor} 
                        maxValue={item.max} 
                        text={`${item.valor}`} 
                        styles={buildStyles({ 
                          textSize: '18px', 
                          textColor: '#333', 
                          pathColor: item.cor, 
                          trailColor: '#e5e5e5' 
                        })} 
                      />
                    </div>
                    <span className="text-xs font-semibold text-center">{item.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-gray-600">Você ainda não está participando</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}