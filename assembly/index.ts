import { models } from "@hypermode/modus-sdk-as";
import {
  OpenAIChatModel,
  ResponseFormat,
  SystemMessage,
  UserMessage,
} from "@hypermode/modus-sdk-as/models/openai/chat";

// this model name should match the one defined in the modus.json manifest file
const modelName: string = "post-trade-text-generator";

// In AssemblyScript, we need to use class instead of type/interface
class DataContext {
  schema: string;
  currentData: string;
  userContext: string;

  constructor(schema: string, currentData: string, userContext: string = "") {
    this.schema = schema;
    this.currentData = currentData;
    this.userContext = userContext;
  }
}

// Adding schemaContext parameter to provide database/schema information
export function generateTextWithContext(
  instruction: string,
  prompt: string,
  dataContext: DataContext,
): string {
  const model = models.getModel<OpenAIChatModel>(modelName);

  // Create a comprehensive context combining schema and current data
  const enhancedInstruction = `
    Schema Definition:
    ${dataContext.schema}
    
    Current Data Context:
    ${dataContext.currentData}
    
    ${dataContext.userContext ? `User Context:\n${dataContext.userContext}\n` : ""}
    
    Instructions:
    ${instruction}
    
    Please provide accurate information based on the above context and data.
  `;

  const input = model.createInput([
    new SystemMessage(enhancedInstruction),
    new UserMessage(prompt),
  ]);

  // this is one of many optional parameters available for the OpenAI chat interface
  input.temperature = 0.7;

  const output = model.invoke(input);
  return output.choices[0].message.content.trim();
}

// Example usage:
const dataContext = new DataContext(
  `
    type Trade {
      id: ID!
      timestamp: DateTime!
      amount: Float!
      status: String!
      trader: String!
    }
  `,
  `
    Recent Trades:
    - Trade #1234: amount: $5000, timestamp: 2024-03-20 14:30:00, trader: "John Doe"
    - Trade #1235: amount: $3200, timestamp: 2024-03-20 14:35:00, trader: "Jane Smith"
    
    Trading Statistics:
    - Total Daily Volume: $25,000
    - Average Trade Size: $4,100
  `,
  `
    User: John Doe
    Role: Senior Trader
    Permissions: Full access to trade data
  `,
);
