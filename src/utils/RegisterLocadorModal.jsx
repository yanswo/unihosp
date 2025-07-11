import React, { useState } from "react";
import styles from "./RegisterLocadorModal.module.css";
// import { useAuth } from "../context/AuthContext";
import imagem from "../../public/login.png"

const UserIcon = () => <span className={styles.icon}>&#128100;</span>;
const EmailIcon = () => <span className={styles.icon}>&#128231;</span>;
const LockIcon = () => <span className={styles.icon}>&#128274;</span>;
const CpfIcon = () => <span className={styles.icon}>&#128196;</span>;
const AddressIcon = () => <span className={styles.icon}>&#127968;</span>;
const CepIcon = () => <span className={styles.icon}>&#128230;</span>;
const CityIcon = () => <span className={styles.icon}>&#127961;</span>;
const StateIcon = () => <span className={styles.icon}>&#127463;&#127479;</span>;

function RegisterLocadorModal({ isOpen, onClose, onSwitchToLogin }) {
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

    if (
      !formData.name ||
      !formData.email ||
      !formData.senha ||
      !formData.cpf ||
      !formData.endereco
    ) {
      setError("Nome, Email, Senha, CPF e Endereço são obrigatórios.");
      setIsLoading(false);
      return;
    }
    if (formData.senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/locador", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseText = await response.text();
      console.log(
        `RegisterLocadorModal: handleSubmit - Status: ${response.status}, Resposta Bruta: ${responseText}`
      );

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error(
          "RegisterLocadorModal: Erro ao parsear JSON da resposta:",
          responseText,
          parseError
        );
        if (!response.ok) {
          throw new Error(
            responseText || `Erro ${response.status} ao cadastrar locador.`
          );
        }

        result = { message: "Operação enviada, mas resposta não era JSON." };
      }

      if (!response.ok) {
        throw new Error(
          result.error || `Erro ${response.status} ao tentar cadastrar locador.`
        );
      }

      setSuccessMessage(
        "Cadastro de Locador realizado com sucesso! Você já pode fazer login."
      );
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
      if (onClose) {
        onClose();
      }

      if (onSwitchToLogin) {
        onSwitchToLogin();
      }

    } catch (err) {
      console.error("RegisterLocadorModal: Falha ao cadastrar locador:", err);
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
              alt="Ilustração Cadastro Locador"
              className={styles.illustration}
            />
          </div>

          <form className={styles.formContainer} onSubmit={handleSubmit}>
            <h2 className={styles.modalTitle}>Cadastro de Locador</h2>
            {error && <p className={styles.errorMessage}>{error}</p>}
            {successMessage && (
              <p className={styles.successMessage}>{successMessage}</p>
            )}

            <div className={styles.inputGroup}>
              <UserIcon />
              <input
                name="name"
                type="text"
                placeholder="Nome Completo"
                value={formData.name}
                onChange={handleChange}
                className={styles.inputField}
                disabled={isLoading}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <EmailIcon />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={styles.inputField}
                disabled={isLoading}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <LockIcon />
              <input
                name="senha"
                type="password"
                placeholder="Senha (mín. 6 caracteres)"
                value={formData.senha}
                onChange={handleChange}
                className={styles.inputField}
                disabled={isLoading}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <CpfIcon />
              <input
                name="cpf"
                type="text"
                placeholder="CPF (somente números)"
                value={formData.cpf}
                onChange={handleChange}
                className={styles.inputField}
                disabled={isLoading}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <AddressIcon />
              <input
                name="endereco"
                type="text"
                placeholder="Endereço Completo (Rua, N°, Bairro)"
                value={formData.endereco}
                onChange={handleChange}
                className={styles.inputField}
                disabled={isLoading}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <CepIcon />
              <input
                name="cep"
                type="text"
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
                name="cidade"
                type="text"
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
                name="estado"
                type="text"
                placeholder="Estado (UF)"
                value={formData.estado}
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

export default RegisterLocadorModal;
