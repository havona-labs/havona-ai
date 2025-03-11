import { dgraph } from "@hypermode/modus-sdk-as";
import { models } from "@hypermode/modus-sdk-as";
import {
  OpenAIChatModel,
  SystemMessage,
  UserMessage,
} from "@hypermode/modus-sdk-as/models/openai/chat";

// Connection name as defined in modus.json
const DGRAPH_CONNECTION = "dgraph";

/**
 * Get a trade contract by ID
 * @param contractId The ID of the trade contract to retrieve
 * @returns JSON string with the trade contract data
 */
export function getTradeContract(contractId: string): string {
  // Create a query to get a trade contract by ID
  const query = new dgraph.Query(`
    query getTradeContract($id: ID!) {
      getTradeContract(id: $id) {
        id
        contractNo
        contractDate
        status
        seller {
          id
          name
        }
        buyer {
          id
          name
        }
        productGoods {
          description
          quantity
        }
        fixedPrice
        riskClassification
      }
    }
  `).withVariable("id", contractId);

  // Execute the query
  const response = dgraph.executeQuery(DGRAPH_CONNECTION, query);

  // Check if response is valid
  if (!response || !response.Json) {
    return `Error retrieving trade contract: Invalid response`;
  }

  return response.Json;
}

/**
 * Get trade contracts for a user (as buyer or seller)
 * @param userId The ID of the user
 * @returns JSON string with the user's trade contracts
 */
export function getUserTradeContracts(userId: string): string {
  // Create a query to get trade contracts where the user is buyer or seller
  const query = new dgraph.Query(`
    query getUserTradeContracts($userId: ID!) {
      queryTradeContract(filter: {
        or: [
          { seller: { id: { eq: $userId } } },
          { buyer: { id: { eq: $userId } } }
        ]
      }) {
        id
        contractNo
        contractDate
        status
        seller {
          id
          name
        }
        buyer {
          id
          name
        }
        productGoods {
          description
          quantity
        }
      }
    }
  `).withVariable("userId", userId);

  // Execute the query
  const response = dgraph.executeQuery(DGRAPH_CONNECTION, query);

  // Check if response is valid
  if (!response || !response.Json) {
    return `Error retrieving user trade contracts: Invalid response`;
  }

  return response.Json;
}

/**
 * Search for trade contracts by status
 * @param status The status to search for
 * @returns JSON string with matching trade contracts
 */
export function searchTradeContractsByStatus(status: string): string {
  // Create a query to search for trade contracts by status
  const query = new dgraph.Query(`
    query searchTradeContractsByStatus($status: DigitalTradeTransactionStatus!) {
      queryTradeContract(filter: { status: { eq: $status } }) {
        id
        contractNo
        contractDate
        status
        seller {
          id
          name
        }
        buyer {
          id
          name
        }
      }
    }
  `).withVariable("status", status);

  // Execute the query
  const response = dgraph.executeQuery(DGRAPH_CONNECTION, query);

  // Check if response is valid
  if (!response || !response.Json) {
    return `Error searching trade contracts: Invalid response`;
  }

  return response.Json;
}

/**
 * Answer questions about a trade contract using AI
 * @param contractId The ID of the trade contract
 * @param question The user's question about the trade contract
 * @returns AI-generated answer based on the trade contract data
 */
export function answerTradeContractQuestion(
  contractId: string,
  question: string,
): string {
  // Get the trade contract data
  const contractData = getTradeContract(contractId);

  // Check if we got valid data
  if (contractData.includes("Error")) {
    return `I couldn't retrieve information about that trade contract. ${contractData}`;
  }

  // Get the AI model
  const model = models.getModel<OpenAIChatModel>("post-trade-text-generator");

  // Create the system prompt
  const systemPrompt = `
You are a helpful trade assistant. Answer the user's question about their trade contract based on the data provided.
Be specific and reference actual details from the contract when possible.
If the data doesn't contain the answer, acknowledge that and suggest what information might help answer their question better.
`;

  // Create the user prompt with the question and contract data
  const userPrompt = `
User Question: ${question}

Trade Contract Data:
${contractData}
`;

  // Create the input for the model
  const input = model.createInput([
    new SystemMessage(systemPrompt),
    new UserMessage(userPrompt),
  ]);

  // Set parameters
  input.temperature = 0.7;

  // Generate the response
  const output = model.invoke(input);
  return output.choices[0].message.content.trim();
}

/**
 * Get a summary of a user's trade contracts
 * @param userId The ID of the user
 * @returns AI-generated summary of the user's trade contracts
 */
export function summarizeUserTradeContracts(userId: string): string {
  // Get the user's trade contracts
  const contractsData = getUserTradeContracts(userId);

  // Check if we got valid data
  if (contractsData.includes("Error")) {
    return `I couldn't retrieve your trade contracts. ${contractsData}`;
  }

  // Get the AI model
  const model = models.getModel<OpenAIChatModel>("post-trade-text-generator");

  // Create the system prompt
  const systemPrompt = `
You are a helpful trade assistant. Provide a summary of the user's trade contracts based on the data provided.
Include key information such as:
1. Total number of contracts
2. Contract statuses
3. Key counterparties
4. Types of goods/products
5. Any notable patterns or insights

Be specific and reference actual details from the contracts.
`;

  // Create the user prompt with the contracts data
  const userPrompt = `
Please summarize the following trade contracts:

${contractsData}
`;

  // Create the input for the model
  const input = model.createInput([
    new SystemMessage(systemPrompt),
    new UserMessage(userPrompt),
  ]);

  // Set parameters
  input.temperature = 0.7;

  // Generate the response
  const output = model.invoke(input);
  return output.choices[0].message.content.trim();
}
