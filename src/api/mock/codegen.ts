import { Layer, NeuralNetworkLayers } from "../Network";

export type Framework = "keras" | "pytorch" | "tensorflowjs";

export const FRAMEWORK_LABELS: Record<Framework, string> = {
  keras: "Keras (TensorFlow)",
  pytorch: "PyTorch",
  tensorflowjs: "TensorFlow.js",
};

const activationOf = (layer: Layer): string =>
  layer.activationFunction ?? "relu";

function generateKeras(network: NeuralNetworkLayers): string {
  const lines: string[] = [
    "import tensorflow as tf",
    "from tensorflow import keras",
    "from tensorflow.keras import layers",
    "",
    "model = keras.Sequential([",
  ];

  const isCnn = network.layers.some((l) => l.type === "conv");

  let flattened = !isCnn;
  const ensureFlatten = () => {
    if (!flattened) {
      lines.push(`    layers.Flatten(),`);
      flattened = true;
    }
  };

  network.layers.forEach((layer, i) => {
    switch (layer.type) {
      case "input":
        if (isCnn) {

          lines.push(`    keras.Input(shape=(28, 28, ${layer.neuronCount})),`);
        } else {
          lines.push(`    keras.Input(shape=(${layer.neuronCount},)),`);
        }
        break;
      case "conv": {
        const k = layer.kernelSize ?? 3;
        lines.push(
          `    layers.Conv2D(${layer.neuronCount}, (${k}, ${k}), activation='${activationOf(
            layer
          )}', padding='same'),`
        );
        break;
      }
      case "pool": {
        const p = layer.poolSize ?? 2;
        lines.push(`    layers.MaxPooling2D(pool_size=(${p}, ${p})),`);
        break;
      }
      case "flatten":
        ensureFlatten();
        break;
      case "dropout":
        lines.push(`    layers.Dropout(${layer.rate ?? 0.5}),`);
        break;
      case "batchnorm":
        lines.push(`    layers.BatchNormalization(),`);
        break;
      case "output":
        ensureFlatten();
        lines.push(
          `    layers.Dense(${layer.neuronCount}, activation='${activationOf(
            layer
          )}'),  # output`
        );
        break;
      default:
        ensureFlatten();
        lines.push(
          `    layers.Dense(${layer.neuronCount}, activation='${activationOf(
            layer
          )}'),  # hidden ${i}`
        );
    }
  });

  lines.push(
    "])",
    "",
    "model.compile(",
    "    optimizer='adam',",
    "    loss='categorical_crossentropy',",
    "    metrics=['accuracy'],",
    ")",
    "",
    "model.summary()"
  );
  return lines.join("\n");
}

function generatePyTorch(network: NeuralNetworkLayers): string {
  const isCnn = network.layers.some((l) => l.type === "conv");
  const init: string[] = [];
  const forward: string[] = [];

  const inputLayer = network.layers.find((l) => l.type === "input");
  let channels = inputLayer?.neuronCount ?? 1;

  let convIdx = 0;
  let fcIdx = 0;
  let dropIdx = 0;
  let bnIdx = 0;
  let flattened = !isCnn;
  const denseLikeCount = network.layers.filter(
    (l) => l.type === "dense" || l.type === "output"
  ).length;
  let denseSeen = 0;

  const ensureFlat = () => {
    if (!flattened) {
      forward.push("        x = torch.flatten(x, 1)");
      flattened = true;
    }
  };

  if (!isCnn) forward.push("        x = x.view(x.size(0), -1)");

  for (const layer of network.layers) {
    switch (layer.type) {
      case "input":
        break;
      case "conv": {
        convIdx += 1;
        const k = layer.kernelSize ?? 3;
        const pad = Math.floor(k / 2);
        init.push(
          `        self.conv${convIdx} = nn.Conv2d(${channels}, ${layer.neuronCount}, kernel_size=${k}, padding=${pad})`
        );
        forward.push(
          `        x = F.${activationOf(layer)}(self.conv${convIdx}(x))`
        );
        channels = layer.neuronCount;
        break;
      }
      case "pool": {
        const p = layer.poolSize ?? 2;
        forward.push(`        x = F.max_pool2d(x, ${p})`);
        break;
      }
      case "flatten":
        ensureFlat();
        break;
      case "dropout": {
        dropIdx += 1;
        init.push(
          `        self.drop${dropIdx} = nn.Dropout(${layer.rate ?? 0.5})`
        );
        forward.push(`        x = self.drop${dropIdx}(x)`);
        break;
      }
      case "batchnorm": {
        bnIdx += 1;
        if (flattened) {
          init.push(`        self.bn${bnIdx} = nn.LazyBatchNorm1d()`);
        } else {
          init.push(`        self.bn${bnIdx} = nn.BatchNorm2d(${channels})`);
        }
        forward.push(`        x = self.bn${bnIdx}(x)`);
        break;
      }
      case "dense":
      case "output": {
        ensureFlat();
        fcIdx += 1;
        denseSeen += 1;
        const isLast = denseSeen === denseLikeCount;
        init.push(
          `        self.fc${fcIdx} = nn.LazyLinear(${layer.neuronCount})`
        );
        if (isLast) {
          forward.push(`        x = self.fc${fcIdx}(x)`);
        } else {
          forward.push(
            `        x = F.${activationOf(layer)}(self.fc${fcIdx}(x))`
          );
        }
        break;
      }
    }
  }

  forward.push("        return x");

  return [
    "import torch",
    "import torch.nn as nn",
    "import torch.nn.functional as F",
    "",
    "class Net(nn.Module):",
    "    def __init__(self):",
    "        super().__init__()",
    ...init,
    "",
    "    def forward(self, x):",
    ...forward,
    "",
    "model = Net()",
    "print(model)",
  ].join("\n");
}

function generateTfjs(network: NeuralNetworkLayers): string {
  const isCnn = network.layers.some((l) => l.type === "conv");
  const lines: string[] = [
    "import * as tf from '@tensorflow/tfjs';",
    "",
    "const model = tf.sequential();",
  ];

  const inputLayer = network.layers.find((l) => l.type === "input");
  const channels = inputLayer?.neuronCount ?? 1;
  const inputDim =
    inputLayer?.neuronCount ?? network.layers[0]?.neuronCount ?? 1;
  let firstLayerEmitted = false;

  let flattened = !isCnn;
  const ensureFlatten = () => {
    if (!flattened) {
      lines.push("model.add(tf.layers.flatten());");
      flattened = true;
    }
  };

  for (const layer of network.layers) {
    switch (layer.type) {
      case "input":
        break;
      case "conv": {
        const opts = [
          `filters: ${layer.neuronCount}`,
          `kernelSize: ${layer.kernelSize ?? 3}`,
          `activation: '${activationOf(layer)}'`,
          `padding: 'same'`,
        ];
        if (!firstLayerEmitted) {
          opts.push(`inputShape: [28, 28, ${channels}]`);
          firstLayerEmitted = true;
        }
        lines.push(`model.add(tf.layers.conv2d({ ${opts.join(", ")} }));`);
        break;
      }
      case "pool":
        lines.push(
          `model.add(tf.layers.maxPooling2d({ poolSize: ${layer.poolSize ?? 2} }));`
        );
        break;
      case "flatten":
        ensureFlatten();
        break;
      case "dropout": {
        const opts = [`rate: ${layer.rate ?? 0.5}`];
        if (!firstLayerEmitted && !isCnn) {
          opts.push(`inputShape: [${inputDim}]`);
          firstLayerEmitted = true;
        }
        lines.push(`model.add(tf.layers.dropout({ ${opts.join(", ")} }));`);
        break;
      }
      case "batchnorm": {
        const opts: string[] = [];
        if (!firstLayerEmitted && !isCnn) {
          opts.push(`inputShape: [${inputDim}]`);
          firstLayerEmitted = true;
        }
        const inner = opts.length ? `{ ${opts.join(", ")} }` : "";
        lines.push(`model.add(tf.layers.batchNormalization(${inner}));`);
        break;
      }
      case "dense":
      case "output": {
        ensureFlatten();
        const opts = [
          `units: ${layer.neuronCount}`,
          `activation: '${activationOf(layer)}'`,
        ];
        if (!firstLayerEmitted && !isCnn) {
          opts.push(`inputShape: [${inputDim}]`);
          firstLayerEmitted = true;
        }
        lines.push(`model.add(tf.layers.dense({ ${opts.join(", ")} }));`);
        break;
      }
    }
  }

  lines.push(
    "",
    "model.compile({",
    "  optimizer: 'adam',",
    "  loss: 'categoricalCrossentropy',",
    "  metrics: ['accuracy'],",
    "});",
    "",
    "model.summary();"
  );
  return lines.join("\n");
}

const isSequenceModel = (network: NeuralNetworkLayers) =>
  network.layers.some((l) =>
    ["embedding", "lstm", "gru", "rnn", "attention"].includes(l.type)
  );

function generateKerasSeq(network: NeuralNetworkLayers): string {
  const hasAttn = network.layers.some((l) => l.type === "attention");
  const lines: string[] = [
    "import tensorflow as tf",
    "from tensorflow import keras",
    "from tensorflow.keras import layers",
    "",
  ];
  if (hasAttn) {
    lines.push(
      "# TransformerBlock — стандартный блок энкодера:",
      "# MultiHeadAttention + Feed-Forward + LayerNorm и остаточные связи.",
      ""
    );
  }
  lines.push("model = keras.Sequential([");
  network.layers.forEach((layer) => {
    switch (layer.type) {
      case "embedding":
        lines.push(
          `    layers.Embedding(input_dim=${layer.vocabSize ?? 10000}, output_dim=${
            layer.embeddingDim ?? 64
          }),`
        );
        break;
      case "lstm":
        lines.push(
          `    layers.LSTM(${layer.neuronCount}, return_sequences=${
            layer.returnSequences ? "True" : "False"
          }),`
        );
        break;
      case "gru":
        lines.push(
          `    layers.GRU(${layer.neuronCount}, return_sequences=${
            layer.returnSequences ? "True" : "False"
          }),`
        );
        break;
      case "rnn":
        lines.push(
          `    layers.SimpleRNN(${layer.neuronCount}, return_sequences=${
            layer.returnSequences ? "True" : "False"
          }),`
        );
        break;
      case "attention":
        lines.push(
          `    TransformerBlock(num_heads=${layer.numHeads ?? 4}, ff_dim=${
            layer.ffDim ?? 128
          }),`
        );
        break;
      case "globalpool":
        lines.push("    layers.GlobalAveragePooling1D(),");
        break;
      case "output":
        lines.push(
          `    layers.Dense(${layer.neuronCount}, activation='${activationOf(
            layer
          )}'),  # output`
        );
        break;
      default:
        lines.push(
          `    layers.Dense(${layer.neuronCount}, activation='${activationOf(
            layer
          )}'),`
        );
    }
  });
  lines.push(
    "])",
    "",
    "model.compile(",
    "    optimizer='adam',",
    "    loss='categorical_crossentropy',",
    "    metrics=['accuracy'],",
    ")",
    "",
    "model.summary()"
  );
  return lines.join("\n");
}

function generateTfjsSeq(network: NeuralNetworkLayers): string {
  const lines = ["import * as tf from '@tensorflow/tfjs';", "", "const model = tf.sequential();"];
  network.layers.forEach((layer) => {
    switch (layer.type) {
      case "embedding":
        lines.push(
          `model.add(tf.layers.embedding({ inputDim: ${
            layer.vocabSize ?? 10000
          }, outputDim: ${layer.embeddingDim ?? 64} }));`
        );
        break;
      case "lstm":
        lines.push(
          `model.add(tf.layers.lstm({ units: ${layer.neuronCount}, returnSequences: ${
            layer.returnSequences ? "true" : "false"
          } }));`
        );
        break;
      case "gru":
        lines.push(
          `model.add(tf.layers.gru({ units: ${layer.neuronCount}, returnSequences: ${
            layer.returnSequences ? "true" : "false"
          } }));`
        );
        break;
      case "rnn":
        lines.push(
          `model.add(tf.layers.simpleRNN({ units: ${layer.neuronCount}, returnSequences: ${
            layer.returnSequences ? "true" : "false"
          } }));`
        );
        break;
      case "attention":
        lines.push(
          "// блок внимания (Transformer) — реализуется отдельным слоем"
        );
        break;
      case "globalpool":
        lines.push("model.add(tf.layers.globalAveragePooling1d());");
        break;
      default:
        lines.push(
          `model.add(tf.layers.dense({ units: ${layer.neuronCount}, activation: '${activationOf(
            layer
          )}' }));`
        );
    }
  });
  lines.push(
    "",
    "model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });",
    "model.summary();"
  );
  return lines.join("\n");
}

function generatePyTorchSeq(network: NeuralNetworkLayers): string {
  const L = network.layers;
  const emb = L.find((l) => l.type === "embedding");
  const recs = L.filter((l) => ["lstm", "gru", "rnn"].includes(l.type));
  const hasAttn = L.some((l) => l.type === "attention");
  const denses = L.filter((l) => l.type === "dense" || l.type === "output");
  const embDim = emb?.embeddingDim ?? 64;
  const init: string[] = [];
  const fwd: string[] = ["        x = self.embedding(x)"];

  if (emb)
    init.push(
      `        self.embedding = nn.Embedding(${emb.vocabSize ?? 10000}, ${embDim})`
    );

  let feat = embDim;
  if (hasAttn) {
    const attn = L.find((l) => l.type === "attention");
    const nblocks = L.filter((l) => l.type === "attention").length;
    init.push(
      `        enc_layer = nn.TransformerEncoderLayer(d_model=${embDim}, nhead=${
        attn?.numHeads ?? 4
      }, dim_feedforward=${attn?.ffDim ?? 128}, batch_first=True)`
    );
    init.push(
      `        self.encoder = nn.TransformerEncoder(enc_layer, num_layers=${nblocks})`
    );
    fwd.push("        x = self.encoder(x)");
    fwd.push("        x = x.mean(dim=1)  # усреднение по токенам");
  } else if (recs.length) {
    const map: Record<string, string> = { lstm: "LSTM", gru: "GRU", rnn: "RNN" };
    recs.forEach((r, i) => {
      const inp = i === 0 ? embDim : recs[i - 1].neuronCount;
      init.push(
        `        self.rnn${i + 1} = nn.${map[r.type]}(${inp}, ${r.neuronCount}, batch_first=True)`
      );
      fwd.push(`        x, _ = self.rnn${i + 1}(x)`);
    });
    fwd.push("        x = x[:, -1, :]  # последний таймстеп");
    feat = recs[recs.length - 1].neuronCount;
  }

  denses.forEach((d, i) => {
    init.push(
      `        self.fc${i + 1} = nn.Linear(${
        i === 0 ? feat : denses[i - 1].neuronCount
      }, ${d.neuronCount})`
    );
    const isLast = i === denses.length - 1;
    if (isLast) fwd.push(`        x = self.fc${i + 1}(x)`);
    else
      fwd.push(
        `        x = F.${activationOf(d) === "relu" ? "relu" : activationOf(d)}(self.fc${i + 1}(x))`
      );
  });
  fwd.push("        return x");

  return [
    "import torch",
    "import torch.nn as nn",
    "import torch.nn.functional as F",
    "",
    "class Net(nn.Module):",
    "    def __init__(self):",
    "        super().__init__()",
    ...init,
    "",
    "    def forward(self, x):",
    ...fwd,
    "",
    "model = Net()",
    "print(model)",
  ].join("\n");
}

export function generateCode(
  network: NeuralNetworkLayers,
  framework: Framework = "keras"
): string {
  if (isSequenceModel(network)) {
    switch (framework) {
      case "pytorch":
        return generatePyTorchSeq(network);
      case "tensorflowjs":
        return generateTfjsSeq(network);
      default:
        return generateKerasSeq(network);
    }
  }
  switch (framework) {
    case "pytorch":
      return generatePyTorch(network);
    case "tensorflowjs":
      return generateTfjs(network);
    default:
      return generateKeras(network);
  }
}

export interface GanSpec {
  latentDim: number;
  dataDim: number;
  generator: number[];
  discriminator: number[];
}

function ganKeras(s: GanSpec): string {
  const gen = s.generator
    .map((h) => `    model.add(layers.Dense(${h}))\n    model.add(layers.LeakyReLU(0.2))`)
    .join("\n");
  const disc = s.discriminator
    .map((h) => `    model.add(layers.Dense(${h}))\n    model.add(layers.LeakyReLU(0.2))`)
    .join("\n");
  return `import tensorflow as tf
from tensorflow.keras import layers, Model, Sequential

LATENT_DIM = ${s.latentDim}
DATA_DIM = ${s.dataDim}

def build_generator():
    model = Sequential(name="generator")
    model.add(layers.Input(shape=(LATENT_DIM,)))
${gen}
    model.add(layers.Dense(DATA_DIM, activation="tanh"))
    return model

def build_discriminator():
    model = Sequential(name="discriminator")
    model.add(layers.Input(shape=(DATA_DIM,)))
${disc}
    model.add(layers.Dense(1, activation="sigmoid"))
    return model

generator = build_generator()
discriminator = build_discriminator()

opt = tf.keras.optimizers.Adam(2e-4, beta_1=0.5)
discriminator.compile(optimizer=opt, loss="binary_crossentropy", metrics=["accuracy"])

# Комбинированная модель: генератор учится обманывать дискриминатор
discriminator.trainable = False
z = layers.Input(shape=(LATENT_DIM,))
gan = Model(z, discriminator(generator(z)), name="gan")
gan.compile(optimizer=tf.keras.optimizers.Adam(2e-4, beta_1=0.5),
            loss="binary_crossentropy")

# Цикл обучения (псевдокод):
# for step in range(steps):
#     noise = tf.random.normal([batch, LATENT_DIM])
#     fake = generator(noise)
#     discriminator.train_on_batch(real, tf.ones([batch, 1]))
#     discriminator.train_on_batch(fake, tf.zeros([batch, 1]))
#     gan.train_on_batch(noise, tf.ones([batch, 1]))  # обучаем генератор
`;
}

function ganPyTorch(s: GanSpec): string {
  const genSeq = [
    `            nn.Linear(LATENT_DIM, ${s.generator[0] ?? s.dataDim}),`,
    `            nn.LeakyReLU(0.2),`,
    ...s.generator.slice(1).flatMap((h, i) => [
      `            nn.Linear(${s.generator[i]}, ${h}),`,
      `            nn.LeakyReLU(0.2),`,
    ]),
    `            nn.Linear(${s.generator[s.generator.length - 1] ?? "LATENT_DIM"}, DATA_DIM),`,
    `            nn.Tanh(),`,
  ].join("\n");
  const discSeq = [
    `            nn.Linear(DATA_DIM, ${s.discriminator[0] ?? 1}),`,
    `            nn.LeakyReLU(0.2),`,
    ...s.discriminator.slice(1).flatMap((h, i) => [
      `            nn.Linear(${s.discriminator[i]}, ${h}),`,
      `            nn.LeakyReLU(0.2),`,
    ]),
    `            nn.Linear(${s.discriminator[s.discriminator.length - 1] ?? "DATA_DIM"}, 1),`,
    `            nn.Sigmoid(),`,
  ].join("\n");
  return `import torch
import torch.nn as nn

LATENT_DIM = ${s.latentDim}
DATA_DIM = ${s.dataDim}

class Generator(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
${genSeq}
        )

    def forward(self, z):
        return self.net(z)

class Discriminator(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
${discSeq}
        )

    def forward(self, x):
        return self.net(x)

generator = Generator()
discriminator = Discriminator()
criterion = nn.BCELoss()
opt_g = torch.optim.Adam(generator.parameters(), lr=2e-4, betas=(0.5, 0.999))
opt_d = torch.optim.Adam(discriminator.parameters(), lr=2e-4, betas=(0.5, 0.999))

# Цикл обучения (псевдокод):
# for real in dataloader:
#     z = torch.randn(real.size(0), LATENT_DIM)
#     fake = generator(z)
#     # дискриминатор: реальные -> 1, фейковые -> 0
#     loss_d = criterion(discriminator(real), ones) + \\
#              criterion(discriminator(fake.detach()), zeros)
#     opt_d.zero_grad(); loss_d.backward(); opt_d.step()
#     # генератор: обмануть дискриминатор
#     loss_g = criterion(discriminator(fake), ones)
#     opt_g.zero_grad(); loss_g.backward(); opt_g.step()
`;
}

function ganTfjs(s: GanSpec): string {
  const gen = s.generator
    .map(
      (h, i) =>
        `  g.add(tf.layers.dense({ units: ${h}${
          i === 0 ? ", inputShape: [LATENT_DIM]" : ""
        } }));\n  g.add(tf.layers.leakyReLU({ alpha: 0.2 }));`
    )
    .join("\n");
  const disc = s.discriminator
    .map(
      (h, i) =>
        `  d.add(tf.layers.dense({ units: ${h}${
          i === 0 ? ", inputShape: [DATA_DIM]" : ""
        } }));\n  d.add(tf.layers.leakyReLU({ alpha: 0.2 }));`
    )
    .join("\n");
  return `import * as tf from '@tensorflow/tfjs';

const LATENT_DIM = ${s.latentDim};
const DATA_DIM = ${s.dataDim};

function buildGenerator() {
  const g = tf.sequential({ name: 'generator' });
${gen}
  g.add(tf.layers.dense({ units: DATA_DIM, activation: 'tanh' }));
  return g;
}

function buildDiscriminator() {
  const d = tf.sequential({ name: 'discriminator' });
${disc}
  d.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
  return d;
}

const generator = buildGenerator();
const discriminator = buildDiscriminator();
discriminator.compile({
  optimizer: tf.train.adam(2e-4, 0.5),
  loss: 'binaryCrossentropy',
  metrics: ['accuracy'],
});

// Комбинированная модель: генератор учится обманывать дискриминатор.
discriminator.trainable = false;
const z = tf.input({ shape: [LATENT_DIM] });
const gan = tf.model({ inputs: z, outputs: discriminator.apply(generator.apply(z)) });
gan.compile({ optimizer: tf.train.adam(2e-4, 0.5), loss: 'binaryCrossentropy' });
`;
}

export function generateGanCode(spec: GanSpec, framework: Framework): string {
  switch (framework) {
    case "pytorch":
      return ganPyTorch(spec);
    case "tensorflowjs":
      return ganTfjs(spec);
    default:
      return ganKeras(spec);
  }
}

export function countParameters(network: NeuralNetworkLayers): number {
  const isCnn = network.layers.some((l) => l.type === "conv");
  let total = 0;
  let h = 28;
  let w = 28;
  let channels = 0;
  let flat = false;
  let prev: number | null = null;

  for (const l of network.layers) {
    switch (l.type) {
      case "input":

        if (isCnn) {
          channels = l.neuronCount;
        } else {
          prev = l.neuronCount;
          flat = true;
        }
        break;
      case "conv": {
        const k = l.kernelSize ?? 3;
        const cin = channels || 1;
        total += (k * k * cin + 1) * l.neuronCount;
        channels = l.neuronCount;
        break;
      }
      case "pool": {
        const p = l.poolSize ?? 2;
        h = Math.max(1, Math.floor(h / p));
        w = Math.max(1, Math.floor(w / p));
        break;
      }
      case "flatten":
        prev = h * w * channels;
        flat = true;
        break;
      case "batchnorm":
        total += 2 * (flat ? prev ?? 0 : channels);
        break;
      case "dense":
      case "output":
        if (!flat) {

          prev = h * w * channels;
          flat = true;
        }
        if (prev != null) total += prev * l.neuronCount + l.neuronCount;
        prev = l.neuronCount;
        break;
    }
  }
  return total;
}
