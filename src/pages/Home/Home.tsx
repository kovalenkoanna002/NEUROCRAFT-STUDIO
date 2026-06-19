import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import Reveal from "../../components/Reveal/Reveal";
import ScrollProgress from "../../components/ScrollProgress/ScrollProgress";
import BackToTop from "../../components/BackToTop/BackToTop";
import AboutSection from "./components/AboutSection";
import FeaturesWrapper from "./components/FeaturesWrapper";
import HeroSection from "./components/HeroSection";
import UsersSection from "./components/UsersSection";
import { PageMeta } from "../../components/PageMeta/PageMeta";
import "./Home.scss";

const Home: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (target) {
      requestAnimationFrame(() => {
        document
          .getElementById(target)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [location.state]);

  return (
    <>
      <PageMeta
        title="Платформа для работы с архитектурами нейросетей"
        description="NeuroCraft Studio — визуализация архитектур нейросетей, графический редактор с генерацией кода, песочница обучения и база знаний по ИИ."
      />
      <ScrollProgress />
      <div className="home">
        <Header />
        <main>
          <HeroSection />
          <Reveal>
            <AboutSection />
          </Reveal>
          <Reveal>
            <FeaturesWrapper />
          </Reveal>
          <Reveal>
            <UsersSection />
          </Reveal>
        </main>
        <footer>
          <Footer />
        </footer>
      </div>
      <BackToTop />
    </>
  );
};

export default Home;
