exports = async function(product, zone){
 const url = "https://9db641f8176e46c48505d0b2ebeb8246.ent-search.us-west-2.aws.cloud.es.io";
 const key = "private-onjrzfnsa6xqyh7zy857isvh";
 const searchEngine = "catalog-mongo";
 const requestUrl = `${url}/api/as/v1/engines/${searchEngine}/documents`;
 const headers = {
        Authorization: [`Bearer ${key}`],
        "Content-Type": [ "application/json" ]
      };
  if(product.archive){
    return context.http.delete({ 
      url: requestUrl,
      headers,
      body: JSON.stringify([product.sku])
    })
    .then(res => EJSON.parse(res.body.text()));
  }
  else{
    const appSearchProduct = context.functions.execute("transformAppSearchProduct", product, zone);
    return appSearchProduct;
    if (appSearchProduct) {
      return context.http.patch({ 
        url: requestUrl,
        headers,
        body: JSON.stringify([appSearchProduct])
      })
      .then(res => EJSON.parse(res.body.text()))
      .then(res => {
        if(res[0].errors[0]){
          return context.http.post({ 
            url: requestUrl,
            headers,
            body: JSON.stringify([appSearchProduct])
          })
          .then(res => EJSON.parse(res.body.text()));
        }
        else{
          return res;
        }
      });
    }
  }
};