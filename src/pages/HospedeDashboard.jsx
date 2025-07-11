import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./HospedeDashboard.module.css";
import ProfileSummary from "../components/hospede/ProfileSummary";
import DashboardHeader from "../components/hospede/DashboardHeader";
import MinhasReservas from "../components/hospede/MinhasReservas";
import MeusFavoritos from "../components/hospede/MeusFavoritos";
import HistoricoReservasHospede from "../components/hospede/HistoricoReservasHospede";

function HospedeDashboard() {
  const { userType, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState("ativas");

  useEffect(() => {
    if (isAuthenticated && userType !== "hospede") {
      navigate("/");
    }
  }, [isAuthenticated, userType, navigate]);

  if (userType === null && !isAuthenticated) {
    return <div className={styles.loading}>Carregando dashboard...</div>;
  }
  if (isAuthenticated && userType !== "hospede") {
    return <div className={styles.loading}>Redirecionando...</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <DashboardHeader />
      <div className={styles.dashboardContent}>
        <ProfileSummary />
        {}
        <section className={styles.dashboardSection}>
          <h3>Encontre sua Próxima Acomodação</h3>
          <p>
            Navegue pelas opções disponíveis e encontre o lugar perfeito para
            seus estudos.
          </p>
          <button
            className={styles.actionButton}
            onClick={() => navigate("/buscar-casas")}
          >
            Buscar Casas Agora
          </button>
        </section>

        <section className={styles.dashboardSection}>
          <div className={styles.sectionHeaderWithToggle}>
            <h3>Minhas Reservas</h3>
            <div>
              <button
                onClick={() => setView("ativas")}
                className={
                  view === "ativas"
                    ? styles.toggleButtonActive
                    : styles.toggleButton
                }
              >
                Ativas
              </button>
              <button
                onClick={() => setView("historico")}
                className={
                  view === "historico"
                    ? styles.toggleButtonActive
                    : styles.toggleButton
                }
              >
                Histórico
              </button>
            </div>
          </div>
          {isAuthenticated && userType === "hospede" ? (
            view === "ativas" ? (
              <MinhasReservas />
            ) : (
              <HistoricoReservasHospede />
            )
          ) : (
            <p>
              Você precisa estar logado como hóspede para ver suas reservas.
            </p>
          )}
        </section>
        <section className={styles.dashboardSection}>
          <h3>Minhas Mensagens</h3>
          <button
              className={styles.actionButton}
              onClick={() => navigate("/mensagens")}
        >
              Ver Mensagens
          </button>
        </section>

        <section className={styles.dashboardSection}>
          <h3>Meus Favoritos</h3>
          {isAuthenticated && userType === "hospede" ? (
            <MeusFavoritos />
          ) : (
            <p>
              Você precisa estar logado como hóspede para ver seus favoritos.
            </p>
          )}
        </section>

        <section className={styles.dashboardSection}>
          <h3>Configurações do Perfil</h3>
          <p>Mantenha seus dados atualizados.</p>
          <button
            className={styles.actionButton}
            onClick={() => navigate("/hospede/perfil/editar")}
          >
            Editar Meu Perfil
          </button>
        </section>
      </div>
    </div>
  );
}
export default HospedeDashboard;
