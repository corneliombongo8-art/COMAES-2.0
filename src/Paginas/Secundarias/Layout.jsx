// Layout.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaBars, FaUserCircle, FaChartLine, FaBell, FaBook, FaTrophy, FaBullhorn,
  FaHeadset, FaCogs, FaInfoCircle, FaFacebook, FaInstagram,
  FaWhatsapp, FaLinkedin, FaPhone, FaHome
} from "react-icons/fa";

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const usuarioLogado = false;
  const usuario = { nome: "João Silva" };

  // Menu com HOME + Sobre nós
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

  useEffect(() => {
    const index = menuItems.findIndex(i => i.link === location.pathname);
    setActiveItem(index);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 transition-all duration-300 relative">

  {/* OVERLAY MOBILE */}
  <div
    className={`fixed inset-0 bg-black/70 z-40 md:hidden transition-opacity duration-300
      ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
    onClick={() => setMenuOpen(false)}
  />

{/* SLIDER PEQUENO - SOMENTE ÍCONES (desktop) */}
<div className="bg-black text-white fixed top-0 left-0 h-full z-50 shadow-lg w-20 p-3 flex-col items-center hidden md:flex">
  <h1 className="text-3xl font-bold mt-1 text-blue-600">C</h1>
  <ul className="flex flex-col gap-3 mt-8">
    {menuItems.map((item, index) => (
      <li key={index} className="hover:translate-x-1 hover:scale-95 transition-transform">
        <Link
          to={item.link}
          onClick={() => setActiveItem(index)}
          title={item.text}
          className={`flex items-center justify-center w-10 h-10 rounded-md
            ${activeItem === index ? "bg-blue-600 text-white" : "hover:bg-blue-700/70 text-white"}`}
        >
          {item.icon}
        </Link>
      </li>
    ))}
  </ul>
</div>

{/* SLIDER GRANDE - ÍCONES + TEXTO + LOGO + SUBTÍTULO (mobile + desktop quando aberto) */}
<div className={`bg-black text-white fixed top-0 left-0 h-full z-50 shadow-lg w-80 p-4 flex flex-col transition-transform duration-300
  ${menuOpen ? "flex" : "hidden"}`}>
  
  {/* LOGO + SUBTÍTULO */}
  <div className="flex flex-col items-center mb-6">
    <h1 className="text-3xl font-bold mt-1 text-blue-600">Comaes</h1>
    <h4 className="text-gray-300 text-center mt-4 text-sm drop-shadow-sm">
      Plataforma de Competições Educativa Online
    </h4>
  </div>

  {/* MENU COMPLETO */}
  <ul className="flex flex-col gap-2">
    {menuItems.map((item, index) => (
      <li key={index} className="hover:translate-x-1 hover:scale-95 transition-transform">
        <Link
          to={item.link}
          onClick={() => setActiveItem(index)}
          className={`flex items-center gap-2 py-2 px-3 rounded-md transition-all duration-300
            ${activeItem === index ? "bg-blue-600 text-white" : "hover:bg-blue-700/70 text-white"}`}
        >
          {item.icon}
          <span className="text-sm md:text-base text-white truncate">{item.text}</span>
        </Link>
      </li>
    ))}
  </ul>
</div>

{/* MAIN CONTENT */}
<div
  className={`flex flex-col min-h-screen w-full transition-all duration-300
    ${menuOpen ? "md:ml-80" : "md:ml-20"} 
    md:transition-all
  `}
>


        {/* HEADER */}
        <header className="bg-blue-600 shadow-md sticky top-0 z-40">
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

            {/* ÍCONES NO TOPO */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-5 pr-2 sm:pr-4 md:pr-6">
              {[{ icon: <FaBook />, link: "/teste-seu-conhecimento" },
                { icon: <FaBell />, link: null },
                { icon: <FaTrophy />, link: "/entrar-no-torneio" }]
                .map((item, index) => {
                  const baseClasses = `
                    flex items-center justify-center rounded-full cursor-pointer transition-colors
                    w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12
                    text-lg sm:text-xl md:text-2xl
                  `;
                  return item.link ? (
                    <Link
                      key={index}
                      to={item.link}
                      className={`${baseClasses} bg-blue-500 text-white hover:bg-white hover:text-blue-600`}
                    >
                      {item.icon}
                    </Link>
                  ) : (
                    <div
                      key={index}
                      className={`${baseClasses} bg-blue-500 text-white hover:bg-white hover:text-blue-600`}
                    >
                      {item.icon}
                    </div>
                  );
                })}

              {/* AUTH BUTTONS */}
              {!usuarioLogado && (
                <div className="flex gap-2 sm:gap-3 md:gap-4 pl-2 sm:pl-4 md:pl-6">
                  <button
                    onClick={() => navigate("/login")}
                    className="px-3 sm:px-4 md:px-6 py-1 sm:py-2 rounded-lg font-semibold 
                    bg-transparent border border-white text-white"
                  >
                    Entrar
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto">{children}</main>

        {/* FOOTER */}
        <footer className="bg-gray-900 text-gray-300 mt-auto p-6 sm:p-8">
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
        </footer>
      </div>
    </div>
  );
}
