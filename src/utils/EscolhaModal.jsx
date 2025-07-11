import React from "react";
import styles from "./EscolhaModal.module.css";
function EscolhaModal({
  isOpen,
  onClose,
  onSelectHospede,
  onSelectLocador,
  onSwitchToLogin,
}) {
  console.log("LOG EscolhaModal RENDER: isOpen:", isOpen);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
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
        <h2 className={styles.modalTitle}>
          Como você gostaria de se cadastrar?
        </h2>
        <p className={styles.modalSubtitle}>
          Selecione o seu perfil na UniHosp:
        </p>
        <div className={styles.buttonContainer}>
          <button className={styles.choiceButton} onClick={onSelectHospede}>
            Sou Hóspede
            <span className={styles.buttonDescription}>
              Procurando um lugar para ficar
            </span>
          </button>
          <button
            className={`${styles.choiceButton} ${styles.locadorButton}`}
            onClick={onSelectLocador}
          >
            Sou Locador
            <span className={styles.buttonDescription}>
              Quero anunciar minhas vagas
            </span>
          </button>
        </div>
        <p className={styles.alternativeLink}>
          Já tem uma conta?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (onSwitchToLogin) onSwitchToLogin();
            }}
          >
            Faça login
          </a>
        </p>
      </div>
    </div>
  );
}

export default EscolhaModal;
