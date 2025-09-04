import { NavLink } from "react-router-dom";

const linkBase =
  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group";
const linkIdle =
  "text-gray-300 hover:text-white hover:bg-gray-700/50 hover:scale-105";
const linkActive =
  "text-white bg-blue-600/20 border border-blue-500/50 shadow-lg";

const navItems = [
  { to: "/dashboard/tasks", label: "Задачи", icon: "📝" },
  { to: "/dashboard/notes", label: "Заметки", icon: "📋" },
  { to: "/dashboard/weather", label: "Погода", icon: "🌤️" },
  { to: "/dashboard/currency", label: "Валюты", icon: "💰" },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Мобильное меню (overlay) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Сайдбар */}
      <aside className={`
        fixed md:static top-0 left-0 h-full w-64 bg-gray-800/95 backdrop-blur-md border-r border-gray-700/50 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        {/* Заголовок */}
        <div className="p-6 border-b border-gray-700/50 flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-xs mb-1">Personal Dashboard</div>
            <div className="text-white text-lg font-bold">v0.1</div>
          </div>
          {/* Крестик для закрытия на мобильных */}
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors duration-200"
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Навигация */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout внизу */}
        <div className="p-4 border-t border-gray-700/50">
          <NavLink
            to="/"
            onClick={onClose}
            className={`${linkBase} ${linkIdle} text-red-300 hover:text-red-200 hover:bg-red-600/20`}
          >
            <span className="text-lg">🚪</span>
            <span>Выйти</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
