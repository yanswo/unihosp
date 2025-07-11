import React, { useState } from "react";
import styles from "./RegisterHospedeModal.module.css";
import imagem from "../../public/login.png";

const UserIcon = () => <span className={styles.icon}>&#128100;</span>;
const EmailIcon = () => <span className={styles.icon}>&#128231;</span>;
const LockIcon = () => <span className={styles.icon}>&#128274;</span>;
const CpfIcon = () => <span className={styles.icon}>&#128196;</span>;
const CepIcon = () => <span className={styles.icon}>&#128230;</span>;
const CityIcon = () => <span className={styles.icon}>&#127961;</span>;
const StateIcon = () => <span className={styles.icon}>&#127463;&#127479;</span>;
const MatriculaIcon = () => <span className={styles.icon}>&#127891;</span>;
const UniversityIcon = () => <span className={styles.icon}>&#127979;</span>;

function RegisterHospedeModal({ isOpen, onClose, onSwitchToLogin }) {
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
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    for (const key in formData) {
      if (formData[key] === "") {
        setError(`O campo ${key} é obrigatório.`);
        setIsLoading(false);
        return;
      }
    }
    if (formData.senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://apiunihosp.onrender.com/api/hospede",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Erro ${response.status}`);
      }

      setSuccessMessage(
        "Cadastro realizado com sucesso! Você já pode fazer login."
      );

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

      if (onClose) {
        onClose();
      }

      if (onSwitchToLogin) {
        onSwitchToLogin();
      }
    } catch (err) {
      setError(err.message || "Falha ao realizar cadastro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`${styles.modalOverlay} ${styles.open}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Fechar modal"
        >
          &times;
        </button>

        <div className={styles.modalBody}>
          <div className={styles.illustrationContainer}>
            <img
              src={imagem}
              alt="Ilustração Cadastro Hóspede"
              className={styles.illustration}
            />
          </div>

          <form className={styles.formContainer} onSubmit={handleSubmit}>
            {error && <p className={styles.errorMessage}>{error}</p>}
            {successMessage && (
              <p className={styles.successMessage}>{successMessage}</p>
            )}

            <div className={styles.inputGroup}>
              <UserIcon />
              <input
                type="text"
                name="name"
                placeholder="Nome Completo"
                value={formData.name}
                onChange={handleChange}
                className={styles.inputField}
                disabled={isLoading}
              />
            </div>
            <div className={styles.inputGroup}>
              <EmailIcon />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={styles.inputField}
                disabled={isLoading}
              />
            </div>
            <div className={styles.inputGroup}>
              <LockIcon />
              <input
                type="password"
                name="senha"
                placeholder="Senha (mín. 6 caracteres)"
                value={formData.senha}
                onChange={handleChange}
                className={styles.inputField}
                disabled={isLoading}
              />
            </div>
            <div className={styles.inputGroup}>
              <CpfIcon />
              <input
                type="text"
                name="cpf"
                placeholder="CPF (somente números)"
                value={formData.cpf}
                onChange={handleChange}
                className={styles.inputField}
                disabled={isLoading}
              />
            </div>
            <div className={styles.inputGroup}>
              <CepIcon />
              <input
                type="text"
                name="cep"
                placeholder="CEP (somente números)"
                value={formData.cep}
                onChange={handleChange}
                className={styles.inputField}
                disabled={isLoading}
              />
            </div>
            <div className={styles.inputGroup}>
              <CityIcon />
              <input
                type="text"
                name="cidade"
                placeholder="Cidade"
                value={formData.cidade}
                onChange={handleChange}
                className={styles.inputField}
                disabled={isLoading}
              />
            </div>
            <div className={styles.inputGroup}>
              <StateIcon />
              <input
                type="text"
                name="estado"
                placeholder="Estado (UF)"
                value={formData.estado}
                onChange={handleChange}
                className={styles.inputField}
                disabled={isLoading}
              />
            </div>
            <div className={styles.inputGroup}>
              <MatriculaIcon />
              <input
                type="text"
                name="matricula"
                placeholder="Matrícula (Universidade)"
                value={formData.matricula}
                onChange={handleChange}
                className={styles.inputField}
                disabled={isLoading}
              />
            </div>
            <div className={styles.inputGroup}>
              <UniversityIcon />
              <input
                type="text"
                name="universidade"
                placeholder="Universidade"
                value={formData.universidade}
                onChange={handleChange}
                className={styles.inputField}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className={styles.confirmButton}
              disabled={isLoading}
            >
              {isLoading ? "Cadastrando..." : "Confirmar Cadastro"}
            </button>
            <p className={styles.alternativeLink}>
              Já tem uma conta?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (!isLoading && onSwitchToLogin) onSwitchToLogin();
                }}
              >
                Faça login
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterHospedeModal;
