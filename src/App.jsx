import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import LandingPage from "./pages/LandingPage";
import AdminPage from "./pages/AdminPage";
import HospedeDashboard from "./pages/HospedeDashboard";
import BuscarCasasPage from "./components/hospede/BuscarCasasPage";
import EditarPerfilHospedePage from "./components/hospede/EditarPerfilHospedePage";
import LocadorDashboard from "./pages/LocadorDashboard";
import EditarPerfilLocadorPage from "./components/locador/EditarPerfilLocador";
import PagamentoSimularPage from "./pages/PagamentoSimularPage";
import PaginaMensagens from "./pages/PaginaMensagens";

import ChatFlutuanteIcon from "./components/mensagens/ChatFlutuanteIcon";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ProtectedRoute({ children, allowedTypes }) {
  const { isAuthenticated, userType, authLoading } = useAuth();

  if (authLoading && !isAuthenticated) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        Verificando autenticação...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (allowedTypes && !allowedTypes.includes(userType)) {
    if (userType === "hospede") return <Navigate to="/hospede/dashboard" replace />;
    if (userType === "locador") return <Navigate to="/locador/dashboard" replace />;
    if (userType === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/buscar-casas" element={<BuscarCasasPage />} />
        {} {}

        <Route
          path="/pagamento/simular/:reservaId"
          element={
            <ProtectedRoute allowedTypes={["hospede"]}>
              <PagamentoSimularPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedTypes={["admin"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospede/dashboard"
          element={
            <ProtectedRoute allowedTypes={["hospede"]}>
              <HospedeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospede/perfil/editar"
          element={
            <ProtectedRoute allowedTypes={["hospede"]}>
              <EditarPerfilHospedePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/locador/dashboard"
          element={
            <ProtectedRoute allowedTypes={["locador"]}>
              <LocadorDashboard />
            </ProtectedRoute>
          }
        />
        {}
        <Route
          path="/locador/perfil/editar"
          element={
            <ProtectedRoute allowedTypes={["locador"]}>
              <EditarPerfilLocadorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mensagens"
          element={
            <ProtectedRoute allowedTypes={["hospede", "locador"]}>
              <PaginaMensagens />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mensagens/:conversaId"
          element={
            <ProtectedRoute allowedTypes={["hospede", "locador"]}>
              <PaginaMensagens />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/" replace />} />
      </Routes>
      <ChatFlutuanteIcon />
    </Router>
  );
}

export default App;