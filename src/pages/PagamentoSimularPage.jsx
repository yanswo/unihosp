import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./PagamentoSimularPage.module.css";
import jsPDF from "jspdf";

function PagamentoSimularPage() {
  const { reservaId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [simulandoPagamento, setSimulandoPagamento] = useState(false);
  const [pagamentoSucesso, setPagamentoSucesso] = useState(false);

  const fetchReservaDetalhes = useCallback(async () => {
    if (!token || !reservaId) {
      setError("Dados da reserva ou autenticação ausentes.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://apiunihosp.onrender.com/api/reservas/${reservaId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({ error: `Erro HTTP ${response.status}` }));
        throw new Error(
          errData.error || "Falha ao buscar detalhes da reserva."
        );
      }
      const data = await response.json();
      setReserva(data);
    } catch (err) {
      console.error("Erro ao buscar detalhes da reserva:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [reservaId, token]);

  useEffect(() => {
    fetchReservaDetalhes();
  }, [fetchReservaDetalhes]);

  const gerarReciboPDF = () => {
    if (!reserva) return;

    const doc = new jsPDF();
    const dataSimulacao = new Date().toLocaleDateString("pt-BR");
    const horaSimulacao = new Date().toLocaleTimeString("pt-BR");

    doc.setFontSize(18);
    doc.text("Recibo de Reserva Simulada - UniHosp", 14, 22);

    doc.setFontSize(12);
    doc.text(`Data da Simulação: ${dataSimulacao} às ${horaSimulacao}`, 14, 32);
    doc.text(`ID da Reserva: ${reserva.id}`, 14, 42);
    doc.text(`ID da Transação Simulada: SIM-${Date.now()}`, 14, 52);

    doc.setFontSize(14);
    doc.text("Detalhes do Hóspede:", 14, 70);
    doc.setFontSize(12);
    doc.text(`Nome: ${reserva.hospede?.name || "N/A"}`, 14, 78);
    doc.text(`Email: ${reserva.hospede?.email || "N/A"}`, 14, 86);

    doc.setFontSize(14);
    doc.text("Detalhes da Acomodação:", 14, 104);
    doc.setFontSize(12);
    doc.text(
      `Propriedade: ${reserva.casa?.endereco || ""}, ${
        reserva.casa?.numero || ""
      }`,
      14,
      112
    );
    doc.text(`Cidade: ${reserva.casa?.cidade || "N/A"}`, 14, 120);
    doc.text(`Locador: ${reserva.locador?.name || "N/A"}`, 14, 128);

    doc.setFontSize(14);
    doc.text("Detalhes da Reserva:", 14, 146);
    doc.setFontSize(12);
    doc.text(`Check-in: ${formatarData(reserva.dataCheckIn)}`, 14, 154);
    doc.text(`Check-out: ${formatarData(reserva.dataCheckOut)}`, 14, 162);
    doc.text(`Número de Hóspedes: ${reserva.numeroHospedes}`, 14, 170);

    doc.setFontSize(14);
    doc.text("Detalhes do Pagamento (Simulado):", 14, 188);
    doc.setFontSize(12);
    doc.text(
      `Valor Total: R$ ${parseFloat(reserva.valorTotalCalculado || 0)
        .toFixed(2)
        .replace(".", ",")}`,
      14,
      196
    );
    doc.text(
      `Status do Pagamento: ${reserva.statusPagamento || "N/A"}`,
      14,
      204
    );
    doc.text(`Status da Reserva: ${reserva.status || "N/A"}`, 14, 212);

    doc.setFontSize(10);
    doc.text(
      "Este é um comprovante de uma transação simulada para fins de desenvolvimento.",
      14,
      230
    );
    doc.text(
      "Nenhum valor real foi cobrado e nenhum serviço de hospedagem real foi contratado.",
      14,
      236
    );

    doc.save(`recibo-simulado-reserva-${reserva.id}.pdf`);
  };

  const handleSimularPagamento = async () => {
    setSimulandoPagamento(true);
    setError("");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const response = await fetch(
        `https://apiunihosp.onrender.com/api/reservas/${reservaId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "CONFIRMADA" }),
        }
      );

      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({ error: "Falha ao atualizar status da reserva." }));
        throw new Error(errData.error);
      }

      const reservaAtualizadaDoBackend = await response.json();
      setReserva(reservaAtualizadaDoBackend);
      setPagamentoSucesso(true);
    } catch (err) {
      console.error("Erro na simulação de pagamento:", err);
      setError(err.message || "Ocorreu um erro ao simular o pagamento.");
      setPagamentoSucesso(false);
    } finally {
      setSimulandoPagamento(false);
    }
  };

  useEffect(() => {
    if (pagamentoSucesso && reserva && reserva.status === "CONFIRMADA") {
      gerarReciboPDF();
    }
  }, [pagamentoSucesso, reserva]);

  const formatarData = (dataISO) => {
    if (!dataISO) return "N/A";
    return new Date(dataISO).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Carregando detalhes da reserva...</p>
      </div>
    );
  }

  if (error && !reserva && !pagamentoSucesso) {
    return (
      <div className={styles.errorContainer}>
        <p>Erro: {error}</p>
      </div>
    );
  }

  if (!reserva && !pagamentoSucesso) {
    return (
      <div className={styles.errorContainer}>
        <p>Reserva não encontrada ou dados insuficientes.</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.paymentCard}>
        <h1 className={styles.title}>Simulação de Pagamento</h1>

        {pagamentoSucesso && reserva ? (
          <div className={styles.successMessage}>
            <h2>Pagamento Simulado com Sucesso!</h2>
            <p>
              Sua reserva para "{reserva.casa?.endereco}" (
              {reserva.casa?.numero}, {reserva.casa?.cidade}) foi confirmada.
            </p>
            <p>Status: {reserva.status}</p>
            <p>Status Pagamento: {reserva.statusPagamento}</p>
            <p style={{ marginTop: "15px", fontSize: "0.9em", color: "#555" }}>
              Um recibo em PDF foi gerado e o download deve ter iniciado
              automaticamente.
            </p>
            <p style={{ fontSize: "0.9em", color: "#555" }}>
              (Simulação: Um e-mail de confirmação seria enviado para:{" "}
              {reserva.hospede?.email || "email não disponível"})
            </p>
            <button
              onClick={() =>
                navigate("/hospede/dashboard", { state: { view: "ativas" } })
              }
              className={styles.actionButton}
              style={{ marginTop: "20px" }}
            >
              Ver Minhas Reservas
            </button>
          </div>
        ) : reserva ? (
          <>
            <div className={styles.reservaInfo}>
              <h2>Detalhes da Reserva</h2>
              <p>
                <strong>Propriedade:</strong> {reserva.casa?.endereco},{" "}
                {reserva.casa?.numero} - {reserva.casa?.cidade}
              </p>
              <p>
                <strong>Check-in:</strong> {formatarData(reserva.dataCheckIn)}
              </p>
              <p>
                <strong>Check-out:</strong> {formatarData(reserva.dataCheckOut)}
              </p>
              <p>
                <strong>Hóspedes:</strong> {reserva.numeroHospedes}
              </p>
              <p className={styles.valorTotal}>
                <strong>Valor Total:</strong> R${" "}
                {parseFloat(reserva.valorTotalCalculado || 0)
                  .toFixed(2)
                  .replace(".", ",")}
              </p>
              {reserva.status && (
                <p>
                  <strong>Status Atual:</strong>{" "}
                  <span
                    className={`${styles.status} ${
                      styles["status" + reserva.status.replace(/\s+/g, "")] ||
                      styles.statusDefault
                    }`}
                  >
                    {reserva.status}
                  </span>
                </p>
              )}
              {reserva.statusPagamento && (
                <p>
                  <strong>Status Pagamento:</strong>{" "}
                  <span
                    className={`${styles.status} ${
                      styles[
                        "status" + reserva.statusPagamento.replace(/\s+/g, "")
                      ] || styles.statusDefault
                    }`}
                  >
                    {reserva.statusPagamento}
                  </span>
                </p>
              )}
            </div>

            {error && <p className={styles.errorMessageGlobal}>{error}</p>}

            <div className={styles.paymentActions}>
              <p>Esta é uma simulação. Nenhum valor real será cobrado.</p>
              <button
                onClick={handleSimularPagamento}
                disabled={
                  simulandoPagamento || reserva?.status === "CONFIRMADA"
                }
                className={styles.actionButton}
              >
                {simulandoPagamento
                  ? "Processando Simulação..."
                  : reserva?.status === "CONFIRMADA"
                  ? "Pagamento Confirmado"
                  : "Simular Pagamento Agora"}
              </button>
            </div>
          </>
        ) : (
          <div className={styles.errorContainer}>
            <p>Não foi possível carregar os dados da reserva para pagamento.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PagamentoSimularPage;
