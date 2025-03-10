import { models } from "@hypermode/modus-sdk-as";
import {
  OpenAIChatModel,
  ResponseFormat,
  SystemMessage,
  UserMessage,
} from "@hypermode/modus-sdk-as/models/openai/chat";

export function generateText(instruction: string, prompt: string): string {
  const model = models.getModel<OpenAIChatModel>("post-trade-text-generator");

  const input = model.createInput([
    new SystemMessage(instruction),
    new UserMessage(prompt),
  ]);

  // this is one of many optional parameters available for the OpenAI chat interface
  input.temperature = 0.7;

  // Invoke the model
  const output = model.invoke(input);

  return output.choices[0].message.content.trim();
}

export function sayHello(name: string | null = null): string {
  return `Hello, ${name || "World"}!`;
}
