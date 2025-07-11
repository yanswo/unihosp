import React from "react";
import styles from "./Serviços.module.css";

function Servicos() {
  const services = [
    {
      id: 1,
      icon: "📚",
      title: "Repúblicas Verificadas",
      description:
        "Encontre repúblicas seguras e avaliadas por outros estudantes.",
    },
    {
      id: 2,
      icon: "🤝",
      title: "Contratos Facilitados",
      description:
        "Processos de contrato simplificados e transparentes entre locador e hóspede.",
    },
    {
      id: 3,
      icon: "🔍",
      title: "Busca Personalizada",
      description:
        "Filtros avançados para você achar o local ideal com suas preferências.",
    },
    {
      id: 4,
      icon: "💬",
      title: "Comunidade Ativa",
      description:
        "Conecte-se com outros universitários, tire dúvidas e compartilhe experiências.",
    },
    {
      id: 5,
      icon: "🛡️",
      title: "Suporte Dedicado",
      description:
        "Nossa equipe está pronta para ajudar em qualquer etapa do processo.",
    },
    {
      id: 6,
      icon: "💡",
      title: "Dicas e Guias",
      description:
        "Conteúdo exclusivo para te ajudar na vida universitária e na moradia.",
    },
  ];

  return (
    <section id="servicos" className={styles.servicosSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>NOSSOS SERVIÇOS</h2>
        <p className={styles.sectionSubtitle}>
          Oferecemos uma gama de serviços pensados para facilitar sua busca e
          estadia, conectando você às melhores opções de moradia universitária.
        </p>
        <div className={styles.servicesGrid}>
          {services.map((service) => (
            <div key={service.id} className={styles.serviceItem}>
              <div className={styles.serviceIcon}>{service.icon}</div>
              <h3 className={styles.serviceTitle}>{service.title}</h3>
              <p className={styles.serviceDescription}>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export default Servicos;
