import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './ListaConversas.module.css';
import { toast } from 'react-toastify';

const LixeiraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const formatarDataUltimaMensagem = (dataIso) => {
  if (!dataIso) return '';
  const agora = new Date();
  const dataMsg = new Date(dataIso);
  const diffSegundos = Math.round((agora - dataMsg) / 1000);
  const diffMinutos = Math.round(diffSegundos / 60);
  const diffHoras = Math.round(diffMinutos / 60);
  const diffDias = Math.round(diffHoras / 24);

  if (diffSegundos < 60) return `${diffSegundos}s`;
  if (diffMinutos < 60) return `${diffMinutos}m`;
  if (diffHoras < 24) return `${diffHoras}h`;
  if (diffDias === 1) return 'Ontem';
  if (diffDias < 7) return `${diffDias}d`;
  return dataMsg.toLocaleDateString('pt-BR');
};

function ListaConversas({ onConversaSelecionada, conversaAtivaId, refreshKey, onConversaExcluida }) {
  const { token, userId, userType } = useAuth();
  const [conversas, setConversas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletandoId, setDeletandoId] = useState(null);

  const fetchConversas = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/conversas', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: `Erro HTTP ${response.status}` }));
        throw new Error(errData.error || "Falha ao buscar conversas.");
      }
      const data = await response.json();
      setConversas(data);
    } catch (err) {
      console.error("Erro ao buscar conversas:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConversas();
  }, [fetchConversas, refreshKey]);

  const handleExcluirConversa = async (idConversa, e) => {
    e.stopPropagation();
    if (!window.confirm("Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita e a conversa será removida para ambos os participantes.")) {
      return;
    }
    if (!token) {
      toast.error("Autenticação necessária para excluir conversa.");
      return;
    }
    setDeletandoId(idConversa);
    try {
      const response = await fetch(`http://localhost:5000/api/conversas/${idConversa}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: `Erro HTTP ${response.status}` }));
        throw new Error(errData.error || "Falha ao excluir conversa.");
      }
      setConversas(prev => prev.filter(c => c.id !== idConversa));
      toast.success("Conversa excluída com sucesso!");
      if (onConversaExcluida) {
        onConversaExcluida(idConversa);
      }
    } catch (err) {
      console.error("Erro ao excluir conversa:", err);
      toast.error(`Erro ao excluir conversa: ${err.message}`);
    } finally {
      setDeletandoId(null);
    }
  };

  if (loading) {
    return <p className={styles.loading}>Carregando conversas...</p>;
  }

  if (error && conversas.length === 0) {
    return <p className={styles.error}>Erro ao carregar conversas: {error}</p>;
  }

  if (conversas.length === 0 && !loading) {
    return <p className={styles.semConversas}>Nenhuma conversa encontrada.</p>;
  }

  return (
    <ul className={styles.listaConversas}>
      {}
      {error && conversas.length > 0 && <p className={styles.errorInline}>Erro ao atualizar: {error}</p>}
      {conversas.map((conversa) => {
        const outroParticipante = userType === 'hospede' ? conversa.locador : conversa.hospede;
        const ultimaMensagem = conversa.mensagens?.[0];
        let previewMensagem = ultimaMensagem?.conteudo || "Nenhuma mensagem ainda.";
        if (previewMensagem.length > 30) {
            previewMensagem = previewMensagem.substring(0, 30) + "...";
        }
        
        let remetenteUltimaMensagem = "";
        if (ultimaMensagem) {
            if ((userType === 'hospede' && ultimaMensagem.remetenteHospedeId === userId) ||
                (userType === 'locador' && ultimaMensagem.remetenteLocadorId === userId)) {
                remetenteUltimaMensagem = "Você: ";
            }
        }

        const estaDeletando = deletandoId === conversa.id;

        return (
          <li
            key={conversa.id}
            className={`${styles.itemConversa} ${conversa.id === conversaAtivaId ? styles.ativa : ''} ${conversa.contagemNaoLidas > 0 ? styles.naoLida : ''}`}
            onClick={() => !estaDeletando && onConversaSelecionada(conversa.id, outroParticipante)}
            tabIndex={0}
            onKeyPress={(e) => !estaDeletando && e.key === 'Enter' && onConversaSelecionada(conversa.id, outroParticipante)}
            aria-current={conversa.id === conversaAtivaId ? "page" : undefined}
          >
            <div className={styles.avatarPlaceholder}>
              {outroParticipante?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className={styles.infoConversa}>
              <div className={styles.nomeEData}>
                <span className={styles.nomeParticipante}>{outroParticipante?.name || 'Usuário Desconhecido'}</span>
                {ultimaMensagem && (
                    <span className={styles.dataUltimaMensagem}>
                        {formatarDataUltimaMensagem(ultimaMensagem.createdAt)}
                    </span>
                )}
              </div>
              <p className={styles.previewMensagem}>
                {conversa.contagemNaoLidas > 0 && !remetenteUltimaMensagem ? <strong>{previewMensagem}</strong> : <>{remetenteUltimaMensagem}{previewMensagem}</>}
              </p>
              {conversa.casa && (
                <p className={styles.infoCasaConversa}>
                    Sobre: {conversa.casa.endereco}, {conversa.casa.numero}
                </p>
              )}
            </div>
            <div className={styles.acoesItemConversa}>
              {conversa.contagemNaoLidas > 0 && (
                <span className={styles.badgeNaoLidasItem}>{conversa.contagemNaoLidas}</span>
              )}
              <button
                className={styles.botaoExcluirConversa}
                onClick={(e) => handleExcluirConversa(conversa.id, e)}
                disabled={estaDeletando}
                title="Excluir conversa"
                aria-label="Excluir conversa"
              >
                {estaDeletando ? "..." : <LixeiraIcon />}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default ListaConversas;