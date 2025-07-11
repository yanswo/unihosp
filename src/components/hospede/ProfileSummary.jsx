import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./ProfileSummary.module.css";

function ProfileSummary() {
  const { token, userId } = useAuth();
  const [hospedeData, setHospedeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !userId) {
      setError(
        "Informações de autenticação não encontradas para carregar perfil."
      );
      setLoading(false);
      return;
    }

    const fetchHospedeDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `https://apiunihosp.onrender.com/api/hospede/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const responseText = await response.text();
        if (!response.ok) {
          let errData = { error: `Erro HTTP ${response.status}` };
          try {
            errData = JSON.parse(responseText);
          } catch (e) {
            console.error("Erro ao parsear resposta de erro:", e);
          }
          throw new Error(errData.error || `Erro ao buscar dados do hóspede`);
        }
        const data = JSON.parse(responseText);
        setHospedeData(data);
      } catch (err) {
        console.error("Erro ao buscar detalhes do hóspede:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHospedeDetails();
  }, [token, userId]);

  if (loading)
    return (
      <div className={styles.profileSummary}>
        <p className={styles.loading}>Carregando seu perfil...</p>
      </div>
    );
  if (error)
    return (
      <div className={styles.profileSummary}>
        <p className={styles.error}>{error}</p>
      </div>
    );
  if (!hospedeData)
    return (
      <div className={styles.profileSummary}>
        <p className={styles.error}>
          Não foi possível carregar os dados do seu perfil.
        </p>
      </div>
    );

  return (
    <div className={styles.profileSummary}>
      <h2>Olá, {hospedeData.name}!</h2>
      <p>Bem-vindo(a) de volta ao seu painel UniHosp.</p>
      <div className={styles.profileDetails}>
        <p>
          <strong>Email:</strong> {hospedeData.email}
        </p>
        {hospedeData.universidade && (
          <p>
            <strong>Universidade:</strong> {hospedeData.universidade}
          </p>
        )}
        {hospedeData.matricula && (
          <p>
            <strong>Matrícula:</strong> {hospedeData.matricula}
          </p>
        )}
        {hospedeData.cpf && (
          <p>
            <strong>CPF:</strong> {hospedeData.cpf}
          </p>
        )}
      </div>
    </div>
  );
}

export default ProfileSummary;
