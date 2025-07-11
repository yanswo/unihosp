import React from "react";
import styles from "./HeroSection.module.css";

function HeroSection() {
  const headerHeight = "80px";
  return (
    <section
      className={styles.heroSection}
      style={{ paddingTop: headerHeight }}
    >
      <div className={styles.textContainer}>
        <h1 className={styles.mainHeading}>
          BEM <br />
          VINDO <br />A UNIHOSTEL!
        </h1>
        <p className={styles.subHeading}>
          Aqui você vai encontrar o que você tanto aguarda!
        </p>
      </div>
      <div className={styles.imageContainer}>
        <img
          src="https://imgs.search.brave.com/Pigjnw0Za3PaNdYP-Ic2LYPgS23mt_EmgcLdsHpYI8A/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS12ZWN0b3Iv/Y29sbGVnZS1zdHVk/ZW50LWRvcm0taW50/ZXJpb3IteW91bmct/dHJhdmVsZXJzLXN0/b3BwaW5nLWhvc3Rl/bC12ZWN0b3ItaWxs/dXN0cmF0aW9uLWFs/dGVybmF0aXZlLWFj/Y29tbW9kYXRpb24t/YmFja3BhY2tlcnMt/aG91c2UtdHJpcC1j/b25jZXB0Xzc0ODU1/LTEzMDI3LmpwZz9z/ZW10PWFpc19oeWJy/aWQ"
          alt="Ilustração de boas-vindas da UniHosp"
          className={styles.heroImage}
        />
      </div>
    </section>
  );
}

export default HeroSection;
