/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import styles from "../../pages/AdminPage.module.css";
import AdminForm from "./AdminForm";

function GerenciarAdmins({ token }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  const fetchAdmins = useCallback(async () => {
    if (!token) {
      setError("Autenticação necessária.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const responseText = await response.text();
      if (!response.ok) {
        let errData = { error: `Erro HTTP ${response.status}` };
        try {
          errData = JSON.parse(responseText);
        } catch (e) {}
        throw new Error(errData.error || "Erro ao buscar admins");
      }
      const data = JSON.parse(responseText);
      if (Array.isArray(data)) setAdmins(data);
      else {
        setAdmins([]);
        throw new Error("Dados de admins inesperados.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleAddClick = () => {
    setEditingAdmin(null);
    setShowForm(true);
    setError("");
  };
  const handleEditClick = (admin) => {
    setEditingAdmin(admin);
    setShowForm(true);
    setError("");
  };

  const handleDeleteClick = async (adminId) => {
    if (!window.confirm("Deletar este administrador?")) return;
    if (!token) {
      alert("Token não encontrado.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/${adminId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const responseText = await response.text();
      if (!response.ok) {
        let errData = { error: `Erro HTTP ${response.status}` };
        try {
          errData = JSON.parse(responseText);
        } catch (e) {}
        throw new Error(errData.error || "Falha ao deletar admin.");
      }
      alert("Administrador deletado!");
      fetchAdmins();
    } catch (err) {
      setError(err.message);
      alert(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAdmin = async (formData, adminId) => {
    setLoading(true);
    setError("");
    const method = adminId ? "PUT" : "POST";
    const url = adminId
      ? `http://localhost:5000/api/admin/${adminId}`
      : "http://localhost:5000/api/admin";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        if (!response.ok)
          throw new Error(responseText || `Erro ${response.status}`);
        result = { message: "Operação OK, resposta não JSON." };
      }
      if (!response.ok)
        throw new Error(
          result.error || `Falha ao ${adminId ? "atualizar" : "criar"} admin.`
        );
      alert(`Admin ${adminId ? "atualizado" : "criado"}!`);
      setShowForm(false);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (err) {
      setError(`Erro ao salvar: ${err.message}.`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !showForm) return <p>Carregando administradores...</p>;

  return (
    <div className={styles.crudSection}>
      <h3>Administradores ({admins.length})</h3>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {!showForm && (
        <button
          className={styles.addButton}
          onClick={handleAddClick}
          disabled={loading}
        >
          Adicionar Admin
        </button>
      )}
      {showForm && (
        <AdminForm
          adminAtual={editingAdmin}
          onSave={handleSaveAdmin}
          onCancel={() => {
            setShowForm(false);
            setEditingAdmin(null);
            setError("");
          }}
          isLoading={loading}
        />
      )}
      {!showForm && admins.length === 0 && !loading ? (
        <p>Nenhum admin.</p>
      ) : (
        !showForm &&
        admins.length > 0 && (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.id}</td>
                  <td>{admin.name}</td>
                  <td>{admin.email}</td>
                  <td>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleEditClick(admin)}
                      disabled={loading}
                    >
                      Editar
                    </button>
                    <button
                      className={styles.actionButtonDelete}
                      onClick={() => handleDeleteClick(admin.id)}
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
export default GerenciarAdmins;
