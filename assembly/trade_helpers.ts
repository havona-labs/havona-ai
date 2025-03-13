/**
 * Helper functions for TradeContract classes.
 */
import { JSON } from "json-as";
import { TradeContract } from "./classes";
import { injectNodeUid, GraphSchema } from "./dgraph-utils";

const trade_schema: GraphSchema = new GraphSchema();

trade_schema.node_types.set("TradeContract", {
  id_field: "TradeContract.id",
  relationships: [
    { predicate: "TradeContract.seller", type: "Member" },
    { predicate: "TradeContract.buyer", type: "Member" },
    { predicate: "TradeContract.broker", type: "Member" },
    { predicate: "TradeContract.productGoods", type: "ProductGoods" },
  ],
});

trade_schema.node_types.set("Member", {
  id_field: "Member.id",
  relationships: [],
});

trade_schema.node_types.set("ProductGoods", {
  id_field: "ProductGoods.name",
  relationships: [
    {
      predicate: "ProductGoods.commodityReference",
      type: "CommodityReference",
    },
  ],
});

trade_schema.node_types.set("CommodityReference", {
  id_field: "CommodityReference.id",
  relationships: [],
});

export function buildTradeContractMutationJson(
  connection: string,
  tradeContract: TradeContract,
): string {
  const payload = JSON.stringify(tradeContract);
  return injectNodeUid(connection, payload, "TradeContract", trade_schema);
}

// Helper function to generate a searchable description for a trade contract
export function generateTradeContractDescription(
  tradeContract: TradeContract,
): string {
  let description = `Contract ${tradeContract.contractNo} dated ${tradeContract.contractDate}`;

  // Add seller information if available
  const seller = tradeContract.seller;
  if (seller !== null) {
    const sellerName = seller.companyName;
    description += ` Seller: ${sellerName}`;
  }

  // Add buyer information if available
  const buyer = tradeContract.buyer;
  if (buyer !== null) {
    const buyerName = buyer.companyName;
    description += ` Buyer: ${buyerName}`;
  }

  // Add product information if available
  const goods = tradeContract.productGoods;
  if (goods !== null) {
    const productName = goods.name;
    description += ` Product: ${productName}`;

    // Add commodity information if available
    const commodity = goods.commodityReference;
    if (commodity !== null) {
      const commodityName = commodity.name;
      description += ` Commodity: ${commodityName}`;
    }

    const quantity = goods.quantity;
    description += ` Quantity: ${quantity}`;

    const origin = goods.originCountry;
    description += ` Origin: ${origin}`;
  }

  // Add pricing information
  const pricingType = tradeContract.fixedPrice ? "Fixed" : "Variable";
  const pricingMethod = tradeContract.pricingMethod;
  description += ` Pricing: ${pricingType} - ${pricingMethod}`;

  return description;
}
