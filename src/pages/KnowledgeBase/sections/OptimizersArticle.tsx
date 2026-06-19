import React from "react";
import {
  Article,
  Title,
  Lead,
  H2,
  H3,
  P,
  Ul,
  Formula,
  Callout,
  Term,
  Sources,
} from "../components/ArticleKit";
import GradientDescentDemo from "../interactive/GradientDescentDemo";
import { REFS } from "../references";

const OptimizersArticle: React.FC = () => (
  <Article>
    <Title>Алгоритмы оптимизации</Title>
    <Lead>
      Оптимизатор решает, как именно менять веса по вычисленному{" "}
      <Term id="gradient">градиенту</Term>, чтобы быстрее и стабильнее
      минимизировать потери.
    </Lead>

    <H2>Градиентный спуск</H2>
    <P>
      Базовый принцип: сдвигаем параметр против градиента с шагом{" "}
      <Term id="learning-rate">learning rate</Term> η:
    </P>
    <Formula>w ← w − η · ∂L/∂w</Formula>

    <H3>Попробуйте сами</H3>
    <P>
      Мячик катится к минимуму параболы. Меняйте learning rate и наблюдайте:
      слишком большой шаг — спуск перепрыгивает минимум и расходится.
    </P>
    <GradientDescentDemo />

    <H2>Популярные оптимизаторы</H2>
    <Ul
      items={[
        "SGD — обновляет веса по мини-батчам; прост, но чувствителен к learning rate.",
        "Momentum — накапливает «инерцию» прошлых шагов, проскакивает мелкие неровности.",
        "RMSProp — адаптирует шаг для каждого параметра по истории градиентов.",
        "Adam — сочетает Momentum и RMSProp; стандартный выбор по умолчанию.",
      ]}
    />

    <Callout variant="tip">
      Начните с Adam и learning rate около 0.001 — это работает в подавляющем
      большинстве задач. Тонкую настройку оставьте на потом.
    </Callout>

    <H2>Размер батча и learning rate</H2>
    <Ul
      items={[
        "Маленький батч — больше шума в градиенте, но иногда лучше обобщение.",
        "Большой батч — устойчивее и быстрее на GPU, но требует большего learning rate.",
        "Learning rate — самый важный гиперпараметр: при расхождении уменьшайте его в 3–10 раз.",
      ]}
    />

    <H2>Расписания скорости обучения</H2>
    <P>
      На практике learning rate не держат постоянным, а уменьшают по ходу
      обучения:
    </P>
    <Ul
      items={[
        "Step decay — ступенчатое снижение каждые N эпох.",
        "Cosine annealing — плавное косинусное затухание.",
        "Warmup — короткий разгон в начале, помогает трансформерам.",
      ]}
    />

    <Callout variant="info">
      Признаки неправильного learning rate: потеря «скачет» или растёт →
      слишком большой; падает крайне медленно по прямой → слишком малый.
    </Callout>

    <Sources refs={[REFS.rumelhart1986, REFS.goodfellow, REFS.nikolenko]} />
  </Article>
);

export default OptimizersArticle;
