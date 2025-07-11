import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./AdminPage.module.css";
import GerenciarHospedes from "../components/admin/GerenciarHospede";
import GerenciarLocadores from "../components/admin/GerenciarLocador";
import GerenciarCasas from "../components/admin/GerenciarCasa";
import GerenciarAdmins from "../components/admin/GerenciarAdmin";
import VerGraficos from "../components/admin/VerGraficos";

function AdminPage() {
  const { token, userType, logoutAction } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("graficos");

  useEffect(() => {
    if (userType !== "admin") {
      navigate("/");
    }
  }, [userType, navigate]);

  const handleLogout = () => {
    logoutAction();
    navigate("/");
  };

  const renderView = () => {
    if (!token)
      return <p className={styles.errorMessage}>Autenticação necessária.</p>;
    switch (currentView) {
      case "hospedes":
        return <GerenciarHospedes token={token} />;
      case "locadores":
        return <GerenciarLocadores token={token} />;
      case "casas":
        return <GerenciarCasas token={token} />;
      case "admins":
        return <GerenciarAdmins token={token} />;
      case "graficos":
        return <VerGraficos token={token} />;
      default:
        return <VerGraficos token={token} />;
    }
  };

  return (
    <div className={styles.adminPageContainer}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>UniHosp Admin</h2>
        <nav>
          <ul>
            {}
            <li
              onClick={() => setCurrentView("graficos")}
              className={currentView === "graficos" ? styles.active : ""}
            >
              Ver Gráficos
            </li>
            <li
              onClick={() => setCurrentView("hospedes")}
              className={currentView === "hospedes" ? styles.active : ""}
            >
              Gerenciar Hóspedes
            </li>
            <li
              onClick={() => setCurrentView("locadores")}
              className={currentView === "locadores" ? styles.active : ""}
            >
              Gerenciar Locadores
            </li>
            <li
              onClick={() => setCurrentView("casas")}
              className={currentView === "casas" ? styles.active : ""}
            >
              Gerenciar Casas
            </li>
            <li
              onClick={() => setCurrentView("admins")}
              className={currentView === "admins" ? styles.active : ""}
            >
              Gerenciar Admins
            </li>
          </ul>
        </nav>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </aside>
      <main className={styles.mainContent}>
        <header className={styles.contentHeader}>
          <h1>Painel de Gerenciamento do Sistema</h1>
          <p>Bem-vindo, Administrador!</p>
        </header>
        {token ? (
          renderView()
        ) : (
          <p className={styles.errorMessage}>
            Carregando dados ou token ausente...
          </p>
        )}
      </main>
    </div>
  );
}

export default AdminPage;
