import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./ChatFlutuanteIcon.module.css";
import { useLocation } from "react-router-dom";

const ChatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="0.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

function ChatFlutuanteIcon() {
  const navigate = useNavigate();
  const { isAuthenticated, userType, token } = useAuth();
  const [totalNaoLidas, setTotalNaoLidas] = useState(0);
  const location = useLocation();

  const fetchTotalNaoLidas = useCallback(async () => {
    if (
      !isAuthenticated ||
      !token ||
      (userType !== "hospede" && userType !== "locador")
    ) {
      setTotalNaoLidas(0);
      return;
    }
    try {
      const response = await fetch(
        "https://apiunihosp.onrender.com/api/mensagens/nao-lidas/total",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setTotalNaoLidas(data.totalNaoLidas || 0);
      } else {
        console.error(
          "Erro ao buscar total de mensagens não lidas:",
          response.status
        );
        setTotalNaoLidas(0);
      }
    } catch (error) {
      console.error("Erro no fetch do total de não lidas:", error);
      setTotalNaoLidas(0);
    }
  }, [isAuthenticated, token, userType]);

  useEffect(() => {
    fetchTotalNaoLidas();
    const intervalId = setInterval(fetchTotalNaoLidas, 30000);
    return () => clearInterval(intervalId);
  }, [fetchTotalNaoLidas]);

  if (location.pathname.startsWith("/mensagens")) {
    return null; // Não exibir o ícone se já estiver na página de mensagens
  }

  if (!isAuthenticated || (userType !== "hospede" && userType !== "locador")) {
    return null;
  }

  const handleIconClick = () => {
    navigate("/mensagens");
  };

  return (
    <button
      className={styles.chatFlutuanteBtn}
      onClick={handleIconClick}
      title={`Abrir Minhas Mensagens ${
        totalNaoLidas > 0 ? `(${totalNaoLidas} não lidas)` : ""
      }`}
      aria-label={`Abrir Minhas Mensagens ${
        totalNaoLidas > 0 ? `(${totalNaoLidas} não lidas)` : ""
      }`}
    >
      <ChatIcon />
      {totalNaoLidas > 0 && (
        <span className={styles.notificationBadge}>
          {totalNaoLidas > 9 ? "9+" : totalNaoLidas}
        </span>
      )}
    </button>
  );
}

export default ChatFlutuanteIcon;
