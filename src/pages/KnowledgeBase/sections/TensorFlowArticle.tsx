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

const CODE = `import tensorflow as tf

model = tf.keras.Sequential([
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(10, activation='softmax'),
])
model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])
model.fit(x_train, y_train, epochs=5)`;

const TensorFlowArticle: React.FC = () => (
  <Article>
    <Title>TensorFlow</Title>
    <Lead>
      TensorFlow — открытая платформа машинного обучения от Google. Подходит как
      для исследований, так и для продакшена и развёртывания моделей.
    </Lead>

    <H2>Особенности</H2>
    <Ul
      items={[
        "Вычисления на CPU, GPU и TPU без изменения кода.",
        "Высокоуровневый API Keras для быстрой сборки моделей.",
        "Экосистема: TensorBoard (визуализация), TF Lite (мобильные), TF Serving (развёртывание).",
      ]}
    />

    <H2>Пример</H2>
    <CodeBlock code={CODE} language="python" />

    <Callout variant="tip">
      В NeuroCraft Studio генератор кода умеет выдавать архитектуру именно в
      формате Keras (TensorFlow) — соберите сеть в конструкторе и получите
      готовый код.
    </Callout>

    <H2>Когда выбирать TensorFlow</H2>
    <Ul
      items={[
        "Нужно развёртывание в продакшен: сервинг, мобильные (TF Lite), браузер (TF.js).",
        "Важна зрелая экосистема инструментов и совместимость с промышленными пайплайнами.",
        "Для обучения и прототипов внутри TF удобнее всего высокоуровневый Keras.",
      ]}
    />

    <Sources refs={[REFS.tensorflow, REFS.goodfellow]} />
  </Article>
);

export default TensorFlowArticle;
