import React, { useState, useEffect } from "react";
import styles from "../../pages/AdminPage.module.css";

const UserIcon = () => <span className={styles.icon}>&#128100;</span>;
const EmailIcon = () => <span className={styles.icon}>&#128231;</span>;
const LockIcon = () => <span className={styles.icon}>&#128274;</span>;
const CpfIcon = () => <span className={styles.icon}>&#128196;</span>;
const AddressIcon = () => <span className={styles.icon}>&#127968;</span>;
const CepIcon = () => <span className={styles.icon}>&#128230;</span>;
const CityIcon = () => <span className={styles.icon}>&#127961;</span>;
const StateIcon = () => <span className={styles.icon}>&#127463;&#127479;</span>;

function LocadorForm({ locadorAtual, onSave, onCancel, isLoading }) {
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
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (locadorAtual) {
      setFormData({
        name: locadorAtual.name || "",
        email: locadorAtual.email || "",
        senha: "",
        cpf: locadorAtual.cpf || "",
        endereco: locadorAtual.endereco || "",
        cep: locadorAtual.cep || "",
        cidade: locadorAtual.cidade || "",
        estado: locadorAtual.estado || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        senha: "",
        cpf: "",
        endereco: "",
        cep: "",
        cidade: "",
        estado: "",
      });
    }
  }, [locadorAtual]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    console.log("LocadorForm: Submit. Dados do formulário:", formData);

    const isEditing = !!locadorAtual;
    if (
      !formData.name ||
      !formData.email ||
      !formData.cpf ||
      !formData.endereco
    ) {
      setFormError("Nome, Email, CPF e Endereço são obrigatórios.");
      return;
    }
    if (!isEditing && !formData.senha) {
      setFormError("Senha é obrigatória para novo locador.");
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

    console.log("LocadorForm: Payload a ser enviado para onSave:", payload);
    onSave(payload, locadorAtual?.id);
  };

  return (
    <div className={styles.formOverlay}>
      <div className={styles.formContainerModal}>
        <h3>{locadorAtual ? "Editar Locador" : "Adicionar Novo Locador"}</h3>
        {formError && <p className={styles.errorMessage}>{formError}</p>}
        <form onSubmit={handleSubmit}>
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
                  locadorAtual ? "Nova Senha (não alterar se vazio)" : "Senha"
                }
                value={formData.senha}
                onChange={handleChange}
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            <div
              className={styles.inputGroupAdmin}
              style={{ gridColumn: "span 2" }}
            >
              {" "}
              {}
              <AddressIcon />
              <input
                className={styles.formInput}
                type="text"
                name="endereco"
                placeholder="Endereço Completo (Rua, N°, Bairro)"
                value={formData.endereco}
                onChange={handleChange}
                required
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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

export default LocadorForm;
