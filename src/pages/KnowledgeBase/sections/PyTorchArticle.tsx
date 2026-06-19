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

const CODE = `import torch
import torch.nn as nn

class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(784, 64)
        self.fc2 = nn.Linear(64, 10)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        return self.fc2(x)

model = Net()`;

const PyTorchArticle: React.FC = () => (
  <Article>
    <Title>PyTorch</Title>
    <Lead>
      PyTorch — открытая библиотека глубокого обучения, развиваемая Meta AI.
      Любима исследователями за гибкость и «питоничность».
    </Lead>

    <H2>Особенности</H2>
    <Ul
      items={[
        "Динамический вычислительный граф — удобно отлаживать как обычный код.",
        "Автоматическое дифференцирование (autograd).",
        "Богатая экосистема: torchvision, torchaudio, Lightning.",
      ]}
    />

    <H2>Пример</H2>
    <CodeBlock code={CODE} language="python" />

    <Callout variant="info">
      Конструктор NeuroCraft Studio также умеет генерировать архитектуру в
      формате PyTorch (класс <code>nn.Module</code>).
    </Callout>

    <H2>Когда выбирать PyTorch</H2>
    <Ul
      items={[
        "Исследования и эксперименты: динамический граф упрощает отладку и нестандартные архитектуры.",
        "Большинство свежих научных статей выходят с кодом на PyTorch.",
        "Для продакшена есть TorchServe и экспорт в формат ONNX.",
      ]}
    />

    <Sources refs={[REFS.pytorch, REFS.goodfellow]} />
  </Article>
);

export default PyTorchArticle;
