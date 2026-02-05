// Layout.jsx - VERSÃO CORRIGIDA
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaBars, FaUserCircle, FaChartLine, FaBell, FaBook, FaTrophy, FaBullhorn,
  FaHeadset, FaCogs, FaInfoCircle, FaFacebook, FaInstagram,
  FaWhatsapp, FaLinkedin, FaPhone, FaHome
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import NotificacoesModal from "./Notificacoes";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const dropdownRef = useRef(null);

  const menuItems = [
    { icon: <FaHome className="text-2xl" />, text: "Home", link: "/" },
    { icon: <FaTrophy className="text-2xl" />, text: "Entrar no Torneio", link: "/entrar-no-torneio" },
    { icon: <FaBook className="text-2xl" />, text: "Teste seu Conhecimento", link: "/teste-seu-conhecimento" },
    { icon: <FaBullhorn className="text-2xl" />, text: "Portal de Notícias", link: "/portal-de-noticias" },
    { icon: <FaChartLine className="text-2xl" />, text: "Dashboard", link: "/painel" },
    { icon: <FaUserCircle className="text-2xl" />, text: "Perfil do Usuário", link: "/perfil" },
    { icon: <FaCogs className="text-2xl" />, text: "Configurações", link: "/configuracoes" },
    { icon: <FaInfoCircle className="text-2xl" />, text: "Sobre nós", link: "/sobre-nos" },
    { icon: <FaHeadset className="text-2xl" />, text: "Suporte", link: "/suporte" },
  ];


  // Detecta item ativo pelo pathname
  useEffect(() => {
    const index = menuItems.findIndex(i => i.link === location.pathname);
    setActiveItem(index);
  }, [location.pathname]);

  // Atualiza contador de notificações
  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (user && user.id) {
        try {
          const response = await fetch(`http://localhost:3000/usuarios/${user.id}/notificacoes/nao-lidas/count`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await response.json();
          if (data.success) {
            setNotificationCount(data.count);
          }
        } catch (error) {
          console.error("Erro ao buscar contagem de notificações:", error);
        }
      } else {
        setNotificationCount(0);
      }
    };

    fetchNotificationCount();
    
    // Opcional: Polling a cada 60 segundos
    const interval = setInterval(fetchNotificationCount, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ANIMAÇÕES
  const sliderSmallVariants = {
    hidden: { x: -80, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  const sliderBigVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.4 } },
    exit: { x: -300, opacity: 0, transition: { duration: 0.3 } }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const mainContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05 }
    })
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 transition-all duration-300 relative">
      {/* OVERLAY MOBILE */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 bg-black/70 z-40 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* SLIDER PEQUENO (desktop) */}
      <motion.div
        variants={sliderSmallVariants}
        initial="hidden"
        animate="visible"
        className="bg-black text-white fixed top-0 left-0 h-full z-40 shadow-lg w-20 p-3 flex-col items-center hidden md:flex"
      >
        <h1 className="text-3xl font-bold mt-1 text-blue-600">C</h1>
        <ul className="flex flex-col gap-3 mt-8">
          {menuItems.map((item, index) => (
            <motion.li
              key={index}
              custom={index}
              variants={menuItemVariants}
              initial="hidden"
              animate="visible"
              className="hover:translate-x-1 hover:scale-95 transition-transform"
            >
              <Link
                to={item.link}
                onClick={() => setActiveItem(index)}
                title={item.text}
                className={`flex items-center justify-center w-10 h-10 rounded-md
                  ${activeItem === index ? "bg-blue-600 text-white" : "hover:bg-blue-700/70 text-white"}`}
              >
                {item.icon}
              </Link>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* SLIDER GRANDE (mobile + desktop aberto) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="slider"
            variants={sliderBigVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-black text-white fixed top-0 left-0 h-full z-50 shadow-lg w-80 p-4 flex flex-col"
          >
            <div className="flex flex-col items-center mb-6">
              <h1 className="text-3xl font-bold mt-1 text-blue-600">Comaes</h1>
              <h4 className="text-gray-300 text-center mt-4 text-sm">
                Plataforma de Competições Educativa Online
              </h4>
            </div>

            <ul className="flex flex-col gap-2">
              {menuItems.map((item, index) => (
                <motion.li
                  key={index}
                  custom={index}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="hover:translate-x-1 hover:scale-95 transition-transform"
                >
                  <Link
                    to={item.link}
                    onClick={() => {
                      setActiveItem(index);
                      setMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 py-2 px-3 rounded-md
                      ${activeItem === index ? "bg-blue-600 text-white" : "hover:bg-blue-700/70 text-white"}`}
                  >
                    {item.icon}
                    <span className="text-sm md:text-base">{item.text}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE NOTIFICAÇÕES */}
      <NotificacoesModal 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />

      {/* MAIN CONTENT CONTAINER - CORRIGIDO */}
      <div
        className={`flex flex-col min-h-screen w-full transition-all duration-300
          ${menuOpen ? "md:ml-80" : "md:ml-20"}
          pt-0`}
      >
        {/* HEADER - FIXADO CORRETAMENTE */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-blue-600 shadow-md sticky top-0 z-40 w-full"
        >
          <div className="flex items-center justify-between p-3 sm:p-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-2xl sm:text-3xl text-white hover:text-blue-300 transition"
              >
                <FaBars />
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Comaes</h1>
            </div>

            {/* ICONS */}
            <div className="flex items-center gap-1 sm:gap-3 md:gap-5 pr-1 sm:pr-4 md:pr-6">
              {/* Botão de Teste de Conhecimento */}
              <Link
                to="/teste-seu-conhecimento"
                className="flex items-center justify-center rounded-full cursor-pointer transition-colors
                  w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12
                  text-base sm:text-xl md:text-2xl
                  bg-blue-500 text-white hover:bg-white hover:text-blue-600"
              >
                <FaBook />
              </Link>

              {/* Botão de Notificações */}
              <div className="relative">
                <button
                  onClick={handleNotificationClick}
                  className="flex items-center justify-center rounded-full cursor-pointer transition-colors
                    w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12
                    text-base sm:text-xl md:text-2xl
                    bg-blue-500 text-white hover:bg-white hover:text-blue-600"
                >
                  <FaBell />
                </button>
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full 
                    w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </div>

              {/* Botão de Torneio */}
              <Link
                to="/entrar-no-torneio"
                className="flex items-center justify-center rounded-full cursor-pointer transition-colors
                  w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12
                  text-base sm:text-xl md:text-2xl
                  bg-blue-500 text-white hover:bg-white hover:text-blue-600"
              >
                <FaTrophy />
              </Link>

              {/* MOSTRAR BOTÕES DE ENTRAR/CADASTRAR APENAS SE NÃO ESTIVER LOGADO */}
              {!user ? (
                <div className="flex gap-1 sm:gap-3 md:gap-4 pl-1 sm:pl-4 md:pl-6">
                  <button
                    onClick={() => navigate("/login")}
                    className="px-2 py-1 sm:px-4 md:px-6 sm:py-2 rounded-lg font-semibold text-sm sm:text-base
                    bg-transparent border border-white text-white hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => navigate("/cadastro")}
                    className="px-2 py-1 sm:px-4 md:px-6 sm:py-2 rounded-lg font-semibold text-sm sm:text-base
                    bg-white text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    Cadastre-se
                  </button>
                </div>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-2 py-1 sm:px-4 sm:py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-400 transition-colors"
                  >
                    <span className="hidden sm:inline">{user.username || user.name || "Usuário"}</span>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name || 'avatar'} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <FaUserCircle className="text-xl" />
                    )}
                  </button>
                  
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-70 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-3 border-b">
                        <p className="font-semibold truncate text-gray-800">{user.fullName || user.name || user.username}</p>
                        <p className="text-sm truncate text-gray-600">{user.email || user.phone || ""}</p>
                      </div>
                      <div className="p-1">
                        <Link
                          to="/perfil"
                          className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                          onClick={() => setProfileOpen(false)}
                        >
                          Meu Perfil
                        </Link>
                        {user?.isAdmin && (
                          <Link
                            to="/admin"
                            className="block px-3 py-2 text-blue-600 hover:bg-blue-50 rounded font-semibold"
                            onClick={() => setProfileOpen(false)}
                          >
                            🔐 Painel Administrativo
                          </Link>
                        )}
                        <Link
                          to="/configuracoes"
                          className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                          onClick={() => setProfileOpen(false)}
                        >
                          Configurações
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100 rounded"
                        >
                          Terminar Sessão
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.header>

        {/* MAIN CONTENT */}
        <motion.main
          variants={mainContentVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full"
        >
          {children}
        </motion.main>

        {/* FOOTER */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900 text-gray-300 mt-auto p-6 sm:p-8 w-full"
        >
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 sm:gap-6">
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-sm md:text-base">
              {menuItems.map((item, index) => (
                <Link key={index} to={item.link} className="text-gray-400 hover:text-blue-500 flex items-center gap-1 transition-colors">
                  {item.text}<span className="inline-block transform rotate-90 text-blue-500">›</span>
                </Link>
              ))}
              <Link to="/politica-de-uso" className="text-gray-400 hover:text-blue-500 flex items-center gap-1 transition-colors">
                Política de Uso<span className="rotate-90 text-blue-500">›</span>
              </Link>
              <Link to="/privacidade" className="text-gray-400 hover:text-blue-500 flex items-center gap-1 transition-colors">
                Privacidade<span className="rotate-90 text-blue-500">›</span>
              </Link>
              <Link to="/seguranca" className="text-gray-400 hover:text-blue-500 flex items-center gap-1 transition-colors">
                Segurança<span className="rotate-90 text-blue-500">›</span>
              </Link>
            </div>

            <div className="flex justify-center gap-6 text-2xl mt-4 sm:mt-6">
              <a href="https://facebook.com" target="_blank" className="hover:text-blue-500 text-gray-400 transition-colors"><FaFacebook /></a>
              <a href="https://instagram.com" target="_blank" className="hover:text-blue-500 text-gray-400 transition-colors"><FaInstagram /></a>
              <a href="https://wa.me/" target="_blank" className="hover:text-green-500 text-gray-400 transition-colors"><FaWhatsapp /></a>
              <a href="https://linkedin.com" target="_blank" className="hover:text-blue-500 text-gray-400 transition-colors"><FaLinkedin /></a>
              <a href="tel:+244000000000" className="hover:text-blue-500 text-gray-400 transition-colors"><FaPhone /></a>
            </div>
          </div>

          <div className="text-center text-gray-500 mt-4 sm:mt-6">
            &copy; 2025 Comaes - Plataforma de Competições Educativas Online. Todos os direitos reservados.
          </div>
        </motion.footer>
      </div>
    </div>
  );
}