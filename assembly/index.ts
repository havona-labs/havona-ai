import { models } from "@hypermode/modus-sdk-as";
import {
  OpenAIChatModel,
  ResponseFormat,
  SystemMessage,
  UserMessage,
} from "@hypermode/modus-sdk-as/models/openai/chat";

// this model name should match the one defined in the modus.json manifest file
const modelName: string = "post-trade-text-generator";

export function generateText(instruction: string, prompt: string): string {
  const model = models.getModel<OpenAIChatModel>(modelName);
  const input = model.createInput([
    new SystemMessage(instruction),
    new UserMessage(prompt),
  ]);

  // this is one of many optional parameters available for the OpenAI chat interface
  input.temperature = 0.7;

  const output = model.invoke(input);
  return output.choices[0].message.content.trim();
}
