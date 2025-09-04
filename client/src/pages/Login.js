import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      await login(email, password);
      nav("/dashboard", { replace: true });
    } catch (e) {
      setErr("Неверный email или пароль");
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 p-4">
      <div className="w-full max-w-md">
        {/* Логотип/заголовок */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Personal Dashboard
          </div>
          <div className="text-gray-400 text-sm">Добро пожаловать обратно</div>
        </div>

        {/* Форма входа */}
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Вход в систему</h1>
          
          {err && (
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/50 text-red-200 text-sm">
              <span className="text-red-400">⚠</span>
              {err}
            </div>
          )}

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input 
                  type="email" 
                  placeholder="Введите ваш email" 
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-600/50 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Пароль</label>
                <input 
                  type="password" 
                  placeholder="Введите пароль" 
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-600/50 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <button 
              disabled={busy} 
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none"
            >
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Входим...
                </span>
              ) : "Войти"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Нет аккаунта?{" "}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
