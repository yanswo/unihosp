import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './CasaDetalhesModal.module.css';
import { useNavigate, Link } from 'react-router-dom';

const LocalIcon = () => <span className={styles.detailIcon}>📍</span>;
const PrecoIcon = () => <span className={styles.detailIcon}>💰</span>;
const RegrasIcon = () => <span className={styles.detailIcon}>📜</span>;
const UserIcon = () => <span className={styles.detailIcon}>👤</span>;
const ImagesIcon = () => <span className={styles.detailIcon}>🖼️</span>;
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);


function CasaDetalhesModal({ casaId, onClose, onAbrirReservaModal, onContatarLocadorModal }) {
  const navigate = useNavigate();
  const { token, isAuthenticated, userType } = useAuth();

  const [casa, setCasa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imagemPrincipal, setImagemPrincipal] = useState('');

  const fetchCasaDetalhes = useCallback(async () => {
    if (!casaId) {
      setError("ID da casa não fornecido.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/casa/${casaId}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: `Erro HTTP ${response.status}` }));
        throw new Error(errData.error || "Falha ao buscar detalhes da casa.");
      }
      const data = await response.json();
      setCasa(data);
      if (data.imagens && data.imagens.length > 0) {
        setImagemPrincipal(data.imagens[0].url);
      } else {
        setImagemPrincipal(`https://placehold.co/600x400/A8D5E2/333?text=${encodeURIComponent(data.endereco?.substring(0,20) || "Casa")}`);
      }
    } catch (err) {
      console.error("Erro ao buscar detalhes da casa no modal:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [casaId]);

  useEffect(() => {
    fetchCasaDetalhes();
  }, [fetchCasaDetalhes]);

  const handleSelecionarImagem = (url) => {
    setImagemPrincipal(url);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className={styles.modalOverlay} onClick={handleOverlayClick}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.loadingStateModal}>Carregando detalhes da casa...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.modalOverlay} onClick={handleOverlayClick}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
           <button onClick={onClose} className={styles.closeButton}><CloseIcon /></button>
          <div className={styles.errorStateModal}>Erro: {error}</div>
        </div>
      </div>
    );
  }

  if (!casa) {
    return (
      <div className={styles.modalOverlay} onClick={handleOverlayClick}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className={styles.closeButton}><CloseIcon /></button>
          <div className={styles.errorStateModal}>Casa não encontrada.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="casaModalTitle">
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeButton} aria-label="Fechar detalhes da casa">
          <CloseIcon />
        </button>
        
        <div className={styles.modalBody}>
            <div className={styles.imageGallery}>
              <div className={styles.imagemPrincipalContainer}>
                <img 
                    src={imagemPrincipal} 
                    alt={`Foto principal de ${casa.endereco}`} 
                    className={styles.imagemPrincipal}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/600x400/E0E0E0/BDBDBD?text=Indisponível`;
                    }}
                />
              </div>
              {casa.imagens && casa.imagens.length > 1 && (
                <div className={styles.thumbnailsContainer}>
                  {casa.imagens.map((img) => (
                    <div 
                      key={img.id} 
                      className={`${styles.thumbnailItem} ${img.url === imagemPrincipal ? styles.thumbnailAtiva : ''}`}
                      onClick={() => handleSelecionarImagem(img.url)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSelecionarImagem(img.url)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Ver imagem ${casa.imagens.indexOf(img) + 1}`}
                    >
                      <img src={img.url} alt={`Thumbnail de ${casa.endereco} ${casa.imagens.indexOf(img) + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.infoContainer}>
              <h2 id="casaModalTitle" className={styles.casaTitulo}>{casa.endereco}, {casa.numero}</h2>
              <p className={styles.casaLocalizacao}><LocalIcon /> {casa.cidade}{casa.estado ? `, ${casa.estado}` : ''} {casa.cep ? `- CEP: ${casa.cep}` : ''}</p>
              
              {typeof casa.precoPorNoite === 'number' && (
                <p className={styles.casaPreco}><PrecoIcon /> R$ {casa.precoPorNoite.toFixed(2).replace('.', ',')} / noite</p>
              )}

              <div className={styles.detalhesGrid}>
                <div className={styles.detalheItem}>
                    <h4><RegrasIcon /> Diretrizes da Casa</h4>
                    <p>{casa.diretrizes || "Não especificadas."}</p>
                </div>
                {casa.complemento && (
                    <div className={styles.detalheItem}>
                        <h4><span className={styles.detailIcon}>ℹ️</span> Complemento</h4>
                        <p>{casa.complemento}</p>
                    </div>
                )}
                {casa.locador && (
                    <div className={styles.detalheItem}>
                        <h4><UserIcon /> Sobre o Locador</h4>
                        <p><strong>Nome:</strong> {casa.locador.name}</p>
                        <p><strong>Email:</strong> {casa.locador.email}</p>
                    </div>
                )}
              </div>
              
              {isAuthenticated && userType === 'hospede' && (
                <div className={styles.acoesContainerModal}>
                  <button 
                    className={styles.actionButtonReserva} 
                    onClick={() => {
                        onClose();
                        onAbrirReservaModal(casa);
                    }}
                    disabled={casa.precoPorNoite === null || casa.precoPorNoite === undefined}
                    title={ (casa.precoPorNoite === null || casa.precoPorNoite === undefined) ? "Reserva indisponível (sem preço)" : "Reservar esta acomodação"}
                  >
                    Reservar Agora
                  </button>
                  <button 
                    className={styles.actionButtonContato}
                    onClick={() => {
                        onClose();
                        onContatarLocadorModal(casa.locador.id, casa.id);
                    }}
                  >
                    Contatar Locador
                  </button>
                  {}
                </div>
              )}
               {!isAuthenticated && casaId && (
                <div className={styles.loginPromptModal}>
                    <p>Faça <Link to={`/login?redirect=/casas/${casaId}`}>login</Link> ou <Link to={`/register?redirect=/casas/${casaId}`}>cadastre-se</Link> para reservar ou contatar o locador.</p>
                </div>
               )}
            </div>
        </div>
      </div>
    </div>
  );
}

export default CasaDetalhesModal;