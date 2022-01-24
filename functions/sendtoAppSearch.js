exports = async function(product, zone){
 const AppSearchClient = require('@elastic/app-search-node')
 const url = "https://9db641f8176e46c48505d0b2ebeb8246.ent-search.us-west-2.aws.cloud.es.io";
 const key = "private-onjrzfnsa6xqyh7zy857isvh";
 const searchEngine = "catalog-mongo";
 const client = new AppSearchClient(
      undefined,
      key,
      () => `${url}/api/as/v1/`
    );
  if(product.archive){
    return client.destroyDocuments(searchEngine, [product.sku]);
  }
  else{
    const appSearchProduct = context.functions.execute("transformAppSearchProduct", product, zone);
    if (appSearchProduct) {
      const updateRes = await client.updateDocuments(searchEngine, [appSearchProduct])
      // Handle server error
      if (!updateRes) {
        throw 'AppSearch ServerError';
      }
      if(updateRes[0].errors[0]){
        return client.indexDocuments(searchEngine, [appSearchProduct]);
      }
      else{
        return updateRes
      }
    }
  }
};