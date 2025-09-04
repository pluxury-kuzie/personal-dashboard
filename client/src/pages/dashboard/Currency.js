import { useEffect, useState, useCallback } from "react";
import { api } from "../../lib/api";

const COMMON = ["USD", "EUR", "GBP", "JPY", "PLN", "CZK", "SEK", "NOK", "CHF", "AUD", "CAD"];

export default function Currency() {
  const [base, setBase] = useState("USD");
  const [symbols] = useState(COMMON);
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [amount, setAmount] = useState("100");
  const [result, setResult] = useState(null);
  const [converting, setConverting] = useState(false);

  const loadRates = useCallback(async (b) => {
    setErr(null);
    setLoading(true);
    try {
      const data = await api(`/currency/rates?base=${encodeURIComponent(b)}`);
      setRates(data);
    } catch {
      setErr("Не удалось загрузить курсы");
      setRates(null);
    } finally {
      setLoading(false);
    }
  }, []);

  async function convert() {
    const amt = Number(amount);
    if (!isFinite(amt)) return setResult(null);
    setConverting(true); setErr(null);
    try {
      const data = await api(`/currency/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${amt}`);
      setResult(data.result);
    } catch (e) {
      setErr("Не удалось конвертировать");
      setResult(null);
    } finally { setConverting(false); }
  }

  useEffect(() => {
    loadRates(base);
  }, [base, loadRates]);
  

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          Валюты
        </h1>
      </div>

      {/* Конвертер */}
      <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Конвертер валют</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select 
              value={from} 
              onChange={(e)=>setFrom(e.target.value)}
              className="rounded-xl bg-gray-900/50 border border-gray-600/50 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-200"
            >
              {symbols.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select 
              value={to} 
              onChange={(e)=>setTo(e.target.value)}
              className="rounded-xl bg-gray-900/50 border border-gray-600/50 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-200"
            >
              {symbols.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input 
              value={amount} 
              onChange={(e)=>setAmount(e.target.value)} 
              placeholder="Сумма"
              className="rounded-xl bg-gray-900/50 border border-gray-600/50 px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-200"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={convert}
              disabled={converting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none"
            >
              {converting ? (
                <span className="inline-flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Конвертирую…
                </span>
              ) : "Конвертировать"}
            </button>
          </div>
          {result !== null && (
            <div className="text-center p-4 rounded-xl bg-yellow-600/20 border border-yellow-500/30">
              <div className="text-2xl font-bold text-white">
                {amount} {from} = <span className="text-yellow-300">{result}</span> {to}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Котировки к базовой валюте */}
      <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-300">Базовая валюта:</div>
            <select
              value={base}
              onChange={(e) => {
                const b = e.target.value;
                setBase(b);
                loadRates(b);
              }}
              className="rounded-xl bg-gray-900/50 border border-gray-600/50 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-200"
            >
              {symbols.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {rates?.date && (
            <div className="text-sm text-gray-400">
              Обновлено: {new Date(rates.date).toLocaleDateString('ru-RU')}
            </div>
          )}
        </div>

        {err && (
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/50 text-red-200 mb-4">
            <span className="text-red-400">⚠</span>
            {err}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-400">Загрузка курсов валют...</div>
          </div>
        ) : rates ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Object.entries(rates.rates).map(([sym, val]) => (
              <div 
                key={sym} 
                className="group bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-600/50 p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-semibold text-white">{sym}</div>
                  <div className="text-xs text-gray-400">к {rates.base}</div>
                </div>
                <div className="text-2xl font-bold text-yellow-400">{val}</div>
                <div className="text-xs text-gray-500 mt-2">
                  {sym === rates.base ? "Базовая валюта" : `1 ${rates.base} = ${val} ${sym}`}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            Нет данных для отображения
          </div>
        )}
      </div>
    </section>
  );
}
