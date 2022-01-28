exports = function(product, zone){
 const algoliasearch = require('algoliasearch');
 const appId = "DJPDHKVAO1";
 const apiKey = "694ced9f97f36ade2838af0080a02319";
 const productsIndex = "products-int";
 const client = algoliasearch(appId, apiKey);
 const index = client.initIndex(productsIndex);
 
// product = {
//   archive: false,
//   sku: "ZUHZ21YBZ0253C1000001-1968",
//   objectID: "ZUHZ21YBZ0253C1000001-1968",
//   name: "test"
// };
  if(product.archive){
    index.deleteObjects([product.sku]);
    return true;
    // .then(res => EJSON.parse(res.body.text()));
  }
  else{
    const appSearchProduct = context.functions.execute("transformAppSearchProduct", product, zone);
    // const appSearchProduct = product;
    if (appSearchProduct) {
    appSearchProduct.objectID = product.sku;
      index.partialUpdateObjects([appSearchProduct], { createIfNotExists: true });
      return true;
      // .then(res => EJSON.parse(res.body.text()));
    }
  }
};