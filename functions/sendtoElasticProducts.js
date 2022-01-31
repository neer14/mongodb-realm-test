exports = function(product, zone){
  const { Client } = require('@elastic/elasticsearch');
  return {a: zone.metadata.elasticsearch_secret, b: zone.metadata.elasticsearch_secret}
  const [user, password] = context.functions.execute("decode", zone.metadata.elasticsearch_secret).split(':');
  const client = new Client({
      node: zone.metadata.elasticsearch_url,
      auth: {
        username: context.functions.execute("decrypt", user),
        password: context.functions.execute("decrypt", password),
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