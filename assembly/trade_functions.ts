import { JSON } from "json-as";
import { dgraph } from "@hypermode/modus-sdk-as";
import { TradeContract } from "./classes";
import { embedText } from "./embeddings";
import {
  buildTradeContractMutationJson,
  generateTradeContractDescription,
} from "./trade_helpers";
import {
  deleteNodePredicates,
  ListOf,
  searchBySimilarity,
  getEntityById,
  addEmbeddingToJson,
} from "./dgraph-utils";

const DGRAPH_CONNECTION = "dgraph";

/**
 * Add or update a trade contract to the database
 */
export function upsertTradeContract(
  tradeContract: TradeContract,
): Map<string, string> | null {
  let payload = buildTradeContractMutationJson(
    DGRAPH_CONNECTION,
    tradeContract,
  );

  // Generate a searchable description for the trade contract
  const searchableDescription = generateTradeContractDescription(tradeContract);

  // Add the description to the trade contract for search purposes
  tradeContract.description = searchableDescription;

  // Generate embedding for the description
  const embedding = embedText([searchableDescription])[0];
  payload = addEmbeddingToJson(payload, "TradeContract.embedding", embedding);

  const mutation = new dgraph.Mutation(payload);
  const response = dgraph.executeMutations(DGRAPH_CONNECTION, mutation);

  return response.Uids;
}

/**
 * Get a trade contract by its id
 */
export function getTradeContract(id: string): TradeContract | null {
  const body = `
    TradeContract.id
    TradeContract.contractNo
    TradeContract.contractDate
    TradeContract.status
    TradeContract.description
    TradeContract.fixedPrice
    TradeContract.pricingMethod
    TradeContract.seller {
      Member.id
      Member.companyName
      Member.contactDetails
      Member.memberPublicKey
    }
    TradeContract.buyer {
      Member.id
      Member.companyName
      Member.contactDetails
      Member.memberPublicKey
    }
    TradeContract.broker {
      Member.id
      Member.companyName
      Member.contactDetails
      Member.memberPublicKey
    }
    TradeContract.productGoods {
      ProductGoods.name
      ProductGoods.quantity
      ProductGoods.hsCode
      ProductGoods.originCountry
      ProductGoods.commodityReference {
        CommodityReference.id
        CommodityReference.symbol
        CommodityReference.name
        CommodityReference.category
      }
    }`;
  return getEntityById<TradeContract>(
    DGRAPH_CONNECTION,
    "TradeContract.id",
    id,
    body,
  );
}

/**
 * Delete a trade contract by its id
 */
export function deleteTradeContract(id: string): void {
  deleteNodePredicates(DGRAPH_CONNECTION, `eq(TradeContract.id, "${id}")`, [
    "TradeContract.id",
    "TradeContract.contractNo",
    "TradeContract.contractDate",
    "TradeContract.status",
    "TradeContract.description",
    "TradeContract.fixedPrice",
    "TradeContract.pricingMethod",
    "TradeContract.seller",
    "TradeContract.buyer",
    "TradeContract.broker",
    "TradeContract.productGoods",
    "TradeContract.embedding",
  ]);
}

// Define a nested structure for the commodity query response
@json
class CommodityQueryResult {
  list: CommodityRefList[] = [];
}


@json
class CommodityRefList {
  list: ProductGoodsList[] = [];
}


@json
class ProductGoodsList {
  parent: TradeContract[] = [];
}

/**
 * Get all trade contracts for a specific commodity
 */
export function getTradeContractsByCommodity(
  commodityName: string,
): TradeContract[] {
  const query = new dgraph.Query(`{
    list(func: has(CommodityReference.name)) @filter(eq(CommodityReference.name, "${commodityName}")) {
      list:~ProductGoods.commodityReference {
        parent:~TradeContract.productGoods {
          TradeContract.id
          TradeContract.contractNo
          TradeContract.contractDate
          TradeContract.status
          TradeContract.description
          TradeContract.fixedPrice
          TradeContract.pricingMethod
          TradeContract.seller {
            Member.id
            Member.companyName
          }
          TradeContract.buyer {
            Member.id
            Member.companyName
          }
          TradeContract.productGoods {
            ProductGoods.name
            ProductGoods.quantity
            ProductGoods.commodityReference {
              CommodityReference.name
              CommodityReference.category
            }
          }
        }
      }
    }
  }`);

  const response = dgraph.executeQuery(DGRAPH_CONNECTION, query);
  const data = JSON.parse<CommodityQueryResult>(response.Json);

  const results: TradeContract[] = [];

  if (data.list.length > 0) {
    for (let i = 0; i < data.list.length; i++) {
      const commodityRefs = data.list[i].list;
      if (commodityRefs.length > 0) {
        for (let j = 0; j < commodityRefs.length; j++) {
          const contracts = commodityRefs[j].parent;
          if (contracts.length > 0) {
            for (let k = 0; k < contracts.length; k++) {
              results.push(contracts[k]);
            }
          }
        }
      }
    }
  }

  return results;
}

/**
 * Search trade contracts by semantic similarity to a given text
 */
export function searchTradeContracts(search: string): TradeContract[] {
  const embedding = embedText([search])[0];
  const topK = 5;
  const body = `
    TradeContract.id
    TradeContract.contractNo
    TradeContract.contractDate
    TradeContract.status
    TradeContract.description
    TradeContract.fixedPrice
    TradeContract.pricingMethod
    TradeContract.seller {
      Member.id
      Member.companyName
    }
    TradeContract.buyer {
      Member.id
      Member.companyName
    }
    TradeContract.productGoods {
      ProductGoods.name
      ProductGoods.quantity
      ProductGoods.commodityReference {
        CommodityReference.name
        CommodityReference.category
      }
    }
  `;
  return searchBySimilarity<TradeContract>(
    DGRAPH_CONNECTION,
    embedding,
    "TradeContract.embedding",
    body,
    topK,
  );
}

// Define a structure for the company query response
@json
class CompanyQueryResult {
  list: CompanyRelations[] = [];
}


@json
class CompanyRelations {
  as_seller: TradeContract[] = [];
  as_buyer: TradeContract[] = [];
}

/**
 * Search trade contracts by company (buyer or seller)
 */
export function searchTradeContractsByCompany(
  companyName: string,
): TradeContract[] {
  const query = new dgraph.Query(`{
    list(func: has(Member.companyName)) @filter(eq(Member.companyName, "${companyName}")) {
      as_seller:~TradeContract.seller {
        TradeContract.id
        TradeContract.contractNo
        TradeContract.contractDate
        TradeContract.status
        TradeContract.description
        TradeContract.fixedPrice
        TradeContract.pricingMethod
        TradeContract.seller {
          Member.id
          Member.companyName
        }
        TradeContract.buyer {
          Member.id
          Member.companyName
        }
        TradeContract.productGoods {
          ProductGoods.name
          ProductGoods.quantity
          ProductGoods.commodityReference {
            CommodityReference.name
            CommodityReference.category
          }
        }
      }
      as_buyer:~TradeContract.buyer {
        TradeContract.id
        TradeContract.contractNo
        TradeContract.contractDate
        TradeContract.status
        TradeContract.description
        TradeContract.fixedPrice
        TradeContract.pricingMethod
        TradeContract.seller {
          Member.id
          Member.companyName
        }
        TradeContract.buyer {
          Member.id
          Member.companyName
        }
        TradeContract.productGoods {
          ProductGoods.name
          ProductGoods.quantity
          ProductGoods.commodityReference {
            CommodityReference.name
            CommodityReference.category
          }
        }
      }
    }
  }`);

  const response = dgraph.executeQuery(DGRAPH_CONNECTION, query);
  const data = JSON.parse<CompanyQueryResult>(response.Json);

  const results: TradeContract[] = [];

  if (data.list.length > 0) {
    // Add contracts where the company is a seller
    const asSeller = data.list[0].as_seller;
    if (asSeller && asSeller.length > 0) {
      for (let i = 0; i < asSeller.length; i++) {
        results.push(asSeller[i]);
      }
    }

    // Add contracts where the company is a buyer
    const asBuyer = data.list[0].as_buyer;
    if (asBuyer && asBuyer.length > 0) {
      for (let i = 0; i < asBuyer.length; i++) {
        results.push(asBuyer[i]);
      }
    }
  }

  return results;
}
