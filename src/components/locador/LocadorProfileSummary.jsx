import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./LocadorProfileSummary.module.css";

function LocadorProfileSummary({ onCasasFetched }) {
  const { token, userId } = useAuth();
  const [locadorData, setLocadorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !userId) {
      setError("Informações de autenticação não encontradas.");
      setLoading(false);
      return;
    }
    const fetchLocadorDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `https://apiunihosp.onrender.com/api/locador/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          const errData = await response
            .json()
            .catch(() => ({ error: `Erro HTTP ${response.status}` }));
          throw new Error(errData.error || `Erro ao buscar dados do locador`);
        }
        const data = await response.json();
        setLocadorData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLocadorDetails();
  }, [token, userId]);

  if (loading)
    return (
      <div className={styles.profileSummary}>
        <p className={styles.loading}>Carregando perfil do locador...</p>
      </div>
    );
  if (error)
    return (
      <div className={styles.profileSummary}>
        <p className={styles.error}>{error}</p>
      </div>
    );
  if (!locadorData)
    return (
      <div className={styles.profileSummary}>
        <p className={styles.error}>
          Não foi possível carregar os dados do perfil.
        </p>
      </div>
    );

  return (
    <div className={styles.profileSummary}>
      {" "}
      {}
      <h2>Olá, {locadorData.name}!</h2>
      <p>Gerencie suas propriedades e reservas diretamente do seu painel.</p>
      <div className={styles.profileDetails}>
        <p>
          <strong>Email:</strong> {locadorData.email}
        </p>
        <p>
          <strong>CPF:</strong> {locadorData.cpf}
        </p>
        <p>
          <strong>Endereço Principal:</strong> {locadorData.endereco}
          {locadorData.cidade && `, ${locadorData.cidade}`}
          {locadorData.estado && ` - ${locadorData.estado}`}
        </p>
      </div>
    </div>
  );
}
export default LocadorProfileSummary;
