import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./HistoricoReservasLocador.module.css";
import { useNavigate } from "react-router-dom";

function HistoricoReservasLocador() {
  const { token, userId } = useAuth();
  const navigate = useNavigate();
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistorico = useCallback(async () => {
    if (!token || !userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://apiunihosp.onrender.com/api/locador/reservas/historico`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || "Erro ao buscar histórico de reservas do locador."
        );
      if (Array.isArray(data)) setHistorico(data);
      else {
        setHistorico([]);
        console.warn("HistóricoReservasLocador: Dados não são array:", data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    if (token && userId) {
      fetchHistorico();
    } else if (!token || !userId) {
      setError("Autenticação necessária para visualizar o histórico.");
      setLoading(false);
    }
  }, [fetchHistorico, token, userId]);

  const formatarData = (dataISO) =>
    new Date(dataISO).toLocaleDateString("pt-BR", { timeZone: "UTC" });

  if (loading && historico.length === 0) {
    return (
      <div className={styles.loading}>Carregando histórico de reservas...</div>
    );
  }
  if (error && historico.length === 0) {
    return <div className={styles.errorFeedback}>{error}</div>;
  }

  return (
    <>
      {}
      {}
      {error && historico.length > 0 && (
        <p className={styles.errorFeedback}>{error}</p>
      )}{" "}
      {}
      {historico.length === 0 && !loading && !error ? (
        <p className={styles.noReservasMessage}>
          Nenhuma reserva encontrada no seu histórico.
        </p>
      ) : (
        <ul className={styles.reservasList}>
          {historico.map((reserva) => (
            <li
              key={reserva.id}
              className={`${styles.reservaCard} ${
                // Usando estilos do CSS module
                styles["reservaStatus" + reserva.status?.replace(/\s+/g, "")] ||
                ""
              }`}
            >
              {}
              <h4>
                Casa: {reserva.casa?.endereco || "N/A"},{" "}
                {reserva.casa?.cidade || "N/A"} (ID Casa: {reserva.casaId})
              </h4>
              <p>
                <strong>Hóspede:</strong> {reserva.hospede?.name || "N/A"} (
                {reserva.hospede?.email || "N/A"})
              </p>
              <p>
                <strong>Período:</strong> {formatarData(reserva.dataCheckIn)} -{" "}
                {formatarData(reserva.dataCheckOut)}
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
                  onClick={() => {
                    alert(
                      `Ver detalhes da Casa ID: ${reserva.casaId} (implementar)`
                    );
                  }}
                >
                  Ver Casa
                </button>
                {}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
export default HistoricoReservasLocador;
