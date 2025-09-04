import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 text-white">
      {/* Закрепленный хедер */}
      <header className="fixed top-0 left-0 right-0 z-40 h-20 bg-gray-900/95 backdrop-blur-md border-b border-gray-800/50 md:left-64">
        <div className="h-full flex items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-4">
            {/* Кнопка гамбургера для мобильных */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg text-gray-200 font-medium">
              {user?.name || user?.email}
            </span>
          </div>
        </div>
      </header>

      {/* Основной контент с отступом под хедер */}
      <div className="h-screen flex">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto pt-20">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
