// ProgramacaoOriginal.jsx - VERSÃO ATUALIZADA
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { FaSignOutAlt, FaCrown, FaUser, FaPlay, FaRedo, FaExpand, FaCompress, FaExclamationTriangle, FaCode } from "react-icons/fa";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import torneioService from "../../../../../BackEnd/services/torneioService";

const TEMPO_QUESTAO = 90;
const DISCIPLINA_TORNEIO = 'Programação';

export default function ProgramacaoOriginal() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { username } = useParams();
  const editorRef = useRef(null);

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
  const [nivelSelecionado, setNivelSelecionado] = useState("facil");
  const [resultado, setResultado] = useState("");
  const [pontuacao, setPontuacao] = useState(null);
  const [enviando, setEnviando] = useState(false);
  
  // Estados de programação
  const [expandido, setExpandido] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [saida, setSaida] = useState("");
  const [executando, setExecutando] = useState(false);
  const [testesPassados, setTestesPassados] = useState(0);
  const [totalTestes, setTotalTestes] = useState(0);
  
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
            mensagem: 'Não há torneios de Programação disponíveis no momento.'
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
          const questoesMock = [
            { 
              id: 1, 
              titulo: "Soma de Dois Números",
              descricao: "Escreva uma função que receba dois números e retorne a soma deles.",
              dificuldade: 'facil',
              pontos: 10,
              linguagem: 'javascript',
              codigoInicial: "function soma(a, b) {\n  // Sua solução aqui\n  return a + b;\n}\n\n// Teste sua função\nconsole.log(soma(2, 3)); // Deve retornar 5\nconsole.log(soma(-1, 1)); // Deve retornar 0",
              testes: [
                { entrada: "soma(2, 3)", saidaEsperada: "5" },
                { entrada: "soma(-1, 1)", saidaEsperada: "0" },
                { entrada: "soma(10, 20)", saidaEsperada: "30" }
              ]
            },
            { 
              id: 2, 
              titulo: "Fatorial",
              descricao: "Implemente uma função que calcule o fatorial de um número inteiro positivo.",
              dificuldade: 'medio',
              pontos: 15,
              linguagem: 'javascript',
              codigoInicial: "function fatorial(n) {\n  // Sua solução aqui\n}\n\n// Teste sua função\nconsole.log(fatorial(5)); // Deve retornar 120\nconsole.log(fatorial(0)); // Deve retornar 1",
              testes: [
                { entrada: "fatorial(5)", saidaEsperada: "120" },
                { entrada: "fatorial(0)", saidaEsperada: "1" },
                { entrada: "fatorial(3)", saidaEsperada: "6" }
              ]
            },
            { 
              id: 3, 
              titulo: "Fibonacci",
              descricao: "Implemente uma função recursiva para calcular o n-ésimo termo da sequência de Fibonacci.",
              dificuldade: 'dificil',
              pontos: 20,
              linguagem: 'javascript',
              codigoInicial: "function fibonacci(n) {\n  // Sua solução aqui\n}\n\n// Teste sua função\nconsole.log(fibonacci(6)); // Deve retornar 8\nconsole.log(fibonacci(10)); // Deve retornar 55",
              testes: [
                { entrada: "fibonacci(6)", saidaEsperada: "8" },
                { entrada: "fibonacci(10)", saidaEsperada: "55" },
                { entrada: "fibonacci(1)", saidaEsperada: "1" }
              ]
            }
          ];
          setQuestoes(questoesMock);
          if (questoesMock.length > 0) {
            setCodigo(questoesMock[0].codigoInicial);
            setTotalTestes(questoesMock[0].testes.length);
          }
        } else {
          setQuestoes(questoesData);
          if (questoesData.length > 0) {
            setCodigo(questoesData[0].codigoInicial || "// Escreva seu código aqui...");
            setTotalTestes(questoesData[0].testes?.length || 0);
          }
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

  // Atualiza o código quando muda a questão
  useEffect(() => {
    if (questoes[questaoIndex]) {
      setCodigo(questoes[questaoIndex].codigoInicial || "// Escreva seu código aqui...");
      setSaida("");
      setResultado("");
      setPontuacao(null);
      setExecutando(false);
      setTestesPassados(0);
      setTotalTestes(questoes[questaoIndex].testes?.length || 0);
    }
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

  const handleNextQuestao = () => {
    if (questoes.length > 0) {
      setQuestaoIndex(prev => (prev + 1 < questoes.length ? prev + 1 : 0));
    }
    setQuestaoTime(TEMPO_QUESTAO);
    setExecutando(false);
  };

  const resetarCodigo = () => {
    setCodigo(questoes[questaoIndex]?.codigoInicial || "// Escreva seu código aqui...");
    setSaida("");
    setResultado("");
    setPontuacao(null);
    setTestesPassados(0);
  };

  const executarCodigo = () => {
    setExecutando(true);
    setSaida("Executando código...\n");
    
    // Simulação da execução do código
    setTimeout(() => {
      const questaoAtual = questoes[questaoIndex];
      let passou = 0;
      let output = "Resultados dos testes:\n\n";
      
      // Simulação de testes
      questaoAtual.testes?.forEach((teste, index) => {
        output += `Teste ${index + 1}: ${teste.entrada}\n`;
        
        // Simulação de resultados baseada na dificuldade
        const dificuldade = questaoAtual.dificuldade;
        let chanceAcerto = 0.7; // Padrão 70%
        
        if (dificuldade === 'facil') chanceAcerto = 0.9;
        else if (dificuldade === 'medio') chanceAcerto = 0.7;
        else chanceAcerto = 0.5;
        
        const acertou = Math.random() < chanceAcerto;
        
        if (acertou) {
          output += `  ✅ Saída: ${teste.saidaEsperada}\n`;
          output += `  ✅ Teste passou!\n\n`;
          passou++;
        } else {
          output += `  ❌ Saída esperada: ${teste.saidaEsperada}\n`;
          output += `  ❌ Teste falhou!\n\n`;
        }
      });
      
      output += `\n${passou} de ${questaoAtual.testes?.length || 0} testes passaram.`;
      
      setSaida(output);
      setTestesPassados(passou);
      
      // Calcula pontuação baseada nos testes passados
      const percentual = questaoAtual.testes?.length ? (passou / questaoAtual.testes.length) * 100 : 0;
      let pontuacaoCalculada = 0;
      let resultadoTexto = "";
      
      if (percentual === 100) {
        pontuacaoCalculada = questaoAtual.pontos || 10;
        resultadoTexto = "Perfeito! Todos os testes passaram!";
      } else if (percentual >= 70) {
        pontuacaoCalculada = Math.floor((questaoAtual.pontos || 10) * 0.7);
        resultadoTexto = "Bom! A maioria dos testes passou.";
      } else if (percentual >= 40) {
        pontuacaoCalculada = Math.floor((questaoAtual.pontos || 10) * 0.4);
        resultadoTexto = "Razoável. Alguns testes passaram.";
      } else {
        pontuacaoCalculada = Math.floor((questaoAtual.pontos || 10) * 0.1);
        resultadoTexto = "Precisa melhorar. Poucos testes passaram.";
      }
      
      setPontuacao(pontuacaoCalculada);
      setResultado(resultadoTexto);
      setExecutando(false);
    }, 2000);
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

  // 5. RANKING DINÂMICO
  const rankingOrdenado = [...ranking].sort((a, b) => b.pontuacao - a.pontuacao);
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
              {torneio?.titulo || 'Torneio de Programação'}
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
            <FaCode className="text-green-400" />
            <h2 className="text-xl font-bold">Ranking Programação</h2>
          </div>
          
          {rankingComPosicoes.length > 0 ? (
            <table className="w-full table-auto text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="w-1/6 px-2 py-2 text-left">Pos</th>
                  <th className="px-2 py-2 text-left">Nome</th>
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

        {/* ÁREA DE EXERCÍCIO - COMPILADOR DE PROGRAMAÇÃO */}
        <div className="flex-1 flex flex-col items-center p-4 overflow-auto space-y-4">
          {/* HEADER DA ÁREA */}
          <div className="w-full max-w-6xl bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-lg md:text-xl lg:text-2xl font-normal text-gray-800 text-center">
              {torneio?.titulo || 'Torneio de Programação'}
            </h1>
            
            {/* NÍVEIS DINÂMICOS */}
            <div className="flex gap-2 flex-wrap justify-center">
              {[
                { nivel: "Fácil", pts: 10 },
                { nivel: "Médio", pts: 15 },
                { nivel: "Difícil", pts: 20 }
              ].map((item) => (
                <button
                  key={item.nivel}
                  onClick={() => setNivelSelecionado(item.nivel)}
                  className={`px-4 py-1.5 text-xs md:text-sm rounded-full font-semibold transition-all ${
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
            <div className="w-full max-w-6xl bg-gradient-to-r from-indigo-50 to-blue-100 border-l-4 border-blue-600 rounded-xl shadow p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-700 mb-2">
                    {questoes[questaoIndex]?.titulo || 'Desafio de Programação'}
                  </h3>
                  <p className="text-sm md:text-base text-gray-800">
                    {questoes[questaoIndex]?.descricao || 'Carregando descrição...'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-200 text-blue-800">
                    Questão {questaoIndex + 1}/{questoes.length}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-200 text-purple-800">
                    {questoes[questaoIndex]?.linguagem?.toUpperCase() || 'JAVASCRIPT'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs mt-2">
                <span className="bg-white px-3 py-1 rounded-full shadow-sm">
                  <strong>Testes:</strong> {testesPassados}/{totalTestes}
                </span>
                <span className="bg-white px-3 py-1 rounded-full shadow-sm">
                  <strong>Dificuldade:</strong> {questoes[questaoIndex]?.dificuldade?.toUpperCase() || 'MÉDIO'}
                </span>
                <span className="bg-white px-3 py-1 rounded-full shadow-sm">
                  <strong>Pontos:</strong> {questoes[questaoIndex]?.pontos || 10}
                </span>
              </div>
            </div>
          )}

          {/* EDITOR + SAÍDA */}
          <div className={`w-full max-w-6xl grid ${expandido ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"} gap-4`}>
            {/* EDITOR */}
            <div className={`bg-white rounded-xl shadow-md p-3 flex flex-col ${expandido ? "col-span-1 min-h-[80vh]" : "min-h-[350px]"}`}>
              <div className="flex items-center justify-between mb-2 border-b pb-2">
                <div className="flex items-center gap-2">
                  <FaCode className="text-blue-600" />
                  <h3 className="font-semibold text-gray-700">Editor de Código</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={resetarCodigo} 
                    className="flex items-center gap-1 text-xs px-3 py-1 rounded-md bg-gray-100 hover:bg-red-100 text-gray-700 transition"
                  >
                    <FaRedo /> Resetar
                  </button>
                  <button 
                    onClick={() => setExpandido(!expandido)} 
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-blue-100 text-gray-700 transition"
                  >
                    {expandido ? <FaCompress /> : <FaExpand />}
                  </button>
                </div>
              </div>
              <textarea
                ref={editorRef}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="flex-1 w-full font-mono text-sm bg-gray-50 border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                spellCheck="false"
                placeholder="// Escreva seu código aqui..."
              />
            </div>

            {/* SAÍDA */}
            {!expandido && (
              <div className="bg-white rounded-xl shadow-md p-3 flex flex-col min-h-[350px]">
                <div className="flex items-center justify-between mb-2 border-b pb-2">
                  <h3 className="font-semibold text-gray-700">Saída do Programa</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
                    {executando ? "Executando..." : "Pronto"}
                  </span>
                </div>
                <pre className="flex-1 bg-black rounded-lg p-3 overflow-auto text-green-400 font-mono text-sm">
                  <code className="whitespace-pre-wrap break-words">
                    {saida || "A saída do seu código aparecerá aqui..."}
                  </code>
                </pre>
                <div className="mt-2 text-xs text-gray-500">
                  Linguagem: JavaScript (Node.js) • Testes realizados: {testesPassados}/{totalTestes}
                </div>
              </div>
            )}
          </div>

          {/* TEMPORIZADOR DA QUESTÃO */}
          <div className="w-full max-w-6xl bg-white rounded-xl shadow-md p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700">Tempo restante para esta questão</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                questaoTime < 10 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
              }`}>
                {formatSeconds(questaoTime)}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-300 ${
                questaoTime < 10 ? "bg-red-500" : "bg-blue-600"
              }`}
                style={{ width: `${(questaoTime / TEMPO_QUESTAO) * 100}%` }} />
            </div>
          </div>

          {/* BOTÃO EXECUTAR */}
          <div className="w-full max-w-6xl">
            <button
              onClick={executarCodigo}
              disabled={executando}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
                executando
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
              }`}
            >
              <FaPlay />
              {executando ? "Executando..." : "Executar Código"}
            </button>
          </div>

          {/* RESULTADO / AVALIAÇÃO */}
          {resultado && (
            <div className="w-full max-w-6xl bg-white border rounded-xl shadow-md p-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Resultado da Execução</h3>
                    <p className="text-sm text-gray-600">{resultado}</p>
                  </div>
                </div>
                {pontuacao !== null && (
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-green-700">{pontuacao} pts</span>
                    <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                      {testesPassados}/{totalTestes} testes
                    </span>
                  </div>
                )}
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
                label: "Desafios Resolvidos", 
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
            <FaCode className="text-green-400" />
            <h2 className="text-xl font-bold">Ranking Programação</h2>
          </div>
          
          {rankingComPosicoes.length > 0 ? (
            <table className="w-full table-auto text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="w-1/6 px-2 py-2 text-left">Pos</th>
                  <th className="px-2 py-2 text-left">Nome</th>
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
                label: "Desafios Resolvidos", 
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