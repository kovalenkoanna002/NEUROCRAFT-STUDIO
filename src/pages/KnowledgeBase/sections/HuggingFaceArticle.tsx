import React from "react";
import {
  Article,
  Title,
  Lead,
  H2,
  Ul,
  CodeBlock,
  Callout,
  Sources,
} from "../components/ArticleKit";
import { REFS } from "../references";

const CODE = `from transformers import pipeline

clf = pipeline("sentiment-analysis")
print(clf("NeuroCraft Studio makes learning fun!"))
# [{'label': 'POSITIVE', 'score': 0.99}]`;

const HuggingFaceArticle: React.FC = () => (
  <Article>
    <Title>Hugging Face</Title>
    <Lead>
      Hugging Face — экосистема и хаб готовых моделей. Библиотека Transformers
      даёт доступ к тысячам предобученных моделей в несколько строк кода.
    </Lead>

    <H2>Что предлагает</H2>
    <Ul
      items={[
        "Hub — репозиторий моделей, датасетов и демо (Spaces).",
        "Библиотека transformers — единый интерфейс к моделям для текста, изображений, звука.",
        "Дообучение (fine-tuning) предобученных моделей под свою задачу.",
      ]}
    />

    <H2>Пример пайплайна</H2>
    <CodeBlock code={CODE} language="python" />

    <Callout variant="tip">
      Подход «взять предобученную модель и дообучить» (transfer learning) экономит
      данные и время по сравнению с обучением с нуля.
    </Callout>

    <H2>Экосистема</H2>
    <Ul
      items={[
        "transformers — модели для текста, изображений и звука.",
        "datasets — тысячи готовых датасетов в едином формате.",
        "tokenizers — быстрая токенизация текста.",
        "Spaces — публикация интерактивных демо моделей.",
      ]}
    />

    <Sources refs={[REFS.huggingface, REFS.transformer2017]} />
  </Article>
);

export default HuggingFaceArticle;
