import { useState } from "react";
import { Link } from "react-router-dom";

function Cadastro() {
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    nascimento: "",
    sexo: "",
    escola: "",
    senha: "",
    confirmaSenha: ""
  });

  const [errors, setErrors] = useState({});

  const escolas = ["Escola A", "Escola B", "Escola C"];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // limpa erro ao digitar
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    // Validação campos obrigatórios
    Object.keys(form).forEach((key) => {
      if (!form[key]) {
        newErrors[key] = "Este campo é obrigatório";
      }
    });

    // Validação de senhas
    if (form.senha && form.confirmaSenha && form.senha !== form.confirmaSenha) {
      newErrors.confirmaSenha = "As senhas não coincidem";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("Cadastro válido:", form);
    // Aqui você pode enviar os dados para o backend
  };

  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-2 bg-white text-black">
      {/* Left Section - Image */}
      <div className="hidden md:flex items-center justify-center bg-blue-600">
        <img
          src="/comaes-cadastro.png"
          alt="Comaes Cadastro Preview"
          className="w-4/5 h-auto rounded-2xl shadow-2xl"
        />
      </div>

      {/* Right Section - Cadastro */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200 transition-transform duration-300 hover:scale-105">
          <h1 className="text-4xl font-bold text-blue-600 text-center mb-4">Comaes</h1>
          <p className="text-center text-gray-700 mb-6">
            Cadastre-se na melhor plataforma de competições educativas online
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <input type="text" name="nome" placeholder="Nome Completo" value={form.nome} onChange={handleChange} className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              {errors.nome && <p className="text-red-600 text-sm mt-1">{errors.nome}</p>}
            </div>

            <div>
              <input type="text" name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              {errors.telefone && <p className="text-red-600 text-sm mt-1">{errors.telefone}</p>}
            </div>

            <div>
              <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <input type="date" name="nascimento" placeholder="Nascimento" value={form.nascimento} onChange={handleChange} className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              {errors.nascimento && <p className="text-red-600 text-sm mt-1">{errors.nascimento}</p>}
            </div>

            <div>
              <select name="sexo" value={form.sexo} onChange={handleChange} className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                <option value="">Selecione o seu Sexo</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
              {errors.sexo && <p className="text-red-600 text-sm mt-1">{errors.sexo}</p>}
            </div>

            <div>
              <select name="escola" value={form.escola} onChange={handleChange} className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                <option value="">Onde Estudas? Selecione a Escola</option>
                {escolas.map((e, i) => <option key={i} value={e}>{e}</option>)}
              </select>
              {errors.escola && <p className="text-red-600 text-sm mt-1">{errors.escola}</p>}
            </div>

            <div>
              <input type="password" name="senha" placeholder="Palavra Passe" value={form.senha} onChange={handleChange} className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              {errors.senha && <p className="text-red-600 text-sm mt-1">{errors.senha}</p>}
            </div>

            <div>
              <input type="password" name="confirmaSenha" placeholder="Confirmação da Palavra Passe" value={form.confirmaSenha} onChange={handleChange} className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              {errors.confirmaSenha && <p className="text-red-600 text-sm mt-1">{errors.confirmaSenha}</p>}
            </div>

            <button type="submit" className="w-full mt-4 p-3 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition">Cadastrar-se</button>
          </form>

          <p className="mt-4 text-center text-sm">
            Já tem uma conta? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Cadastro;