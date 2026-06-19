import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";

import "./KnowledgeBase.scss";
import KnowledgePage from "./KnowledgePage";
import { PageMeta } from "../../components/PageMeta/PageMeta";

const KnowledgeBase: React.FC = () => {
  return (
    <>
      <PageMeta
        title="База знаний по нейросетям и ИИ"
        description="Каталог статей по нейронным сетям, машинному обучению и ИИ с проверенными источниками — основы, архитектуры, обучение, LLM и агенты."
      />
      <Header />
      <main>
        <div className="container">
          <KnowledgePage />
        </div>
      </main>

      <Footer />
    </>
  );
};

export default KnowledgeBase;
