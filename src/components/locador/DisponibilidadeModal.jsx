import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "./DisponibilidadeModal.module.css";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const formatarDataParaAPI = (date) => {
  if (!date) return "";
  const d = new Date(date);
  let month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

function DisponibilidadeModal({
  casaId,
  nomeCasa,
  onClose,
  onBloqueioAtualizado,
}) {
  const { token } = useAuth();
  const [bloqueios, setBloqueios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dataInicioBloqueio, setDataInicioBloqueio] = useState(
    formatarDataParaAPI(new Date())
  );
  const [dataFimBloqueio, setDataFimBloqueio] = useState(
    formatarDataParaAPI(new Date())
  );
  const [motivoBloqueio, setMotivoBloqueio] = useState("");
  const [submittingBloqueio, setSubmittingBloqueio] = useState(false);

  const fetchBloqueiosEReservas = useCallback(async () => {
    if (!token || !casaId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const resBloqueios = await fetch(
        `https://apiunihosp.onrender.com/api/casas/${casaId}/bloqueios`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!resBloqueios.ok) {
        const errData = await resBloqueios.json().catch(() => ({}));
        throw new Error(
          errData.error || "Falha ao buscar bloqueios de disponibilidade."
        );
      }
      const dataBloqueios = await resBloqueios.json();
      setBloqueios(Array.isArray(dataBloqueios) ? dataBloqueios : []);

      const resCasa = await fetch(
        `https://apiunihosp.onrender.com/api/casa/${casaId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!resCasa.ok) {
        const errData = await resCasa.json().catch(() => ({}));
        throw new Error(
          errData.error || "Falha ao buscar detalhes da casa para reservas."
        );
      }
      const dataCasa = await resCasa.json();
      setReservas(Array.isArray(dataCasa.reservas) ? dataCasa.reservas : []);
    } catch (err) {
      console.error("Erro ao buscar dados de disponibilidade:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [casaId, token]);

  useEffect(() => {
    fetchBloqueiosEReservas();
  }, [fetchBloqueiosEReservas]);

  const handleAdicionarBloqueio = async (e) => {
    e.preventDefault();
    if (!dataInicioBloqueio || !dataFimBloqueio) {
      toast.error("Datas de início e fim do bloqueio são obrigatórias.");
      return;
    }
    if (new Date(dataFimBloqueio) < new Date(dataInicioBloqueio)) {
      toast.error("A data de fim não pode ser anterior à data de início.");
      return;
    }
    setSubmittingBloqueio(true);
    try {
      const response = await fetch(
        `https://apiunihosp.onrender.com/api/casas/${casaId}/bloqueios`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            dataInicio: dataInicioBloqueio,
            dataFim: dataFimBloqueio,
            motivo: motivoBloqueio,
          }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Falha ao adicionar bloqueio.");
      }
      toast.success("Período de indisponibilidade adicionado!");
      setDataInicioBloqueio(formatarDataParaAPI(new Date()));
      setDataFimBloqueio(formatarDataParaAPI(new Date()));
      setMotivoBloqueio("");
      fetchBloqueiosEReservas();
      if (onBloqueioAtualizado) onBloqueioAtualizado();
    } catch (err) {
      console.error("Erro ao adicionar bloqueio:", err);
      toast.error(`Erro: ${err.message}`);
    } finally {
      setSubmittingBloqueio(false);
    }
  };

  const handleRemoverBloqueio = async (bloqueioId) => {
    if (
      !window.confirm(
        "Tem certeza que deseja remover este período de indisponibilidade?"
      )
    )
      return;
    try {
      const response = await fetch(
        `https://apiunihosp.onrender.com/api/bloqueios/${bloqueioId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Falha ao remover bloqueio.");
      }
      toast.success("Bloqueio removido com sucesso!");
      fetchBloqueiosEReservas();
      if (onBloqueioAtualizado) onBloqueioAtualizado();
    } catch (err) {
      console.error("Erro ao remover bloqueio:", err);
      toast.error(`Erro: ${err.message}`);
    }
  };

  const tileDisabled = ({ date, view }) => {
    if (view === "month") {
      const currentDate = formatarDataParaAPI(date);
      for (const reserva of reservas) {
        if (
          currentDate >= formatarDataParaAPI(reserva.dataCheckIn) &&
          currentDate <= formatarDataParaAPI(reserva.dataCheckOut)
        ) {
          return true;
        }
      }
      for (const bloqueio of bloqueios) {
        if (
          currentDate >= formatarDataParaAPI(bloqueio.dataInicio) &&
          currentDate <= formatarDataParaAPI(bloqueio.dataFim)
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const currentDateStr = formatarDataParaAPI(date);
      for (const reserva of reservas) {
        if (
          currentDateStr >= formatarDataParaAPI(reserva.dataCheckIn) &&
          currentDateStr <= formatarDataParaAPI(reserva.dataCheckOut)
        ) {
          return styles.dataReservada;
        }
      }
      for (const bloqueio of bloqueios) {
        if (
          currentDateStr >= formatarDataParaAPI(bloqueio.dataInicio) &&
          currentDateStr <= formatarDataParaAPI(bloqueio.dataFim)
        ) {
          return styles.dataBloqueadaManualmente;
        }
      }
    }
    return null;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Fechar modal de disponibilidade"
        >
          &times; {}
        </button>
        <h3 className={styles.modalTitle}>
          Gerenciar Disponibilidade{nomeCasa ? `: ${nomeCasa}` : ""}
        </h3>

        {loading && (
          <p className={styles.loading}>
            Carregando dados de disponibilidade...
          </p>
        )}
        {error && !loading && <p className={styles.errorFeedback}>{error}</p>}

        {!loading && (
          <div className={styles.conteudoModal}>
            <div className={styles.calendarioContainer}>
              <h4>Calendário</h4>
              <Calendar
                tileDisabled={tileDisabled}
                tileClassName={tileClassName}
                minDate={new Date()}
              />
              <div className={styles.legendaCalendario}>
                <span
                  className={`${styles.legendaItem} ${styles.legendaReservado}`}
                >
                  Reservado
                </span>
                <span
                  className={`${styles.legendaItem} ${styles.legendaBloqueadoManualmente}`}
                >
                  Bloqueado Manualmente
                </span>
              </div>
            </div>

            <div className={styles.formularioEListaBloqueios}>
              <form
                onSubmit={handleAdicionarBloqueio}
                className={styles.formBloqueio}
              >
                <h4>Adicionar Período de Indisponibilidade</h4>
                <div className={styles.inputGroup}>
                  <label htmlFor="dataInicioBloqueio">Data Início:</label>
                  <input
                    type="date"
                    id="dataInicioBloqueio"
                    value={dataInicioBloqueio}
                    onChange={(e) => setDataInicioBloqueio(e.target.value)}
                    min={formatarDataParaAPI(new Date())}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="dataFimBloqueio">Data Fim:</label>
                  <input
                    type="date"
                    id="dataFimBloqueio"
                    value={dataFimBloqueio}
                    onChange={(e) => setDataFimBloqueio(e.target.value)}
                    min={dataInicioBloqueio || formatarDataParaAPI(new Date())}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="motivoBloqueio">Motivo (opcional):</label>
                  <input
                    type="text"
                    id="motivoBloqueio"
                    value={motivoBloqueio}
                    onChange={(e) => setMotivoBloqueio(e.target.value)}
                    placeholder="Ex: Manutenção, Uso pessoal"
                  />
                </div>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={submittingBloqueio}
                >
                  {submittingBloqueio ? "Adicionando..." : "Adicionar Bloqueio"}
                </button>
              </form>

              <div className={styles.listaBloqueiosManuais}>
                <h4>Bloqueios Manuais Ativos</h4>
                {bloqueios.length === 0 ? (
                  <p>Nenhum período bloqueado manualmente.</p>
                ) : (
                  <ul>
                    {bloqueios.map((bloqueio) => (
                      <li key={bloqueio.id}>
                        De{" "}
                        {new Date(bloqueio.dataInicio).toLocaleDateString(
                          "pt-BR",
                          { timeZone: "UTC" }
                        )}{" "}
                        até{" "}
                        {new Date(bloqueio.dataFim).toLocaleDateString(
                          "pt-BR",
                          { timeZone: "UTC" }
                        )}
                        {bloqueio.motivo && ` (${bloqueio.motivo})`}
                        <button
                          onClick={() => handleRemoverBloqueio(bloqueio.id)}
                          className={styles.botaoRemoverPequeno}
                        >
                          Remover
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DisponibilidadeModal;
