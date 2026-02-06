// InglesOriginal.jsx - VERSÃO ATUALIZADA
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { FaSignOutAlt, FaCrown, FaUser, FaChartLine, FaExclamationTriangle } from "react-icons/fa";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import torneioService from "../../../../../BackEnd/services/torneioService";

const TEMPO_QUESTAO = 120;
const DISCIPLINA_TORNEIO = 'Inglês';

const usefulPhrases = [
  "In my opinion,", "Firstly,", "Secondly,", "Furthermore,", 
  "However,", "Therefore,", "In conclusion,", "For example,",
  "On the other hand,", "As a result,", "Moreover,", "Additionally,",
  "To summarize,", "It is important to", "One advantage is",
  "Another aspect is", "This means that", "In addition to",
  "Despite this,", "Consequently,"
];

export default function InglesOriginal() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // Estados principais
  const [torneio, setTorneio] = useState(null);
  const [torneioInfo, setTorneioInfo] = useState({ status: '', mensagem: '' });
  const [ranking, setRanking] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [questoes, setQuestoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  
  // Estados da questão atual
  const [torneioTime, setTorneioTime] = useState(0);
  const [progresso, setProgresso] = useState(0);
  const [questaoIndex, setQuestaoIndex] = useState(0);
  const [questaoTime, setQuestaoTime] = useState(TEMPO_QUESTAO);
  const [resposta, setResposta] = useState("");
  const [nivelSelecionado, setNivelSelecionado] = useState("Easy");
  const [resultado, setResultado] = useState("");
  const [pontuacao, setPontuacao] = useState(null);
  const [enviando, setEnviando] = useState(false);
  
  // Estados de UI
  const [mostrarRanking, setMostrarRanking] = useState(false);
  const [mostrarDados, setMostrarDados] = useState(false);

  // 1. VERIFICAÇÃO E CARREGAMENTO DO TORNEIO
  useEffect(() => {
    const carregarTorneio = async () => {
      if (!user?.id) {
        setLoading(false);
        setErro('Usuário não autenticado');
        return;
      }

      try {
        setLoading(true);
        setErro('');
        
        // Verificar se há torneio ativo
        const torneioData = await torneioService.verificarTorneioAtivo(DISCIPLINA_TORNEIO);
        
        if (!torneioData) {
          setTorneioInfo({
            status: 'indisponivel',
            mensagem: 'Não há torneios de Inglês disponíveis no momento.'
          });
          setLoading(false);
          return;
        }
        
        setTorneio(torneioData.torneio);
        setTorneioInfo({
          status: torneioData.status,
          mensagem: torneioData.mensagem
        });
        
        // Calcular tempo restante e progresso
        const tempoData = torneioService.calcularTempoRestante(
          torneioData.torneio.inicia_em,
          torneioData.torneio.termina_em
        );
        
        setTorneioTime(tempoData.segundos);
        setProgresso(tempoData.progresso);
        
        // Se torneio terminou
        if (tempoData.status === 'finalizado') {
          setTorneioInfo({
            status: 'finalizado',
            mensagem: 'Este torneio já foi finalizado.'
          });
          setLoading(false);
          return;
        }
        
        // 2. REGISTRAR PARTICIPANTE (se for a primeira vez)
        const participanteData = await torneioService.registrarParticipante(
          torneioData.torneio.id,
          user.id,
          DISCIPLINA_TORNEIO
        );
        
        if (participanteData && participanteData.data) {
          setUserStats({
            pontuacao: participanteData.data.pontuacao || 0,
            posicao: participanteData.data.posicao || 0,
            casos_resolvidos: participanteData.data.casos_resolvidos || 0,
            disciplina_competida: participanteData.data.disciplina_competida
          });
        }
        
        // 3. CARREGAR RANKING
        const rankingData = await torneioService.obterRanking(torneioData.torneio.id);
        setRanking(rankingData);
        
        // 4. CARREGAR QUESTÕES
        const questoesData = await torneioService.obterQuestoes(torneioData.torneio.id, DISCIPLINA_TORNEIO);
        
        if (questoesData.length === 0) {
          // Questões mock para demonstração
          setQuestoes([
            { 
              id: 1, 
              titulo: "Essay Writing",
              descricao: "Write a short essay about your favorite hobby. (100-150 words)",
              dificuldade: 'medio',
              pontos: 10
            },
            { 
              id: 2, 
              titulo: "Vacation Description",
              descricao: "Describe your dream vacation destination. (120-160 words)",
              dificuldade: 'medio',
              pontos: 10
            },
            { 
              id: 3, 
              titulo: "Advantages of Learning English",
              descricao: "What are the advantages of learning English? (150-200 words)",
              dificuldade: 'dificil',
              pontos: 15
            }
          ]);
        } else {
          setQuestoes(questoesData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar torneio:', error);
        setErro('Erro ao carregar dados do torneio. Tente novamente.');
        setLoading(false);
      }
    };
    
    carregarTorneio();
  }, [user?.id]);

  // Temporizador do torneio em tempo real
  useEffect(() => {
    if (!torneio || torneioTime <= 0) return;
    
    const interval = setInterval(() => {
      setTorneioTime(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
      
      // Atualizar progresso
      if (torneio?.inicia_em && torneio?.termina_em) {
        const tempoData = torneioService.calcularTempoRestante(
          torneio.inicia_em,
          torneio.termina_em
        );
        setProgresso(tempoData.progresso);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [torneio, torneioTime]);

  // Temporizador da questão
  useEffect(() => {
    if (questoes.length === 0) return;
    
    const interval = setInterval(() => {
      setQuestaoTime(prev => {
        if (prev <= 0) {
          handleNextQuestao();
          return TEMPO_QUESTAO;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [questaoIndex, questoes]);

  // Funções auxiliares
  const formatTime = (seconds) => {
    const d = Math.floor(seconds / (24 * 3600));
    const h = Math.floor((seconds % (24 * 3600)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d}d ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatSeconds = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleResposta = (value) => setResposta(prev => prev + value + " ");

  const handleNextQuestao = () => {
    setResposta("");
    setResultado("");
    setPontuacao(null);
    setEnviando(false);
    if (questoes.length > 0) {
      setQuestaoIndex(prev => (prev + 1 < questoes.length ? prev + 1 : 0));
    }
    setQuestaoTime(TEMPO_QUESTAO);
  };

  const executarResposta = async () => {
    if (!resposta.trim()) {
      setResultado("Please write your essay before submitting.");
      setPontuacao(0);
      return;
    }

    setEnviando(true);
    
    // Simulação de avaliação pela IA
    setTimeout(() => {
      const wordCount = resposta.trim().split(/\s+/).filter(word => word.length > 0).length;
      let feedback = "";
      let pontos = 0;
      
      if (wordCount > 100) {
        feedback = "Excellent! Your essay is well-developed with good structure and vocabulary.";
        pontos = 10;
      } else if (wordCount > 70) {
        feedback = "Good! Keep working on expanding your ideas and adding more details.";
        pontos = 7;
      } else if (wordCount > 40) {
        feedback = "Fair. Try to write more details and improve sentence structure.";
        pontos = 5;
      } else if (resposta.length > 0) {
        feedback = "Basic. You need to write more content and develop your ideas further.";
        pontos = 3;
      } else {
        feedback = "Please write your essay.";
        pontos = 0;
      }
      
      setResultado(feedback);
      setPontuacao(pontos);
      setEnviando(false);
      
      // Em produção, aqui seria a chamada para atualizar pontuação no backend
      // await torneioService.submeterResposta(torneio.id, user.id, { ... });
      
      // Avança para próxima questão após 5s
      setTimeout(() => {
        handleNextQuestao();
      }, 5000);
    }, 1500);
  };

  // Renderização condicional baseada no estado
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Carregando torneio...</p>
      </div>
    );
  }

  if (erro || torneioInfo.status === 'indisponivel') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <FaExclamationTriangle className="text-6xl text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Torneio Indisponível</h2>
        <p className="text-gray-600 mb-6">{erro || torneioInfo.mensagem}</p>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  if (torneioInfo.status === 'finalizado') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <FaCrown className="text-6xl text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Torneio Finalizado</h2>
        <p className="text-gray-600 mb-6">{torneioInfo.mensagem}</p>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Ver Resultados
        </button>
      </div>
    );
  }

  // 5. RANKING DINÂMICO - Ordenado por pontuação
  const rankingOrdenado = [...ranking].sort((a, b) => b.pontuacao - a.pontuacao);
  
  // Atribuir posições baseadas no ranking
  const rankingComPosicoes = rankingOrdenado.map((participante, index) => ({
    ...participante,
    posicao: index + 1
  }));

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* HEADER DINÂMICO */}
      <div className="bg-blue-600 text-white shadow-md">
        <div className="flex items-center justify-between p-4">
          {/* Botão Sair */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 border border-white px-3 py-1.5 text-xs sm:text-sm rounded hover:bg-white hover:text-blue-600 transition"
          >
            <FaSignOutAlt className="text-sm" />
            Sair do Torneio
          </button>

          {/* Temporizador do torneio DINÂMICO */}
          <div className="flex flex-col items-center">
            <p className="text-xs sm:text-sm">Tempo restante do torneio</p>
            <h2 className="text-lg sm:text-xl font-bold">
              {formatTime(torneioTime)}
            </h2>
            <p className="text-xs text-blue-200 mt-1">
              {torneio?.titulo || 'English Writing Tournament'}
            </p>
          </div>

          {/* Status do Torneio */}
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              torneioInfo.status === 'ativo' 
                ? 'bg-green-500 text-white' 
                : 'bg-yellow-500 text-white'
            }`}>
              {torneioInfo.status === 'ativo' ? 'ATIVO' : 'AGENDADO'}
            </div>
          </div>
        </div>

        {/* BARRA DE PROGRESSO DINÂMICA */}
        <div className="w-full h-3 bg-white/30">
          <div
            className={`h-3 transition-all duration-1000 ${
              progresso > 75 ? "bg-red-500" : 
              progresso > 50 ? "bg-yellow-500" : "bg-green-400"
            }`}
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR ESQUERDA - RANKING DINÂMICO DO BANCO */}
        <div className="hidden lg:block w-80 bg-black text-white shadow-lg p-3 overflow-y-auto">
          <div className="flex items-center justify-center gap-2 mb-4 border-b border-gray-700 pb-2">
            <FaCrown className="text-yellow-400" />
            <h2 className="text-xl font-bold">Student Ranking</h2>
          </div>
          
          {rankingComPosicoes.length > 0 ? (
            <table className="w-full table-auto text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="w-1/6 px-2 py-2 text-left">Pos</th>
                  <th className="px-2 py-2 text-left">Name</th>
                  <th className="w-1/6 px-2 py-2 text-left">Pts</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {rankingComPosicoes.slice(0, 10).map((participante) => (
                  <tr 
                    key={participante.id} 
                    className={`border-b border-gray-700 hover:bg-gray-900 transition-colors ${
                      participante.usuario?.id === user?.id ? 'bg-blue-900/30' : ''
                    }`}
                  >
                    <td className="px-2 py-2 font-semibold">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700">
                        {participante.posicao}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        {participante.usuario?.imagem ? (
                          <img 
                            src={participante.usuario.imagem} 
                            alt={participante.usuario.nome} 
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                            {participante.usuario?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                          </div>
                        )}
                        <span className="truncate">
                          {participante.usuario?.nome || 'Usuário'}
                          {participante.usuario?.id === user?.id && ' (Você)'}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-blue-400 font-semibold">
                      {participante.pontuacao.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-gray-400 py-4">
              <p>Nenhum participante ainda</p>
              <p className="text-xs mt-1">Seja o primeiro!</p>
            </div>
          )}
          
          <div className="mt-4 text-center text-xs text-gray-400">
            Total de participantes: {rankingComPosicoes.length}
          </div>
        </div>

        {/* ÁREA DE EXERCÍCIO */}
        <div className="flex-1 flex flex-col items-center p-4 overflow-auto space-y-4">
          {/* HEADER DA ÁREA */}
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-lg md:text-xl lg:text-2xl font-normal text-gray-800 text-center">
              {torneio?.titulo || 'English Writing Tournament'}
            </h1>
            
            {/* NÍVEIS DINÂMICOS */}
            <div className="flex gap-2 flex-wrap justify-center">
              {[
                { nivel: "Easy", pts: 5 },
                { nivel: "Medium", pts: 10 },
                { nivel: "Hard", pts: 20 }
              ].map((item) => (
                <button
                  key={item.nivel}
                  onClick={() => setNivelSelecionado(item.nivel)}
                  className={`px-3 py-1.5 text-xs md:text-sm rounded-full font-semibold transition-all ${
                    nivelSelecionado === item.nivel
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {item.nivel} • {item.pts} pts
                </button>
              ))}
            </div>
          </div>

          {/* ENUNCIADO DINÂMICO */}
          {questoes.length > 0 && (
            <div className="w-full max-w-4xl bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600 rounded-xl shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm md:text-base font-medium text-gray-800">
                  {questoes[questaoIndex]?.descricao || 'Carregando questão...'}
                </p>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-200 text-blue-800">
                  Questão {questaoIndex + 1}/{questoes.length}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>Word Count: {resposta.trim().split(/\s+/).filter(w => w.length > 0).length}</span>
                <span className="font-semibold">
                  Dificuldade: {questoes[questaoIndex]?.dificuldade?.toUpperCase() || 'MEDIUM'}
                </span>
              </div>
            </div>
          )}

          {/* EDITOR */}
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-4 space-y-3">
            {/* FRASES ÚTEIS */}
            <div className="flex gap-1 md:gap-2 flex-wrap border-b pb-3 overflow-x-auto">
              {usefulPhrases.map((phrase) => (
                <button
                  key={phrase}
                  onClick={() => handleResposta(phrase)}
                  className="px-2 py-1 text-xs md:text-sm bg-gray-100 hover:bg-blue-100 text-gray-800 rounded-md transition flex-shrink-0"
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

          {/* TEMPORIZADOR DA QUESTÃO */}
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-4">
            <div className="flex justify-between items-center mb-2 text-sm md:text-base font-semibold text-gray-700">
              <span>Time remaining for this question</span>
              <span className={`px-2 py-0.5 rounded ${
                questaoTime < 10 ? "bg-red-100 text-red-600" : "bg-gray-100"
              }`}>
                {formatSeconds(questaoTime)}
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  questaoTime < 10 ? "bg-red-500" : "bg-blue-600"
                }`}
                style={{ width: `${(questaoTime / TEMPO_QUESTAO) * 100}%` }}
              />
            </div>
          </div>

          {/* BOTÃO SUBMIT */}
          <button
            onClick={executarResposta}
            disabled={enviando}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 w-full sm:w-auto sm:min-w-[160px] ${
              enviando
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
            } text-white shadow-md hover:shadow-lg active:scale-95`}
          >
            {enviando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-sm md:text-base">Processing...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm md:text-base">Submit Essay</span>
              </>
            )}
          </button>

          {/* RESULTADO / AVALIAÇÃO */}
          {resultado && (
            <div className="w-full max-w-4xl bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl shadow-md p-4 animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">AI Evaluation</h3>
                    {pontuacao !== null && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">Score:</span>
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">
                          {pontuacao}/10
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-gray-700">{resultado}</p>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Next question in:</span>
                        <span className="font-semibold text-blue-600">5 seconds</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOTÕES MOBILE */}
          <div className="flex flex-col sm:flex-row w-full max-w-5xl justify-between gap-3 mt-4 lg:hidden">
            <button
              onClick={() => setMostrarRanking(true)}
              className="flex-1 bg-black hover:bg-gray-900 text-white px-4 py-3 rounded-lg shadow-md text-sm transition-colors flex items-center justify-center gap-2"
            >
              <FaCrown />
              Ver Ranking
            </button>
            <button
              onClick={() => setMostrarDados(true)}
              className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              <FaUser />
              Seus Dados
            </button>
          </div>
        </div>

        {/* SIDEBAR DIREITA - DADOS DO USUÁRIO DINÂMICOS DO BANCO */}
        <div className="hidden lg:flex w-64 bg-white text-gray-800 shadow-lg p-4 overflow-y-auto flex-col items-center space-y-3">
          {/* Foto e Identidade */}
          <div className="flex flex-col items-center mb-3">
            {user?.imagem ? (
              <img
                src={user.imagem}
                alt={user.nome}
                className="w-20 h-20 rounded-full mb-2 border-2 border-blue-400 object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full mb-2 border-2 border-blue-400 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold">
                {user?.nome ? user.nome.split(' ').map(n => n[0]).join('').substring(0, 2) : 'U'}
              </div>
            )}
            <h3 className="text-lg font-bold mt-2">{user?.nome || "Usuário"}</h3>
            <span className="text-gray-500 text-sm">
              {userStats?.disciplina_competida || DISCIPLINA_TORNEIO}
            </span>
          </div>

          {/* Estatísticas DINÂMICAS do banco */}
          <div className="w-full flex flex-col gap-4 items-center">
            {[
              { 
                valor: userStats?.pontuacao || 0, 
                label: "Pontuação", 
                cor: "#3b82f6", 
                max: 10000,
                unidade: 'pts'
              },
              { 
                valor: userStats?.posicao || rankingComPosicoes.length + 1, 
                label: "Posição no Ranking", 
                cor: "#10b981", 
                max: rankingComPosicoes.length || 1,
                unidade: 'º'
              },
              { 
                valor: userStats?.casos_resolvidos || 0, 
                label: "Casos Resolvidos", 
                cor: "#8b5cf6", 
                max: 100,
                unidade: ''
              }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-3xl border border-gray-200 p-2 flex flex-col items-center gap-1 w-40 hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16">
                  <CircularProgressbar 
                    value={item.valor} 
                    maxValue={item.max}
                    text={`${item.valor}${item.unidade}`} 
                    styles={buildStyles({
                      textSize: '16px',
                      textColor: '#1f2937',
                      pathColor: item.cor,
                      trailColor: '#f3f4f6',
                      pathTransitionDuration: 1,
                    })}
                  />
                </div>
                <span className="text-xs font-semibold text-center text-gray-700">{item.label}</span>
                <span className="text-xs text-gray-500">
                  {item.valor} de {item.max}{item.unidade}
                </span>
              </div>
            ))}
          </div>
          
          {/* Progresso no torneio */}
          <div className="w-full mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progresso do Torneio</span>
              <span>{progresso.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAY SIDEBAR ESQUERDA (RANKING MOBILE) */}
      <div className={`fixed inset-0 z-50 flex transition-all duration-300 ${
        mostrarRanking ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}>
        <div 
          className={`absolute inset-0 bg-black/60 ${
            mostrarRanking ? "opacity-100" : "opacity-0"
          }`} 
          onClick={() => setMostrarRanking(false)} 
        />
        <div className={`relative w-80 bg-black text-white p-4 overflow-y-auto transform transition-transform duration-300 ${
          mostrarRanking ? "translate-x-0" : "-translate-x-full"
        }`}>
          <button 
            onClick={() => setMostrarRanking(false)} 
            className="absolute top-2 right-2 text-white text-xl hover:text-gray-300"
          >
            ✕
          </button>
          
          <div className="flex items-center justify-center gap-2 mb-4 border-b border-gray-700 pb-2">
            <FaCrown className="text-yellow-400" />
            <h2 className="text-xl font-bold">Student Ranking</h2>
          </div>
          
          {rankingComPosicoes.length > 0 ? (
            <table className="w-full table-auto text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="w-1/6 px-2 py-2 text-left">Pos</th>
                  <th className="px-2 py-2 text-left">Name</th>
                  <th className="w-1/6 px-2 py-2 text-left">Pts</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {rankingComPosicoes.slice(0, 10).map((participante) => (
                  <tr 
                    key={participante.id} 
                    className={`border-b border-gray-700 hover:bg-gray-900 transition-colors ${
                      participante.usuario?.id === user?.id ? 'bg-blue-900/30' : ''
                    }`}
                  >
                    <td className="px-2 py-2 font-semibold">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700">
                        {participante.posicao}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        {participante.usuario?.imagem ? (
                          <img 
                            src={participante.usuario.imagem} 
                            alt={participante.usuario.nome} 
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                            {participante.usuario?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                          </div>
                        )}
                        <span className="truncate">
                          {participante.usuario?.nome || 'Usuário'}
                          {participante.usuario?.id === user?.id && ' (Você)'}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-blue-400 font-semibold">
                      {participante.pontuacao.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-gray-400 py-4">
              <p>Nenhum participante ainda</p>
              <p className="text-xs mt-1">Seja o primeiro!</p>
            </div>
          )}
        </div>
      </div>

      {/* OVERLAY SIDEBAR DIREITA (DADOS USUÁRIO MOBILE) */}
      <div className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${
        mostrarDados ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}>
        <div 
          className={`absolute inset-0 bg-black/60 ${
            mostrarDados ? "opacity-100" : "opacity-0"
          }`} 
          onClick={() => setMostrarDados(false)} 
        />
        <div className={`relative w-72 bg-white text-gray-800 p-4 overflow-y-auto transform transition-transform duration-300 ${
          mostrarDados ? "translate-x-0" : "translate-x-full"
        }`}>
          <button 
            onClick={() => setMostrarDados(false)} 
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl"
          >
            ✕
          </button>
          
          <div className="flex flex-col items-center mb-3">
            {user?.imagem ? (
              <img
                src={user.imagem}
                alt={user.nome}
                className="w-20 h-20 rounded-full mb-2 border-2 border-blue-400 object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full mb-2 border-2 border-blue-400 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold">
                {user?.nome ? user.nome.split(' ').map(n => n[0]).join('').substring(0, 2) : 'U'}
              </div>
            )}
            <h3 className="text-lg font-bold mt-2">{user?.nome || "Usuário"}</h3>
          </div>
          
          <div className="w-full flex flex-col gap-4 items-center mt-6">
            {[
              { 
                valor: userStats?.pontuacao || 0, 
                label: "Pontuação", 
                cor: "#3b82f6", 
                max: 10000,
                unidade: 'pts'
              },
              { 
                valor: userStats?.posicao || rankingComPosicoes.length + 1, 
                label: "Posição no Ranking", 
                cor: "#10b981", 
                max: rankingComPosicoes.length || 1,
                unidade: 'º'
              },
              { 
                valor: userStats?.casos_resolvidos || 0, 
                label: "Casos Resolvidos", 
                cor: "#8b5cf6", 
                max: 100,
                unidade: ''
              }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-3xl border border-gray-200 p-2 flex flex-col items-center gap-1 w-40"
              >
                <div className="w-16 h-16">
                  <CircularProgressbar 
                    value={item.valor} 
                    maxValue={item.max}
                    text={`${item.valor}${item.unidade}`} 
                    styles={buildStyles({
                      textSize: '16px',
                      textColor: '#1f2937',
                      pathColor: item.cor,
                      trailColor: '#f3f4f6',
                    })}
                  />
                </div>
                <span className="text-xs font-semibold text-center text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS para animações */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}