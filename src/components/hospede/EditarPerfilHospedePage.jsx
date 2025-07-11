import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./EditarPerfilHospedePage.module.css";
import DashboardHeader from "./DashboardHeader";

const UserIcon = () => <span className={styles.icon}>&#128100;</span>;
const EmailIcon = () => <span className={styles.icon}>&#128231;</span>;
const LockIcon = () => <span className={styles.icon}>&#128274;</span>;
const CpfIcon = () => <span className={styles.icon}>&#128196;</span>;
const CepIcon = () => <span className={styles.icon}>&#128230;</span>;
const CityIcon = () => <span className={styles.icon}>&#127961;</span>;
const StateIcon = () => <span className={styles.icon}>&#127463;&#127479;</span>;
const MatriculaIcon = () => <span className={styles.icon}>&#127891;</span>;
const UniversityIcon = () => <span className={styles.icon}>&#127979;</span>;

function EditarPerfilHospedePage() {
  const { token, userId } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    senha: "",
    cpf: "",
    cep: "",
    cidade: "",
    estado: "",
    matricula: "",
    universidade: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchHospedeData = useCallback(async () => {
    if (!token || !userId) {
      setError("Não autenticado.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://apiunihosp.onrender.com/api/hospede/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({ error: `Erro HTTP ${response.status}` }));
        throw new Error(errData.error || "Erro ao buscar dados do perfil.");
      }
      const data = await response.json();
      setFormData({
        name: data.name || "",
        email: data.email || "",
        senha: "",
        cpf: data.cpf || "",
        cep: data.cep || "",
        cidade: data.cidade || "",
        estado: data.estado || "",
        matricula: data.matricula || "",
        universidade: data.universidade || "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    fetchHospedeData();
  }, [fetchHospedeData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !userId) {
      setError("Não autenticado. Não é possível salvar.");
      return;
    }
    setSubmitLoading(true);
    setError("");
    setSuccessMessage("");

    const payload = { ...formData };
    if (!payload.senha || payload.senha.trim() === "") {
      delete payload.senha;
    } else if (payload.senha.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      setSubmitLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://apiunihosp.onrender.com/api/hospede/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({ error: `Erro HTTP ${response.status}` }));
        throw new Error(errData.error || "Erro ao atualizar perfil.");
      }
      const result = await response.json();
      setSuccessMessage("Perfil atualizado com sucesso!");
      console.log("Perfil atualizado:", result);
      setFormData((prev) => ({ ...prev, senha: "" }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <DashboardHeader />
        <div className={styles.dashboardContent}>
          <section className={styles.dashboardSection}>
            <p className={styles.loading}>Carregando dados do perfil...</p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <DashboardHeader />
      <div className={styles.dashboardContent}>
        <section className={styles.dashboardSection}>
          <h3>Editar Meu Perfil</h3>
          {}
          {error && !submitLoading && (
            <p className={styles.errorMessage}>{error}</p>
          )}
          {successMessage && (
            <p className={styles.successMessage}>{successMessage}</p>
          )}

          <form onSubmit={handleSubmit} className={styles.profileEditForm}>
            <div className={styles.formGrid}>
              <div className={styles.inputGroupAdmin}>
                {" "}
                {}
                <UserIcon />
                <input
                  className={styles.formInput}
                  type="text"
                  name="name"
                  placeholder="Nome Completo"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={submitLoading}
                />
              </div>
              <div className={styles.inputGroupAdmin}>
                <EmailIcon />
                <input
                  className={styles.formInput}
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={submitLoading}
                />
              </div>
              <div
                className={styles.inputGroupAdmin}
                style={{ gridColumn: "span 2" }}
              >
                <LockIcon />
                <input
                  className={styles.formInput}
                  type="password"
                  name="senha"
                  placeholder="Nova Senha (deixe em branco para não alterar)"
                  value={formData.senha}
                  onChange={handleChange}
                  disabled={submitLoading}
                />
              </div>
              <div className={styles.inputGroupAdmin}>
                <CpfIcon />
                <input
                  className={styles.formInput}
                  type="text"
                  name="cpf"
                  placeholder="CPF"
                  value={formData.cpf}
                  onChange={handleChange}
                  required
                  disabled={submitLoading}
                />
              </div>
              <div className={styles.inputGroupAdmin}>
                <CepIcon />
                <input
                  className={styles.formInput}
                  type="text"
                  name="cep"
                  placeholder="CEP"
                  value={formData.cep}
                  onChange={handleChange}
                  disabled={submitLoading}
                />
              </div>
              <div className={styles.inputGroupAdmin}>
                <CityIcon />
                <input
                  className={styles.formInput}
                  type="text"
                  name="cidade"
                  placeholder="Cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  disabled={submitLoading}
                />
              </div>
              <div className={styles.inputGroupAdmin}>
                <StateIcon />
                <input
                  className={styles.formInput}
                  type="text"
                  name="estado"
                  placeholder="Estado (UF)"
                  value={formData.estado}
                  onChange={handleChange}
                  disabled={submitLoading}
                />
              </div>
              <div className={styles.inputGroupAdmin}>
                <MatriculaIcon />
                <input
                  className={styles.formInput}
                  type="text"
                  name="matricula"
                  placeholder="Matrícula"
                  value={formData.matricula}
                  onChange={handleChange}
                  required
                  disabled={submitLoading}
                />
              </div>
              <div className={styles.inputGroupAdmin}>
                <UniversityIcon />
                <input
                  className={styles.formInput}
                  type="text"
                  name="universidade"
                  placeholder="Universidade"
                  value={formData.universidade}
                  onChange={handleChange}
                  disabled={submitLoading}
                />
              </div>
            </div>
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => navigate("/hospede/dashboard")}
                disabled={submitLoading}
              >
                Voltar ao Painel
              </button>
              <button
                type="submit"
                className={styles.actionButton}
                disabled={submitLoading}
              >
                {submitLoading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default EditarPerfilHospedePage;
