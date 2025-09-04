import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../lib/api";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all"); // all | active | done
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const inputRef = useRef(null);

  // загрузка списка
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await api("/tasks");
        if (!cancelled) setTasks(data);
      } catch (e) {
        if (!cancelled) setError("Не удалось загрузить задачи");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => !t.done);
    if (filter === "done") return tasks.filter((t) => t.done);
    return tasks;
  }, [tasks, filter]);

  async function addTask() {
    const title = newTitle.trim();
    if (!title || busy) return;
    setBusy(true);
    setError(null);
    try {
      const created = await api("/tasks", { method:"POST", body: JSON.stringify({ title }) });
      setTasks((prev) => [created, ...prev]);
      setNewTitle("");
      inputRef.current?.focus();
    } catch {
      setError("Не удалось добавить задачу");
    } finally {
      setBusy(false);
    }
  }

  async function toggleDone(id, next) {
    try {
      const updated = await api(`/tasks/${id}`, { method:"PATCH", body: JSON.stringify({ done: next }) });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch {
      setError("Не удалось изменить статус");
    }
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditingTitle(task.title);
  }

  async function saveEdit(id) {
    const title = editingTitle.trim();
    if (!title) return removeTask(id);
    try {
      const updated = await api(`/tasks/${id}`, { method:"PATCH", body: JSON.stringify({ title }) });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditingId(null);
      setEditingTitle("");
    } catch {
      setError("Не удалось сохранить изменения");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingTitle("");
  }

  async function removeTask(id) {
    try {
      await api(`/tasks/${id}`, { method:"DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Не удалось удалить задачу");
    }
  }

  async function clearDone() {
    try {
      await api(`/tasks?done=true`, { method:"DELETE" });
      setTasks((prev) => prev.filter((t) => !t.done));
    } catch {
      setError("Не удалось удалить выполненные");
    }
  }

  const activeCount = tasks.filter((t) => !t.done).length;

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Задачи
        </h1>
        <div className="text-sm text-gray-400">
          Активных: <span className="text-white font-semibold">{activeCount}</span> / Всего:{" "}
          <span className="text-white font-semibold">{tasks.length}</span>
        </div>
      </div>

      {/* статус/ошибки */}
      <div className="flex items-center gap-3">
        {loading && (
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-900/30 border border-blue-700/50 text-blue-200 text-sm">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            Загрузка…
          </span>
        )}
        {error && (
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/30 border border-red-700/50 text-red-200 text-sm">
            <span className="text-red-400">⚠</span>
            {error}
          </span>
        )}
      </div>

      {/* Панель добавления */}
      <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            ref={inputRef}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Что нужно сделать?"
            className="flex-1 rounded-xl bg-gray-900/50 border border-gray-600/50 px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            disabled={busy}
          />
          <button
            onClick={addTask}
            disabled={busy}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none"
          >
            {busy ? "Добавляю..." : "Добавить"}
          </button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap items-center gap-3">
        {["all", "active", "done"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
              filter === f
                ? "bg-blue-600/20 text-blue-200 border-blue-500/50 shadow-lg"
                : "bg-gray-800/40 text-gray-300 border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500/50"
            }`}
          >
            {f === "all" ? "Все" : f === "active" ? "Активные" : "Готово"}
          </button>
        ))}
        <button
          onClick={clearDone}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-800/40 text-gray-300 border border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500/50 transition-all duration-200"
        >
          Удалить выполненные
        </button>
      </div>

      {/* Список задач */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-gray-700/50 bg-gray-800/40 backdrop-blur-sm">
            <div className="text-6xl mb-4">📝</div>
            <div className="text-gray-400 text-lg">
              {loading ? "Загружается…" : "Пока пусто. Добавь первую задачу выше 👆"}
            </div>
          </div>
        ) : (
          filtered.map((t) => (
            <div 
              key={t.id} 
              className={`group bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${
                t.done ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 pt-1">
                  <input
                    id={`chk-${t.id}`}
                    type="checkbox"
                    checked={t.done}
                    onChange={(e) => toggleDone(t.id, e.target.checked)}
                    className="w-5 h-5 accent-blue-500 rounded border-2 border-gray-600 hover:border-blue-500 transition-colors duration-200"
                  />
                </div>

                {editingId === t.id ? (
                  <div className="flex-1 space-y-3">
                    <input
                      autoFocus
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(t.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="w-full rounded-xl bg-gray-900/50 border border-gray-600/50 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(t.id)}
                        className="px-4 py-2 rounded-lg bg-green-600/80 hover:bg-green-500 text-white text-sm font-medium transition-colors duration-200"
                      >
                        Сохранить
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 rounded-lg bg-gray-700/80 hover:bg-gray-600 text-white text-sm font-medium transition-colors duration-200"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <label
                      htmlFor={`chk-${t.id}`}
                      className={`flex-1 select-none cursor-pointer transition-all duration-200 ${
                        t.done ? "line-through text-gray-400" : "text-white hover:text-blue-200"
                      }`}
                    >
                      {t.title}
                    </label>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => startEdit(t)}
                        className="px-3 py-1.5 rounded-lg bg-gray-700/80 hover:bg-blue-600/80 text-white text-sm font-medium transition-all duration-200 hover:scale-105"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => removeTask(t.id)}
                        className="px-3 py-1.5 rounded-lg bg-gray-700/80 hover:bg-red-600/80 text-white text-sm font-medium transition-all duration-200 hover:scale-105"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
