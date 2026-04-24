export type DependencyHealth = {
  ok: boolean;
  name: string;
  detail: string;
};

export type DependenciesHealthResponse = {
  ok: boolean;
  dependencies: DependencyHealth[];
};