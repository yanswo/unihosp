import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./MinhasReservas.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import CasaDetalhesModal from "../../utils/CasaDetalhesModal";
import ReservaModal from "../../utils/ReservaModal";

function MinhasReservas() {
  const { token, userId, isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [operationLoading, setOperationLoading] = useState(null);

  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [selectedCasaIdParaDetalhes, setSelectedCasaIdParaDetalhes] =
    useState(null);

  const [isReservaModalOpen, setIsReservaModalOpen] = useState(false);
  const [selectedCasaParaReserva, setSelectedCasaParaReserva] = useState(null);

  const fetchReservas = useCallback(async () => {
    if (!token || !userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://apiunihosp.onrender.com/api/hospede/reservas`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({ error: `Erro HTTP ${response.status}` }));
        throw new Error(
          errData.error || "Erro ao buscar suas reservas ativas."
        );
      }
      const data = await response.json();
      if (Array.isArray(data)) setReservas(data);
      else {
        setReservas([]);
        console.warn("MinhasReservas: Dados de reservas não são array:", data);
      }
    } catch (err) {
      console.error("MinhasReservas: Falha ao buscar reservas:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  const handleCancelarReservaPeloHospede = async (reservaId) => {
    if (!window.confirm("Tem certeza que deseja cancelar esta reserva?"))
      return;
    if (!token) {
      toast.error("Erro de autenticação ao tentar cancelar reserva.");
      return;
    }
    setOperationLoading(reservaId);
    try {
      const response = await fetch(
        `https://apiunihosp.onrender.com/api/reservas/${reservaId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "CANCELADA_PELO_HOSPEDE" }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Falha ao cancelar a reserva.`);
      }
      toast.success(`Reserva cancelada com sucesso!`);
      fetchReservas();
    } catch (err) {
      toast.error(`Erro ao cancelar reserva: ${err.message}`);
    } finally {
      setOperationLoading(null);
    }
  };

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
    if (!isAuthenticated || userType !== "hospede") {
      toast.info(
        "Você precisa estar logado como hóspede para fazer uma reserva."
      );
      navigate("/login", { state: { from: location } });
      return;
    }
    if (
      casaParaReservar.precoPorNoite === null ||
      casaParaReservar.precoPorNoite === undefined
    ) {
      toast.warn("Esta casa não pode ser reservada (sem preço definido).");
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
    if (!isAuthenticated || userType !== "hospede") {
      toast.info(
        "Você precisa estar logado como hóspede para contatar o locador."
      );
      navigate("/login", { state: { from: location } });
      return;
    }
    try {
      const response = await fetch(
        "https://apiunihosp.onrender.com/api/conversas",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            outroUsuarioId: locadorId,
            casaId: casaIdContexto,
          }),
        }
      );
      const conversaCriada = await response.json();
      if (!response.ok)
        throw new Error(
          conversaCriada.error || "Não foi possível iniciar a conversa."
        );

      setIsDetalhesModalOpen(false);
      navigate(`/mensagens/${conversaCriada.id}`);
    } catch (err) {
      console.error(
        "Erro ao iniciar conversa do modal de detalhes (Minhas Reservas):",
        err
      );
      toast.error(err.message || "Erro ao tentar contatar o locador.");
    }
  };

  if (loading)
    return <div className={styles.loading}>Carregando suas reservas...</div>;

  if (error && reservas.length === 0)
    return <div className={styles.error}>{error}</div>;

  return (
    <>
      {error && reservas.length > 0 && (
        <p className={`${styles.error} ${styles.errorInline}`}>{error}</p>
      )}

      {reservas.length === 0 && !loading ? (
        <p>Você não possui reservas ativas (pendentes ou confirmadas).</p>
      ) : (
        <ul className={styles.reservasList}>
          {reservas.map((reserva) => {
            const isCurrentOperation = operationLoading === reserva.id;
            const podeCancelar =
              reserva.status === "PENDENTE" || reserva.status === "CONFIRMADA";

            const imagemDaCasaUrl =
              reserva.casa?.imagens && reserva.casa.imagens.length > 0
                ? reserva.casa.imagens[0].url
                : `https://placehold.co/150x100/A8D5E2/333?text=${encodeURIComponent(
                    reserva.casa?.endereco?.substring(0, 10) || "Reserva"
                  )}`;
            const altDaImagem =
              reserva.casa?.imagens && reserva.casa.imagens.length > 0
                ? `Foto de ${reserva.casa.endereco}`
                : `Sem foto para ${reserva.casa?.endereco || "Reserva"}`;

            return (
              <li
                key={reserva.id}
                className={`${styles.reservaCard} ${
                  styles.reservaCardLayoutRow
                } ${
                  // Aplicando layout em linha e status
                  styles[
                    "reservaStatus" + reserva.status?.replace(/\s+/g, "")
                  ] || ""
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
                        e.target.src = `https://placehold.co/150x90/E0E0E0/BDBDBD?text=Indisponível`;
                      }}
                    />
                  </div>
                )}
                <div className={styles.reservaInfo}>
                  <h4>
                    {reserva.casa?.endereco || "Endereço não disponível"},{" "}
                    {reserva.casa?.numero || ""}
                  </h4>
                  <p>
                    <strong>Cidade:</strong> {reserva.casa?.cidade || "N/A"}
                  </p>
                  <p>
                    <strong>Check-in:</strong>{" "}
                    {formatarData(reserva.dataCheckIn)} |{" "}
                    <strong>Check-out:</strong>{" "}
                    {formatarData(reserva.dataCheckOut)}
                  </p>
                  <p>
                    <strong>Locador:</strong>{" "}
                    {reserva.casa?.locador?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`${styles.status} ${
                        styles[
                          "status" + reserva.status?.replace(/\s+/g, "")
                        ] || "" // Para cores de status
                      }`}
                    >
                      {reserva.status || "N/A"}
                    </span>
                  </p>
                  {reserva.statusPagamento && (
                    <p>
                      <strong>Pagamento:</strong>{" "}
                      <span
                        className={`${styles.status} ${
                          styles[
                            "status" +
                              reserva.statusPagamento.replace(/\s+/g, "")
                          ] || ""
                        }`}
                      >
                        {reserva.statusPagamento}
                      </span>
                    </p>
                  )}
                  <div className={styles.reservaActions}>
                    <button
                      className={styles.actionButtonSecondary}
                      onClick={() => handleAbrirDetalhesModal(reserva.casaId)}
                      disabled={isCurrentOperation}
                    >
                      Ver Casa
                    </button>
                    {podeCancelar && (
                      <button
                        className={styles.actionButtonDelete}
                        onClick={() =>
                          handleCancelarReservaPeloHospede(reserva.id)
                        }
                        disabled={isCurrentOperation}
                      >
                        {isCurrentOperation
                          ? "Cancelando..."
                          : "Cancelar Reserva"}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
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
    </>
  );
}
export default MinhasReservas;
