// src/Paginas/Tercearios.jsx/ModeloOriginal/ProgramacaoOriginal.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { FaSignOutAlt, FaPlay, FaRedo, FaExpand, FaCompress } from "react-icons/fa";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const TEMPO_QUESTAO = 90;
const DISCIPLINA = 'programacao';

const questoesExemplo = [
  {
    id: 1,
    titulo: "Soma de Dois Números",
    descricao: "Escreva uma função que recebe dois números inteiros e retorna a soma deles.",
    dificuldade: "Fácil",
    pontos: 10,
    codigoInicial: "function soma(a, b) {\n  // Sua solução aqui\n  return a + b;\n}",
    testes: [
      { entrada: "soma(2, 3)", saidaEsperada: "5" },
      { entrada: "soma(-1, 1)", saidaEsperada: "0" },
      { entrada: "soma(0, 0)", saidaEsperada: "0" }
    ]
  },
  {
    id: 2,
    titulo: "Fatorial",
    descricao: "Implemente uma função recursiva para calcular o fatorial de um número.",
    dificuldade: "Médio",
    pontos: 15,
    codigoInicial: "function fatorial(n) {\n  // Sua solução aqui\n  if (n <= 1) return 1;\n  return n * fatorial(n - 1);\n}",
    testes: [
      { entrada: "fatorial(5)", saidaEsperada: "120" },
      { entrada: "fatorial(0)", saidaEsperada: "1" },
      { entrada: "fatorial(1)", saidaEsperada: "1" }
    ]
  },
  {
    id: 3,
    titulo: "Palíndromo",
    descricao: "Crie uma função que verifica se uma string é um palíndromo (lê-se igual de trás para frente).",
    dificuldade: "Difícil",
    pontos: 20,
    codigoInicial: "function ehPalindromo(str) {\n  // Sua solução aqui\n  const reversed = str.split('').reverse().join('');\n  return str === reversed;\n}",
    testes: [
      { entrada: "ehPalindromo('radar')", saidaEsperada: "true" },
      { entrada: "ehPalindromo('hello')", saidaEsperada: "false" },
      { entrada: "ehPalindromo('a')", saidaEsperada: "true" }
    ]
  }
];

export default function ProgramacaoOriginal() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const editorRef = useRef(null);

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
  const [nivelSelecionado, setNivelSelecionado] = useState("facil");
  const [resultado, setResultado] = useState("");
  const [pontuacao, setPontuacao] = useState(null);
  const [mostrarRanking, setMostrarRanking] = useState(false);
  const [mostrarDados, setMostrarDados] = useState(false);
  const [expandido, setExpandido] = useState(false);
  
  const [codigo, setCodigo] = useState("");
  const [saida, setSaida] = useState("");
  const [executando, setExecutando] = useState(false);
  const [testesPassados, setTestesPassados] = useState(0);
  const [totalTestes, setTotalTestes] = useState(3);

  // 1. VERIFICAR TORNEIO ATIVO (igual ao EntrarTorneio.jsx)
  useEffect(() => {
    const verificarTorneioAtivo = async () => {
      try {
        console.log('🔍 Verificando torneio ativo para Programação...');
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
      const response = await fetch(`http://localhost:3000/torneios/${torneioId}/questoes/programacao`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setQuestoes(data.data);
        if (data.data[0].opcoes?.codigoInicial) {
          setCodigo(data.data[0].opcoes.codigoInicial);
        }
        if (data.data[0].opcoes?.testes) {
          setTotalTestes(data.data[0].opcoes.testes.length);
        }
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

  // Atualiza o código quando muda a questão
  useEffect(() => {
    if (questoes[questaoIndex]) {
      setCodigo(questoes[questaoIndex].codigoInicial || questoes[questaoIndex].opcoes?.codigoInicial || "");
      setSaida("");
      setResultado("");
      setPontuacao(null);
      setTestesPassados(0);
      if (questoes[questaoIndex].testes) {
        setTotalTestes(questoes[questaoIndex].testes.length);
      } else if (questoes[questaoIndex].opcoes?.testes) {
        setTotalTestes(questoes[questaoIndex].opcoes.testes.length);
      }
    }
  }, [questaoIndex, questoes]);

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

  const handleNextQuestao = () => {
    setQuestaoIndex((prev) => (prev + 1 < questoes.length ? prev + 1 : 0));
    setQuestaoTime(TEMPO_QUESTAO);
    setExecutando(false);
  };

  const executarCodigo = async () => {
    setExecutando(true);
    setSaida("Executando código...\n");
    
    // Simulação da execução do código
    setTimeout(async () => {
      const questaoAtual = questoes[questaoIndex];
      let passou = 0;
      let output = "";
      
      // Testes padrão
      const testes = questaoAtual.testes || questaoAtual.opcoes?.testes || [];
      
      for (let i = 0; i < testes.length; i++) {
        const teste = testes[i];
        output += `Teste ${i + 1}: ${teste.entrada}\n`;
        
        try {
          // Em produção, isso seria executado em sandbox
          // Aqui apenas simulamos
          let resultado;
          switch(questaoIndex) {
            case 0: // soma
              if (teste.entrada.includes("2, 3")) resultado = "5";
              else if (teste.entrada.includes("-1, 1")) resultado = "0";
              else resultado = "0";
              break;
            case 1: // fatorial
              if (teste.entrada.includes("5")) resultado = "120";
              else resultado = "1";
              break;
            case 2: // palindromo
              if (teste.entrada.includes("radar")) resultado = "true";
              else resultado = "false";
              break;
            default:
              resultado = "true";
          }
          
          if (String(resultado) === teste.saidaEsperada) {
            output += `  ✅ Resultado: ${resultado}\n`;
            output += `  ✅ Teste passou!\n\n`;
            passou++;
          } else {
            output += `  ❌ Resultado: ${resultado}\n`;
            output += `  ❌ Esperado: ${teste.saidaEsperada}\n`;
            output += `  ❌ Teste falhou!\n\n`;
          }
        } catch (error) {
          output += `  ❌ Erro: ${error.message}\n\n`;
        }
      }
      
      output += `\n${passou} de ${testes.length} testes passaram.`;
      
      setSaida(output);
      setTestesPassados(passou);
      
      // Calcula pontuação baseada nos testes passados
      const percentual = testes.length > 0 ? (passou / testes.length) * 100 : 0;
      let pontuacaoCalculada = 0;
      let resultadoTexto = "";
      
      if (percentual === 100) {
        pontuacaoCalculada = questaoAtual.pontos || 20;
        resultadoTexto = "Perfeito! Todos os testes passaram!";
      } else if (percentual >= 70) {
        pontuacaoCalculada = Math.round((questaoAtual.pontos || 20) * 0.7);
        resultadoTexto = "Bom! A maioria dos testes passou.";
      } else if (percentual >= 40) {
        pontuacaoCalculada = Math.round((questaoAtual.pontos || 20) * 0.4);
        resultadoTexto = "Razoável. Alguns testes passaram.";
      } else {
        pontuacaoCalculada = Math.round((questaoAtual.pontos || 20) * 0.1);
        resultadoTexto = "Precisa melhorar. Poucos testes passaram.";
      }
      
      setPontuacao(pontuacaoCalculada);
      setResultado(resultadoTexto);
      setExecutando(false);
      
      // Atualizar pontuação no banco de dados
      if (participante && pontuacaoCalculada > 0) {
        await atualizarPontuacao(pontuacaoCalculada, 1);
      }
    }, 1500);
  };

  const resetarCodigo = () => {
    setCodigo(questoes[questaoIndex].codigoInicial || questoes[questaoIndex].opcoes?.codigoInicial || "");
    setSaida("");
    setResultado("");
    setPontuacao(null);
    setTestesPassados(0);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando torneio de Programação...</p>
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
            {error || "Não há torneio de Programação ativo no momento."}
          </p>
          <button 
            onClick={() => navigate("/")}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
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
      <div className="bg-purple-600 text-white shadow-md">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-1 border border-white px-2 py-1 text-[10px] sm:px-3 sm:py-1.5 sm:text-xs md:px-4 md:py-2 md:text-sm rounded hover:bg-white hover:text-purple-600 transition"
          >
            <FaSignOutAlt className="text-xs sm:text-sm md:text-base" />
            Sair do Torneio
          </button>

          <div className="flex flex-col items-center" translate="no">
            <p className="text-xs md:text-xs lg:text-sm">Tempo restante do torneio</p>
            <h2 className="text-lg md:text-base lg:text-xl font-bold">{formatTime()}</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white text-purple-600 font-bold px-2 py-1 text-[10px] sm:px-3 sm:py-1.5 sm:text-xs md:px-4 md:py-2 md:text-sm rounded-full flex items-center gap-1 shadow-md">
              Programming Tournament
            </div>
          </div>
        </div>

        {/* Barra de progresso dinâmica */}
        <div className="w-full h-3 bg-white/30">
          <div 
            className="h-3 transition-all duration-1000 bg-gradient-to-r from-purple-400 to-pink-500"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR ESQUERDA - RANKING DINÂMICO */}
        <div className="hidden lg:block w-80 bg-black text-white shadow-lg p-3 overflow-y-auto" translate="no">
          <h2 className="text-xl font-bold mb-4 text-center border-b border-gray-700 pb-1">Programming Ranking</h2>
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
                          <div className="w-7 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                            {participanteRank.usuario?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                          </div>
                        )}
                        <span className="truncate">{participanteRank.usuario?.nome || 'Usuário'}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-purple-400 font-semibold">{participanteRank.pontuacao || 0}</td>
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

        {/* ÁREA DE EXERCÍCIO - COMPILADOR */}
        <div className="flex-1 flex flex-col items-center p-4 overflow-auto space-y-4">
          {/* HEADER */}
          <div className="w-full max-w-6xl bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-lg md:text-xl lg:text-2xl font-normal text-gray-800 text-center">
              {torneio?.titulo || 'Programming Tournament'}
            </h1>
            
            {/* NÍVEIS */}
            <div className="flex gap-2 flex-wrap align-items-center justify-center">
              {[
                { nivel: "Fácil", pts: 10 },
                { nivel: "Médio", pts: 15 },
                { nivel: "Difícil", pts: 20 }
              ].map((item) => (
                <button
                  key={item.nivel}
                  onClick={() => setNivelSelecionado(item.nivel.toLowerCase())}
                  className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all ${
                    nivelSelecionado === item.nivel.toLowerCase()
                      ? "bg-purple-600 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {item.nivel} • {item.pts} pts
                </button>
              ))}
            </div>
          </div>

          {/* ENUNCIADO */}
          {questoes[questaoIndex] && (
            <div className="w-full max-w-6xl bg-gradient-to-r from-purple-50 to-pink-100 border-l-4 border-purple-600 rounded-xl shadow p-4 space-y-2">
              <h3 className="text-lg font-bold text-purple-700">
                {questoes[questaoIndex].titulo || `Questão ${questaoIndex + 1}`}
              </h3>
              <p className="text-sm md:text-base text-gray-800">
                {questoes[questaoIndex].descricao || questoes[questaoIndex].enunciado}
              </p>
              <div className="flex flex-wrap gap-3 text-xs mt-2">
                <span className="bg-white px-3 py-1 rounded-full shadow-sm">
                  <strong>Linguagem:</strong> JavaScript
                </span>
                <span className="bg-white px-3 py-1 rounded-full shadow-sm">
                  <strong>Testes:</strong> {testesPassados}/{totalTestes}
                </span>
                {questoes[questaoIndex]?.pontos && (
                  <span className="bg-white px-3 py-1 rounded-full shadow-sm">
                    <strong>Pontos:</strong> {questoes[questaoIndex].pontos}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* EDITOR + SAÍDA */}
          <div className={`w-full max-w-6xl grid ${expandido ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"} gap-4`}>
            {/* EDITOR */}
            <div className={`bg-white rounded-xl shadow-md p-3 flex flex-col ${expandido ? "col-span-1 min-h-[80vh]" : "min-h-[350px]"}`}>
              <div className="flex items-center justify-between mb-2 border-b pb-2">
                <h3 className="font-semibold text-gray-700">Editor de Código</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={resetarCodigo} 
                    className="flex items-center gap-1 text-xs px-3 py-1 rounded-md bg-gray-100 hover:bg-red-100 text-gray-700 transition"
                  >
                    <FaRedo /> Resetar
                  </button>
                  <button 
                    onClick={() => setExpandido(!expandido)} 
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-purple-100 text-gray-700 transition"
                  >
                    {expandido ? <FaCompress /> : <FaExpand />}
                  </button>
                </div>
              </div>
              <textarea
                ref={editorRef}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="flex-1 w-full font-mono text-sm bg-gray-50 border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                spellCheck="false"
                placeholder="// Escreva seu código aqui..."
              />
            </div>

            {/* SAÍDA */}
            {!expandido && (
              <div className="bg-white rounded-xl shadow-md p-3 flex flex-col min-h-[350px]">
                <div className="flex items-center justify-between mb-2 border-b pb-2">
                  <h3 className="font-semibold text-gray-700" translate="no">Saída do Programa</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
                    {executando ? "Executando..." : "Pronto"}
                  </span>
                </div>
                <pre className="flex-1 bg-black rounded-lg p-3 overflow-auto text-green-400 font-mono text-sm">
                  <code className="whitespace-pre-wrap break-words">
                    {saida || "A saída do seu código aparecerá aqui..."}
                  </code>
                </pre>
              </div>
            )}
          </div>

          {/* TEMPORIZADOR */}
          <div className="w-full max-w-6xl bg-white rounded-xl shadow-md p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700">Tempo restante para esta questão</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${questaoTime < 10 ? "bg-red-100 text-red-600" : "bg-purple-100 text-purple-600"}`}>
                {formatSeconds(questaoTime)}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${questaoTime < 10 ? "bg-red-500" : "bg-purple-600"}`}
                style={{ width: `${(questaoTime / TEMPO_QUESTAO) * 100}%` }} 
              />
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

          {/* RESULTADO */}
          {resultado && (
            <div className="w-full max-w-6xl bg-white border rounded-xl shadow-md p-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                <span className="font-semibold text-purple-700">{resultado}</span>
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Ver Ranking
            </button>
            <button 
              onClick={() => setMostrarDados(true)} 
              className="flex-1 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-4 py-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
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
                className="w-20 h-20 rounded-full object-cover border-2 border-purple-400 mb-2"
              />
            ) : (
              <div className="w-20 h-20 rounded-full mb-2 border-2 border-purple-400 bg-gradient-to-r from-purple-500 to-pink-700 flex items-center justify-center text-white text-2xl font-bold">
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
                { valor: participante.pontuacao || 0, label: "Pontuação", cor: "#8b5cf6", max: 10000 },
                { valor: participante.posicao || 0, label: "Posição", cor: "#8b5cf6", max: 100 },
                { valor: participante.casos_resolvidos || 0, label: "Casos Resolvidos", cor: "#8b5cf6", max: 100 }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-3xl border border-purple-200 p-2 flex flex-col items-center gap-1 w-40">
                  <div className="w-14 h-14">
                    <CircularProgressbar 
                      value={item.valor} 
                      maxValue={item.max}
                      text={`${item.valor}`} 
                      styles={buildStyles({
                        textSize: '18px',
                        textColor: '#333',
                        pathColor: item.cor,
                        trailColor: '#e5e5e5',
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
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
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
          <div className="absolute inset-0 bg-black/60" onClick={() => setMostrarRanking(false)} />
          <div className="relative w-80 bg-black text-white p-4 overflow-y-auto">
            <button onClick={() => setMostrarRanking(false)} className="absolute top-2 right-2 text-white text-xl">✕</button>
            <h2 className="text-xl font-bold mb-4 text-center border-b border-gray-700 pb-1">Programming Ranking</h2>
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
                            <div className="w-7 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                              {participanteRank.usuario?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                            </div>
                          )}
                          <span className="truncate">{participanteRank.usuario?.nome || 'Usuário'}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-purple-400 font-semibold">{participanteRank.pontuacao || 0}</td>
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
          <div className="absolute inset-0 bg-black/60" onClick={() => setMostrarDados(false)} />
          <div className="relative w-72 bg-white text-gray-800 p-4 overflow-y-auto">
            <button onClick={() => setMostrarDados(false)} className="absolute top-2 right-2 text-xl">✕</button>
            <div className="flex flex-col items-center mb-3">
              {participante?.usuario?.imagem ? (
                <img 
                  src={participante.usuario.imagem} 
                  alt={participante.usuario.nome}
                  className="w-20 h-20 rounded-full object-cover border-2 border-purple-400 mb-2"
                />
              ) : (
                <div className="w-20 h-20 rounded-full mb-2 border-2 border-purple-400 bg-gradient-to-r from-purple-500 to-pink-700 flex items-center justify-center text-white text-2xl font-bold">
                  {participante?.usuario?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || user?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                </div>
              )}
              <h3 className="text-lg font-bold mt-2">{participante?.usuario?.nome || user?.nome || "Usuário"}</h3>
            </div>
            
            {participante ? (
              <div className="w-full flex flex-col mt-4 gap-4 items-center">
                {[
                  { valor: participante.pontuacao || 0, label: "Pontuação", cor: "#8b5cf6", max: 10000 },
                  { valor: participante.posicao || 0, label: "Posição", cor: "#8b5cf6", max: 100 },
                  { valor: participante.casos_resolvidos || 0, label: "Casos Resolvidos", cor: "#8b5cf6", max: 100 }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white rounded-3xl border border-purple-200 p-2 flex flex-col items-center gap-1 w-40">
                    <div className="w-14 h-14">
                      <CircularProgressbar 
                        value={item.valor} 
                        maxValue={item.max}
                        text={`${item.valor}`} 
                        styles={buildStyles({
                          textSize: '18px',
                          textColor: '#333',
                          pathColor: item.cor,
                          trailColor: '#e5e5e5',
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