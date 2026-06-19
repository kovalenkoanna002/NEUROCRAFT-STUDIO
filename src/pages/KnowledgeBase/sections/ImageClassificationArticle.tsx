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
  CodeBlock,
  Term,
  Sources,
} from "../components/ArticleKit";
import { REFS } from "../references";

const KERAS = `from tensorflow import keras
from tensorflow.keras import layers

model = keras.Sequential([
    keras.Input(shape=(32, 32, 3)),
    layers.Conv2D(32, 3, activation='relu', padding='same'),
    layers.MaxPooling2D(),
    layers.Conv2D(64, 3, activation='relu', padding='same'),
    layers.MaxPooling2D(),
    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dense(10, activation='softmax'),
])
model.compile(optimizer='adam',
              loss='categorical_crossentropy',
              metrics=['accuracy'])`;

const ImageClassificationArticle: React.FC = () => (
  <Article>
    <Title>Классификация изображений</Title>
    <Lead>
      Классификация изображений — задача отнести картинку к одному классу из
      заранее заданного набора: «кошка», «собака», «автомобиль». Это базовая
      задача компьютерного зрения, на которой выросли свёрточные сети, начиная с
      LeNet-5 (LeCun и др., 1998) для распознавания рукописных цифр.
    </Lead>

    <H2>Постановка задачи</H2>
    <P>
      На вход подаётся изображение в виде тензора (высота × ширина × каналы), на
      выходе — вектор вероятностей по классам. Модель обучается на размеченном
      наборе: тысячи примеров с известными метками.
    </P>
    <Ul
      items={[
        "Бинарная классификация — два класса (есть объект / нет).",
        "Многоклассовая — один объект из множества классов.",
        "Многометочная (multi-label) — на изображении может быть несколько меток сразу.",
      ]}
    />

    <H2>Архитектура решения</H2>
    <P>
      Стандартный конвейер — свёрточная сеть. Свёрточные слои выделяют{" "}
      <Term id="feature-map">карты признаков</Term> (края → текстуры → части
      объектов), <Term id="pooling">пулинг</Term> уменьшает размерность, затем{" "}
      <Term id="flatten">Flatten</Term> и <Term id="dense">полносвязные</Term>{" "}
      слои выдают ответ через <Term id="softmax">softmax</Term>.
    </P>
    <H3>Выходной слой и softmax</H3>
    <P>Softmax превращает логиты в вероятности, дающие в сумме единицу:</P>
    <Formula>softmax(z)_i = e^(z_i) / Σ_j e^(z_j)</Formula>

    <H2>Функция потерь и обучение</H2>
    <P>
      Для классификации используют перекрёстную энтропию. Она тем больше, чем
      сильнее предсказанная вероятность правильного класса отличается от единицы:
    </P>
    <Formula>L = − Σ_i y_i · log(p_i)</Formula>
    <P>
      Веса обновляются <Term id="gradient-descent">градиентным спуском</Term> по{" "}
      <Term id="backprop">обратному распространению ошибки</Term> в течение
      нескольких <Term id="epoch">эпох</Term>.
    </P>

    <H2>Глубокие сети и остаточные связи</H2>
    <P>
      Простое наращивание глубины упирается в проблему затухающих градиентов. He
      и др. (2016) предложили остаточные связи (ResNet): блок учит не само
      преобразование, а поправку к входу.
    </P>
    <Formula>y = F(x) + x</Formula>
    <P>
      Такой «короткий путь» позволяет обучать сети из сотен слоёв и резко повысил
      точность на ImageNet.
    </P>

    <H2>Пример на Keras</H2>
    <CodeBlock code={KERAS} language="python" />

    <H2>Метрики и типичные проблемы</H2>
    <Ul
      items={[
        "Accuracy — доля верных ответов; обманчива при несбалансированных классах.",
        "Precision и Recall — точность и полнота для конкретного класса.",
        "Матрица ошибок показывает, какие классы путаются между собой.",
      ]}
    />
    <Callout variant="tip">
      Против <Term id="overfitting">переобучения</Term> помогают аугментация
      данных, <Term id="dropout">dropout</Term> и перенос обучения с
      предобученной на ImageNet модели (ResNet, VGG).
    </Callout>

    <Sources refs={[REFS.lecun1998, REFS.he2016, REFS.goodfellow]} />
  </Article>
);

export default ImageClassificationArticle;
