import React from "react";
import styles from "./Sobre.module.css";
import logo from "../../../public/Logo.png"


function Sobre() {
  return (
    <section id="sobre" className={styles.sobreSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Sobre a UniHostel</h2>
        <p className={styles.sectionSubtitle}>
          Conectando estudantes universitários às melhores e mais seguras opções
          de moradia, simplificando a jornada da vida acadêmica.
        </p>
        <div className={styles.contentWrapper}>
          <div className={styles.textContainer}>
            <h3 className={styles.textHeading}>Nossa Essência</h3>
            <p className={styles.paragraphText}>
              A UniHostel nasceu da vivência e dos desafios enfrentados por
              estudantes na busca por um lar durante a graduação. Entendemos que
              encontrar o lugar certo para morar é mais do que uma necessidade –
              é fundamental para o bem-estar, segurança e sucesso acadêmico.
            </p>
            <p className={styles.paragraphText}>
              Nossa plataforma é desenhada para ser intuitiva, segura e
              completa, oferecendo filtros detalhados, informações verificadas e
              um canal direto de comunicação entre hóspedes e locadores
              comprometidos com uma experiência positiva.
            </p>
            <h3 className={styles.textHeading}>O Que Nos Move</h3>
            <ul className={styles.valuesList}>
              <li>
                <span className={styles.icon}>✨</span> Foco na Experiência do
                Universitário
              </li>
              <li>
                <span className={styles.icon}>🛡️</span> Segurança e Confiança
                nas Transações
              </li>
              <li>
                <span className={styles.icon}>🤝</span> Comunidade e Colaboração
              </li>
              <li>
                <span className={styles.icon}>💡</span> Inovação e Melhoria
                Contínua
              </li>
            </ul>
          </div>
          <div className={styles.imagePlaceholderWrapper}>
            <div className={styles.imagePlaceholder}>
              <img src={logo} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Sobre;
