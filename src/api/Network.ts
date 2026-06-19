import { z } from "zod";
import { Code } from "./Code";

export const LayerSchema = z.object({
  type: z.enum(["input", "hidden", "dense", "conv", "output"]),
  neuronCount: z.number(),
  activationFunction: z.string().optional(),
  description: z.string().optional(),
});

const PerceptronLayerSchema = LayerSchema.extend({
  type: z.enum(["input", "dense", "output"]),
});

const ConvolutionalLayerSchema = LayerSchema.extend({
  type: z.enum(["input", "conv", "pool", "flatten", "dense", "output"]),
  filterSize: z.number().optional(),
});

const PerceptronNetworkSchema = z.object({
  networkType: z.literal("perceptron"),
  layers: z.array(PerceptronLayerSchema),
});
const ConvolutionalNetworkSchema = z.object({
  networkType: z.literal("convolutional"),
  layers: z.array(ConvolutionalLayerSchema),
});

const NeuralNetworkSchema = z.union([
  PerceptronNetworkSchema,
  ConvolutionalNetworkSchema,
]);
export type NeuralNetwork = z.infer<typeof NeuralNetworkSchema>;

export {
  PerceptronNetworkSchema,
  ConvolutionalNetworkSchema,
  NeuralNetworkSchema,
};
export interface NeuralNetworkLayers {
  layers: Layer[];
}
export type LayerType =
  | "input"
  | "hidden"
  | "output"
  | "dense"
  | "conv"
  | "pool"
  | "flatten"
  | "embedding"
  | "lstm"
  | "gru"
  | "rnn"
  | "attention"
  | "globalpool"
  | "dropout"
  | "batchnorm";

export interface Layer {
  type: LayerType;
  neuronCount: number;
  activationFunction?: string;
  kernelSize?: number;
  poolSize?: number;
  vocabSize?: number;
  embeddingDim?: number;
  returnSequences?: boolean;
  numHeads?: number;
  ffDim?: number;
  rate?: number;
  description?: string;
}

import { generateCode, Framework } from "./mock/codegen";
import { parseArchitectureFromCode } from "./mock/parseCode";
import { mockDelay } from "./mock/utils";

export function submitArchitecture(
  network: NeuralNetworkLayers,
  framework: Framework = "keras"
): Promise<Code> {
  return mockDelay({ code: generateCode(network, framework) });
}

export function fetchNetworkArchitecture(
  modelCode: string
): Promise<NeuralNetworkLayers> {
  return mockDelay(parseArchitectureFromCode(modelCode));
}
