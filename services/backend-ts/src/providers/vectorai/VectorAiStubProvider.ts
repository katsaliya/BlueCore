import { VectorStoreProvider } from "./VectorStoreProvider";
import { DependencyHealth } from "../../types/dependencies";
import { env } from "../../config/env";

export class VectorAiStubProvider implements VectorStoreProvider {
  async getHealth(): Promise<DependencyHealth> {
    const url = `${env.VECTORAI_BRIDGE_BASE_URL}${env.VECTORAI_BRIDGE_HEALTH_PATH}`;

    try {
      const response = await fetch(url, {
        method: "GET"
      });

      if (!response.ok) {
        return {
          ok: false,
          name: "vectorai-bridge",
          detail: `HTTP ${response.status} from ${url}`
        };
      }

      return {
        ok: true,
        name: "vectorai-bridge",
        detail: `reachable at ${url}`
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "unknown connection error";

      return {
        ok: false,
        name: "vectorai-bridge",
        detail: `unreachable at ${url} (${message})`
      };
    }
  }
}