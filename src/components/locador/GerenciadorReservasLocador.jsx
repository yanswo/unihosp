import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./GerenciadorReservasLocador.module.css";
import { toast } from "react-toastify";

function GerenciadorReservasLocador() {
  const { token, userId } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(true);
  const [errorReservas, setErrorReservas] = useState("");
  const [operationLoading, setOperationLoading] = useState(null);

  const fetchReservasLocador = useCallback(async () => {
    if (!token || !userId) {
      return;
    }
    setLoadingReservas(true);
    setErrorReservas("");
    try {
      const response = await fetch(
        `https://apiunihosp.onrender.com/api/locador/reservas`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "Erro ao buscar reservas ativas do locador."
        );
      }
      if (Array.isArray(data)) {
        setReservas(data);
      } else {
        setReservas([]);
        console.warn(
          "GerenciadorReservasLocador: Dados de reservas ativas não são um array:",
          data
        );
      }
    } catch (err) {
      console.error(
        "GerenciadorReservasLocador: Falha ao buscar reservas ativas:",
        err
      );
      setErrorReservas(err.message);
    } finally {
      setLoadingReservas(false);
    }
  }, [token, userId]);

  useEffect(() => {
    if (token && userId) {
      fetchReservasLocador();
    }
  }, [fetchReservasLocador, token, userId]);

  const handleAtualizarStatusReserva = async (
    reservaId,
    novoStatus,
    mensagemConfirmacao,
    actionType
  ) => {
    if (!token) {
      toast.error("Autenticação necessária para atualizar status da reserva.");
      return;
    }
    if (mensagemConfirmacao && !window.confirm(mensagemConfirmacao)) return;

    setOperationLoading({ id: reservaId, action: actionType });
    try {
      const response = await fetch(
        `https://apiunihosp.onrender.com/api/reservas/${reservaId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: novoStatus.toUpperCase() }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.error || `Falha ao atualizar status para ${novoStatus}.`
        );
      }
      toast.success("Status da reserva atualizado com sucesso!");
      fetchReservasLocador();
    } catch (err) {
      toast.error(`Erro ao atualizar status: ${err.message}`);
      console.error("Erro ao atualizar status da reserva:", err);
    } finally {
      setOperationLoading(null);
    }
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return "N/A";
    return new Date(dataISO).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };

  if (loadingReservas && reservas.length === 0) {
    return (
      <div className={styles.loading}>Carregando suas reservas ativas...</div>
    );
  }

  if (errorReservas && reservas.length === 0) {
    return <div className={styles.errorFeedback}>{errorReservas}</div>;
  }

  return (
    <>
      {}
      {}
      {errorReservas && reservas.length > 0 && (
        <p className={styles.errorFeedback}>{errorReservas}</p>
      )}

      {reservas.length === 0 && !loadingReservas && !errorReservas ? (
        <p className={styles.noReservasMessage}>
          Nenhuma reserva ativa (pendente ou confirmada) encontrada para suas
          casas no momento.
        </p>
      ) : (
        <ul className={styles.reservasList}>
          {reservas.map((reserva) => {
            const isCurrentOperation = operationLoading?.id === reserva.id;
            const currentAction = operationLoading?.action;

            const podeConfirmarRejeitar = reserva.status === "PENDENTE";
            const podeCancelarLocador =
              reserva.status === "PENDENTE" || reserva.status === "CONFIRMADA";

            return (
              <li
                key={reserva.id}
                className={`${styles.reservaCard} ${
                  // Usando estilos do CSS module
                  styles[
                    "reservaStatus" + reserva.status?.replace(/\s+/g, "")
                  ] || ""
                }`}
              >
                <h4>
                  Casa: {reserva.casa?.endereco || "N/A"},{" "}
                  {reserva.casa?.cidade || "N/A"} (ID Casa: {reserva.casaId})
                </h4>
                <p>
                  <strong>Hóspede:</strong> {reserva.hospede?.name || "N/A"} (
                  {reserva.hospede?.email || "N/A"})
                </p>
                <p>
                  <strong>Período:</strong> {formatarData(reserva.dataCheckIn)}{" "}
                  - {formatarData(reserva.dataCheckOut)}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`${styles.status} ${
                      styles["status" + reserva.status?.replace(/\s+/g, "")] ||
                      ""
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
                          "status" + reserva.statusPagamento.replace(/\s+/g, "")
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
                    onClick={() => {
                      alert(
                        `Ver detalhes da Casa ID: ${reserva.casaId} (implementar)`
                      );
                    }}
                    disabled={isCurrentOperation}
                  >
                    Ver Casa
                  </button>

                  {podeConfirmarRejeitar && (
                    <>
                      <button
                        className={styles.actionButtonConfirm}
                        onClick={() =>
                          handleAtualizarStatusReserva(
                            reserva.id,
                            "CONFIRMADA",
                            "Tem certeza que deseja CONFIRMAR esta reserva?",
                            "aprovar"
                          )
                        }
                        disabled={isCurrentOperation}
                      >
                        {isCurrentOperation && currentAction === "aprovar"
                          ? "Processando..."
                          : "Aprovar"}
                      </button>
                      <button
                        className={styles.actionButtonRejeitar}
                        onClick={() =>
                          handleAtualizarStatusReserva(
                            reserva.id,
                            "REJEITADA",
                            "Tem certeza que deseja REJEITAR esta reserva?",
                            "rejeitar"
                          )
                        }
                        disabled={isCurrentOperation}
                      >
                        {isCurrentOperation && currentAction === "rejeitar"
                          ? "Processando..."
                          : "Rejeitar"}
                      </button>
                    </>
                  )}
                  {podeCancelarLocador && (
                    <button
                      className={styles.actionButtonDelete}
                      onClick={() =>
                        handleAtualizarStatusReserva(
                          reserva.id,
                          "CANCELADA_PELO_LOCADOR",
                          "Tem certeza que deseja CANCELAR esta reserva (esta ação não poderá ser desfeita)?",
                          "cancelar"
                        )
                      }
                      disabled={isCurrentOperation}
                    >
                      {isCurrentOperation && currentAction === "cancelar"
                        ? "Cancelando..."
                        : "Cancelar Reserva"}
                    </button>
                  )}
                  {}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default GerenciadorReservasLocador;
