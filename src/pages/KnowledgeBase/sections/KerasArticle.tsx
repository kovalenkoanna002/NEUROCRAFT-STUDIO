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

const CODE = `from tensorflow import keras
from tensorflow.keras import layers

model = keras.Sequential([
    layers.Input(shape=(784,)),
    layers.Dense(128, activation='relu'),
    layers.Dense(10, activation='softmax'),
])`;

const KerasArticle: React.FC = () => (
  <Article>
    <Title>Keras</Title>
    <Lead>
      Keras — высокоуровневый API для построения нейросетей. Делает код кратким и
      читаемым; входит в состав TensorFlow.
    </Lead>

    <H2>Почему с него начинают</H2>
    <Ul
      items={[
        "Минимум кода: модель собирается из слоёв как из кубиков.",
        "Единый интерфейс fit / evaluate / predict.",
        "Три способа описания: Sequential, функциональный API, подклассы Model.",
      ]}
    />

    <H2>Пример Sequential</H2>
    <CodeBlock code={CODE} language="python" />

    <Callout variant="tip">
      Именно формат Keras используется по умолчанию в конструкторе NeuroCraft
      Studio — он самый наглядный для обучения.
    </Callout>

    <H2>Три способа описать модель</H2>
    <Ul
      items={[
        "Sequential — линейный стек слоёв; самый простой, подходит для большинства учебных задач.",
        "Функциональный API — произвольные графы: несколько входов/выходов, ветвления.",
        "Подклассы Model — полный контроль через собственный класс, как в PyTorch.",
      ]}
    />

    <Sources refs={[REFS.keras, REFS.tensorflow]} />
  </Article>
);

export default KerasArticle;
