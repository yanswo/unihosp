import React, { useState, useEffect, useCallback } from "react";
import styles from "./BuscarCasasPage.module.css";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import ReservaModal from "../../utils/ReservaModal";
import CasaDetalhesModal from "../../utils/CasaDetalhesModal";
import { toast } from "react-toastify";

function CasaCard({
  casa,
  onFavoritar,
  onAbrirModalReserva,
  onAbrirDetalhesModal,
  isFavorito,
  isHospedeLogado,
}) {
  const imagemPrincipalUrl =
    casa.imagens && casa.imagens.length > 0
      ? casa.imagens[0].url
      : `https://placehold.co/300x180/A8D5E2/333?text=${encodeURIComponent(
          casa.endereco?.substring(0, 15) || "Casa"
        )}`;
  const placeholderText =
    casa.imagens && casa.imagens.length > 0
      ? `Foto de ${casa.endereco}`
      : `Sem foto disponível para ${casa.endereco || "Casa"}`;

  return (
    <div className={styles.casaCard}>
      <div className={styles.casaImageContainer}>
        <img
          src={imagemPrincipalUrl}
          alt={placeholderText}
          className={styles.casaImage}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/300x180/E0E0E0/BDBDBD?text=Indisponível`;
            e.target.alt = `Imagem indisponível para ${
              casa.endereco || "Casa"
            }`;
          }}
        />
      </div>
      <div className={styles.casaInfo}>
        <h3>
          {casa.endereco || "Endereço não informado"}, {casa.numero || ""}
        </h3>
        <p className={styles.cidadeEstado}>
          {casa.cidade || "Cidade não informada"}
          {casa.estado ? `, ${casa.estado}` : ""}
          {casa.cep ? ` - CEP: ${casa.cep}` : ""}
        </p>
        <p className={styles.diretrizes}>
          <strong>Diretrizes:</strong>{" "}
          {casa.diretrizes ? casa.diretrizes.substring(0, 80) : "Não informado"}
          {casa.diretrizes && casa.diretrizes.length > 80 ? "..." : ""}
        </p>
        {casa.complemento && (
          <p>
            <strong>Complemento:</strong> {casa.complemento}
          </p>
        )}
        {casa.locador && (
          <p className={styles.locadorInfo}>
            <strong>Locador:</strong> {casa.locador.name || "Não informado"}
          </p>
        )}
        {typeof casa.precoPorNoite === "number" && (
          <p className={styles.precoPorNoite}>
            <strong>Preço por Noite:</strong> R${" "}
            {casa.precoPorNoite.toFixed(2).replace(".", ",")}
          </p>
        )}
        <div className={styles.casaActions}>
          <button
            className={styles.detailsButton}
            onClick={() => onAbrirDetalhesModal(casa.id)}
          >
            Ver Detalhes
          </button>
          {isHospedeLogado && (
            <>
              <button
                className={`${styles.actionButtonSmall} ${
                  isFavorito ? styles.favoritedButton : styles.favoriteButton
                }`}
                onClick={() => onFavoritar(casa.id, isFavorito)}
                title={
                  isFavorito
                    ? "Remover dos Favoritos"
                    : "Adicionar aos Favoritos"
                }
                aria-label={
                  isFavorito
                    ? "Remover dos Favoritos"
                    : "Adicionar aos Favoritos"
                }
              >
                {isFavorito ? "❤️" : "🤍"}
              </button>
              {casa.precoPorNoite !== null &&
                casa.precoPorNoite !== undefined && (
                  <button
                    className={`${styles.actionButtonSmall} ${styles.reserveButton}`}
                    onClick={() => onAbrirModalReserva(casa)}
                    title="Reservar esta casa"
                  >
                    Reservar
                  </button>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BuscarCasasPage() {
  const { token, userId, userType, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [casas, setCasas] = useState([]);
  const [favoritosHospede, setFavoritosHospede] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCidade, setFilterCidade] = useState("");

  const [isReservaModalOpen, setIsReservaModalOpen] = useState(false);
  const [selectedCasaParaReserva, setSelectedCasaParaReserva] = useState(null);

  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [selectedCasaIdParaDetalhes, setSelectedCasaIdParaDetalhes] =
    useState(null);

  const isHospedeLogado = isAuthenticated && userType === "hospede";

  const fetchCasasEFavoritos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const promessas = [
        fetch("https://apiunihosp.onrender.com/api/casa").then((res) => {
          if (!res.ok)
            throw new Error(`Erro HTTP ${res.status} ao buscar casas`);
          return res.json();
        }),
      ];

      if (isHospedeLogado && token) {
        promessas.push(
          fetch("https://apiunihosp.onrender.com/api/hospede/favoritos", {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => {
              if (!res.ok) {
                console.warn(
                  `Erro HTTP ${res.status} ao buscar favoritos, continuando...`
                );
                return [];
              }
              return res.json();
            })
            .catch((favError) => {
              console.warn(
                "Falha ao buscar favoritos, continuando...",
                favError
              );
              return [];
            })
        );
      } else {
        promessas.push(Promise.resolve([]));
      }

      const [casasData, favoritosData] = await Promise.all(promessas);

      if (Array.isArray(casasData)) {
        setCasas(casasData);
      } else {
        setCasas([]);
        console.error(
          "BuscarCasasPage: Dados de casas não são array:",
          casasData
        );
        setError("Formato de dados de casas inesperado.");
      }

      if (Array.isArray(favoritosData)) {
        setFavoritosHospede(favoritosData.map((fav) => fav.casaId));
      } else {
        setFavoritosHospede([]);
        console.warn(
          "BuscarCasasPage: Dados de favoritos não são array ou falharam:",
          favoritosData
        );
      }
    } catch (err) {
      console.error("BuscarCasasPage: Falha ao buscar dados:", err);
      setError(err.message || "Erro ao carregar dados das acomodações.");
    } finally {
      setLoading(false);
    }
  }, [token, isHospedeLogado]);

  useEffect(() => {
    fetchCasasEFavoritos();
  }, [fetchCasasEFavoritos]);

  const handleFavoritar = async (casaId, jaEFavorito) => {
    if (!isHospedeLogado || !token) {
      toast.info(
        "Você precisa estar logado como hóspede para favoritar casas."
      );
      navigate("/login", { state: { from: location } });
      return;
    }
    const method = jaEFavorito ? "DELETE" : "POST";
    const url = jaEFavorito
      ? `https://apiunihosp.onrender.com/api/favoritos/${casaId}`
      : `https://apiunihosp.onrender.com/api/favoritos`;
    const body = !jaEFavorito
      ? JSON.stringify({ casaId: parseInt(casaId) })
      : null;
    const headers = { Authorization: `Bearer ${token}` };
    if (body) headers["Content-Type"] = "application/json";
    try {
      const response = await fetch(url, { method, headers, body });
      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          responseData.error ||
            `Falha ao ${jaEFavorito ? "desfavoritar" : "favoritar"} casa.`
        );
      }
      toast.success(
        jaEFavorito ? "Removido dos favoritos!" : "Adicionado aos favoritos!"
      );
      fetchCasasEFavoritos();
    } catch (err) {
      console.error("Erro ao favoritar/desfavoritar:", err);
      toast.error(`Erro: ${err.message}`);
    }
  };

  const handleAbrirModalReserva = (casaSelecionada) => {
    if (!isHospedeLogado) {
      toast.info(
        "Você precisa estar logado como hóspede para fazer uma reserva."
      );
      navigate("/login", { state: { from: location } });
      return;
    }
    if (
      casaSelecionada.precoPorNoite === null ||
      casaSelecionada.precoPorNoite === undefined
    ) {
      toast.warn("Esta casa não pode ser reservada (sem preço definido).");
      return;
    }
    setSelectedCasaParaReserva(casaSelecionada);
    setIsReservaModalOpen(true);
  };

  const handleCloseReservaModal = () => {
    setIsReservaModalOpen(false);
    setSelectedCasaParaReserva(null);
  };

  const handleReservaSucesso = (novaReserva) => {
    handleCloseReservaModal();
  };

  const handleAbrirDetalhesModal = (idCasa) => {
    setSelectedCasaIdParaDetalhes(idCasa);
    setIsDetalhesModalOpen(true);
  };

  const handleCloseDetalhesModal = () => {
    setIsDetalhesModalOpen(false);
    setSelectedCasaIdParaDetalhes(null);
  };

  const handleContatarLocadorDoModal = async (locadorId, casaIdContexto) => {
    if (!isAuthenticated || userType !== "hospede") {
      toast.info(
        "Você precisa estar logado como hóspede para contatar o locador."
      );
      navigate("/login", { state: { from: location } });
      return;
    }
    try {
      const response = await fetch(
        "https://apiunihosp.onrender.com/api/conversas",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            outroUsuarioId: locadorId,
            casaId: casaIdContexto,
          }),
        }
      );
      const conversaCriada = await response.json();
      if (!response.ok)
        throw new Error(
          conversaCriada.error || "Não foi possível iniciar a conversa."
        );

      setIsDetalhesModalOpen(false);
      navigate(`/mensagens/${conversaCriada.id}`);
    } catch (err) {
      console.error("Erro ao iniciar conversa do modal de detalhes:", err);
      toast.error(err.message || "Erro ao tentar contatar o locador.");
    }
  };

  const cidadesUnicas = [
    ...new Set(casas.map((casa) => casa.cidade).filter(Boolean)),
  ].sort();

  const filteredCasas = casas.filter((casa) => {
    const searchLower = searchTerm.toLowerCase();
    const cidadeMatch = filterCidade ? casa.cidade === filterCidade : true;

    const enderecoMatch = casa.endereco?.toLowerCase().includes(searchLower);
    const cidadeTermMatch = casa.cidade?.toLowerCase().includes(searchLower);
    const estadoTermMatch = casa.estado?.toLowerCase().includes(searchLower);
    const locadorNameMatch = casa.locador?.name
      ?.toLowerCase()
      .includes(searchLower);

    const searchTermMatch =
      enderecoMatch || cidadeTermMatch || estadoTermMatch || locadorNameMatch;

    return cidadeMatch && searchTermMatch;
  });

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.content}>
          <header className={styles.pageHeader}>
            <h1>Encontre Sua Acomodação Ideal</h1>
          </header>
          <p className={styles.loading}>Carregando acomodações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.content}>
          <header className={styles.pageHeader}>
            <h1>Encontre Sua Acomodação Ideal</h1>
          </header>
          <p className={styles.error}>Erro ao carregar acomodações: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.content}>
        <header className={styles.pageHeader}>
          <h1>Encontre Sua Acomodação Ideal</h1>
          <p>Explore as opções disponíveis para universitários.</p>
        </header>
        <div className={styles.filtersContainer}>
          <input
            type="text"
            placeholder="Buscar por endereço, cidade, estado, locador..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className={styles.cityFilter}
            value={filterCidade}
            onChange={(e) => setFilterCidade(e.target.value)}
          >
            <option value="">Todas as Cidades</option>
            {cidadesUnicas.map((cidade) => (
              <option key={cidade} value={cidade}>
                {cidade}
              </option>
            ))}
          </select>
        </div>

        {!loading && filteredCasas.length === 0 && (
          <p className={styles.noResults}>
            Nenhuma casa encontrada com os filtros atuais.
          </p>
        )}

        <div className={styles.casasList}>
          {filteredCasas.map((casa) => (
            <CasaCard
              key={casa.id}
              casa={casa}
              onFavoritar={handleFavoritar}
              onAbrirModalReserva={handleAbrirModalReserva}
              onAbrirDetalhesModal={handleAbrirDetalhesModal}
              isFavorito={favoritosHospede.includes(casa.id)}
              isHospedeLogado={isHospedeLogado}
            />
          ))}
        </div>
      </div>

      {selectedCasaParaReserva && isReservaModalOpen && (
        <ReservaModal
          isOpen={isReservaModalOpen}
          onClose={handleCloseReservaModal}
          casa={selectedCasaParaReserva}
          onReservaSucesso={handleReservaSucesso}
        />
      )}

      {isDetalhesModalOpen && selectedCasaIdParaDetalhes && (
        <CasaDetalhesModal
          casaId={selectedCasaIdParaDetalhes}
          onClose={handleCloseDetalhesModal}
          onAbrirReservaModal={(casaParaReservar) => {
            handleCloseDetalhesModal();
            handleAbrirModalReserva(casaParaReservar);
          }}
          onContatarLocadorModal={handleContatarLocadorDoModal}
        />
      )}
    </div>
  );
}
export default BuscarCasasPage;
