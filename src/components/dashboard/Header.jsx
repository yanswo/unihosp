import React, { useState, useEffect } from "react";
import styles from "./Header.module.css";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

import LoginModal from "../../utils/LoginModal";
import EscolhaModal from "../../utils/EscolhaModal";
import RegisterHospedeModal from "../../utils/RegisterHospedeModal";
import RegisterLocadorModal from "../../utils/RegisterLocadorModal";

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);


function Header({ isLandingPage }) {
  const { isAuthenticated, userType, logoutAction } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserTypeChoiceModalOpen, setIsUserTypeChoiceModalOpen] = useState(false);
  const [isRegisterHospedeModalOpen, setIsRegisterHospedeModalOpen] = useState(false);
  const [isRegisterLocadorModalOpen, setIsRegisterLocadorModalOpen] = useState(false);

  const [headerScrolled, setHeaderScrolled] = useState(false);

  const closeAllModals = () => {
    setIsLoginModalOpen(false);
    setIsUserTypeChoiceModalOpen(false);
    setIsRegisterHospedeModalOpen(false);
    setIsRegisterLocadorModalOpen(false);
  };

  const openLoginModal = () => {
    closeAllModals();
    setIsLoginModalOpen(true);
  };
  const handleNavigateToUserTypeChoice = () => {
    closeAllModals();
    setIsUserTypeChoiceModalOpen(true);
  };
  const handleSelectHospede = () => {
    closeAllModals();
    setIsRegisterHospedeModalOpen(true);
  };
  const handleSelectLocador = () => {
    closeAllModals();
    setIsRegisterLocadorModalOpen(true);
  };
  const handleNavigateToLogin = () => {
    closeAllModals();
    setIsLoginModalOpen(true);
  };


  const handleLogout = () => {
    logoutAction();
    navigate("/");
  };

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const isAnyModalOpen = isLoginModalOpen || isUserTypeChoiceModalOpen || isRegisterHospedeModalOpen || isRegisterLocadorModalOpen;
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalBodyOverflow || '';
    }
    return () => {
      if (document.body.style.overflow === "hidden") {
          document.body.style.overflow = originalBodyOverflow || '';
      }
    };
  }, [
    isLoginModalOpen,
    isUserTypeChoiceModalOpen,
    isRegisterHospedeModalOpen,
    isRegisterLocadorModalOpen,
  ]);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const headerOffset = 70;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    } else if (sectionId === 'inicio') {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
     else {
      navigate("/");
    }
  };

  const handleNavClick = (e, pathOrId) => {
    e.preventDefault();
    if (isLandingPage && pathOrId.startsWith("#")) {
      scrollToSection(pathOrId.substring(1));
    } else if (isLandingPage && (pathOrId === "/" || pathOrId === "#inicio") ) {
      scrollToSection("inicio");
    }
     else if (pathOrId === "/") {
      navigate("/");
      if (location.pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" });
    }
    else {
      navigate(pathOrId);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setHeaderScrolled(true);
      } else {
        setHeaderScrolled(false);
      }
    };
    if (isLandingPage) {
        window.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (isLandingPage) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isLandingPage]);


  return (
    <>
      <header className={`${styles.header} ${isLandingPage && headerScrolled ? styles.headerScrolled : ''}`}>
        <h1
          className={styles.title}
          onClick={() => handleNavClick({ preventDefault: () => {} }, isLandingPage ? "#inicio" : "/")}
        >
          UniHostel
        </h1>
        <ul className={styles.listContainer}>
          <li className={styles.list}>
            <a href={isLandingPage ? "#inicio" : "/"} onClick={(e) => handleNavClick(e, isLandingPage ? "#inicio" : "/")}>
              Home
            </a>
          </li>
          {isLandingPage && (
            <>
              <li className={styles.list}>
                <a href="#sobre" onClick={(e) => handleNavClick(e, "#sobre")}>Sobre</a>
              </li>
              <li className={styles.list}>
                <a href="#servicos" onClick={(e) => handleNavClick(e, "#servicos")}>Serviços</a>
              </li>
              <li className={styles.list}>
                <a href="#contato" onClick={(e) => handleNavClick(e, "#contato")}>Contato</a>
              </li>
            </>
          )}

          {}
          <li className={styles.list}>
            <button 
              onClick={toggleTheme} 
              className={styles.themeToggleButton}
              aria-label={`Mudar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
              title={`Mudar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
          </li>

          {isAuthenticated ? (
            <>
              {userType === "admin" && (
                <li className={styles.list}>
                  <a href="/admin" onClick={(e) => handleNavClick(e, "/admin")}>
                    Painel Admin
                  </a>
                </li>
              )}
              {userType === "hospede" && (
                <li className={styles.list}>
                  <a
                    href="/hospede/dashboard"
                    onClick={(e) => handleNavClick(e, "/hospede/dashboard")}
                  >
                    Meu Painel
                  </a>
                </li>
              )}
              {userType === "locador" && (
                <li className={styles.list}>
                  <a
                    href="/locador/dashboard"
                    onClick={(e) => handleNavClick(e, "/locador/dashboard")}
                  >
                    Meu Painel
                  </a>
                </li>
              )}
              <li className={styles.listLogin}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                >
                  Logout
                </a>
              </li>
            </>
          ) : (
            <li className={styles.listLogin}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openLoginModal();
                }}
              >
                Login
              </a>
            </li>
          )}
        </ul>
      </header>

      {}
      {!isAuthenticated && (
        <>
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={closeAllModals}
            onSwitchToRegister={handleNavigateToUserTypeChoice}
          />
          <EscolhaModal
            isOpen={isUserTypeChoiceModalOpen}
            onClose={closeAllModals}
            onSelectHospede={handleSelectHospede}
            onSelectLocador={handleSelectLocador}
            onSwitchToLogin={handleNavigateToLogin}
          />
          <RegisterHospedeModal
            isOpen={isRegisterHospedeModalOpen}
            onClose={closeAllModals}
            onSwitchToLogin={handleNavigateToLogin}
          />
          <RegisterLocadorModal
            isOpen={isRegisterLocadorModalOpen}
            onClose={closeAllModals}
            onSwitchToLogin={handleNavigateToLogin}
          />
        </>
      )}
    </>
  );
}

export default Header;