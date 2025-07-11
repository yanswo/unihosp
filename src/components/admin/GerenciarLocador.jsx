/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import styles from "../../pages/AdminPage.module.css";
import LocadorForm from "./LocadorForm";

function GerenciarLocadores({ token }) {
  const [locadores, setLocadores] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingLocador, setEditingLocador] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);

  const fetchLocadores = useCallback(async () => {
    if (!token) {
      console.warn(
        "GerenciarLocadores: Token ausente, não buscando locadores."
      );
      setError("Autenticação necessária.");
      return;
    }
    setLoadingList(true);
    setError("");
    console.log("GerenciarLocadores: Buscando locadores...");
    try {
      const response = await fetch("http://localhost:5000/api/locador", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const responseText = await response.text();
      console.log(
        `GerenciarLocadores: fetchLocadores - Status: ${response.status}, Resposta Bruta: ${responseText}`
      );
      if (!response.ok) {
        let errData = { error: `Erro HTTP ${response.status}` };
        try {
          errData = JSON.parse(responseText);
        } catch (e) {}
        throw new Error(errData.error || `Erro ao buscar locadores`);
      }
      const data = JSON.parse(responseText);
      if (Array.isArray(data)) {
        setLocadores(data);
      } else {
        setLocadores([]);
        throw new Error("Formato de dados inesperado.");
      }
    } catch (err) {
      console.error("GerenciarLocadores: fetchLocadores - Falha:", err);
      setError(err.message);
    } finally {
      setLoadingList(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLocadores();
  }, [fetchLocadores]);

  const handleAddClick = () => {
    setEditingLocador(null);
    setShowForm(true);
    setError("");
  };
  const handleEditClick = (locador) => {
    setEditingLocador(locador);
    setShowForm(true);
    setError("");
  };

  const handleDeleteClick = async (locadorId) => {
    if (
      !window.confirm(
        "Deletar este locador? Suas casas associadas também podem ser afetadas."
      )
    )
      return;
    if (!token) {
      alert("Token não encontrado.");
      return;
    }

    setOperationLoading(true);
    setError("");
    console.log(`GerenciarLocadores: Deletando locador ID: ${locadorId}`);
    try {
      const response = await fetch(
        `http://localhost:5000/api/locador/${locadorId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const responseText = await response.text();
      console.log(
        `GerenciarLocadores: handleDelete - Status: ${response.status}, Resposta: ${responseText}`
      );
      if (!response.ok) {
        let errData = { error: `Erro HTTP ${response.status}` };
        try {
          errData = JSON.parse(responseText);
        } catch (e) {}
        throw new Error(errData.error || "Falha ao deletar locador.");
      }
      alert("Locador deletado com sucesso!");
      fetchLocadores();
    } catch (err) {
      console.error("GerenciarLocadores: handleDelete - Falha:", err);
      setError(err.message);
      alert(`Erro ao deletar: ${err.message}`);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleSaveLocador = async (formDataFromForm, locadorId) => {
    setOperationLoading(true);
    setError("");
    const method = locadorId ? "PUT" : "POST";
    const url = locadorId
      ? `http://localhost:5000/api/locador/${locadorId}`
      : "http://localhost:5000/api/locador";

    console.log(
      `GerenciarLocadores: Salvando locador. Método: ${method}, URL: ${url}`
    );
    console.log(
      "GerenciarLocadores: Payload:",
      JSON.stringify(formDataFromForm)
    );

    const headers = { "Content-Type": "application/json" };
    if (token && method === "PUT") {
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
        `GerenciarLocadores: handleSave - Status: ${response.status}, Resposta: ${responseText}`
      );
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        if (!response.ok)
          throw new Error(responseText || `Erro ${response.status}`);
        result = { message: "Operação bem-sucedida, resposta não JSON." };
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
            `Falha ao ${locadorId ? "atualizar" : "criar"} locador.`
        );
      }
      alert(`Locador ${locadorId ? "atualizado" : "criado"} com sucesso!`);
      setShowForm(false);
      setEditingLocador(null);
      fetchLocadores();
    } catch (err) {
      console.error(`GerenciarLocadores: handleSave - Falha (${method}):`, err);
      setError(`Erro ao salvar: ${err.message}.`);
    } finally {
      setOperationLoading(false);
    }
  };

  if (loadingList && !showForm) return <p>Carregando locadores...</p>;

  return (
    <div className={styles.crudSection}>
      <h3>Locadores Cadastrados ({locadores.length})</h3>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {!showForm && (
        <button
          className={styles.addButton}
          onClick={handleAddClick}
          disabled={operationLoading}
        >
          Adicionar Novo Locador
        </button>
      )}

      {showForm && (
        <LocadorForm
          locadorAtual={editingLocador}
          onSave={handleSaveLocador}
          onCancel={() => {
            setShowForm(false);
            setEditingLocador(null);
            setError("");
          }}
          isLoading={operationLoading}
        />
      )}

      {!showForm && locadores.length === 0 && !loadingList ? (
        <p>Nenhum locador encontrado.</p>
      ) : (
        !showForm &&
        locadores.length > 0 && (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>CPF</th>
                <th>Endereço</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {locadores.map((locador) => (
                <tr key={locador.id}>
                  <td>{locador.id}</td>
                  <td>{locador.name}</td>
                  <td>{locador.email}</td>
                  <td>{locador.cpf}</td>
                  <td>{locador.endereco}</td>
                  <td>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleEditClick(locador)}
                      disabled={operationLoading}
                    >
                      Editar
                    </button>
                    <button
                      className={styles.actionButtonDelete}
                      onClick={() => handleDeleteClick(locador.id)}
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

export default GerenciarLocadores;
