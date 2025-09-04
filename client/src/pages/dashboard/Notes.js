import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [filter, setFilter] = useState("all"); // all | pinned
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await api("/notes");
        if (!cancelled) setNotes(data);
      } catch (e) {
        if (!cancelled) setError("Не удалось загрузить заметки");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (filter === "pinned") return notes.filter(n => n.pinned);
    return notes;
  }, [notes, filter]);

  async function addNote() {
    const t = title.trim();
    const c = content.trim();
    if (!t || busy) return;
    setBusy(true); setError(null);
    try {
      const created = await api("/notes", {
        method: "POST",
        body: JSON.stringify({ title: t, content: c }),
      });
      setNotes(prev => [created, ...prev]);
      setTitle(""); setContent("");
    } catch {
      setError("Не удалось создать заметку");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(n) {
    setEditingId(n.id);
    setEditTitle(n.title);
    setEditContent(n.content || "");
  }

  async function saveEdit(id) {
    const t = editTitle.trim();
    const c = editContent.trim();
    if (!t) return;
    try {
      const updated = await api(`/notes/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: t, content: c }),
      });
      setNotes(prev => prev.map(n => n.id === id ? updated : n));
      setEditingId(null); setEditTitle(""); setEditContent("");
    } catch {
      setError("Не удалось сохранить изменения");
    }
  }

  function cancelEdit() {
    setEditingId(null); setEditTitle(""); setEditContent("");
  }

  async function togglePin(id, next) {
    try {
      const updated = await api(`/notes/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ pinned: next }),
      });
      setNotes(prev => prev.map(n => n.id === id ? updated : n));
    } catch {
      setError("Не удалось изменить pin");
    }
  }

  async function removeNote(id) {
    try {
      await api(`/notes/${id}`, { method: "DELETE" });
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch {
      setError("Не удалось удалить заметку");
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          Заметки
        </h1>
        <div className="text-sm text-gray-400">
          Всего: <span className="text-white font-semibold">{notes.length}</span>
          {filter === "pinned" && (
            <> • Закреплённых: <span className="text-white font-semibold">{notes.filter(n => n.pinned).length}</span></>
          )}
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

      {/* создаём новую заметку */}
      <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Создать новую заметку</h3>
        <div className="space-y-4">
          <input
            placeholder="Заголовок"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            className="w-full rounded-xl bg-gray-900/50 border border-gray-600/50 px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          />
          <textarea
            placeholder="Текст заметки (необязательно)"
            value={content}
            onChange={(e)=>setContent(e.target.value)}
            rows={4}
            className="w-full rounded-xl bg-gray-900/50 border border-gray-600/50 px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-y transition-all duration-200"
          />
          <div className="flex justify-end">
            <button
              disabled={busy}
              onClick={addNote}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:opacity-50 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none"
            >
              {busy ? "Создаю..." : "Создать заметку"}
            </button>
          </div>
        </div>
      </div>

      {/* фильтр */}
      <div className="flex items-center gap-3">
        {["all", "pinned"].map(f => (
          <button
            key={f}
            onClick={()=>setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
              filter === f
                ? "bg-green-600/20 text-green-200 border-green-500/50 shadow-lg"
                : "bg-gray-800/40 text-gray-300 border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500/50"
            }`}
          >
            {f === "all" ? "Все" : "Закреплённые"}
          </button>
        ))}
      </div>

      {/* список */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-gray-700/50 bg-gray-800/40 backdrop-blur-sm">
          <div className="text-6xl mb-4">📝</div>
          <div className="text-gray-400 text-lg">
            {loading ? "Загружается…" : "Заметок пока нет. Создай первую выше 👆"}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(n => (
            <div 
              key={n.id} 
              className={`group bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${
                n.pinned ? 'ring-2 ring-yellow-500/30' : ''
              }`}
            >
              {editingId === n.id ? (
                <div className="space-y-3">
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={(e)=>setEditTitle(e.target.value)}
                    onKeyDown={(e)=> e.key==="Enter" && saveEdit(n.id)}
                    className="w-full rounded-xl bg-gray-900/50 border border-gray-600/50 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e)=>setEditContent(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl bg-gray-900/50 border border-gray-600/50 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-y transition-all duration-200"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => saveEdit(n.id)}
                      className="px-3 py-1.5 rounded-lg bg-green-600/80 hover:bg-green-500 text-white text-sm font-medium transition-colors duration-200"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1.5 rounded-lg bg-gray-700/80 hover:bg-gray-600 text-white text-sm font-medium transition-colors duration-200"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-white leading-tight">{n.title}</h3>
                    <button
                      onClick={() => togglePin(n.id, !n.pinned)}
                      className={`flex-shrink-0 p-2 rounded-lg text-sm border transition-all duration-200 hover:scale-110 ${
                        n.pinned
                          ? "bg-yellow-600/30 text-yellow-200 border-yellow-500/50 shadow-lg"
                          : "bg-gray-900/50 text-gray-300 border-gray-600/50 hover:bg-gray-700/50"
                      }`}
                      title={n.pinned ? "Открепить" : "Закрепить"}
                    >
                      📌
                    </button>
                  </div>
                  {n.content && (
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed mb-4">
                      {n.content}
                    </p>
                  )}
                  <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => startEdit(n)}
                      className="px-3 py-1.5 rounded-lg bg-gray-700/80 hover:bg-blue-600/80 text-white text-sm font-medium transition-all duration-200 hover:scale-105"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => removeNote(n.id)}
                      className="px-3 py-1.5 rounded-lg bg-gray-700/80 hover:bg-red-600/80 text-white text-sm font-medium transition-all duration-200 hover:scale-105"
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
