import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./components/DashboardLayout";
import Tasks from "./pages/dashboard/Tasks";
import Notes from "./pages/dashboard/Notes";
import Weather from "./pages/dashboard/Weather";
import Currency from "./pages/dashboard/Currency";
import { AuthProvider, useAuth } from "./context/AuthContext";

function RequireAuth({ children }) {
  const { isAuthed, initializing } = useAuth();
  if (initializing) return <div className="h-screen flex items-center justify-center text-white bg-gray-900">Загрузка…</div>;
  return isAuthed ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Публичные */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Приватные */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="tasks" replace />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="notes" element={<Notes />} />
            <Route path="weather" element={<Weather />} />
            <Route path="currency" element={<Currency />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
