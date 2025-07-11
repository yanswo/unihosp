import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./MeusFavoritos.module.css";
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from "react-router-dom";
import CasaDetalhesModal from "../../utils/CasaDetalhesModal";
import ReservaModal from "../../utils/ReservaModal";

function MeusFavoritos() {
  const { token, userId, isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [selectedCasaIdParaDetalhes, setSelectedCasaIdParaDetalhes] = useState(null);

  const [isReservaModalOpen, setIsReservaModalOpen] = useState(false);
  const [selectedCasaParaReserva, setSelectedCasaParaReserva] = useState(null);


  const fetchFavoritos = useCallback(async () => {
    if (!token || !userId) {
      setError("Autenticação necessária para ver seus favoritos.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `http://localhost:5000/api/hospede/favoritos`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: `Erro HTTP ${response.status}` }));
        throw new Error(errData.error || "Erro ao buscar seus favoritos.");
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setFavoritos(data);
      } else {
        setFavoritos([]);
        console.warn("MeusFavoritos: Formato de dados de favoritos inesperado.", data);
      }
    } catch (err) {
      console.error("MeusFavoritos: Falha ao buscar favoritos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    fetchFavoritos();
  }, [fetchFavoritos]);

  const handleRemoverFavorito = async (casaId) => {
    if (!window.confirm("Remover esta casa dos seus favoritos?")) return;
    if (!token) {
      toast.error("Erro de autenticação ao tentar remover favorito.");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/favoritos/${casaId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: `Erro HTTP ${response.status}` }));
        throw new Error(errData.error || "Falha ao remover favorito.");
      }
      toast.success("Casa removida dos favoritos!");
      fetchFavoritos();
    } catch (err) {
      console.error("MeusFavoritos: handleRemoverFavorito - Falha:", err);
      toast.error(`Erro ao remover favorito: ${err.message}`);
    }
  };

  const handleAbrirDetalhesModal = (idCasa) => {
    setSelectedCasaIdParaDetalhes(idCasa);
    setIsDetalhesModalOpen(true);
  };

  const handleCloseDetalhesModal = () => {
    setIsDetalhesModalOpen(false);
    setSelectedCasaIdParaDetalhes(null);
  };

   const handleAbrirReservaModalViaDetalhes = (casaParaReservar) => {
    if (!isAuthenticated || userType !== 'hospede') {
      toast.info("Você precisa estar logado como hóspede para fazer uma reserva.");
      navigate('/login', { state: { from: location } });
      return;
    }
    if (casaParaReservar.precoPorNoite === null || casaParaReservar.precoPorNoite === undefined) {
        toast.warn("Esta casa não pode ser reservada (sem preço definido).");
        return;
    }
    setSelectedCasaParaReserva(casaParaReservar);
    setIsDetalhesModalOpen(false);
    setIsReservaModalOpen(true);
  };

  const handleCloseReservaModal = () => {
    setIsReservaModalOpen(false);
    setSelectedCasaParaReserva(null);
  };
  
  const handleReservaSucesso = (novaReserva) => {
    handleCloseReservaModal();
  };

  const handleContatarLocadorDoModal = async (locadorId, casaIdContexto) => {
    if (!isAuthenticated || userType !== 'hospede') {
      toast.info("Você precisa estar logado como hóspede para contatar o locador.");
      navigate('/login', { state: { from: location } });
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/conversas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ outroUsuarioId: locadorId, casaId: casaIdContexto }),
      });
      const conversaCriada = await response.json();
      if (!response.ok) throw new Error(conversaCriada.error || "Não foi possível iniciar a conversa.");
      
      setIsDetalhesModalOpen(false);
      navigate(`/mensagens/${conversaCriada.id}`);
    } catch (err) {
      console.error("Erro ao iniciar conversa do modal de detalhes (Favoritos):", err);
      toast.error(err.message || "Erro ao tentar contatar o locador.");
    }
  };


  if (loading)
    return <div className={styles.loading}>Carregando seus favoritos...</div>;
  
  if (error && favoritos.length === 0) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.favoritosContainer}>
      {error && favoritos.length > 0 && <p className={`${styles.error} ${styles.errorInline}`}>{error}</p>}
      
      {favoritos.length === 0 && !loading ? (
        <p>Você ainda não adicionou nenhuma casa aos favoritos.</p>
      ) : (
        <div className={styles.favoritosGrid}>
          {favoritos.map((favorito) => {
            const imagemDaCasaUrl = favorito.casa?.imagens && favorito.casa.imagens.length > 0
              ? favorito.casa.imagens[0].url
              : `https://placehold.co/300x200/A8D5E2/333?text=${encodeURIComponent(
                  favorito.casa?.endereco?.substring(0, 10) || "Favorita"
                )}`;
            const altDaImagem = favorito.casa?.imagens && favorito.casa.imagens.length > 0
              ? `Foto de ${favorito.casa.endereco}`
              : `Sem foto disponível para ${favorito.casa?.endereco || "Casa Favorita"}`;

            return (
            <div key={favorito.id} className={styles.favoritoCard}>
              <div className={styles.favoritoImageContainer}> 
                <img
                  src={imagemDaCasaUrl}
                  alt={altDaImagem}
                  className={styles.favoritoImagem}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/300x200/E0E0E0/BDBDBD?text=Erro`;
                    e.target.alt = `Imagem indisponível`;
                  }}
                />
              </div>
              <div className={styles.favoritoInfo}> 
                <h3>
                  {favorito.casa?.endereco || "Endereço não disponível"},{" "}
                  {favorito.casa?.numero || ""}
                </h3>
                <p className={styles.cidadeEstado}>
                  {favorito.casa?.cidade || "Cidade não disponível"}
                  {favorito.casa?.estado ? `, ${favorito.casa.estado}` : ""}
                </p>
                {typeof favorito.casa?.precoPorNoite === 'number' && (
                  <p className={styles.precoPorNoite}>
                    R$ {favorito.casa.precoPorNoite.toFixed(2).replace('.', ',')} / noite
                  </p>
                )}
                <div className={styles.favoritoActions}>
                  <button
                    className={styles.detailsButton}
                    onClick={() => handleAbrirDetalhesModal(favorito.casaId)}
                  >
                    Ver Detalhes
                  </button>
                  <button
                    className={`${styles.actionButtonSmall} ${styles.removeFavoriteButton}`} 
                    onClick={() => handleRemoverFavorito(favorito.casaId)}
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          )})}
        </div>
      )}

      {}
      {isDetalhesModalOpen && selectedCasaIdParaDetalhes && (
        <CasaDetalhesModal
          casaId={selectedCasaIdParaDetalhes}
          onClose={handleCloseDetalhesModal}
          onAbrirReservaModal={handleAbrirReservaModalViaDetalhes}
          onContatarLocadorModal={handleContatarLocadorDoModal}
        />
      )}

      {}
      {selectedCasaParaReserva && isReservaModalOpen && (
        <ReservaModal
          isOpen={isReservaModalOpen}
          onClose={handleCloseReservaModal}
          casa={selectedCasaParaReserva}
          onReservaSucesso={handleReservaSucesso}
        />
      )}
    </div>
  );
}

export default MeusFavoritos;