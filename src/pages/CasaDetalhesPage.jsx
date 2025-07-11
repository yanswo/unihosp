import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './CasaDetalhesPage.module.css';
import DashboardHeader from '../components/hospede/DashboardHeader';

const LocalIcon = () => <span className={styles.detailIcon}>📍</span>;
const PrecoIcon = () => <span className={styles.detailIcon}>💰</span>;
const RegrasIcon = () => <span className={styles.detailIcon}>📜</span>;
const UserIcon = () => <span className={styles.detailIcon}>👤</span>;
const ImagesIcon = () => <span className={styles.detailIcon}>🖼️</span>;


function CasaDetalhesPage() {
  const { casaId } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated, userType, userId } = useAuth();

  const [casa, setCasa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imagemPrincipal, setImagemPrincipal] = useState('');

  const fetchCasaDetalhes = useCallback(async () => {
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
      console.error("Erro ao buscar detalhes da casa:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [casaId]);


  useEffect(() => {
    if (casaId) {
      fetchCasaDetalhes();
    }
  }, [casaId, fetchCasaDetalhes]);

  const handleSelecionarImagem = (url) => {
    setImagemPrincipal(url);
  };

  const handleContatarLocadorAqui = async () => {
    if (!isAuthenticated || userType !== 'hospede') {
      alert("Você precisa estar logado como hóspede para contatar o locador.");
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (!casa || !casa.locador) {
        alert("Informações do locador não disponíveis.");
        return;
    }
    try {
        const response = await fetch('http://localhost:5000/api/conversas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                outroUsuarioId: casa.locador.id,
                casaId: casa.id,
            }),
        });
        const conversaCriada = await response.json();
        if (!response.ok) {
            throw new Error(conversaCriada.error || "Não foi possível iniciar a conversa.");
        }
        navigate(`/mensagens/${conversaCriada.id}`);
    } catch (err) {
        console.error("Erro ao iniciar conversa a partir dos detalhes da casa:", err);
        alert(err.message || "Erro ao tentar contatar o locador.");
    }
  };



  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <DashboardHeader /> {}
        <div className={styles.loadingState}>Carregando detalhes da casa...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <DashboardHeader />
        <div className={styles.errorState}>Erro ao carregar detalhes: {error}</div>
      </div>
    );
  }

  if (!casa) {
    return (
      <div className={styles.pageContainer}>
        <DashboardHeader />
        <div className={styles.errorState}>Casa não encontrada.</div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <DashboardHeader /> {}
      <main className={styles.detalhesContent}>
        <div className={styles.imageGallery}>
          <div className={styles.imagemPrincipalContainer}>
            <img 
                src={imagemPrincipal} 
                alt={`Foto principal de ${casa.endereco}`} 
                className={styles.imagemPrincipal}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/600x400/E0E0E0/BDBDBD?text=Imagem+Indisponível`;
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
                >
                  <img src={img.url} alt={`Thumbnail de ${casa.endereco}`} />
                </div>
              ))}
            </div>
          )}
           {(casa.imagens?.length === 0 || !casa.imagens) && casa.endereco && (
             <div className={styles.imagemPrincipalContainer}> {}
                <img 
                    src={`https://placehold.co/600x400/A8D5E2/333?text=${encodeURIComponent(casa.endereco?.substring(0,20) || "Casa")}`}
                    alt={`Foto de ${casa.endereco}`} 
                    className={styles.imagemPrincipal}
                />
             </div>
           )}
        </div>

        <div className={styles.infoContainer}>
          <h1 className={styles.casaTitulo}>{casa.endereco}, {casa.numero}</h1>
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
                    {}
                </div>
            )}
          </div>
          
          {}
          {isAuthenticated && userType === 'hospede' && (
            <div className={styles.acoesContainer}>
              <button 
                className={styles.actionButtonReserva} 
                onClick={() => alert("Abrir modal de reserva")}
                disabled={casa.precoPorNoite === null || casa.precoPorNoite === undefined}
                title={ (casa.precoPorNoite === null || casa.precoPorNoite === undefined) ? "Reserva indisponível (sem preço)" : "Reservar esta acomodação"}
              >
                Reservar Agora
              </button>
              <button 
                className={styles.actionButtonContato}
                onClick={handleContatarLocadorAqui}
              >
                Contatar Locador
              </button>
              {
}
            </div>
          )}
           {!isAuthenticated && (
            <div className={styles.loginPrompt}>
                <p>Faça <Link to={`/login?redirect=/casas/${casaId}`}>login</Link> ou <Link to={`/register?redirect=/casas/${casaId}`}>cadastre-se</Link> para reservar ou contatar o locador.</p>
            </div>
           )}

        </div>
      </main>
      {
}
    </div>
  );
}

export default CasaDetalhesPage;