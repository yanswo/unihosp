import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./GerenciadorCasasLocador.module.css";
import CasaLocadorForm from "./CasaLocadorForm";
import DisponibilidadeModal from "./DisponibilidadeModal";
import { toast } from "react-toastify";

const EditIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);
const DeleteIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);
const CalendarIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

function GerenciadorCasasLocador() {
  const { token, userId } = useAuth();
  const [minhasCasas, setMinhasCasas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCasa, setEditingCasa] = useState(null);

  const [showDisponibilidadeModal, setShowDisponibilidadeModal] =
    useState(false);
  const [selectedCasaParaDisponibilidade, setSelectedCasaParaDisponibilidade] =
    useState(null);

  const fetchMinhasCasas = useCallback(async () => {
    if (!token || !userId) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://apiunihosp.onrender.com/api/locador/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "Erro ao buscar dados do locador e suas casas."
        );
      }
      setMinhasCasas(data.casas || []);
    } catch (err) {
      console.error("GerenciadorCasasLocador: Falha ao buscar casas:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    if (token && userId) {
      fetchMinhasCasas();
    }
  }, [fetchMinhasCasas, token, userId]);

  const handleAddClick = () => {
    setEditingCasa(null);
    setShowForm(true);
    setError("");
  };

  const handleEditClick = (casa) => {
    setEditingCasa(casa);
    setShowForm(true);
    setError("");
  };

  const handleDeleteClick = async (casaId) => {
    if (
      !window.confirm(
        "Tem certeza que deseja deletar esta casa? Todas as reservas e favoritos associados também serão removidos."
      )
    )
      return;
    if (!token) {
      toast.error("Token de autenticação não encontrado.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://apiunihosp.onrender.com/api/casa/${casaId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({ error: `Erro HTTP ${response.status} ao deletar.` }));
        throw new Error(errData.error || "Falha ao deletar casa.");
      }
      toast.success("Casa deletada com sucesso!");
      fetchMinhasCasas();
    } catch (err) {
      console.error("GerenciadorCasasLocador: Erro ao deletar casa:", err);
      toast.error(`Erro ao deletar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCasa = async (formDataFromForm, casaIdParaEditar) => {
    setLoading(true);
    const method = casaIdParaEditar ? "PUT" : "POST";
    const url = casaIdParaEditar
      ? `https://apiunihosp.onrender.com/api/casa/${casaIdParaEditar}`
      : "https://apiunihosp.onrender.com/api/casa";
    const payload = formDataFromForm;
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.error ||
            `Falha ao ${casaIdParaEditar ? "atualizar" : "criar"} casa.`
        );
      }
      toast.success(
        `Casa ${casaIdParaEditar ? "atualizada" : "criada"} com sucesso!`
      );
      setShowForm(false);
      setEditingCasa(null);
      fetchMinhasCasas();
    } catch (err) {
      toast.error(
        `Erro ao salvar casa: ${err.message}. Verifique os dados no formulário.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDisponibilidadeModal = (casa) => {
    setSelectedCasaParaDisponibilidade(casa);
    setShowDisponibilidadeModal(true);
  };

  const handleCloseDisponibilidadeModal = () => {
    setSelectedCasaParaDisponibilidade(null);
    setShowDisponibilidadeModal(false);
  };

  const handleBloqueioAtualizado = () => {};

  if (loading && !showForm && minhasCasas.length === 0) {
    return (
      <div className={styles.loadingFeedback}>Carregando suas casas...</div>
    );
  }

  return (
    <>
      <div className={styles.headerContainer}>
        <h3>Minhas Casas Cadastradas ({minhasCasas.length})</h3>
        {!showForm && (
          <button
            className={styles.addCasaButton}
            onClick={handleAddClick}
            disabled={loading || showForm}
          >
            Adicionar Nova Casa
          </button>
        )}
      </div>

      {error && !showForm && <p className={styles.errorFeedback}>{error}</p>}

      {showForm && (
        <CasaLocadorForm
          casaAtual={editingCasa}
          onSave={handleSaveCasa}
          onCancel={() => {
            setShowForm(false);
            setEditingCasa(null);
          }}
          isLoading={loading}
          locadorId={userId}
        />
      )}

      {!showForm && minhasCasas.length === 0 && !loading && !error && (
        <p className={styles.noCasasMessage}>
          Você ainda não cadastrou nenhuma casa.
        </p>
      )}

      {!showForm && minhasCasas.length > 0 && (
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Endereço</th>
                <th>Cidade</th>
                <th>Preço/Noite</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {minhasCasas.map((casa) => (
                <tr key={casa.id}>
                  <td>{casa.id}</td>
                  <td>
                    {casa.endereco}, {casa.numero}
                  </td>
                  <td>{casa.cidade || "N/A"}</td>
                  <td>
                    R${" "}
                    {typeof casa.precoPorNoite === "number"
                      ? casa.precoPorNoite.toFixed(2).replace(".", ",")
                      : "N/A"}
                  </td>
                  <td className={styles.actionsCell}>
                    {" "}
                    {}
                    <button
                      className={`${styles.tableActionButton} ${styles.calendarButton}`}
                      onClick={() => handleOpenDisponibilidadeModal(casa)}
                      disabled={loading}
                      title="Gerenciar Disponibilidade"
                    >
                      <CalendarIcon />
                      {}
                    </button>
                    <button
                      className={styles.tableActionButton}
                      onClick={() => handleEditClick(casa)}
                      disabled={loading}
                      title="Editar Casa"
                    >
                      <EditIcon />
                      {}
                    </button>
                    <button
                      className={styles.tableActionButtonDelete}
                      onClick={() => handleDeleteClick(casa.id)}
                      disabled={loading}
                      title="Deletar Casa"
                    >
                      <DeleteIcon />
                      {}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDisponibilidadeModal && selectedCasaParaDisponibilidade && (
        <DisponibilidadeModal
          casaId={selectedCasaParaDisponibilidade.id}
          nomeCasa={selectedCasaParaDisponibilidade.endereco}
          onClose={handleCloseDisponibilidadeModal}
          onBloqueioAtualizado={handleBloqueioAtualizado}
        />
      )}
    </>
  );
}

export default GerenciadorCasasLocador;
