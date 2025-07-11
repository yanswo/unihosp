import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ListaConversas from "../components/mensagens/ListaConversas";
import ChatConversa from "../components/mensagens/ChatConversa";
import styles from "./PaginaMensagens.module.css";
import DashboardHeader from "../components/hospede/DashboardHeader";
import { useAuth } from "../context/AuthContext";

function PaginaMensagens() {
  const { conversaId: conversaIdDaUrl } = useParams();
  const navigate = useNavigate();
  const { token, userType } = useAuth();
  const [conversaSelecionadaId, setConversaSelecionadaId] = useState(null);
  const [infoOutroUsuarioChat, setInfoOutroUsuarioChat] = useState(null);
  const [loadingInfoConversa, setLoadingInfoConversa] = useState(false);
  const [refreshConversasListKey, setRefreshConversasListKey] = useState(
    Date.now()
  );

  const fetchDetalhesConversaParaChat = useCallback(
    async (idConversa) => {
      if (!token || !idConversa) return;
      setLoadingInfoConversa(true);
      try {
        const response = await fetch(
          `https://apiunihosp.onrender.com/api/conversas/detalhes/${idConversa}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          const errData = await response
            .json()
            .catch(() => ({ error: "Erro ao buscar dados da conversa" }));
          throw new Error(errData.error);
        }
        const dadosConversa = await response.json();
        if (userType === "hospede") {
          setInfoOutroUsuarioChat(dadosConversa.locador);
        } else if (userType === "locador") {
          setInfoOutroUsuarioChat(dadosConversa.hospede);
        } else {
          setInfoOutroUsuarioChat(null);
        }
      } catch (error) {
        console.error(
          "Erro ao buscar detalhes da conversa para o chat:",
          error
        );
        setInfoOutroUsuarioChat(null);
        navigate("/mensagens");
        setConversaSelecionadaId(null);
      } finally {
        setLoadingInfoConversa(false);
      }
    },
    [token, userType, navigate]
  );

  useEffect(() => {
    const idNumUrl = conversaIdDaUrl ? parseInt(conversaIdDaUrl) : null;

    if (idNumUrl) {
      if (idNumUrl !== conversaSelecionadaId || !infoOutroUsuarioChat) {
        setConversaSelecionadaId(idNumUrl);
        fetchDetalhesConversaParaChat(idNumUrl);
      }
    } else {
      setConversaSelecionadaId(null);
      setInfoOutroUsuarioChat(null);
    }
  }, [
    conversaIdDaUrl,
    fetchDetalhesConversaParaChat,
    conversaSelecionadaId,
    infoOutroUsuarioChat,
  ]);

  const handleSelecionarConversa = useCallback(
    (idConversa, outroUsuarioInfo) => {
      setInfoOutroUsuarioChat(outroUsuarioInfo);
      if (conversaIdDaUrl !== String(idConversa)) {
        navigate(`/mensagens/${idConversa}`);
      } else {
        if (!infoOutroUsuarioChat && idConversa) {
          fetchDetalhesConversaParaChat(idConversa);
        }
        setConversaSelecionadaId(idConversa);
      }
    },
    [
      navigate,
      conversaIdDaUrl,
      infoOutroUsuarioChat,
      fetchDetalhesConversaParaChat,
    ]
  );

  const handleVoltarParaLista = useCallback(() => {
    setConversaSelecionadaId(null);
    setInfoOutroUsuarioChat(null);
    navigate("/mensagens");
    setRefreshConversasListKey(Date.now());
  }, [navigate]);

  const handleChatAtualizado = useCallback(() => {
    setRefreshConversasListKey(Date.now());
  }, []);

  const handleConversaExcluidaDaLista = useCallback(
    (idConversaExcluida) => {
      setRefreshConversasListKey(Date.now());
      if (conversaSelecionadaId === idConversaExcluida) {
        handleVoltarParaLista();
      }
    },
    [conversaSelecionadaId, handleVoltarParaLista]
  );

  return (
    <div className={styles.paginaMensagensContainer}>
      <DashboardHeader />
      <div className={styles.conteudoPrincipalMensagens}>
        <div
          className={`${styles.listaConversasContainer} ${
            conversaSelecionadaId ? styles.esconderEmMobile : ""
          }`}
        >
          <h2 className={styles.tituloSecao}>Minhas Conversas</h2>
          <ListaConversas
            onConversaSelecionada={handleSelecionarConversa}
            conversaAtivaId={conversaSelecionadaId}
            refreshKey={refreshConversasListKey}
            onConversaExcluida={handleConversaExcluidaDaLista}
          />
        </div>

        <div
          className={`${styles.chatConversaContainer} ${
            !conversaSelecionadaId ? styles.esconderEmMobile : ""
          }`}
        >
          {conversaSelecionadaId ? (
            loadingInfoConversa && !infoOutroUsuarioChat ? (
              <div className={styles.placeholderChat}>
                <p>Carregando dados da conversa...</p>
              </div>
            ) : (
              <ChatConversa
                key={conversaSelecionadaId}
                conversaId={conversaSelecionadaId}
                onVoltarParaLista={handleVoltarParaLista}
                infoOutroUsuarioProp={infoOutroUsuarioChat}
                onMensagensLidas={handleChatAtualizado}
              />
            )
          ) : (
            <div className={styles.placeholderChat}>
              <span className={styles.placeholderIcon}>💬</span>
              <p>Selecione uma conversa para ver as mensagens.</p>
              <p className={styles.dicaPlaceholder}>
                Ou inicie uma nova conversa na página de uma casa.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaginaMensagens;
