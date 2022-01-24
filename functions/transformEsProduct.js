
/**
 * Transform Name Description etc for elastic.
 *
 * @param {*} entity
 * @memberof ElasticLib
 */
function transformI18n(entity) {
  if (entity) {
    const keys = Object.keys(entity);
    if (keys.length > 0) {
      keys.forEach((key) => {
        if (entity[key].document_id) {
          delete entity[key].document_id;
        }
        if (entity[key].pushed_document_id) {
          delete entity[key].pushed_document_id;
        }
      });
    }
  }
  return entity;
}

/**
 * filter product by allowed languages
 * add sale_price_scy & cost_price_scy by zone price_settings
 */
function transformFields(product, zone) {
  const allowedLanguages = zone.allowed_languages;
  const zone_price_settings = product.price_settings[zone.id];
  const languages = allowedLanguages.map((lang) => lang.toLowerCase());
  const productLanguageFields = {
    name: filterLanguages(
      product.name_i18n,
      languages,
      product.supplier_languages
    ),
    attributes: product.attributes,
    variations: getSanitizedVariants(product, zone_price_settings, languages),
  };
  // Do not add product if one of allowed_languages not available
  if (!Object.keys(productLanguageFields.name).length) return false;
  if (product.description_i18n) {
    const description = filterLanguages(
      product.description_i18n,
      languages,
      product.supplier_languages
    );
    // Ignore description if one of allowed_languages not available
    if (Object.keys(description).length)
      productLanguageFields.description = description;
  }
  if (product.short_description_i18n) {
    const short_description = filterLanguages(
      product.short_description_i18n,
      languages,
      product.supplier_languages
    );
    // Ignore short description if one of allowed_languages not available
    if (Object.keys(short_description).length)
      productLanguageFields.short_description = short_description;
  }
  if (product.brand) {
    const brand = filterLanguages(
      product.brand,
      languages,
      product.supplier_languages
    );
    // Ignore brand if one of allowed_languages not available
    if (Object.keys(brand).length) productLanguageFields.brand = brand;
  }
  const attributes = [];
  productLanguageFields.attributes.forEach(attribute => {
    attributes.push({
      name: filterLanguages(
        attribute.name,
        languages,
        product.supplier_languages,
        'attributes'
      ),
      options: attribute.options
        .map(opt =>
          filterLanguages(
            opt,
            languages,
            product.supplier_languages,
            'attributes'
          )
        )
        .filter(entity => entity),
    });
  });
  productLanguageFields.attributes = attributes;
  return productLanguageFields;
}

/**
 * filter i18n object by allowed languages
 */
function filterLanguages(
  entity,
  allowedLanguages,
  supplierLanguages,
  type = ''
) {
  const output = {};
  allowedLanguages.forEach((key) => {
    if (entity[key] && key.length === 2) {
      output[key] = entity[key];
    }
  });
  if (!Object.keys(output).length && type === 'attributes') {
    const entityLanguages = Object.keys(entity);
    // check if supplier language is available in entity
    const keys = supplierLanguages.filter((lang) =>
      entityLanguages.includes(lang)
    );
    if (keys.length) {
      // if supplier language is available in entity then add 1st language from supplier languages
      output[keys[0]] = entity[keys[0]];
    } else {
      // if supplier language is not available in entity then add 1st language from entity languages
      output[entityLanguages[0]] = entity[entityLanguages[0]];
    }
  }
  return output;
}

/**
 * get variants to push with language and price
 */
function getSanitizedVariants(product, zone_price_settings, languages) {
  const sanitizedVariants = [];
  product.variant.forEach(variant => {
      const sanitizedVariant = {
        sku: variant.sku,
        vat: variant.vat,
        quantity: variant.quantity,
        archive: variant.archive,
        weight: variant.weight,
        attributes: variant.attributes,
        market_price_scy: variant.market_price || 0,
        sale_price_scy:
          (variant.price_scy || 0) *
          (Number(zone_price_settings.price_to_sale) || 0),
        cost_price_scy:
          (variant.price_scy || 0) *
          (Number(zone_price_settings.price_to_cost) || 0),
      };
      if (variant.hs_code) sanitizedVariant.hs_code = variant.hs_code;
      sanitizedVariant.attributes = sanitizedVariant.attributes
        .map(attribute => ({
          name: filterLanguages(
            attribute.name,
            languages,
            product.supplier_languages,
            'attributes'
          ),
          option: filterLanguages(
            attribute.option,
            languages,
            product.supplier_languages,
            'attributes'
          ),
        }))
        .filter(entity => entity);
      sanitizedVariants.push(sanitizedVariant);
    }
  );
  return sanitizedVariants;
}

exports = function(product, zone){
  const transformedProduct = transformFields(product, zone);
  if (!transformedProduct) return false;
  const esProduct = {
    archive: product.archive,
    categories: [{
    "_id" : 1,
    "name" : {
        "en" : "Collectibles",
        "ar" : "Collectibles"
    },
    "treeNodeLevel" : 1,
    "updated" : ISODate("2021-11-26T09:36:26.210Z"),
    "productsCount" : 45
}],
    tax_class: product.tax_class,
    created: product.created,
    name: transformI18n(transformedProduct.name) || {},
    description: transformI18n(transformedProduct.description) || {},
    short_description:
      transformI18n(transformedProduct.short_description) || {},
    images: product.images,
    ship_to: product.ship_to,
    ship_from: product.ship_from,
    seller_id: product.seller_id,
    sku: product.sku,
    source_url: product.source_url,
    barcode: product.barcode,
    updated: product.updated,
    product_currency: product.product_currency,
    attributes: transformedProduct.attributes,
    variations: transformedProduct.variations,
    handling_time: product.handling_time,
    fulfilledBy: product.fulfilledBy,
  };
  return esProduct;
};