import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const nav = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      await register(name, email, password);
      nav("/dashboard", { replace: true });
    } catch (e) {
      setErr("Не удалось зарегистрироваться (email занят?)");
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 p-4">
      <div className="w-full max-w-md">
        {/* Логотип/заголовок */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Personal Dashboard
          </div>
          <div className="text-gray-400 text-sm">Создайте новый аккаунт</div>
        </div>

        {/* Форма регистрации */}
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Регистрация</h1>
          
          {err && (
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/50 text-red-200 text-sm">
              <span className="text-red-400">⚠</span>
              {err}
            </div>
          )}

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Имя</label>
                <input 
                  placeholder="Введите ваше имя" 
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-600/50 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input 
                  type="email" 
                  placeholder="Введите ваш email" 
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-600/50 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Пароль</label>
                <input 
                  type="password" 
                  placeholder="Минимум 6 символов" 
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-600/50 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200"
                  minLength={6}
                  required
                />
                <div className="text-xs text-gray-500 mt-1">Пароль должен содержать минимум 6 символов</div>
              </div>
            </div>

            <button 
              disabled={busy} 
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:opacity-50 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none"
            >
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Регистрируем...
                </span>
              ) : "Зарегистрироваться"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Уже есть аккаунт?{" "}
              <Link to="/" className="text-green-400 hover:text-green-300 font-medium transition-colors duration-200">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
