"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorAiStubProvider = void 0;
const env_1 = require("../../config/env");
class VectorAiStubProvider {
    async getHealth() {
        const url = `${env_1.env.VECTORAI_BRIDGE_BASE_URL}${env_1.env.VECTORAI_BRIDGE_HEALTH_PATH}`;
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "unknown connection error";
            return {
                ok: false,
                name: "vectorai-bridge",
                detail: `unreachable at ${url} (${message})`
            };
        }
    }
}
exports.VectorAiStubProvider = VectorAiStubProvider;
