import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./HistoricoReservasHospede.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import CasaDetalhesModal from "../../utils/CasaDetalhesModal";
import ReservaModal from "../../utils/ReservaModal";

function HistoricoReservasHospede() {
  const { token, userId, isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [selectedCasaIdParaDetalhes, setSelectedCasaIdParaDetalhes] = useState(null);

  const [isReservaModalOpen, setIsReservaModalOpen] = useState(false);
  const [selectedCasaParaReserva, setSelectedCasaParaReserva] = useState(null);

  const fetchHistorico = useCallback(async () => {
    if (!token || !userId) {
      setError("Autenticação necessária.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `http://localhost:5000/api/hospede/reservas/historico`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Erro ao buscar histórico de reservas.");
      if (Array.isArray(data)) setHistorico(data);
      else {
        setHistorico([]);
        console.warn("HistóricoReservas: Dados não são array:", data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    fetchHistorico();
  }, [fetchHistorico]);

  const formatarData = (dataISO) =>
    new Date(dataISO).toLocaleDateString("pt-BR", { timeZone: "UTC" });

  const handleAbrirDetalhesModal = (idCasa) => {
    setSelectedCasaIdParaDetalhes(idCasa);
    setIsDetalhesModalOpen(true);
  };

  const handleCloseDetalhesModal = () => {
    setIsDetalhesModalOpen(false);
    setSelectedCasaIdParaDetalhes(null);
  };

   const handleAbrirReservaModalViaDetalhes = (casaParaReservar) => {
    if (!isAuthenticated || userType !== 'hospede') {
      alert("Você precisa estar logado como hóspede para fazer uma reserva.");
      navigate('/login', { state: { from: location } });
      return;
    }
    if (casaParaReservar.precoPorNoite === null || casaParaReservar.precoPorNoite === undefined) {
        alert("Esta casa não pode ser reservada (sem preço definido).");
        return;
    }
    setSelectedCasaParaReserva(casaParaReservar);
    setIsDetalhesModalOpen(false);
    setIsReservaModalOpen(true);
  };

  const handleCloseReservaModal = () => {
    setIsReservaModalOpen(false);
    setSelectedCasaParaReserva(null);
  };
  
  const handleReservaSucesso = (novaReserva) => {
    handleCloseReservaModal();
  };

  const handleContatarLocadorDoModal = async (locadorId, casaIdContexto) => {
    if (!isAuthenticated || userType !== 'hospede') {
      alert("Você precisa estar logado como hóspede para contatar o locador.");
      navigate('/login', { state: { from: location } });
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/conversas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ outroUsuarioId: locadorId, casaId: casaIdContexto }),
      });
      const conversaCriada = await response.json();
      if (!response.ok) throw new Error(conversaCriada.error || "Não foi possível iniciar a conversa.");
      
      setIsDetalhesModalOpen(false);
      navigate(`/mensagens/${conversaCriada.id}`);
    } catch (err) {
      console.error("Erro ao iniciar conversa do modal de detalhes (Histórico):", err);
      alert(err.message || "Erro ao tentar contatar o locador.");
    }
  };


  if (loading)
    return <div className={styles.loading}>Carregando histórico de reservas...</div>;
  if (error && historico.length === 0) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.reservasContainer}> {}
      {error && historico.length > 0 && <p className={`${styles.error} ${styles.errorInline}`}>{error}</p>}
      {historico.length === 0 && !loading ? (
        <p>Você não possui reservas no seu histórico.</p>
      ) : (
        <ul className={styles.reservasList}>
          {historico.map((reserva) => {
            const imagemDaCasaUrl = reserva.casa?.imagens && reserva.casa.imagens.length > 0
             ? reserva.casa.imagens[0].url
             : `https://placehold.co/130x90/A8D5E2/333?text=${encodeURIComponent(
                 reserva.casa?.endereco?.substring(0, 8) || "Hist"
               )}`;
           const altDaImagem = reserva.casa?.imagens && reserva.casa.imagens.length > 0
             ? `Foto de ${reserva.casa.endereco}`
             : `Sem foto para ${reserva.casa?.endereco || "Casa do Histórico"}`;

            return (
            <li
              key={reserva.id}
              className={`${styles.reservaCard} ${styles.reservaCardLayoutRow} ${ // Layout em linha
                styles["reservaStatus" + reserva.status?.replace(/\s+/g, "")] || ""
              }`}
            >
               {reserva.casa && (
                  <div className={styles.casaImageContainerSmall}> 
                    <img 
                      src={imagemDaCasaUrl} 
                      alt={altDaImagem} 
                      className={styles.reservaCasaImagem}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/130x90/E0E0E0/BDBDBD?text=Erro`;
                      }}
                    />
                  </div>
                )}
              <div className={styles.reservaInfo}>
                <h4>
                  {reserva.casa?.endereco || "N/A"},{" "}
                  {reserva.casa?.numero || ""}
                </h4>
                <p>
                  <strong>Cidade:</strong> {reserva.casa?.cidade || "N/A"}
                </p>
                <p>
                  <strong>Check-in:</strong> {formatarData(reserva.dataCheckIn)} |{" "}
                  <strong>Check-out:</strong> {formatarData(reserva.dataCheckOut)}
                </p>
                <p>
                  <strong>Locador:</strong> {reserva.casa?.locador?.name || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`${styles.status} ${
                      styles["status" + reserva.status?.replace(/\s+/g, "")] || ""
                    }`}
                  >
                    {reserva.status || "N/A"}
                  </span>
                </p>
                <div className={styles.reservaActions}>
                  <button
                    className={styles.actionButtonSecondary}
                    onClick={() => handleAbrirDetalhesModal(reserva.casaId)}
                  >
                    Ver Detalhes da Casa
                  </button>
                </div>
              </div>
            </li>
          )})}
        </ul>
      )}

      {}
      {isDetalhesModalOpen && selectedCasaIdParaDetalhes && (
        <CasaDetalhesModal
          casaId={selectedCasaIdParaDetalhes}
          onClose={handleCloseDetalhesModal}
          onAbrirReservaModal={handleAbrirReservaModalViaDetalhes}
          onContatarLocadorModal={handleContatarLocadorDoModal}
        />
      )}

      {}
      {selectedCasaParaReserva && isReservaModalOpen && (
        <ReservaModal
          isOpen={isReservaModalOpen}
          onClose={handleCloseReservaModal}
          casa={selectedCasaParaReserva}
          onReservaSucesso={handleReservaSucesso}
        />
      )}
    </div>
  );
}

export default HistoricoReservasHospede;