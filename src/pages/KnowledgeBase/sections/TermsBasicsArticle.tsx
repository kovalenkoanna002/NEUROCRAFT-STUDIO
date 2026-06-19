import React from "react";
import {
  Article,
  Title,
  Lead,
  H2,
  P,
  Term,
  Callout,
  Sources,
} from "../components/ArticleKit";
import { REFS } from "../references";

const TermsBasicsArticle: React.FC = () => (
  <Article>
    <Title>Базовые термины и определения</Title>
    <Lead>
      Минимальный словарь, без которого сложно читать остальные статьи. Наведите
      курсор на выделенные термины — появится короткое определение. Полный список
      — в разделе «Словарь терминов».
    </Lead>

    <H2>Из чего состоит сеть</H2>
    <P>
      <Term id="neuron">Нейрон</Term> считает взвешенную сумму входов с{" "}
      <Term id="weight">весами</Term> и <Term id="bias">смещением</Term>, затем
      применяет <Term id="activation">функцию активации</Term>. Нейроны
      объединяются в слои; <Term id="dense">полносвязный слой</Term> связывает
      каждый нейрон со всеми выходами предыдущего.
    </P>

    <H2>Как сеть учится</H2>
    <P>
      Качество предсказания измеряет <Term id="loss">функция потерь</Term>. По
      ней считается <Term id="gradient">градиент</Term>, и{" "}
      <Term id="gradient-descent">градиентный спуск</Term> корректирует веса.
      Градиенты по всем слоям вычисляет{" "}
      <Term id="backprop">обратное распространение</Term>. Один проход по всем
      данным — это <Term id="epoch">эпоха</Term>.
    </P>

    <H2>Типичные проблемы</H2>
    <P>
      Если сеть запомнила обучающие данные, но плохо работает на новых, — это{" "}
      <Term id="overfitting">переобучение</Term>. Один из способов борьбы —{" "}
      <Term id="dropout">dropout</Term>.
    </P>

    <Callout variant="info">
      Эти термины подсвечиваются во всех статьях базы знаний — определение всегда
      под рукой.
    </Callout>

    <H2>Свёрточные и порождающие понятия</H2>
    <P>
      В свёрточных сетях ключевые понятия — <Term id="kernel">ядро</Term>,{" "}
      <Term id="convolution">свёртка</Term>, <Term id="pooling">пулинг</Term> и{" "}
      <Term id="feature-map">карта признаков</Term>, после которых идёт{" "}
      <Term id="flatten">Flatten</Term> и полносвязная часть.
    </P>

    <H2>Гиперпараметры обучения</H2>
    <P>
      В отличие от весов, которые сеть подбирает сама,{" "}
      <Term id="learning-rate">скорость обучения</Term>, размер батча и число
      эпох задаёт инженер до обучения — это гиперпараметры.
    </P>

    <Sources refs={[REFS.goodfellow, REFS.nikolenko]} />
  </Article>
);

export default TermsBasicsArticle;
