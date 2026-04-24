import { DependencyHealth } from "../../types/dependencies";

export type GenerateReplyInput = {
  sessionId: string;
  userText: string;
  retrievedMatches: unknown[];
};

export interface LlmProvider {
  getHealth(): Promise<DependencyHealth>;
  generateReply(input: GenerateReplyInput): Promise<string>;
}