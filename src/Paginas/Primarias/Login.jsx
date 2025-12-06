import { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({
    usuario: "",
    senha: ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // limpa erro ao digitar
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    // Campos obrigatórios
    if (!form.usuario) newErrors.usuario = "Este campo é obrigatório";
    if (!form.senha) newErrors.senha = "Este campo é obrigatório";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("Login válido:", form);
    // lógica de autenticação
  };

  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-2 bg-white text-black">
      {/* Left Section - Image */}
      <div className="hidden md:flex items-center justify-center bg-blue-600">
        <img
          src="/comaes-preview.png"
          alt="Comaes Platform Preview"
          className="w-4/5 h-auto rounded-2xl shadow-2xl"
        />
      </div>

      {/* Right Section - Login */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200 transition-transform duration-300 hover:scale-105">
          <h1 className="text-4xl font-bold text-blue-600 text-center mb-4">Comaes</h1>
          <p className="text-center text-gray-700 mb-6">
            Entre na melhor plataforma de competições educativas online
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <input
                type="text"
                name="usuario"
                placeholder="Nome, Telefone ou Email"
                value={form.usuario}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              {errors.usuario && <p className="text-red-600 text-sm mt-1">{errors.usuario}</p>}
            </div>

            <div>
              <input
                type="password"
                name="senha"
                placeholder="Senha"
                value={form.senha}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              {errors.senha && <p className="text-red-600 text-sm mt-1">{errors.senha}</p>}
            </div>

            <button type="submit" className="w-full mt-6 p-3 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition">Entrar</button>
          </form>

          <p className="mt-4 text-center text-sm">
            ou <Link to="/Cadastro" className="text-blue-600 font-semibold hover:underline">Cadastrar-se</Link>
          </p>

          <p className="mt-2 text-center text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
            Esqueci a minha senha
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;