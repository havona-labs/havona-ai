/* 
    This file contains the classes that are used in our App.
    The classes are annotated with the @json decorator 
    to be serialized and deserialized as json string.
    @alias is used to rename the properties in the json string to match Dgraph best practices.
*/

@json
export class Product {

  @alias("Product.id")
  id!: string;


  @alias("Product.title")
  title: string = "";


  @alias("Product.description")
  description: string = "";


  @alias("Product.category")
  @omitnull()
  category: Category | null = null;
}


@json
export class Category {

  @alias("Category.name")
  name: string = "";
}

// Trade Contract classes for Havona schema

@json
export class TradeContract {

  @alias("TradeContract.id")
  id!: string;


  @alias("TradeContract.contractNo")
  contractNo: string = "";


  @alias("TradeContract.contractDate")
  contractDate: string = "";


  @alias("TradeContract.status")
  status: string = "";


  @alias("TradeContract.description")
  description: string = "";


  @alias("TradeContract.seller")
  @omitnull()
  seller: Member | null = null;


  @alias("TradeContract.buyer")
  @omitnull()
  buyer: Member | null = null;


  @alias("TradeContract.broker")
  @omitnull()
  broker: Member | null = null;


  @alias("TradeContract.productGoods")
  @omitnull()
  productGoods: ProductGoods | null = null;


  @alias("TradeContract.fixedPrice")
  fixedPrice: boolean = false;


  @alias("TradeContract.pricingMethod")
  pricingMethod: string = "";
}


@json
export class Member {

  @alias("Member.id")
  id!: string;


  @alias("Member.companyName")
  companyName: string = "";


  @alias("Member.contactDetails")
  contactDetails: string = "";


  @alias("Member.memberPublicKey")
  memberPublicKey: string = "";
}


@json
export class ProductGoods {

  @alias("ProductGoods.name")
  name: string = "";


  @alias("ProductGoods.quantity")
  quantity: i32 = 0;


  @alias("ProductGoods.hsCode")
  hsCode: string = "";


  @alias("ProductGoods.originCountry")
  originCountry: string = "";


  @alias("ProductGoods.commodityReference")
  @omitnull()
  commodityReference: CommodityReference | null = null;
}


@json
export class CommodityReference {

  @alias("CommodityReference.id")
  id!: string;


  @alias("CommodityReference.symbol")
  symbol: string = "";


  @alias("CommodityReference.name")
  name: string = "";


  @alias("CommodityReference.category")
  category: string = "";
}


@json
export class MoneyAmount {

  @alias("MoneyAmount.iSOCurrencyCode")
  iSOCurrencyCode: string = "";


  @alias("MoneyAmount.amount")
  amount: f32 = 0;
}
