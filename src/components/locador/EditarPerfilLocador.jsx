import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./EditarPerfilLocadorPage.module.css";
import DashboardHeader from "../hospede/DashboardHeader";
import { toast } from 'react-toastify';

const UserIcon = () => <span className={styles.icon}>&#128100;</span>;
const EmailIcon = () => <span className={styles.icon}>&#128231;</span>;
const LockIcon = () => <span className={styles.icon}>&#128274;</span>;
const CpfIcon = () => <span className={styles.icon}>&#128196;</span>;
const AddressIcon = () => <span className={styles.icon}>&#127968;</span>;
const CepIcon = () => <span className={styles.icon}>&#128230;</span>;
const CityIcon = () => <span className={styles.icon}>&#127961;</span>;
const StateIcon = () => <span className={styles.icon}>&#127463;&#127479;</span>;

function EditarPerfilLocadorPage() {
  const { token, userId } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    senha: "",
    cpf: "",
    endereco: "",
    cep: "",
    cidade: "",
    estado: "",
  });
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLocadorData = useCallback(async () => {
    if (!token || !userId) {
      toast.error("Autenticação necessária para editar o perfil.");
      setLoadingInitialData(false);
      navigate("/login");
      return;
    }
    setLoadingInitialData(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/locador/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: `Erro HTTP ${response.status}` }));
        throw new Error(errData.error || "Erro ao buscar dados do perfil do locador.");
      }
      const data = await response.json();
      setFormData({
        name: data.name || "",
        email: data.email || "",
        senha: "",
        cpf: data.cpf || "",
        endereco: data.endereco || "",
        cep: data.cep || "",
        cidade: data.cidade || "",
        estado: data.estado || "",
      });
    } catch (err) {
      console.error("Erro ao buscar dados do locador:", err);
      toast.error(err.message || "Não foi possível carregar os dados do perfil.");
    } finally {
      setLoadingInitialData(false);
    }
  }, [token, userId, navigate]);

  useEffect(() => {
    fetchLocadorData();
  }, [fetchLocadorData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !userId) {
      toast.error("Não autenticado. Não é possível salvar.");
      return;
    }
    setIsSubmitting(true);

    const payload = { ...formData };
    if (!payload.senha || payload.senha.trim() === "") {
      delete payload.senha;
    } else if (payload.senha.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres.");
      setIsSubmitting(false);
      return;
    }
    if (payload.cep && payload.cep.trim() === "") payload.cep = null;
    if (payload.cidade && payload.cidade.trim() === "") payload.cidade = null;
    if (payload.estado && payload.estado.trim() === "") payload.estado = null;


    try {
      const response = await fetch(
        `http://localhost:5000/api/locador/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Erro ao atualizar perfil do locador.");
      }
      toast.success("Perfil de locador atualizado com sucesso!");
      setFormData((prev) => ({ ...prev, senha: "" }));
    } catch (err) {
      console.error("Erro ao atualizar perfil do locador:", err);
      toast.error(err.message || "Falha ao atualizar o perfil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingInitialData) {
    return (
      <div className={styles.pageContainer}> {}
        <DashboardHeader />
        <div className={styles.contentWrapper}> {}
          <div className={styles.formSection}> {}
            <p className={styles.loadingMessage}>Carregando dados do perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <DashboardHeader />
      <div className={styles.contentWrapper}>
        <div className={styles.formSection}>
          <h3>Editar Perfil de Locador</h3>
          {}
          {}
          {}

          <form
            onSubmit={handleSubmit}
            className={styles.profileEditForm}
          >
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <UserIcon />
                <input
                  className={styles.formInput}
                  type="text"
                  name="name"
                  placeholder="Nome Completo"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className={styles.inputGroup}>
                <EmailIcon />
                <input
                  className={styles.formInput}
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className={styles.inputGroup} style={{ gridColumn: "span 2" }}>
                <LockIcon />
                <input
                  className={styles.formInput}
                  type="password"
                  name="senha"
                  placeholder="Nova Senha (deixe em branco para não alterar)"
                  value={formData.senha}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
              </div>
              <div className={styles.inputGroup}>
                <CpfIcon />
                <input
                  className={styles.formInput}
                  type="text"
                  name="cpf"
                  placeholder="CPF"
                  value={formData.cpf}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className={styles.inputGroup} style={{ gridColumn: "span 2" }}>
                <AddressIcon />
                <input
                  className={styles.formInput}
                  type="text"
                  name="endereco"
                  placeholder="Endereço Principal (Rua, Av, N°)"
                  value={formData.endereco}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className={styles.inputGroup}>
                <CepIcon />
                <input
                  className={styles.formInput}
                  type="text"
                  name="cep"
                  placeholder="CEP (Opcional)"
                  value={formData.cep}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className={styles.inputGroup}>
                <CityIcon />
                <input
                  className={styles.formInput}
                  type="text"
                  name="cidade"
                  placeholder="Cidade (Opcional)"
                  value={formData.cidade}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className={styles.inputGroup}>
                <StateIcon />
                <input
                  className={styles.formInput}
                  type="text"
                  name="estado"
                  placeholder="Estado (UF, Opcional)"
                  value={formData.estado}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  maxLength="2"
                />
              </div>
            </div>
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => navigate("/locador/dashboard")}
                disabled={isSubmitting}
              >
                Voltar ao Painel
              </button>
              <button
                type="submit"
                className={styles.actionButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditarPerfilLocadorPage;