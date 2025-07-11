/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import styles from "../../pages/AdminPage.module.css";
import CasaForm from "./CasaForm";

function GerenciarCasas({ token }) {
  const [casas, setCasas] = useState([]);
  const [locadores, setLocadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCasa, setEditingCasa] = useState(null);

  const fetchRecursos = useCallback(async () => {
    if (!token) {
      setError("Autenticação necessária.");
      return;
    }
    setLoading(true);
    setError("");
    console.log("GerenciarCasas: Buscando casas e locadores...");
    try {
      const casasResponse = await fetch("http://localhost:5000/api/casa", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const casasResponseText = await casasResponse.text();
      console.log(
        `GerenciarCasas: fetchCasas - Status: ${casasResponse.status}, Resposta Bruta: ${casasResponseText}`
      );
      if (!casasResponse.ok) {
        let errData = { error: `Erro HTTP ${casasResponse.status}` };
        try {
          errData = JSON.parse(casasResponseText);
        } catch (e) {}
        throw new Error(errData.error || `Erro ao buscar casas`);
      }
      const casasData = JSON.parse(casasResponseText);
      if (Array.isArray(casasData)) setCasas(casasData);
      else {
        setCasas([]);
        throw new Error("Formato de dados de casas inesperado.");
      }

      const locadoresResponse = await fetch(
        "http://localhost:5000/api/locador",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const locadoresResponseText = await locadoresResponse.text();
      console.log(
        `GerenciarCasas: fetchLocadores - Status: ${locadoresResponse.status}, Resposta Bruta: ${locadoresResponseText}`
      );
      if (!locadoresResponse.ok) {
        let errData = { error: `Erro HTTP ${locadoresResponse.status}` };
        try {
          errData = JSON.parse(locadoresResponseText);
        } catch (e) {}
        throw new Error(errData.error || `Erro ao buscar locadores`);
      }
      const locadoresData = JSON.parse(locadoresResponseText);
      if (Array.isArray(locadoresData)) setLocadores(locadoresData);
      else {
        setLocadores([]);
      }
    } catch (err) {
      console.error("GerenciarCasas: fetchRecursos - Falha:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRecursos();
  }, [fetchRecursos]);

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
    if (!window.confirm("Deletar esta casa?")) return;
    if (!token) {
      alert("Token não encontrado.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`http://localhost:5000/api/casa/${casaId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const responseText = await response.text();
      if (!response.ok) {
        let errData = { error: `Erro HTTP ${response.status}` };
        try {
          errData = JSON.parse(responseText);
        } catch (e) {}
        throw new Error(errData.error || "Falha ao deletar casa.");
      }
      alert("Casa deletada com sucesso!");
      fetchRecursos();
    } catch (err) {
      setError(err.message);
      alert(`Erro ao deletar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCasa = async (formDataFromForm, casaId) => {
    setLoading(true);
    setError("");
    const method = casaId ? "PUT" : "POST";
    const url = casaId
      ? `http://localhost:5000/api/casa/${casaId}`
      : "http://localhost:5000/api/casa";

    console.log(
      `GerenciarCasas: Salvando casa. Método: ${method}, URL: ${url}`
    );
    console.log("GerenciarCasas: Payload:", JSON.stringify(formDataFromForm));

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formDataFromForm),
      });
      const responseText = await response.text();
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
          result.error || `Falha ao ${casaId ? "atualizar" : "criar"} casa.`
        );
      }
      alert(`Casa ${casaId ? "atualizada" : "criada"} com sucesso!`);
      setShowForm(false);
      setEditingCasa(null);
      fetchRecursos();
    } catch (err) {
      setError(`Erro ao salvar: ${err.message}.`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !showForm) return <p>Carregando dados das casas...</p>;

  return (
    <div className={styles.crudSection}>
      <h3>Casas Cadastradas ({casas.length})</h3>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {!showForm && (
        <button
          className={styles.addButton}
          onClick={handleAddClick}
          disabled={loading}
        >
          Adicionar Nova Casa
        </button>
      )}

      {showForm && (
        <CasaForm
          casaAtual={editingCasa}
          onSave={handleSaveCasa}
          onCancel={() => {
            setShowForm(false);
            setEditingCasa(null);
            setError("");
          }}
          isLoading={loading}
          locadores={locadores}
        />
      )}

      {!showForm && casas.length === 0 && !loading ? (
        <p>Nenhuma casa encontrada.</p>
      ) : (
        !showForm &&
        casas.length > 0 && (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Endereço</th>
                <th>Número</th>
                <th>Cidade</th>
                <th>Estado</th>
                <th>Locador</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {casas.map((casa) => (
                <tr key={casa.id}>
                  <td>{casa.id}</td>
                  <td>{casa.endereco}</td>
                  <td>{casa.numero}</td>
                  <td>{casa.cidade}</td>
                  <td>{casa.estado}</td>
                  <td>
                    {casa.locador?.name || "N/A"} (ID: {casa.locadorId})
                  </td>
                  <td>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleEditClick(casa)}
                      disabled={loading}
                    >
                      Editar
                    </button>
                    <button
                      className={styles.actionButtonDelete}
                      onClick={() => handleDeleteClick(casa.id)}
                      disabled={loading}
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

export default GerenciarCasas;
