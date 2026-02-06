// Torneios.jsx - VERSÃO ATUALIZADA
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { ChevronDown, Users, Trophy, Clock, AlertCircle, Play, BookOpen, Code, Calculator } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import torneioService from '../../../../BackEnd/services/torneioService';

const Torneios = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [activeDiscipline, setActiveDiscipline] = useState('matemática');
  const [torneios, setTorneios] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTorneio, setSelectedTorneio] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info'); // 'info', 'success', 'error'
  const [joining, setJoining] = useState(false);

  const disciplinas = [
    { 
      id: 'matemática', 
      label: 'Matemática', 
      color: 'bg-blue-500',
      icon: <Calculator className="w-5 h-5" />
    },
    { 
      id: 'inglês', 
      label: 'Inglês', 
      color: 'bg-green-500',
      icon: <BookOpen className="w-5 h-5" />
    },
    { 
      id: 'programação', 
      label: 'Programação', 
      color: 'bg-purple-500',
      icon: <Code className="w-5 h-5" />
    }
  ];

  useEffect(() => {
    const fetchTorneos = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        // 1. Verificar torneios ativos para a disciplina selecionada
        const torneioData = await torneioService.verificarTorneioAtivo(
          activeDiscipline.charAt(0).toUpperCase() + activeDiscipline.slice(1)
        );
        
        if (!torneioData) {
          setTorneios([]);
          setSelectedTorneio(null);
          setRanking([]);
          setUserStats(null);
          setLoading(false);
          return;
        }

        // 2. Configurar dados do torneio
        const torneioAtivo = torneioData.torneio;
        setTorneios([torneioAtivo]);
        setSelectedTorneio(torneioAtivo);

        // 3. Buscar ranking do torneio
        const rankingData = await torneioService.obterRanking(torneioAtivo.id);
        setRanking(rankingData);

        // 4. Buscar dados do usuário neste torneio
        const userData = await torneioService.obterDadosParticipante(torneioAtivo.id, user.id);
        
        if (userData) {
          setUserStats({
            pontuacao: userData.pontuacao || 0,
            posicao: userData.posicao || 0,
            casos_resolvidos: userData.casos_resolvidos || 0,
            disciplina_competida: userData.disciplina_competida
          });
        } else {
          setUserStats(null);
        }

      } catch (error) {
        console.error('Erro ao buscar torneios:', error);
        setModalMessage('Erro ao carregar dados do torneio. Tente novamente.');
        setModalType('error');
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTorneos();
  }, [activeDiscipline, user?.id]);

  const handleJoinTorneio = async () => {
    if (!selectedTorneio || !user?.id) return;
    
    setJoining(true);
    
    try {
      // 3. REGISTRAR PARTICIPANTE NA TABELA participantes_torneio
      const response = await torneioService.registrarParticipante(
        selectedTorneio.id,
        user.id,
        activeDiscipline.charAt(0).toUpperCase() + activeDiscipline.slice(1)
      );

      if (response.success) {
        // Atualizar dados do usuário
        if (response.data) {
          setUserStats({
            pontuacao: response.data.pontuacao || 0,
            posicao: response.data.posicao || 0,
            casos_resolvidos: response.data.casos_resolvidos || 0,
            disciplina_competida: response.data.disciplina_competida
          });
        }
        
        // Atualizar ranking
        const rankingData = await torneioService.obterRanking(selectedTorneio.id);
        setRanking(rankingData);
        
        // Mostrar mensagem de sucesso
        setModalMessage(`Parabéns! Você entrou no torneio de ${activeDiscipline}.`);
        setModalType('success');
        setShowModal(true);
        
        // Redirecionar para o torneio após 2 segundos
        setTimeout(() => {
          const routeMap = {
            'matemática': '/matematica-original',
            'inglês': '/ingles-original',
            'programação': '/programacao-original'
          };
          
          const route = routeMap[activeDiscipline];
          if (route) {
            navigate(`${route}/${user.nome || 'usuario'}`);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao entrar no torneio:', error);
      
      if (error.response?.status === 409) {
        // Usuário já está registrado
        setModalMessage('Você já está participando deste torneio!');
        setModalType('info');
      } else {
        setModalMessage('Erro ao entrar no torneio. Tente novamente.');
        setModalType('error');
      }
      setShowModal(true);
    } finally {
      setJoining(false);
    }
  };

  const calculateProgress = () => {
    if (!userStats) return 0;
    const maxCasos = 100;
    return (userStats.casos_resolvidos / maxCasos) * 100;
  };

  const getDisciplinaColor = (disciplina) => {
    switch(disciplina) {
      case 'Matemática': return '#3b82f6';
      case 'Inglês': return '#10b981';
      case 'Programação': return '#a855f7';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Não definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Torneios COMAES</h1>
        <p className="text-gray-300">Participe de torneios e compete com outros usuários</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar de Disciplinas */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-6 sticky top-8">
            <h2 className="text-xl font-semibold mb-4">Disciplinas</h2>
            <div className="space-y-3">
              {disciplinas.map(disciplina => (
                <button
                  key={disciplina.id}
                  onClick={() => setActiveDiscipline(disciplina.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                    activeDiscipline === disciplina.id
                      ? `${disciplina.color} text-white font-semibold`
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {disciplina.icon}
                  {disciplina.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Torneio Info */}
          {selectedTorneio ? (
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{selectedTorneio.titulo}</h3>
                  <p className="text-gray-300 text-sm mt-1">{selectedTorneio.descricao}</p>
                </div>
                <Trophy className="w-12 h-12 text-yellow-400" />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-900 rounded p-4">
                  <Clock className="w-5 h-5 mb-2 text-blue-400" />
                  <p className="text-sm text-gray-400">Início</p>
                  <p className="font-semibold">{formatDate(selectedTorneio.inicia_em)}</p>
                </div>
                <div className="bg-gray-900 rounded p-4">
                  <Clock className="w-5 h-5 mb-2 text-green-400" />
                  <p className="text-sm text-gray-400">Término</p>
                  <p className="font-semibold">{formatDate(selectedTorneio.termina_em)}</p>
                </div>
                <div className="bg-gray-900 rounded p-4">
                  <Users className="w-5 h-5 mb-2 text-purple-400" />
                  <p className="text-sm text-gray-400">Participantes</p>
                  <p className="font-semibold">{ranking.length}</p>
                </div>
              </div>

              {!userStats && (
                <button
                  onClick={handleJoinTorneio}
                  disabled={joining}
                  className={`w-full ${joining ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2`}
                >
                  {joining ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Entrando...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Entrar no Torneio
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Nenhum Torneio Disponível</h3>
              <p className="text-gray-300">
                Não há torneios ativos de {activeDiscipline} no momento.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Volte mais tarde ou verifique outras disciplinas.
              </p>
            </div>
          )}

          {/* User Progress */}
          {userStats && selectedTorneio && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="text-xl font-semibold mb-4">Seu Progresso</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24">
                    <CircularProgressbar
                      value={calculateProgress()}
                      text={`${Math.round(calculateProgress())}%`}
                      styles={buildStyles({
                        rotation: 0.25,
                        strokeLinecap: 'round',
                        textSize: '16px',
                        pathTransitionDuration: 0.5,
                        pathColor: getDisciplinaColor(userStats.disciplina_competida),
                        textColor: '#fff',
                        trailColor: '#4b5563',
                        backgroundColor: '#3b82f6',
                      })}
                    />
                  </div>
                  <p className="text-gray-400 text-sm mt-2">Progresso</p>
                </div>

                <div className="flex flex-col justify-center items-center bg-gray-700 rounded p-4">
                  <p className="text-3xl font-bold text-green-400">{userStats.casos_resolvidos}</p>
                  <p className="text-gray-400 text-sm mt-1">Casos Resolvidos</p>
                </div>

                <div className="flex flex-col justify-center items-center bg-gray-700 rounded p-4">
                  <p className="text-3xl font-bold text-yellow-400">#{userStats.posicao}</p>
                  <p className="text-gray-400 text-sm mt-1">Posição no Ranking</p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    const routeMap = {
                      'Matemática': '/matematica-original',
                      'Inglês': '/ingles-original',
                      'Programação': '/programacao-original'
                    };
                    
                    const route = routeMap[userStats.disciplina_competida];
                    if (route) {
                      navigate(`${route}/${user.nome || 'usuario'}`);
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Continuar Torneio
                </button>
              </div>
            </div>
          )}

          {/* Ranking Table */}
          {selectedTorneio && (
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h4 className="text-xl font-semibold">Ranking do Torneio</h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Posição</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Usuário</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Casos Resolvidos</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Pontuação</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {ranking.length > 0 ? (
                      ranking.map((participante, index) => (
                        <tr 
                          key={participante.id || index} 
                          className={`hover:bg-gray-700 transition-colors ${
                            participante.usuario?.id === user?.id ? 'bg-blue-900/30' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                participante.posicao === 1 ? 'bg-yellow-600 text-yellow-100' :
                                participante.posicao === 2 ? 'bg-gray-400 text-gray-100' :
                                participante.posicao === 3 ? 'bg-amber-700 text-amber-100' :
                                'bg-gray-600 text-gray-300'
                              }`}>
                                {participante.posicao || index + 1}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              {participante.usuario?.imagem ? (
                                <img
                                  src={participante.usuario.imagem}
                                  alt={participante.usuario.nome}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                                  {participante.usuario?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                                </div>
                              )}
                              <span className="font-medium">
                                {participante.usuario?.nome || 'Usuário'}
                                {participante.usuario?.id === user?.id && ' (Você)'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">{participante.casos_resolvidos || 0}</td>
                          <td className="px-6 py-4 font-semibold text-yellow-400">
                            {typeof participante.pontuacao === 'number' ? participante.pontuacao.toFixed(0) : '0'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              participante.status === 'ativo' 
                                ? 'bg-green-900 text-green-300' 
                                : 'bg-gray-700 text-gray-300'
                            }`}>
                              {participante.status || 'ativo'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                          Nenhum participante ainda. Seja o primeiro a entrar!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Feedback */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-center mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                modalType === 'success' ? 'bg-green-900' :
                modalType === 'error' ? 'bg-red-900' :
                'bg-blue-900'
              }`}>
                {modalType === 'success' ? (
                  <Trophy className="w-6 h-6 text-green-300" />
                ) : modalType === 'error' ? (
                  <AlertCircle className="w-6 h-6 text-red-300" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-blue-300" />
                )}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-center mb-2">
              {modalType === 'success' ? 'Sucesso!' :
               modalType === 'error' ? 'Erro!' :
               'Informação'}
            </h3>
            
            <p className="text-gray-300 text-center mb-6">
              {modalMessage}
            </p>
            
            <div className="flex justify-center">
              <button
                onClick={() => setShowModal(false)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  modalType === 'success' ? 'bg-green-600 hover:bg-green-700' :
                  modalType === 'error' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Torneios;