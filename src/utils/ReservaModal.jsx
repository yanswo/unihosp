import React, { useState, useEffect, useCallback } from "react";
import styles from "./ReservaModal.module.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const formatarDataParaAPI = (date) => {
  if (!date) return "";
  if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return date;
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  let month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

const paraDataUTCString = (dateObj) => {
  const d = new Date(dateObj);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
};

function ReservaModal({ isOpen, onClose, casa, onReservaSucesso }) {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [dataCheckIn, setDataCheckIn] = useState("");
  const [dataCheckOut, setDataCheckOut] = useState("");
  const [numeroHospedes, setNumeroHospedes] = useState(1);
  const [observacoes, setObservacoes] = useState("");
  const [valorCalculado, setValorCalculado] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [periodosIndisponiveis, setPeriodosIndisponiveis] = useState([]);
  const [loadingDisponibilidade, setLoadingDisponibilidade] = useState(false);

  const fetchDetalhesCasaParaDisponibilidade = useCallback(async () => {
    if (!casa || !casa.id || !isOpen) {
      setPeriodosIndisponiveis([]);
      return;
    }
    setLoadingDisponibilidade(true);
    setError("");
    try {
      const response = await fetch(
        `https://apiunihosp.onrender.com/api/casa/${casa.id}`
      );
      if (!response.ok) {
        const errText = await response.text();
        console.error(
          "Resposta de erro do backend (disponibilidade):",
          errText
        );
        throw new Error("Falha ao buscar dados de disponibilidade da casa.");
      }
      const dadosCasa = await response.json();
      const indisponibilidades = [];

      (dadosCasa.reservas || []).forEach((reserva) => {
        if (reserva.status === "CONFIRMADA" || reserva.status === "PENDENTE") {
          indisponibilidades.push({
            inicio: paraDataUTCString(new Date(reserva.dataCheckIn)),
            fim: paraDataUTCString(new Date(reserva.dataCheckOut)),
            tipo: "reserva",
          });
        }
      });

      (dadosCasa.bloqueiosDisponibilidade || []).forEach((bloqueio) => {
        indisponibilidades.push({
          inicio: paraDataUTCString(new Date(bloqueio.dataInicio)),
          fim: paraDataUTCString(new Date(bloqueio.dataFim)),
          tipo: "bloqueio",
        });
      });
      setPeriodosIndisponiveis(indisponibilidades);
    } catch (err) {
      console.error("Erro ao buscar disponibilidade:", err);
      setError(
        "Não foi possível verificar a disponibilidade da casa no momento."
      );
      setPeriodosIndisponiveis([]);
    } finally {
      setLoadingDisponibilidade(false);
    }
  }, [casa, isOpen]);

  useEffect(() => {
    if (isOpen && casa) {
      setDataCheckIn("");
      setDataCheckOut("");
      setNumeroHospedes(1);
      setObservacoes("");
      setValorCalculado(0);
      setError("");
      fetchDetalhesCasaParaDisponibilidade();
    }
  }, [isOpen, casa, fetchDetalhesCasaParaDisponibilidade]);

  useEffect(() => {
    if (dataCheckIn && dataCheckOut && casa?.precoPorNoite) {
      const checkIn = new Date(dataCheckIn + "T00:00:00");
      const checkOut = new Date(dataCheckOut + "T00:00:00");
      if (
        !isNaN(checkIn.getTime()) &&
        !isNaN(checkOut.getTime()) &&
        checkOut > checkIn
      ) {
        const diffTime = Math.abs(checkOut - checkIn);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
          setValorCalculado(diffDays * casa.precoPorNoite);
        } else {
          setValorCalculado(0);
        }
      } else {
        setValorCalculado(0);
      }
    } else {
      setValorCalculado(0);
    }
  }, [dataCheckIn, dataCheckOut, casa?.precoPorNoite]);

  if (!isOpen || !casa) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmitReserva = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (loadingDisponibilidade) {
      setError("Aguarde, verificando disponibilidade...");
      setIsLoading(false);
      return;
    }

    if (!dataCheckIn || !dataCheckOut) {
      setError("Datas de check-in e check-out são obrigatórias.");
      setIsLoading(false);
      return;
    }

    const checkInSelecionado = new Date(dataCheckIn + "T00:00:00Z");
    const checkOutSelecionado = new Date(dataCheckOut + "T00:00:00Z");

    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);

    if (checkOutSelecionado <= checkInSelecionado) {
      setError("Data de check-out deve ser posterior à data de check-in.");
      setIsLoading(false);
      return;
    }
    if (checkInSelecionado < hoje) {
      setError("Data de check-in não pode ser no passado.");
      setIsLoading(false);
      return;
    }
    if (parseInt(numeroHospedes, 10) < 1) {
      setError("Número de hóspedes deve ser pelo menos 1.");
      setIsLoading(false);
      return;
    }

    const inicioSolicitadoStr = paraDataUTCString(checkInSelecionado);
    const fimSolicitadoMenosUmDiaStr = paraDataUTCString(
      new Date(checkOutSelecionado.getTime() - 24 * 60 * 60 * 1000)
    );

    for (const periodo of periodosIndisponiveis) {
      const inicioIndisponivel = periodo.inicio;
      const fimIndisponivel = periodo.fim;

      if (
        inicioSolicitadoStr <= fimIndisponivel &&
        fimSolicitadoMenosUmDiaStr >= inicioIndisponivel
      ) {
        const tipoConflito =
          periodo.tipo === "reserva" ? "reservado" : "bloqueado pelo locador";
        setError(
          `Conflito de datas: O período de ${new Date(
            inicioIndisponivel + "T00:00:00Z"
          ).toLocaleDateString("pt-BR", { timeZone: "UTC" })} a ${new Date(
            fimIndisponivel + "T00:00:00Z"
          ).toLocaleDateString("pt-BR", {
            timeZone: "UTC",
          })} está ${tipoConflito}.`
        );
        setIsLoading(false);
        return;
      }
    }

    const payload = {
      casaId: casa.id,
      dataCheckIn: checkInSelecionado.toISOString(),
      dataCheckOut: checkOutSelecionado.toISOString(),
      numeroHospedes: parseInt(numeroHospedes, 10),
      observacoes,
    };

    try {
      const response = await fetch(
        "https://apiunihosp.onrender.com/api/reservas",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Falha ao criar reserva.");
      }

      toast.success(
        "Solicitação de reserva enviada! Você será redirecionado para a simulação de pagamento."
      );
      onClose();
      if (onReservaSucesso) onReservaSucesso(result);
      navigate(`/pagamento/simular/${result.id}`);
    } catch (err) {
      console.error("ReservaModal: Erro ao criar reserva:", err);
      setError(err.message);
      toast.error(err.message || "Não foi possível solicitar a reserva.");
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDateParaInput = (dateString) => {
    if (!dateString) return formatarDataParaAPI(new Date());
    const d = new Date(dateString + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + 1);
    return formatarDataParaAPI(d);
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Fechar modal de reserva"
        >
          &times;
        </button>
        <h3>Solicitar Reserva para:</h3>
        <p className={styles.casaEnderecoReserva}>
          {casa.endereco}, {casa.numero}
        </p>
        {error && <p className={styles.errorMessage}>{error}</p>}
        {loadingDisponibilidade && (
          <p className={styles.loadingMessage}>
            Verificando disponibilidade...
          </p>
        )}

        <form onSubmit={handleSubmitReserva} className={styles.reservaForm}>
          <div className={styles.formGroup}>
            <label htmlFor="dataCheckIn">Data de Check-in:</label>
            <input
              type="date"
              id="dataCheckIn"
              value={dataCheckIn}
              onChange={(e) => {
                setDataCheckIn(e.target.value);
                if (
                  dataCheckOut &&
                  new Date(e.target.value) >= new Date(dataCheckOut)
                ) {
                  setDataCheckOut("");
                }
              }}
              min={formatarDataParaAPI(new Date())}
              required
              disabled={isLoading || loadingDisponibilidade}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="dataCheckOut">Data de Check-out:</label>
            <input
              type="date"
              id="dataCheckOut"
              value={dataCheckOut}
              onChange={(e) => setDataCheckOut(e.target.value)}
              min={
                dataCheckIn
                  ? getMinDateParaInput(dataCheckIn)
                  : formatarDataParaAPI(new Date())
              }
              required
              disabled={isLoading || loadingDisponibilidade || !dataCheckIn}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="numeroHospedes">Número de Hóspedes:</label>
            <input
              type="number"
              id="numeroHospedes"
              value={numeroHospedes}
              min="1"
              onChange={(e) => setNumeroHospedes(e.target.value)}
              required
              disabled={isLoading || loadingDisponibilidade}
            />
          </div>

          {casa.precoPorNoite > 0 &&
            valorCalculado > 0 &&
            dataCheckIn &&
            dataCheckOut &&
            new Date(dataCheckOut) > new Date(dataCheckIn) && (
              <div className={styles.valorTotalInfo}>
                <p>
                  Valor Estimado:{" "}
                  <strong>
                    R$ {valorCalculado.toFixed(2).replace(".", ",")}
                  </strong>{" "}
                  (
                  {Math.ceil(
                    Math.abs(
                      new Date(dataCheckOut + "T00:00:00") -
                        new Date(dataCheckIn + "T00:00:00")
                    ) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  noites)
                </p>
              </div>
            )}

          <div className={styles.formGroup}>
            <label htmlFor="observacoes">Observações (opcional):</label>
            <textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows="3"
              disabled={isLoading || loadingDisponibilidade}
            ></textarea>
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButtonModal}
              onClick={onClose}
              disabled={isLoading || loadingDisponibilidade}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.confirmButtonModal}
              disabled={isLoading || loadingDisponibilidade}
            >
              {isLoading
                ? "Enviando..."
                : loadingDisponibilidade
                ? "Verificando..."
                : "Solicitar Reserva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReservaModal;
