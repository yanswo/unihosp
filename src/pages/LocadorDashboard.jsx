import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./LocadorDashboard.module.css";
import DashboardHeader from "../components/hospede/DashboardHeader";
import LocadorProfileSummary from "../components/locador/LocadorProfileSummary";
import GerenciadorCasasLocador from "../components/locador/GerenciadorCasasLocador";
import GerenciadorReservasLocador from "../components/locador/GerenciadorReservasLocador";
import HistoricoReservasLocador from "../components/locador/HistoricoReservasLocador";

function LocadorDashboard() {
  const { userType, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [viewReservas, setViewReservas] = useState("ativas");

  useEffect(() => {
    if (isAuthenticated === false) {
        navigate("/");
    } else if (isAuthenticated === true && userType !== "locador") {
        navigate("/");
    }
  }, [isAuthenticated, userType, navigate]);

  if (isAuthenticated === null || (isAuthenticated === false && userType === null) ) {
    return <div className={styles.loadingPageFull}>Carregando dashboard do locador...</div>;
  }
  if (isAuthenticated && userType !== "locador") {
    return <div className={styles.loadingPageFull}>Redirecionando...</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <DashboardHeader />
      <div className={styles.dashboardContent}>
        <section className={styles.dashboardSection}> {}
            <LocadorProfileSummary />
        </section>
        
        {}
        <GerenciadorCasasLocador /> 

        <section className={styles.dashboardSection}>
          <div className={styles.sectionHeaderWithToggle}>
            <h3>Gerenciamento de Reservas</h3>
            <div>
              <button
                onClick={() => setViewReservas("ativas")}
                className={
                  viewReservas === "ativas"
                    ? styles.toggleButtonActive
                    : styles.toggleButton
                }
              >
                Ativas
              </button>
              <button
                onClick={() => setViewReservas("historico")}
                className={
                  viewReservas === "historico"
                    ? styles.toggleButtonActive
                    : styles.toggleButton
                }
              >
                Histórico
              </button>
            </div>
          </div>
          {}
          {viewReservas === "ativas" ? (
            <GerenciadorReservasLocador />
          ) : (
            <HistoricoReservasLocador />
          )}
        </section>
        
        <section className={styles.dashboardSection}>
            <h3>Minhas Mensagens</h3>
            <p>Acesse suas conversas com hóspedes interessados.</p>
            <button
                className={styles.actionButton}
                onClick={() => navigate("/mensagens")}
            >
                Ver Mensagens
            </button>
        </section>

        <section className={styles.dashboardSection}>
          <h3>Configurações do Perfil</h3>
          <p>Mantenha seus dados de locador atualizados.</p>
          <button
            className={styles.actionButton}
            onClick={() => navigate("/locador/perfil/editar")}
          >
            Editar Meu Perfil
          </button>
        </section>
      </div>
    </div>
  );
}
export default LocadorDashboard;