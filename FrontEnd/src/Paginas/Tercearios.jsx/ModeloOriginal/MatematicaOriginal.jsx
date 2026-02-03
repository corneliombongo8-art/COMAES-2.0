import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { FaSignOutAlt } from "react-icons/fa";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const TEMPO_QUESTAO = 90;
const DISCIPLINA_TORNEIO = 'Matemática';
const UM_DIA = 24 * 60 * 60;

export default function MatematicaOriginal() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // Estados para dados do torneio
  const [torneio, setTorneio] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [questoes, setQuestoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [torneioTime, setTorneioTime] = useState(0);
  const [questaoIndex, setQuestaoIndex] = useState(0);
  const [questaoTime, setQuestaoTime] = useState(TEMPO_QUESTAO);
  const [resposta, setResposta] = useState("");
  const [nivelSelecionado, setNivelSelecionado] = useState("facil");
  const [resultado, setResultado] = useState("");
  const [pontuacao, setPontuacao] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [mostrarRanking, setMostrarRanking] = useState(false);
  const [mostrarDados, setMostrarDados] = useState(false);
  const [torneioIndisponivel, setTorneioIndisponivel] = useState(false);

  // Fetch torneios e questões
  useEffect(() => {
    const fetchTorneos = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Buscar torneios ativos de Matemática
        const res = await fetch('http://localhost:3000/torneios');
        const data = await res.json();
        
        const torneiosAtivos = Array.isArray(data.data) 
          ? data.data.filter(t => 
              (t.status === 'ativo' || t.status === 'agendado') && 
              t.titulo.toLowerCase().includes('matemática')
            )
          : [];
        
        if (torneiosAtivos.length > 0) {
          const t = torneiosAtivos[0];
          setTorneio(t);

          // Verificar se torneio expirou
          const agora = new Date().getTime();
          const termina = new Date(t.termina_em).getTime();
          const inicia = new Date(t.inicia_em).getTime();
          
          if (agora > termina) {
            setTorneioIndisponivel(true);
            setLoading(false);
            return;
          }

          // Calcular tempo restante
          const tempoRestante = Math.floor((termina - agora) / 1000);
          setTorneioTime(tempoRestante > 0 ? tempoRestante : 0);

          // Buscar questões de matemática do torneio
          const questRes = await fetch(`http://localhost:3000/torneios/${t.id}/questoes/matematica`);
          const questData = await questRes.json();
          setQuestoes(Array.isArray(questData.data) ? questData.data : []);

          // Buscar ranking
          const rankRes = await fetch(`http://localhost:3000/torneios/${t.id}/ranking`);
          const rankData = await rankRes.json();
          setRanking(Array.isArray(rankData.data) ? rankData.data : []);
          
          // Adicionar usuário ao torneio se não estiver
          const participanteRes = await fetch(`http://localhost:3000/torneios/${t.id}/usuario/${user.id}`);
          if (!participanteRes.ok) {
            const joinRes = await fetch(`http://localhost:3000/torneios/${t.id}/join`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ usuario_id: user.id, disciplina_competida: DISCIPLINA_TORNEIO })
            });
            if (joinRes.ok) {
              const userData = await joinRes.json();
              setUserStats(userData.data);
            }
          } else {
            const userData = await participanteRes.json();
            setUserStats(userData.data);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar torneios:', err);
        setLoading(false);
      }
    };
    
    fetchTorneos();
  }, [user?.id, token]);

  // Atualizar tempo do torneio em tempo real
  useEffect(() => {
    if (!torneio) return;

    const interval = setInterval(() => {
      setTorneioTime((prev) => {
        if (prev <= 0) {
          setTorneioIndisponivel(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [torneio]);

  // Temporizador da questão
  useEffect(() => {
    if (!torneio || questoes.length === 0) return;

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

  const UM_DIA = 24 * 60 * 60;

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

  const handleResposta = (value) => setResposta((prev) => prev + value);

  const handleNextQuestao = () => {
    setResposta("");
    setResultado("");
    setPontuacao(null);
    if (questoes.length > 0) {
      setQuestaoIndex((prev) => (prev + 1 < questoes.length ? prev + 1 : 0));
    }
    setQuestaoTime(TEMPO_QUESTAO);
  };

  const executarResposta = async () => {
    if (!resposta.trim()) {
      setResultado("Por favor, digite uma resposta!");
      setPontuacao(0);
      return;
    }

    // Chamar API de avaliação de IA
    try {
      const res = await fetch('http://localhost:3000/avaliar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disciplina: 'matematica',
          questao: questoes[questaoIndex],
          resposta_usuario: resposta
        })
      });

      const data = await res.json();
      if (res.ok) {
        setResultado(data.resultado);
        setPontuacao(data.pontuacao);
      } else {
        setResultado("Erro ao avaliar resposta. Tente novamente.");
        setPontuacao(0);
      }
    } catch (error) {
      console.error('Erro ao executar resposta:', error);
      setResultado("Erro na conexão. Tente novamente.");
      setPontuacao(0);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (torneioIndisponivel) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Torneio Indisponível</h2>
          <p className="text-gray-700 mb-6">Este torneio já foi finalizado.</p>
          <button onClick={() => navigate("/")} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Voltar ao Home
          </button>
        </div>
      </div>
    );
  }

  if (!torneio || questoes.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Nenhum torneio disponível</h2>
          <p className="text-gray-700 mb-6">Não há torneios de Matemática ativos no momento.</p>
          <button onClick={() => navigate("/")} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Voltar ao Home
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
          <button onClick={() => navigate("/")} className="flex items-center gap-1 border border-white px-2 py-1 text-[10px] sm:px-3 sm:py-1.5 sm:text-xs md:px-4 md:py-2 md:text-sm rounded hover:bg-white hover:text-blue-600 transition">
            <FaSignOutAlt className="text-xs sm:text-sm md:text-base" />
            Sair do Torneio
          </button>

          <div className="flex flex-col items-center" translate="no">
            <p className="text-xs md:text-xs lg:text-sm">Tempo restante do torneio</p>
            <h2 className="text-lg md:text-base lg:text-xl font-bold">{formatTime(torneioTime)}</h2>
          </div>

          <div className="flex items-center gap-2 relative">
            <div className="bg-white text-blue-600 font-bold px-2 py-1 text-[10px] sm:px-3 sm:py-1.5 sm:text-xs md:px-4 md:py-2 md:text-sm rounded-full flex items-center gap-1 shadow-md">
              Modelo Original
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="w-full h-3 bg-white/30">
          <div className={`h-3 transition-all duration-1000 ${torneioTime <= UM_DIA ? "bg-red-500" : "bg-green-400"}`}
            style={{ width: torneio?.inicia_em ? `${Math.max(0, Math.min(100, (torneioTime / ((new Date(torneio.termina_em).getTime() - new Date(torneio.inicia_em).getTime()) / 1000)) * 100))}%` : '0%' }} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR ESQUERDA - RANKING */}
        <div className="hidden lg:block w-80 bg-black text-white shadow-lg p-3">
          <h2 className="text-xl font-bold mb-4 text-center border-b border-gray-700 pb-1">Ranking dos Alunos</h2>
          <table className="w-full table-auto rounded-lg overflow-hidden text-sm">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="w-1/6 px-2 py-2 text-left">Pos</th>
                <th className="px-2 py-2 text-left">Nome</th>
                <th className="w-1/6 px-2 py-2 text-left">Pts</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {ranking.map((participante) => (
                <tr key={participante.id} className="border-b border-gray-700 hover:bg-gray-900 transition-colors duration-200">
                  <td className="px-2 py-2 font-semibold">{participante.posicao}</td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      {participante.usuario?.imagem ? (
                        <img src={participante.usuario.imagem} alt={participante.usuario.nome} className="w-7 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                          {participante.usuario?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                        </div>
                      )}
                      <span className="truncate">{participante.usuario?.nome || 'Usuário'}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-blue-500 font-semibold">{participante.pontuacao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ÁREA DE EXERCÍCIO */}
        <div className="flex-1 flex flex-col items-center p-4 overflow-auto space-y-4">
          {/* HEADER DA ÁREA */}
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-lg md:text-xl lg:text-2xl font-normal text-gray-800 text-center">Torneio de Matemática</h1>
            
            <div className="flex gap-2 flex-wrap align-items-center justify-center">
              {[
                { nivel: "Fácil", pts: 5 },
                { nivel: "Médio", pts: 10 },
                { nivel: "Difícil", pts: 20 }
              ].map((item) => (
                <button key={item.nivel} onClick={() => setNivelSelecionado(item.nivel)}
                  className={`px-3 py-1.5 text-xs md:text-sm rounded-full font-semibold transition-all ${
                    nivelSelecionado === item.nivel
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  {item.nivel} • {item.pts} pts
                </button>
              ))}
            </div>
          </div>

          {/* ENUNCIADO */}
          <div className="w-full max-w-4xl bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600 rounded-xl shadow p-4">
            <p className="text-sm md:text-base font-medium text-gray-800">
              {questoes[questaoIndex]?.titulo && <strong>{questoes[questaoIndex].titulo}</strong>}
              {questoes[questaoIndex]?.titulo && <br/>}
              {questoes[questaoIndex]?.descricao}
            </p>
            <div className="mt-2 text-xs text-gray-600">
              Dificuldade: <span className="font-semibold">{questoes[questaoIndex]?.dificuldade.toUpperCase()}</span> • 
              <span className="ml-2 font-semibold">{questoes[questaoIndex]?.pontos} pontos</span>
            </div>
          </div>

          {/* ÁREA DE RESOLUÇÃO */}
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-4 space-y-3">
            {/* TOOLBAR MATEMÁTICA */}
            <div className="flex justify-center gap-1 md:gap-2 flex-wrap border-b pb-3" translate="no">
              {["+", "-", "×", "÷", "√", "(", ")", "²", "³", "=", "π", "°"].map((op) => (
                <button key={op} onClick={() => handleResposta(op)}
                  className="px-2 py-1 text-xs md:text-sm bg-gray-100 hover:bg-blue-100 text-gray-800 rounded-md transition">
                  {op}
                </button>
              ))}
            </div>

            <textarea value={resposta} onChange={(e) => setResposta(e.target.value)}
              className="w-full h-36 resize-none p-3 font-mono text-sm md:text-base bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite aqui sua resolução passo a passo..." />
          </div>

          {/* TEMPORIZADOR */}
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-4">
            <div className="flex justify-between items-center mb-2 text-sm md:text-base font-semibold text-gray-700">
              <span>Tempo restante</span>
              <span className="px-2 py-0.5 rounded bg-gray-100">{formatSeconds(questaoTime)}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
              <div className={`h-full transition-all duration-300 ${questaoTime < 10 ? "bg-red-500" : "bg-blue-600"}`}
                style={{ width: `${(questaoTime / TEMPO_QUESTAO) * 100}%` }} />
            </div>
          </div>

          {/* Botão Executar */}
          <button onClick={executarResposta}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 w-full sm:w-auto sm:min-w-[140px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm md:text-base">Executar</span>
          </button>

          {/* RESULTADO */}
          {resultado && (
            <div className="w-full max-w-4xl bg-white border rounded-xl shadow-md p-3 text-center text-sm md:text-base font-semibold">
              Resultado: {resultado}{" "}
              {pontuacao !== null && <span className="text-blue-600">| {pontuacao} pts</span>}
            </div>
          )}

          {/* BOTÕES MOBILE */}
          <div className="flex flex-col sm:flex-row w-full max-w-5xl justify-between gap-3 mt-4 lg:hidden">
            <button onClick={() => setMostrarRanking(true)} className="flex-1 bg-black hover:bg-gray-900 text-white px-4 py-3 rounded-lg shadow-md text-sm transition-colors flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Ver Ranking
            </button>
            <button onClick={() => setMostrarDados(true)} className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Ver seus Dados
            </button>
          </div>
        </div>

        {/* SIDEBAR DIREITA - INFO USUÁRIO */}
        <div className="hidden lg:flex w-64 bg-white text-gray-800 shadow-lg p-4 overflow-y-auto flex-col items-center space-y-3">
          <div className="flex flex-col items-center mb-3">
            {user?.imagem ? (
              <img src={user.imagem} alt={user.nome} className="w-20 h-20 rounded-full object-cover border-2 border-blue-400 mb-2" />
            ) : (
              <div className="w-20 h-20 rounded-full mb-2 border-2 border-blue-400 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold">
                {user?.nome ? user.nome.split(' ').map(n => n[0]).join('').substring(0, 2) : 'U'}
              </div>
            )}
            <h3 className="text-lg font-bold mt-2">{user?.nome || "Usuário"}</h3>
          </div>
          
          <div className="w-full flex flex-col gap-4 items-center">
            {[
              { valor: userStats?.pontuacao || 0, label: "Pontuação", cor: "#3b82f6", max: 10000 },
              { valor: userStats?.posicao || 0, label: "Posição", cor: "#3b82f6", max: 100 },
              { valor: userStats?.casos_resolvidos || 0, label: "Casos Resolvidos", cor: "#3b82f6", max: 100 }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-blue-200 p-2 flex flex-col items-center gap-1 w-40">
                <div className="w-14 h-14">
                  <CircularProgressbar value={item.valor} maxValue={item.max} text={`${item.valor}`} 
                    styles={buildStyles({ textSize: '18px', textColor: '#333', pathColor: item.cor, trailColor: '#e5e5e5' })} />
                </div>
                <span className="text-xs font-semibold text-center">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* OVERLAY SIDEBAR ESQUERDA (RANKING MOBILE) */}
      <div className={`fixed inset-0 z-50 flex transition-all duration-300 ${mostrarRanking ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${mostrarRanking ? "opacity-100" : "opacity-0"}`} onClick={() => setMostrarRanking(false)} />
        <div className={`relative w-80 bg-black text-white p-4 overflow-y-auto transform transition-transform duration-300 ${mostrarRanking ? "translate-x-0" : "-translate-x-full"}`}>
          <button onClick={() => setMostrarRanking(false)} className="absolute top-2 right-2 text-white text-xl">✕</button>
          <h2 className="text-xl font-bold mb-4 text-center border-b border-gray-700 pb-1">Ranking dos Alunos</h2>
          <table className="w-full table-auto rounded-lg overflow-hidden text-sm">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="w-1/6 px-2 py-2 text-left">Pos</th>
                <th className="px-2 py-2 text-left">Nome</th>
                <th className="w-1/6 px-2 py-2 text-left">Pts</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {ranking.map((participante) => (
                <tr key={participante.id} className="border-b border-gray-700 hover:bg-gray-900 transition-colors duration-200">
                  <td className="px-2 py-2 font-semibold">{participante.posicao}</td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      {participante.usuario?.imagem ? (
                        <img src={participante.usuario.imagem} alt={participante.usuario.nome} className="w-7 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                          {participante.usuario?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                        </div>
                      )}
                      <span className="truncate">{participante.usuario?.nome || 'Usuário'}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-blue-500 font-semibold">{participante.pontuacao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OVERLAY SIDEBAR DIREITA (DADOS USUÁRIO MOBILE) */}
      <div className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${mostrarDados ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${mostrarDados ? "opacity-100" : "opacity-0"}`} onClick={() => setMostrarDados(false)} />
        <div className={`relative w-72 bg-white text-gray-800 p-4 overflow-y-auto transform transition-transform duration-300 ${mostrarDados ? "translate-x-0" : "translate-x-full"}`}>
          <button onClick={() => setMostrarDados(false)} className="absolute top-2 right-2 text-xl">✕</button>
          <div className="flex flex-col items-center mb-3">
            {user?.imagem ? (
              <img src={user.imagem} alt={user.nome} className="w-20 h-20 rounded-full object-cover border-2 border-blue-400 mb-2" />
            ) : (
              <div className="w-20 h-20 rounded-full mb-2 border-2 border-blue-400 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold">
                {user?.nome ? user.nome.split(' ').map(n => n[0]).join('').substring(0, 2) : 'U'}
              </div>
            )}
            <h3 className="text-lg font-bold mt-2">{user?.nome || "Usuário"}</h3>
          </div>
          <div className="w-full flex flex-col mt-10 gap-4 items-center">
            {[
              { valor: userStats?.pontuacao || 0, label: "Pontuação", cor: "#3b82f6", max: 10000 },
              { valor: userStats?.posicao || 0, label: "Posição", cor: "#3b82f6", max: 100 },
              { valor: userStats?.casos_resolvidos || 0, label: "Casos Resolvidos", cor: "#3b82f6", max: 100 }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-blue-200 p-2 flex flex-col items-center gap-1 w-40">
                <div className="w-14 h-14">
                  <CircularProgressbar value={item.valor} maxValue={item.max} text={`${item.valor}`} 
                    styles={buildStyles({ textSize: '18px', textColor: '#333', pathColor: item.cor, trailColor: '#e5e5e5' })} />
                </div>
                <span className="text-xs font-semibold text-center">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}