import React, { useState } from "react";
import styles from "./LoginModal.module.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import imagemLogin from "../../public/login.png"

const UserIcon = () => <span className={styles.icon}>&#128100;</span>;
const LockIcon = () => <span className={styles.icon}>&#128274;</span>;

function LoginModal({ isOpen, onClose, onSwitchToRegister }) {
  const { loginAction, authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loginUserType, setLoginUserType] = useState("hospede");
  const [error, setError] = useState("");

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !senha) {
      setError("Email e senha são obrigatórios.");
      return;
    }

    try {
      const result = await loginAction(email, senha, loginUserType);

      if (result.success) {
        setEmail("");
        setSenha("");
        onClose();

        if (result.userType === "admin") {
          navigate("/admin");
        } else if (result.userType === "hospede") {
          navigate("/hospede/dashboard");
        } else if (result.userType === "locador") {
          navigate("/locador/dashboard");
        }
      }
    } catch (err) {
      setError(
        err.message ||
          "Falha ao fazer login. Verifique suas credenciais e tipo de usuário."
      );
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
              src={imagemLogin}
              alt="Ilustração Login"
              className={styles.illustration}
            />
          </div>
          <form className={styles.formContainer} onSubmit={handleLoginSubmit}>
            {error && <p className={styles.errorMessage}>{error}</p>}
            <div className={styles.userTypeSelector}>
              <label>
                <input
                  type="radio"
                  name="loginUserType"
                  value="hospede"
                  checked={loginUserType === "hospede"}
                  onChange={(e) => setLoginUserType(e.target.value)}
                  disabled={authLoading}
                />{" "}
                Hóspede
              </label>
              <label>
                <input
                  type="radio"
                  name="loginUserType"
                  value="locador"
                  checked={loginUserType === "locador"}
                  onChange={(e) => setLoginUserType(e.target.value)}
                  disabled={authLoading}
                />{" "}
                Locador
              </label>
              <label>
                <input
                  type="radio"
                  name="loginUserType"
                  value="admin"
                  checked={loginUserType === "admin"}
                  onChange={(e) => setLoginUserType(e.target.value)}
                  disabled={authLoading}
                />{" "}
                Admin
              </label>
            </div>
            <div className={styles.inputGroup}>
              <UserIcon />
              <input
                type="email"
                placeholder="Email"
                className={styles.inputField}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={authLoading}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <LockIcon />
              <input
                type="password"
                placeholder="Senha"
                className={styles.inputField}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={authLoading}
                required
              />
            </div>
            <button
              type="submit"
              className={styles.confirmButton}
              disabled={authLoading}
            >
              {authLoading ? "Entrando..." : "Confirmar"}
            </button>
            <p className={styles.signupLink}>
              Não tem uma conta?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (!authLoading && onSwitchToRegister) onSwitchToRegister();
                }}
              >
                Faça seu cadastro, clique aqui
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
