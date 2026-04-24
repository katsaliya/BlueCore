import { DependencyHealth } from "../../types/dependencies";

export interface VectorStoreProvider {
  getHealth(): Promise<DependencyHealth>;
}