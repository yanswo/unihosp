import Header from "../components/dashboard/Header";
import HeroSection from "../components/dashboard/HeroSection";
import Sobre from "../components/dashboard/Sobre";
import Servicos from "../components/dashboard/Serviços";
import Contato from "../components/dashboard/Contato";
import Footer from "../components/dashboard/Footer";

function LandingPage() {
  return (
    <div>
      <Header isLandingPage={true} /> {}
      <HeroSection id="inicio" /> {}
      <Sobre id="sobre" />
      <Servicos id="servicos" />
      <Contato id="contato" /> {}
      <Footer />
    </div>
  );
}

export default LandingPage;
