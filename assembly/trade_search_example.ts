/**
 * Examples of how to use the trade contract search functionality.
 * This file is for demonstration purposes only.
 */
import {
  TradeContract,
  Member,
  ProductGoods,
  CommodityReference,
} from "./classes";
import {
  upsertTradeContract,
  getTradeContract,
  searchTradeContracts,
  searchTradeContractsByCompany,
  getTradeContractsByCommodity,
} from "./trade_functions";

/**
 * Example: Create a new trade contract
 */
export function createExampleTradeContract(): string | null {
  // Create a new trade contract
  const tradeContract = new TradeContract();
  tradeContract.id = "TC-" + Date.now().toString();
  tradeContract.contractNo = "CONTRACT-2023-001";
  tradeContract.contractDate = "2023-05-15";
  tradeContract.status = "ACTIVE";
  tradeContract.fixedPrice = true;
  tradeContract.pricingMethod = "FIXED";

  // Create seller
  const seller = new Member();
  seller.id = "SELLER-001";
  seller.companyName = "Global Commodities Ltd";
  seller.contactDetails = "contact@globalcommodities.com";
  seller.memberPublicKey = "0x123456789abcdef";
  tradeContract.seller = seller;

  // Create buyer
  const buyer = new Member();
  buyer.id = "BUYER-001";
  buyer.companyName = "Acme Trading Co";
  buyer.contactDetails = "trading@acme.com";
  buyer.memberPublicKey = "0xabcdef123456789";
  tradeContract.buyer = buyer;

  // Create product goods
  const productGoods = new ProductGoods();
  productGoods.name = "Premium Wheat";
  productGoods.quantity = 5000;
  productGoods.hsCode = "1001.99";
  productGoods.originCountry = "USA";

  // Create commodity reference
  const commodityRef = new CommodityReference();
  commodityRef.id = "WHEAT-001";
  commodityRef.symbol = "WHEAT";
  commodityRef.name = "Wheat";
  commodityRef.category = "GRAINS";
  productGoods.commodityReference = commodityRef;

  tradeContract.productGoods = productGoods;

  // Save the trade contract
  const result = upsertTradeContract(tradeContract);

  if (result) {
    return tradeContract.id;
  }

  return null;
}

/**
 * Example: Search for trade contracts by text
 */
export function searchTradeContractsExample(
  searchText: string,
): TradeContract[] {
  const results = searchTradeContracts(searchText);
  return results;
}

/**
 * Example: Search for trade contracts by company name
 */
export function searchByCompanyExample(companyName: string): TradeContract[] {
  const results = searchTradeContractsByCompany(companyName);
  return results;
}

/**
 * Example: Get trade contracts by commodity
 */
export function getContractsByCommodityExample(
  commodityName: string,
): TradeContract[] {
  const results = getTradeContractsByCommodity(commodityName);
  return results;
}

/**
 * Example: Retrieve a trade contract by ID
 */
export function getTradeContractExample(id: string): TradeContract | null {
  const result = getTradeContract(id);
  return result;
}

/**
 * Example usage:
 *
 * // Create a new trade contract
 * const contractId = createExampleTradeContract();
 *
 * // Search for wheat contracts
 * const wheatContracts = searchTradeContractsExample("wheat");
 *
 * // Search for contracts with Acme Trading
 * const acmeContracts = searchByCompanyExample("Acme Trading");
 *
 * // Get all wheat commodity contracts
 * const allWheatContracts = getContractsByCommodityExample("Wheat");
 *
 * // Get a specific contract by ID
 * const contract = getTradeContractExample(contractId);
 */
