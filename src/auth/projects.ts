import { useQuery } from "@tanstack/react-query";
import { Layer } from "../api/Network";

const KEY = "neurocraft.projects";

export type NetworkKind =
  | "perceptron"
  | "cnn"
  | "rnn"
  | "transformer"
  | "gan";

export interface GanSpec {
  latentDim: number;
  dataDim: number;
  generator: number[];
  discriminator: number[];
}

export interface SavedArchitecture {
  id: string;
  ownerId: string;
  name: string;
  kind: NetworkKind;
  layers: Layer[];
  gan?: GanSpec;

  labels?: Record<string, string>;
  createdAt: number;
}

function readAll(): SavedArchitecture[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeAll(items: SavedArchitecture[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function listProjects(ownerId: string): SavedArchitecture[] {
  return readAll()
    .filter((p) => p.ownerId === ownerId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getProject(id: string): SavedArchitecture | null {
  return readAll().find((p) => p.id === id) ?? null;
}

export function saveProject(
  ownerId: string,
  data: {
    name: string;
    kind: NetworkKind;
    layers: Layer[];
    gan?: GanSpec;
    labels?: Record<string, string>;
  }
): SavedArchitecture {
  const project: SavedArchitecture = {
    id: crypto.randomUUID(),
    ownerId,
    createdAt: Date.now(),
    ...data,
  };
  writeAll([...readAll(), project]);
  return project;
}

export function removeProject(id: string) {
  writeAll(readAll().filter((p) => p.id !== id));
}

export const projectsKey = (ownerId?: string) => ["projects", ownerId] as const;

export function useProjects(ownerId?: string) {
  return useQuery({
    queryKey: projectsKey(ownerId),
    queryFn: () => (ownerId ? listProjects(ownerId) : []),
    initialData: ownerId ? listProjects(ownerId) : [],
    enabled: !!ownerId,
  });
}
