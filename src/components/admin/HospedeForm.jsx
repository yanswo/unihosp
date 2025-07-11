import React, { useState, useEffect } from "react";
import styles from "../../pages/AdminPage.module.css";

function HospedeForm({ hospedeAtual, onSave, onCancel, isLoading }) {
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
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (hospedeAtual) {
      setFormData({
        name: hospedeAtual.name || "",
        email: hospedeAtual.email || "",
        senha: "",
        cpf: hospedeAtual.cpf || "",
        cep: hospedeAtual.cep || "",
        cidade: hospedeAtual.cidade || "",
        estado: hospedeAtual.estado || "",
        matricula: hospedeAtual.matricula || "",
        universidade: hospedeAtual.universidade || "",
      });
    } else {
      setFormData({
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
    }
  }, [hospedeAtual]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    console.log("HospedeForm: Submit. Dados do formulário:", formData);

    const isEditing = !!hospedeAtual;
    if (!formData.name || !formData.email) {
      setFormError("Nome e Email são obrigatórios.");
      return;
    }
    if (!isEditing && !formData.senha) {
      setFormError("Senha é obrigatória para novo hóspede.");
      return;
    }
    if (formData.senha && formData.senha.length < 6) {
      setFormError("A senha (se fornecida) deve ter pelo menos 6 caracteres.");
      return;
    }

    const payload = { ...formData };
    if (isEditing && !payload.senha) {
      delete payload.senha;
    }

    console.log("HospedeForm: Payload a ser enviado para onSave:", payload);
    onSave(payload, hospedeAtual?.id);
  };

  return (
    <div className={styles.formOverlay}>
      <div className={styles.formContainerModal}>
        <h3>{hospedeAtual ? "Editar Hóspede" : "Adicionar Novo Hóspede"}</h3>
        {formError && <p className={styles.errorMessage}>{formError}</p>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            {}
            {}
            <input
              className={styles.formInput}
              type="text"
              name="name"
              placeholder="Nome Completo"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
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
            <input
              className={styles.formInput}
              type="password"
              name="senha"
              placeholder={
                hospedeAtual ? "Nova Senha (não alterar se vazio)" : "Senha"
              }
              value={formData.senha}
              onChange={handleChange}
              disabled={isLoading}
            />
            <input
              className={styles.formInput}
              type="text"
              name="cpf"
              placeholder="CPF"
              value={formData.cpf}
              onChange={handleChange}
              required
              disabled={isLoading}
            />{" "}
            {}
            <input
              className={styles.formInput}
              type="text"
              name="cep"
              placeholder="CEP"
              value={formData.cep}
              onChange={handleChange}
              disabled={isLoading}
            />
            <input
              className={styles.formInput}
              type="text"
              name="cidade"
              placeholder="Cidade"
              value={formData.cidade}
              onChange={handleChange}
              disabled={isLoading}
            />
            <input
              className={styles.formInput}
              type="text"
              name="estado"
              placeholder="Estado (UF)"
              value={formData.estado}
              onChange={handleChange}
              disabled={isLoading}
            />
            <input
              className={styles.formInput}
              type="text"
              name="matricula"
              placeholder="Matrícula"
              value={formData.matricula}
              onChange={handleChange}
              required
              disabled={isLoading}
            />{" "}
            {}
            <input
              className={styles.formInput}
              type="text"
              name="universidade"
              placeholder="Universidade"
              value={formData.universidade}
              onChange={handleChange}
              disabled={isLoading}
            />
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

export default HospedeForm;
