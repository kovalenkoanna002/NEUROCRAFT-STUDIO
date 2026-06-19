import { Layer, NeuralNetworkLayers } from "../Network";
import { GanSpec } from "../../auth/projects";

export function parseGanFromCode(code: string): GanSpec | null {
  if (!/generator/i.test(code) || !/discriminator/i.test(code)) return null;

  const genIdx = code.search(
    /build_generator|class\s+Generator|buildGenerator/i,
  );
  const discIdx = code.search(
    /build_discriminator|class\s+Discriminator|buildDiscriminator/i,
  );
  if (genIdx < 0 || discIdx < 0 || discIdx <= genIdx) return null;

  const latent = code.match(/LATENT_DIM\s*=\s*(\d+)/);
  const data = code.match(/DATA_DIM\s*=\s*(\d+)/);
  const latentDim = latent ? +latent[1] : 100;
  const dataDim = data ? +data[1] : 784;

  const collect = (section: string): number[] => {
    const found: { i: number; n: number }[] = [];
    let m: RegExpExecArray | null;
    const res = [
      /Dense\s*\(\s*(\d+)\b/g,
      /units\s*:\s*(\d+)\b/g,
      /Linear\s*\(\s*\w+\s*,\s*(\d+)\b/g,
    ];
    res.forEach((re) => {
      while ((m = re.exec(section)) !== null)
        found.push({ i: m.index, n: +m[1] });
    });
    return found.sort((a, b) => a.i - b.i).map((u) => u.n);
  };

  const generator = collect(code.slice(genIdx, discIdx));
  const discAll = collect(code.slice(discIdx));

  const discriminator = discAll.length ? discAll.slice(0, -1) : [];

  return { latentDim, dataDim, generator, discriminator };
}

export function parseArchitectureFromCode(code: string): NeuralNetworkLayers {
  const layers: Layer[] = [];

  const nums = (s: string) =>
    s
      .split(",")
      .map((x) => parseInt(x.trim(), 10))
      .filter((n) => !Number.isNaN(n));

  const kerasInput = code.match(/Input\s*\(\s*shape\s*=\s*\(([^)]*)\)/i);
  const tfInput = code.match(/inputShape\s*:\s*\[([^\]]+)\]/i);
  const inputDims = kerasInput
    ? nums(kerasInput[1])
    : tfInput
      ? nums(tfInput[1])
      : [];
  if (inputDims.length) {

    const n =
      inputDims.length >= 3 ? inputDims[inputDims.length - 1] : inputDims[0];
    layers.push({ type: "input", neuronCount: n });
  }

  const hasSeq = (line: string) =>
    /return_sequences\s*=\s*True/i.test(line) ||
    /returnSequences\s*:\s*true/i.test(line);

  for (const raw of code.split("\n")) {
    const line = raw.trim();
    if (!line || /Input\s*\(\s*shape/i.test(line)) continue;

    let m: RegExpMatchArray | null;

    if (
      (m = line.match(/Conv2D\s*\(\s*(\d+)\s*,\s*\(?\s*(\d+)/i)) ||
      (m = line.match(
        /conv2d\s*\(\s*\{[^}]*filters\s*:\s*(\d+)[^}]*kernelSize\s*:\s*(\d+)/i,
      )) ||
      (m = line.match(
        /nn\.Conv2d\s*\(\s*\d+\s*,\s*(\d+)\s*,\s*kernel_size\s*=\s*(\d+)/i,
      ))
    ) {
      layers.push({ type: "conv", neuronCount: +m[1], kernelSize: +m[2] });
      continue;
    }

    if (
      /MaxPooling2D\s*\(/i.test(line) ||
      /maxPooling2d\s*\(/i.test(line) ||
      /max_pool2d/i.test(line)
    ) {
      const p =
        line.match(/pool_size\s*=\s*\(?\s*(\d+)/i) ||
        line.match(/poolSize\s*:\s*(\d+)/i) ||
        line.match(/max_pool2d\([^,]*,\s*(\d+)/i);
      layers.push({ type: "pool", neuronCount: 0, poolSize: p ? +p[1] : 2 });
      continue;
    }

    if (/Flatten\s*\(/i.test(line) || /torch\.flatten/i.test(line)) {
      layers.push({ type: "flatten", neuronCount: 0 });
      continue;
    }

    if (
      (m = line.match(/Dropout\s*\(\s*([0-9.]+)/i)) ||
      (m = line.match(/dropout\s*\(\s*\{\s*rate\s*:\s*([0-9.]+)/i)) ||
      (m = line.match(/nn\.Dropout\s*\(\s*([0-9.]+)/i))
    ) {
      layers.push({ type: "dropout", neuronCount: 0, rate: parseFloat(m[1]) });
      continue;
    }

    if (
      /BatchNormalization\s*\(/i.test(line) ||
      /batchNormalization\s*\(/i.test(line) ||
      /nn\.BatchNorm\d?d?\s*\(/i.test(line)
    ) {
      layers.push({ type: "batchnorm", neuronCount: 0 });
      continue;
    }

    if (
      (m = line.match(
        /Embedding\s*\(\s*input_dim\s*=\s*(\d+)\s*,\s*output_dim\s*=\s*(\d+)/i,
      )) ||
      (m = line.match(
        /embedding\s*\(\s*\{\s*inputDim\s*:\s*(\d+)\s*,\s*outputDim\s*:\s*(\d+)/i,
      )) ||
      (m = line.match(/nn\.Embedding\s*\(\s*(\d+)\s*,\s*(\d+)/i))
    ) {
      layers.push({
        type: "embedding",
        neuronCount: 0,
        vocabSize: +m[1],
        embeddingDim: +m[2],
      });
      continue;
    }

    if (
      (m = line.match(/LSTM\s*\(\s*(\d+)/i)) ||
      (m = line.match(/lstm\s*\(\s*\{\s*units\s*:\s*(\d+)/i)) ||
      (m = line.match(/nn\.LSTM\s*\(\s*\d+\s*,\s*(\d+)/i))
    ) {
      layers.push({
        type: "lstm",
        neuronCount: +m[1],
        returnSequences: hasSeq(line),
      });
      continue;
    }
    if (
      (m = line.match(/GRU\s*\(\s*(\d+)/i)) ||
      (m = line.match(/gru\s*\(\s*\{\s*units\s*:\s*(\d+)/i)) ||
      (m = line.match(/nn\.GRU\s*\(\s*\d+\s*,\s*(\d+)/i))
    ) {
      layers.push({
        type: "gru",
        neuronCount: +m[1],
        returnSequences: hasSeq(line),
      });
      continue;
    }
    if (
      (m = line.match(/SimpleRNN\s*\(\s*(\d+)/i)) ||
      (m = line.match(/simpleRNN\s*\(\s*\{\s*units\s*:\s*(\d+)/i)) ||
      (m = line.match(/nn\.RNN\s*\(\s*\d+\s*,\s*(\d+)/i))
    ) {
      layers.push({
        type: "rnn",
        neuronCount: +m[1],
        returnSequences: hasSeq(line),
      });
      continue;
    }

    if (
      (m = line.match(
        /TransformerBlock\s*\(\s*num_heads\s*=\s*(\d+)\s*,\s*ff_dim\s*=\s*(\d+)/i,
      )) ||
      (m = line.match(/TransformerEncoderLayer\s*\([^)]*nhead\s*=\s*(\d+)/i))
    ) {
      layers.push({
        type: "attention",
        neuronCount: 0,
        numHeads: +m[1],
        ffDim: m[2] ? +m[2] : undefined,
      });
      continue;
    }

    if (
      /GlobalAveragePooling1D\s*\(/i.test(line) ||
      /globalAveragePooling1d\s*\(/i.test(line) ||
      /\.mean\s*\(\s*dim\s*=\s*1\s*\)/i.test(line)
    ) {
      layers.push({ type: "globalpool", neuronCount: 0 });
      continue;
    }

    if (
      (m = line.match(/Dense\s*\(\s*(\d+)/i)) ||
      (m = line.match(/dense\s*\(\s*\{\s*units\s*:\s*(\d+)/i)) ||
      (m = line.match(/Linear\s*\(\s*\d+\s*,\s*(\d+)/i))
    ) {
      const act =
        line.match(/activation\s*=\s*['"]([a-zA-Z]+)['"]/) ||
        line.match(/activation\s*:\s*['"]([a-zA-Z]+)['"]/);
      layers.push({
        type: "dense",
        neuronCount: +m[1],
        activationFunction: act ? act[1] : undefined,
      });
      continue;
    }
  }

  if (layers.length === 0) {

    return {
      layers: [
        { type: "input", neuronCount: 3 },
        { type: "dense", neuronCount: 8 },
        { type: "dense", neuronCount: 6 },
        { type: "output", neuronCount: 2 },
      ],
    };
  }

  if (!layers.some((l) => l.type === "input" || l.type === "embedding")) {
    layers[0].type = "input";
  }

  const lastDense = [...layers].reverse().find((l) => l.type === "dense");
  if (lastDense) lastDense.type = "output";

  return { layers };
}
