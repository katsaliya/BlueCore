import { LlmProvider, GenerateReplyInput } from "./LlmProvider";
import { DependencyHealth } from "../../types/dependencies";
import { env } from "../../config/env";

type OllamaChatResponse = {
  message?: {
    role?: string;
    content?: string;
  };
};

export class LocalLlmStubProvider implements LlmProvider {
  async getHealth(): Promise<DependencyHealth> {
    const url = `${env.LLM_BASE_URL}${env.LLM_HEALTH_PATH}`;

    try {
      const response = await fetch(url, {
        method: "GET"
      });

      if (!response.ok) {
        return {
          ok: false,
          name: "local-llm",
          detail: `HTTP ${response.status} from ${url}`
        };
      }

      return {
        ok: true,
        name: "local-llm",
        detail: `reachable at ${url}`
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "unknown connection error";

      return {
        ok: false,
        name: "local-llm",
        detail: `unreachable at ${url} (${message})`
      };
    }
  }

  async generateReply(input: GenerateReplyInput): Promise<string> {
    const retrievedText = input.retrievedMatches
      .map((item, index) => {
        if (typeof item === "object" && item !== null && "text" in item) {
          const textValue = (item as { text?: unknown }).text;
          return `[${index + 1}] ${String(textValue ?? "")}`;
        }

        return `[${index + 1}] ${JSON.stringify(item)}`;
      })
      .join("\n");

    const prompt = [
      "You are BlueCore, a concise wellbeing and fatigue-risk assistant for marine workers.",
      "Reply in 1-2 short sentences maximum. Never use bullet points or lists. Plain conversational text only.",
      "Be direct and human. Do not over-explain.",
      "If the user is in immediate danger, tell them to stop work and contact a supervisor immediately.",
      "Do not claim to be a doctor or give medical diagnoses.",
      "",
      `User: ${input.userText}`,
      retrievedText ? `\nContext:\n${retrievedText}` : "",
    ].join("\n");

    const response = await fetch(`${env.LLM_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gemma3:4b",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama HTTP ${response.status}`);
    }

    const data = (await response.json()) as OllamaChatResponse;
    const content = data.message?.content?.trim();

    if (!content) {
      throw new Error("Ollama returned empty content");
    }

    return content;
  }
}