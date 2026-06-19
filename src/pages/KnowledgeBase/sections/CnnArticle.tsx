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
  BuilderLink,
  Term,
  Sources,
} from "../components/ArticleKit";
import ConvolutionDemo from "../interactive/ConvolutionDemo";
import { REFS } from "../references";

const KERAS = `from tensorflow import keras
from tensorflow.keras import layers

model = keras.Sequential([
    keras.Input(shape=(28, 28, 1)),
    layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
    layers.MaxPooling2D((2, 2)),
    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dense(10, activation='softmax'),
])`;

const CnnArticle: React.FC = () => (
  <Article>
    <Title>Свёрточные нейронные сети (CNN)</Title>
    <Lead>
      CNN (Convolutional Neural Networks) — архитектура для данных с
      пространственной структурой: изображений, видео, спектрограмм. Идея
      локальных обучаемых фильтров была предложена в работе LeCun и др. (1998)
      на примере распознавания рукописных цифр (сеть LeNet-5).
    </Lead>

    <H2>Почему не обычная сеть</H2>
    <Ul
      items={[
        <>
          Локальные <Term id="kernel">ядра</Term> вместо связей «каждый с
          каждым» — на порядки меньше параметров.
        </>,
        "Учитывают соседство пикселей и сохраняют пространственную структуру.",
        "Один и тот же фильтр применяется ко всему изображению (общие веса).",
      ]}
    />

    <H2>Как работает свёртка</H2>
    <P>
      <Term id="kernel">Ядро</Term> скользит по изображению и в каждой позиции
      считает сумму произведений своих весов на значения под ним. Результат —{" "}
      <Term id="feature-map">карта признаков</Term>. Ниже ядро Собеля выделяет
      вертикальную границу:
    </P>
    <ConvolutionDemo />
    <Callout variant="info">
      Обратите внимание: на границе (переход 0 → 9) отклик максимален, а на
      однородных участках равен нулю — так фильтр «находит» вертикальные края.
    </Callout>

    <H2>Основные слои</H2>
    <H3>1. Свёрточный слой (Conv2D)</H3>
    <P>
      Применяет набор обучаемых фильтров и формирует{" "}
      <Term id="feature-map">карты признаков</Term>. Чем глубже слой, тем более
      сложные признаки он выделяет: края → текстуры → части объектов.
    </P>

    <H3>2. Активация ReLU</H3>
    <P>Добавляет нелинейность после свёртки:</P>
    <Formula>ReLU(x) = max(0, x)</Formula>

    <H3>3. Пулинг</H3>
    <P>
      <Term id="pooling">Пулинг</Term> уменьшает размер карты, оставляя самые
      сильные отклики (MaxPooling) — меньше вычислений и устойчивость к сдвигам.
    </P>

    <H3>4. Flatten + полносвязные слои</H3>
    <P>
      <Term id="flatten">Flatten</Term> разворачивает карты в вектор, а{" "}
      <Term id="dense">полносвязные</Term> слои выдают итоговый ответ через{" "}
      <Term id="softmax">softmax</Term>.
    </P>

    <H2>Типичная архитектура на Keras</H2>
    <CodeBlock code={KERAS} language="python" />

    <BuilderLink type="cnn" />

    <H2>Шаг (stride) и отступ (padding)</H2>
    <Ul
      items={[
        "Stride — шаг, с которым ядро движется по входу. Stride 2 уменьшает карту вдвое.",
        "Padding 'same' — дополняет края нулями, сохраняя размер; 'valid' — без дополнения, размер уменьшается.",
        "Размер выхода: (W − K + 2P) / S + 1, где W — вход, K — ядро, P — padding, S — stride.",
      ]}
    />

    <H2>Рецептивное поле и иерархия признаков</H2>
    <P>
      Каждый нейрон глубокого слоя «видит» всё больший участок исходного
      изображения — его рецептивное поле растёт. Поэтому ранние слои реагируют на
      края, средние — на текстуры и формы, поздние — на целые объекты.
    </P>

    <H2>Общие веса — главное преимущество</H2>
    <P>
      Одно ядро применяется ко всему изображению, поэтому свёрточный слой имеет
      на порядки меньше параметров, чем полносвязный, и обладает инвариантностью
      к сдвигу: объект распознаётся независимо от своего положения в кадре.
    </P>

    <H2>Transfer learning</H2>
    <P>
      На практике редко обучают CNN с нуля: берут модель, предобученную на
      ImageNet (VGG, ResNet), и дообучают её под свою задачу. Это экономит данные
      и время.
    </P>

    <Callout variant="tip">
      Классические CNN: LeNet-5, AlexNet, VGG, ResNet. Соберите свою сеть в
      конструкторе и сгенерируйте код, чтобы закрепить материал.
    </Callout>

    <Sources
      refs={[REFS.lecun1998, REFS.goodfellow, REFS.nikolenko, REFS.kubsuDept]}
    />
  </Article>
);

export default CnnArticle;
