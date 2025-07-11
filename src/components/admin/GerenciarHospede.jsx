/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import styles from "../../pages/AdminPage.module.css";
import HospedeForm from "./HospedeForm";

function GerenciarHospedes({ token }) {
  const [hospedes, setHospedes] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingHospede, setEditingHospede] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);

  const fetchHospedes = useCallback(async () => {
    if (!token) {
      console.warn("GerenciarHospedes: Token ausente, não buscando hóspedes.");
      setError("Autenticação necessária para buscar hóspedes.");
      return;
    }
    setLoadingList(true);
    setError("");
    console.log("GerenciarHospedes: Iniciando fetchHospedes com token.");
    try {
      const response = await fetch(
        "https://apiunihosp.onrender.com/api/hospede",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const responseText = await response.text();
      console.log(
        `GerenciarHospedes: fetchHospedes - Status: ${response.status}, Resposta Bruta: ${responseText}`
      );

      if (!response.ok) {
        let errorMsg = `Erro HTTP ${response.status}: ${response.statusText}`;
        try {
          const errData = JSON.parse(responseText);
          errorMsg = errData.error || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const data = JSON.parse(responseText);
      if (Array.isArray(data)) {
        console.log(
          "GerenciarHospedes: fetchHospedes - Hóspedes recebidos:",
          data.length,
          "itens"
        );
        setHospedes(data);
      } else {
        console.error(
          "GerenciarHospedes: fetchHospedes - Dados recebidos não são um array:",
          data
        );
        setHospedes([]);
        throw new Error(
          "Formato de dados inesperado do servidor ao listar hóspedes."
        );
      }
    } catch (err) {
      console.error("GerenciarHospedes: fetchHospedes - Falha:", err);
      setError(err.message);
    } finally {
      setLoadingList(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHospedes();
  }, [fetchHospedes]);

  const handleAddClick = () => {
    setEditingHospede(null);
    setShowForm(true);
    setError("");
  };
  const handleEditClick = (hospede) => {
    setEditingHospede(hospede);
    setShowForm(true);
    setError("");
  };

  const handleDeleteClick = async (hospedeId) => {
    if (!window.confirm("Deletar este hóspede?")) return;
    if (!token) {
      alert("Token não encontrado.");
      return;
    }

    setOperationLoading(true);
    setError("");
    console.log(`GerenciarHospedes: Deletando hóspede ID: ${hospedeId}`);
    try {
      const response = await fetch(
        `https://apiunihosp.onrender.com/api/hospede/${hospedeId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const responseText = await response.text();
      console.log(
        `GerenciarHospedes: handleDeleteClick - Status: ${response.status}, Resposta Bruta: ${responseText}`
      );

      if (!response.ok) {
        let errorMsg = `Erro HTTP ${response.status}: ${response.statusText}`;
        try {
          const errData = JSON.parse(responseText);
          errorMsg = errData.error || errData.message || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }
      alert("Hóspede deletado!");
      fetchHospedes();
    } catch (err) {
      console.error("GerenciarHospedes: handleDeleteClick - Falha:", err);
      setError(err.message);
      alert(`Erro ao deletar: ${err.message}`);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleSaveHospede = async (formDataFromForm, hospedeId) => {
    setOperationLoading(true);
    setError("");
    const method = hospedeId ? "PUT" : "POST";
    const url = hospedeId
      ? `https://apiunihosp.onrender.com/api/hospede/${hospedeId}`
      : "https://apiunihosp.onrender.com/api/hospede";

    console.log(
      `GerenciarHospedes: handleSaveHospede - Método: ${method}, URL: ${url}`
    );
    console.log(
      "GerenciarHospedes: handleSaveHospede - Payload:",
      JSON.stringify(formDataFromForm)
    );

    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(formDataFromForm),
      });
      const responseText = await response.text();
      console.log(
        `GerenciarHospedes: handleSaveHospede - Status: ${response.status}, Resposta Bruta: ${responseText}`
      );

      if (!response.ok) {
        let errorMsg = `Erro HTTP ${response.status}: ${response.statusText}`;
        try {
          const errData = JSON.parse(responseText);
          errorMsg = errData.error || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }
      const result = JSON.parse(responseText);
      console.log(
        "GerenciarHospedes: handleSaveHospede - Sucesso, Resultado:",
        result
      );
      alert(`Hóspede ${hospedeId ? "atualizado" : "criado"} com sucesso!`);
      setShowForm(false);
      setEditingHospede(null);
      fetchHospedes();
    } catch (err) {
      console.error(
        `GerenciarHospedes: handleSaveHospede - Falha (${method}):`,
        err
      );
      setError(
        `Erro ao salvar: ${err.message}. Verifique os dados e tente novamente.`
      );
    } finally {
      setOperationLoading(false);
    }
  };

  if (loadingList && !showForm) return <p>Carregando hóspedes...</p>;

  return (
    <div className={styles.crudSection}>
      <h3>Hóspedes Cadastrados ({hospedes.length})</h3>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {!showForm && (
        <button
          className={styles.addButton}
          onClick={handleAddClick}
          disabled={operationLoading}
        >
          Adicionar Novo Hóspede
        </button>
      )}

      {showForm && (
        <HospedeForm
          hospedeAtual={editingHospede}
          onSave={handleSaveHospede}
          onCancel={() => {
            setShowForm(false);
            setEditingHospede(null);
            setError("");
          }}
          isLoading={operationLoading}
        />
      )}

      {!showForm && hospedes.length === 0 && !loadingList ? (
        <p>Nenhum hóspede encontrado.</p>
      ) : (
        !showForm &&
        hospedes.length > 0 && (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>CPF</th>
                <th>Universidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {hospedes.map((hospede) => (
                <tr key={hospede.id}>
                  <td>{hospede.id}</td>
                  <td>{hospede.name}</td>
                  <td>{hospede.email}</td>
                  <td>{hospede.cpf}</td>
                  <td>{hospede.universidade}</td>
                  <td>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleEditClick(hospede)}
                      disabled={operationLoading}
                    >
                      Editar
                    </button>
                    <button
                      className={styles.actionButtonDelete}
                      onClick={() => handleDeleteClick(hospede.id)}
                      disabled={operationLoading}
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
}

export default GerenciarHospedes;
