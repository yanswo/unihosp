import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import styles from "./DashboardHeader.module.css";

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


function DashboardHeader() {
  const { userType, logoutAction } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAction();
    navigate("/");
  };

  const getDashboardHomePath = () => {
    if (userType === "hospede") return "/hospede/dashboard";
    if (userType === "locador") return "/locador/dashboard";
    if (userType === "admin") return "/admin";
    return "/";
  };

  return (
    <header className={styles.dashboardHeader}>
      <h1
        onClick={() => navigate(getDashboardHomePath())}
        className={styles.logoTitle}
        title={`Ir para o painel de ${userType || 'usuário'}`}
      >
        UniHosp {}
        {userType && (
          <span className={styles.userTypeInTitle}>
            {userType.charAt(0).toUpperCase() + userType.slice(1)}
          </span>
        )}
      </h1>
      
      <nav className={styles.navLinks}>
        {}
      </nav>

      <div className={styles.headerActions}>
        <button 
          onClick={toggleTheme} 
          className={styles.themeToggleButton}
          title={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
          aria-label={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
        >
          {}
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;