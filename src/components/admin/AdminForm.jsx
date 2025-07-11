import React, { useState, useEffect } from "react";
import styles from "../../pages/AdminPage.module.css";

// Ícones
const UserIcon = () => <span className={styles.icon}>&#128100;</span>;
const EmailIcon = () => <span className={styles.icon}>&#128231;</span>;
const LockIcon = () => <span className={styles.icon}>&#128274;</span>;

function AdminForm({ adminAtual, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({ name: "", email: "", senha: "" });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (adminAtual) {
      setFormData({
        name: adminAtual.name || "",
        email: adminAtual.email || "",
        senha: "", // Sempre limpa senha para edição
      });
    } else {
      setFormData({ name: "", email: "", senha: "" });
    }
  }, [adminAtual]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.name || !formData.email) {
      setFormError("Nome e Email são obrigatórios.");
      return;
    }
    if (!adminAtual && !formData.senha) {
      // Senha obrigatória só na criação
      setFormError("Senha é obrigatória para novo admin.");
      return;
    }
    if (formData.senha && formData.senha.length < 6) {
      setFormError("A senha (se fornecida) deve ter pelo menos 6 caracteres.");
      return;
    }
    const payload = { ...formData };
    if (adminAtual && !payload.senha) delete payload.senha;
    onSave(payload, adminAtual?.id);
  };

  return (
    <div className={styles.formOverlay}>
      <div className={styles.formContainerModal}>
        <h3>
          {adminAtual ? "Editar Administrador" : "Adicionar Novo Administrador"}
        </h3>
        {formError && <p className={styles.errorMessage}>{formError}</p>}
        <form onSubmit={handleSubmit}>
          <div
            className={styles.formGrid}
            style={{ gridTemplateColumns: "1fr" }}
          >
            {" "}
            {/* Uma coluna para admin */}
            <div className={styles.inputGroupAdmin}>
              <UserIcon />
              <input
                className={styles.formInput}
                type="text"
                name="name"
                placeholder="Nome"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            <div className={styles.inputGroupAdmin}>
              <LockIcon />
              <input
                className={styles.formInput}
                type="password"
                name="senha"
                placeholder={
                  adminAtual ? "Nova Senha (não alterar se vazio)" : "Senha"
                }
                value={formData.senha}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.actionButton}
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default AdminForm;
