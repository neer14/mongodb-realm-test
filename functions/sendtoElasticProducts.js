exports = function(product, zone){
  const { Client } = require('@elastic/elasticsearch');
  // const client = new Client({
  //     node: "https://506c2467738d4029a5a69da87dd665a6.us-west-2.aws.found.io:9243",
  //     auth: {
  //       username: "indexer",
  //       password: "asdasdjhaghjdg78768",
  //     },
  //   });
  const client = new Client({
      node: "https://506c2467738d4029a5a69da87dd665a6.us-west-2.aws.found.io:9243",
      auth: {
        username: "indexer",
        password: "asdasdjhaghjdg78768",
      },
    });
    
  const sendProductInstance = client.updateByQuery({
      index: 'products-instances',
      body: {
        query: {
          term: { 'sku.keyword': product.sku },
        },
        script: {
          params: {
            productArchive: product.archive || false,
            productUpdated: product.updated || new Date(),
          },
          source:
            'ctx._source.archive=params.productArchive; ctx._source.updated=params.productUpdated;',
          lang: 'painless',
        },
      },
      conflicts: 'proceed',
    });
  const promises = [sendProductInstance];
  const esProduct =  context.functions.execute("transformEsProduct", product, zone);
  if (esProduct){
    const bulk = [];
    bulk.push({
      update: { _index: 'products', _id: product.sku },
    });
    bulk.push({
      doc: esProduct,
      doc_as_upsert: true,
    });
    const sendProduct = client.bulk({
      body: bulk,
    });
    promises.push(sendProduct);
  }
    return Promise.all(promises);
};