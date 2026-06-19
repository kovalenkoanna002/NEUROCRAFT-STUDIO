import { Layer } from "../api/Network";

export type NetworkKind =
  | "perceptron"
  | "cnn"
  | "rnn"
  | "transformer"
  | "gan";

export interface ArchitectureTemplate {
  id: string;
  name: string;
  kind: NetworkKind;
  description: string;
  layers: Layer[];
}

export const TEMPLATES: ArchitectureTemplate[] = [
  {
    id: "mlp-classifier",
    name: "MLP-классификатор (табличные данные)",
    kind: "perceptron",
    description:
      "Полносвязная сеть для классификации по 4 признакам на 3 класса (в духе Iris).",
    layers: [
      { type: "input", neuronCount: 4 },
      { type: "dense", neuronCount: 16, activationFunction: "relu" },
      { type: "dense", neuronCount: 8, activationFunction: "relu" },
      { type: "output", neuronCount: 3, activationFunction: "softmax" },
    ],
  },
  {
    id: "xor-net",
    name: "Сеть для XOR",
    kind: "perceptron",
    description:
      "Минимальная сеть, решающая нелинейную задачу XOR: 2 входа, скрытый слой, бинарный выход.",
    layers: [
      { type: "input", neuronCount: 2 },
      { type: "dense", neuronCount: 4, activationFunction: "tanh" },
      { type: "output", neuronCount: 1, activationFunction: "sigmoid" },
    ],
  },
  {
    id: "autoencoder",
    name: "Автоэнкодер",
    kind: "perceptron",
    description:
      "Сжимает вход в узкое представление (bottleneck) и восстанавливает обратно: 64 → 32 → 8 → 32 → 64.",
    layers: [
      { type: "input", neuronCount: 64 },
      { type: "dense", neuronCount: 32, activationFunction: "relu" },
      { type: "dense", neuronCount: 8, activationFunction: "relu" },
      { type: "dense", neuronCount: 32, activationFunction: "relu" },
      { type: "output", neuronCount: 64, activationFunction: "sigmoid" },
    ],
  },
  {
    id: "lenet5",
    name: "LeNet-5",
    kind: "cnn",
    description:
      "Классическая свёрточная сеть LeCun (1998) для распознавания рукописных цифр.",
    layers: [
      { type: "input", neuronCount: 1 },
      { type: "conv", neuronCount: 6, kernelSize: 5, activationFunction: "tanh" },
      { type: "pool", neuronCount: 0, poolSize: 2 },
      { type: "conv", neuronCount: 16, kernelSize: 5, activationFunction: "tanh" },
      { type: "pool", neuronCount: 0, poolSize: 2 },
      { type: "flatten", neuronCount: 0 },
      { type: "dense", neuronCount: 120, activationFunction: "tanh" },
      { type: "dense", neuronCount: 84, activationFunction: "tanh" },
      { type: "output", neuronCount: 10, activationFunction: "softmax" },
    ],
  },
  {
    id: "lstm-text",
    name: "LSTM-классификатор текста",
    kind: "rnn",
    description:
      "Рекуррентная сеть для анализа тональности: эмбеддинги → LSTM → полносвязный выход.",
    layers: [
      { type: "embedding", neuronCount: 0, vocabSize: 10000, embeddingDim: 64 },
      { type: "lstm", neuronCount: 128, returnSequences: false },
      { type: "dense", neuronCount: 64, activationFunction: "relu" },
      { type: "output", neuronCount: 2, activationFunction: "softmax" },
    ],
  },
  {
    id: "transformer-text",
    name: "Трансформер для текста",
    kind: "transformer",
    description:
      "Энкодер-трансформер: эмбеддинги → блок внимания → усреднение → классификатор.",
    layers: [
      { type: "embedding", neuronCount: 0, vocabSize: 20000, embeddingDim: 128 },
      { type: "attention", neuronCount: 0, numHeads: 4, ffDim: 128 },
      { type: "globalpool", neuronCount: 0 },
      { type: "dense", neuronCount: 64, activationFunction: "relu" },
      { type: "output", neuronCount: 3, activationFunction: "softmax" },
    ],
  },
  {
    id: "mini-vgg",
    name: "Mini-VGG",
    kind: "cnn",
    description:
      "Компактная глубокая CNN в стиле VGG: пары свёрток 3×3 с пулингом, для цветных изображений на 10 классов.",
    layers: [
      { type: "input", neuronCount: 3 },
      { type: "conv", neuronCount: 32, kernelSize: 3, activationFunction: "relu" },
      { type: "conv", neuronCount: 32, kernelSize: 3, activationFunction: "relu" },
      { type: "pool", neuronCount: 0, poolSize: 2 },
      { type: "conv", neuronCount: 64, kernelSize: 3, activationFunction: "relu" },
      { type: "conv", neuronCount: 64, kernelSize: 3, activationFunction: "relu" },
      { type: "pool", neuronCount: 0, poolSize: 2 },
      { type: "flatten", neuronCount: 0 },
      { type: "dense", neuronCount: 128, activationFunction: "relu" },
      { type: "output", neuronCount: 10, activationFunction: "softmax" },
    ],
  },
];

export const getTemplate = (id: string): ArchitectureTemplate | null =>
  TEMPLATES.find((t) => t.id === id) ?? null;
