/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import styles from "../../pages/AdminPage.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function VerGraficos({ token }) {
  const [counts, setCounts] = useState({ hospedes: 0, locadores: 0, casas: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDataCounts = useCallback(async () => {
    if (!token) {
      setError("Autenticação necessária para carregar dados dos gráficos.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");

    try {
      const [hospedesRes, locadoresRes, casasRes] = await Promise.all([
        fetch("https://apiunihosp.onrender.com/api/hospede", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://apiunihosp.onrender.com/api/locador", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://apiunihosp.onrender.com/api/casa", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const processResponse = async (res, type) => {
        const text = await res.text();
        if (!res.ok) {
          let errData = { error: `Erro HTTP ${res.status} ao buscar ${type}` };
          try {
            errData = JSON.parse(text);
            // eslint-disable-next-line no-empty
          } catch (e) {}
          throw new Error(
            errData.error || `Falha ao carregar dados de ${type}.`
          );
        }
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error(`Resposta de ${type} não é um JSON válido.`);
        }
      };

      const hospedesData = await processResponse(hospedesRes, "hóspedes");
      const locadoresData = await processResponse(locadoresRes, "locadores");
      const casasData = await processResponse(casasRes, "casas");

      setCounts({
        hospedes: Array.isArray(hospedesData) ? hospedesData.length : 0,
        locadores: Array.isArray(locadoresData) ? locadoresData.length : 0,
        casas: Array.isArray(casasData) ? casasData.length : 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDataCounts();
  }, [fetchDataCounts]);

  const barChartData = {
    labels: ["Hóspedes", "Locadores", "Casas"],
    datasets: [
      {
        label: "Contagem Total",
        data: [counts.hospedes, counts.locadores, counts.casas],
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 159, 64, 0.7)",
          "rgba(75, 192, 192, 0.7)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const pieChartData = {
    labels: ["Hóspedes", "Locadores"],
    datasets: [
      {
        label: "Distribuição de Usuários",
        data: [counts.hospedes, counts.locadores],
        backgroundColor: [
          "rgba(54, 162, 235, 0.85)",
          "rgba(255, 159, 64, 0.85)",
        ],
        borderColor: ["rgba(255, 255, 255, 0.7)", "rgba(255, 255, 255, 0.7)"],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptionsBase = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { family: "'Josefin Sans', sans-serif", size: 13 },
          color: "#555",
          padding: 15,
        },
      },
      title: {
        display: true,
        font: { size: 16, family: "'Josefin Sans', sans-serif", weight: "600" },
        color: "#34495e",
        padding: { top: 0, bottom: 10 },
      },
      tooltip: {
        titleFont: { family: "'Josefin Sans', sans-serif" },
        bodyFont: { family: "'Josefin Sans', sans-serif" },
        backgroundColor: "rgba(0,0,0,0.75)",
        titleColor: "#fff",
        bodyColor: "#fff",
        footerColor: "#fff",
        padding: 10,
        cornerRadius: 3,
      },
    },
  };

  const barChartOptions = {
    ...chartOptionsBase,
    plugins: {
      ...chartOptionsBase.plugins,
      title: { ...chartOptionsBase.plugins.title, text: "Total de Cadastros" },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: Math.max(
            1,
            Math.ceil(
              Math.max(counts.hospedes, counts.locadores, counts.casas, 1) / 5
            )
          ),
          color: "#555",
          font: { family: "'Josefin Sans', sans-serif" },
        },
        grid: { color: "#e9ecef" },
      },
      x: {
        ticks: {
          color: "#555",
          font: { family: "'Josefin Sans', sans-serif" },
        },
        grid: { display: false },
      },
    },
  };

  const pieChartOptions = {
    ...chartOptionsBase,
    plugins: {
      ...chartOptionsBase.plugins,
      title: {
        ...chartOptionsBase.plugins.title,
        text: "Distribuição de Usuários",
      },
    },
  };

  if (loading)
    return (
      <p className={styles.loadingMessage}>
        Carregando dados para os gráficos...
      </p>
    );
  if (error) return <p className={styles.errorMessage}>{error}</p>;

  return (
    <div className={styles.crudSection}>
      <h3>Gráficos e Estatísticas</h3>
      <div className={styles.chartsContainer}>
        <div className={styles.chartWrapper}>
          <h4>Contagem Geral</h4>
          {counts.hospedes > 0 || counts.locadores > 0 || counts.casas > 0 ? (
            <div className={styles.chartCanvasContainer}>
              <Bar options={barChartOptions} data={barChartData} />
            </div>
          ) : (
            <p>Sem dados para o gráfico de contagem geral.</p>
          )}
        </div>
        <div className={styles.chartWrapper}>
          <h4>Usuários: Hóspedes vs Locadores</h4>
          {counts.hospedes > 0 || counts.locadores > 0 ? (
            <div className={styles.chartCanvasContainer}>
              <Pie options={pieChartOptions} data={pieChartData} />
            </div>
          ) : (
            <p>Sem dados para o gráfico de distribuição de usuários.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerGraficos;
