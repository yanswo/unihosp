import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './ChatConversa.module.css';

const VoltarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

function ChatConversa({ conversaId, onVoltarParaLista, infoOutroUsuarioProp, onMensagensLidas }) {
  const { token, userId, userType } = useAuth();
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [infoOutroUsuario, setInfoOutroUsuario] = useState(infoOutroUsuarioProp || null);
  const [enviando, setEnviando] = useState(false);
  
  const mensagensEndRef = useRef(null);

  const scrollToBottom = () => {
    mensagensEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setInfoOutroUsuario(infoOutroUsuarioProp || null);
  }, [infoOutroUsuarioProp]);

  const marcarMensagensComoLidas = useCallback(async () => {
    if (!token || !conversaId) return;
    try {
      await fetch(`http://localhost:5000/api/conversas/${conversaId}/marcar-como-lidas`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (onMensagensLidas) {
        onMensagensLidas(conversaId);
      }
    } catch (err) {
      console.error("Erro ao marcar mensagens como lidas:", err);
    }
  }, [conversaId, token, onMensagensLidas]);

  const fetchMensagens = useCallback(async () => {
    if (!token || !conversaId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const responseMensagens = await fetch(`http://localhost:5000/api/conversas/${conversaId}/mensagens`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!responseMensagens.ok) {
        const errData = await responseMensagens.json().catch(() => ({ error: `Erro HTTP ${responseMensagens.status}` }));
        throw new Error(errData.error || "Falha ao buscar mensagens.");
      }
      const dataMensagens = await responseMensagens.json();
      setMensagens(dataMensagens);

      marcarMensagensComoLidas();

      if (!infoOutroUsuario) {
        console.warn("ChatConversa: infoOutroUsuario não foi fornecida via prop. Header do chat pode ficar incompleto.");
      }

    } catch (err) {
      console.error("Erro ao buscar mensagens no ChatConversa:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [conversaId, token, infoOutroUsuario, marcarMensagensComoLidas]);

  useEffect(() => {
    if (conversaId) {
        fetchMensagens();
    } else {
        setLoading(false);
        setMensagens([]);
    }
  }, [conversaId, fetchMensagens]);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const handleEnviarMensagem = async (e) => {
    e.preventDefault();
    if (novaMensagem.trim() === '' || !token || enviando) return;

    setEnviando(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/conversas/${conversaId}/mensagens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ conteudo: novaMensagem }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({error: "Erro ao enviar mensagem"}));
        throw new Error(errData.error || "Falha ao enviar mensagem.");
      }
      const mensagemEnviada = await response.json();
      setMensagens(prevMensagens => [...prevMensagens, mensagemEnviada]);
      setNovaMensagem('');
      if (onMensagensLidas) {
        onMensagensLidas(conversaId, true);
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (loading && mensagens.length === 0) {
    return <div className={styles.chatLoading}>Carregando mensagens...</div>;
  }

  if (error && !enviando && mensagens.length === 0) {
    return <div className={styles.chatError}>Erro ao carregar mensagens: {error}</div>;
  }

  return (
    <div className={styles.chatContainer}>
      <header className={styles.chatHeader}>
        <button onClick={onVoltarParaLista} className={styles.botaoVoltarMobile}>
          <VoltarIcon />
        </button>
        <div className={styles.avatarPlaceholderHeader}>
            {infoOutroUsuario?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <h3 className={styles.chatComNome}>{infoOutroUsuario?.name || 'Carregando...'}</h3>
      </header>

      <div className={styles.mensagensLista}>
        {mensagens.map((msg) => {
          const ehMinhaMensagem = 
            (userType === 'hospede' && msg.remetenteHospedeId === userId) ||
            (userType === 'locador' && msg.remetenteLocadorId === userId);
          
          return (
            <div
              key={msg.id}
              className={`${styles.mensagemItem} ${ehMinhaMensagem ? styles.minhaMensagem : styles.outraMensagem}`}
            >
              <div className={styles.balaoMensagem}>
                <p className={styles.conteudoMensagem}>{msg.conteudo}</p>
                <span className={styles.timestampMensagem}>
                  {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={mensagensEndRef} />
      </div>

      {error && enviando && <p className={styles.errorEnvioMensagem}>{error}</p>} 
      {!error && enviando && <p className={styles.enviandoStatus}>Enviando...</p>}

      <form onSubmit={handleEnviarMensagem} className={styles.formularioEnvio}>
        <input
          type="text"
          value={novaMensagem}
          onChange={(e) => setNovaMensagem(e.target.value)}
          placeholder="Digite sua mensagem..."
          className={styles.inputMensagem}
          disabled={enviando}
        />
        <button 
            type="submit" 
            className={styles.botaoEnviar} 
            disabled={enviando || novaMensagem.trim() === ''}
            aria-label="Enviar mensagem"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </form>
    </div>
  );
}

export default ChatConversa;