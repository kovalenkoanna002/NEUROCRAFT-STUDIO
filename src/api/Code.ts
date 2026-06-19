import { z } from "zod";
import { parseArchitectureFromCode } from "./mock/parseCode";
import { mockDelay } from "./mock/utils";
import { NeuralNetworkLayers } from "./Network";

export const CodeSchema = z.object({
  code: z.string(),
});

export type Code = z.infer<typeof CodeSchema>;

export function submitCode(modelCode: string): Promise<NeuralNetworkLayers> {
  return mockDelay(parseArchitectureFromCode(modelCode));
}
