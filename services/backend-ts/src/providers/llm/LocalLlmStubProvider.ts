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
      "You are GreenWatch, a local fatigue-risk and wellbeing support assistant for marine workers and other safety-critical workers.",
      "Your role is supportive, calm, practical, and safety-aware.",
      "Keep replies brief and clear.",
      "Use plain language.",
      "Do not claim to be a doctor or medical professional.",
      "Do not diagnose conditions.",
      "Do not give definitive medical advice.",
      "If the user mentions immediate danger, fainting, loss of consciousness, severe chest pain, inability to stay awake while working, or feeling unsafe to continue work, tell them to stop and seek urgent help from a supervisor and local emergency services immediately.",
      "Prefer practical next steps like rest, hydration, food, checking fit-for-duty, notifying a supervisor, or avoiding safety-critical tasks when impaired.",
      "Do not mention retrieved context unless it helps the answer.",
      "Answer in no more than 4 short paragraphs.",
      "",
      `User message: ${input.userText}`,
      "",
      "Retrieved context:",
      retrievedText || "(none)",
      "",
      "Reply in plain text."
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