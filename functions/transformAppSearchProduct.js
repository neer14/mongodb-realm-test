

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
 * Format categories into algolia hierarchy
 */
function getCategoryHierarchy(categories, language) {
  // sort categories by level
  const sorted = categories.reduce((cat, x) => {
    (cat[x.treeNodeLevel] = cat[x.treeNodeLevel] || []).push(x);
    return cat;
  }, {});
  let prevLevel = [];
  const hierarchyObj = {};
  Object.keys(sorted).forEach((level, i) => {
    sorted[level].forEach((element, j) => {
      let prev_hierarchy = [];
      if (prevLevel.length)
        prev_hierarchy =
          prevLevel.find(obj => obj._id === element.parentId)?.hierarchy || [];
      const hierarchy = [...prev_hierarchy, element.name[language]];
      // save hierarchy for each category in sorted
      sorted[level][j].hierarchy = hierarchy;
      if (hierarchy.length && !hierarchy.includes(undefined))
        (hierarchyObj[`lvl${i}`] = hierarchyObj[`lvl${i}`] || []).push(
          hierarchy.join(' > ')
        );
    });
    prevLevel = sorted[level];
  });
  return hierarchyObj;
}


exports = function(product, zone){
  const allowedLanguages = zone.allowed_languages;
  const zone_price_settings = product.price_settings[zone.id];

  const productName = filterLanguages(product.name_i18n, allowedLanguages, []);
  // Do not add product if one of allowed_languages not available
  if (!Object.keys(productName).length) return false;

  let cost = 0;
  let quantity = 0;
  product.variant.forEach(
    (variant) => {
      if (!variant.archive) {
        quantity += variant.quantity;
        cost +=
          (variant.price_scy || 0) *
          (Number(zone_price_settings.price_to_cost) || 0);
      }
    }
  );
  const sanitizedProduct = {
    sku: product.sku,
    created: product.created,
    currency: product.product_currency,
    ship_to: product.ship_to,
    ship_from: product.ship_from,
    images: product.images.slice(0, 4),
    seller: product.seller_id,
    cost,
    quantity,
  };
  Object.keys(productName).forEach(language => {
    sanitizedProduct[`name_${language}`] = productName[language].text;
  });
  if (product.description_i18n) {
    const productDescription = filterLanguages(
      product.description_i18n,
      allowedLanguages,
      product.supplier_languages
    );
    // Ignore description if one of allowed_languages not available
    if (Object.keys(productDescription).length)
      Object.keys(productDescription).forEach(language => {
        sanitizedProduct[`description_${language}`] =
          productDescription[language].text;
      });
  }
  if (product.brand) {
    const productBrand = filterLanguages(
      product.brand,
      allowedLanguages,
      product.supplier_languages
    );
    // Ignore brand if one of allowed_languages not available
    if (Object.keys(productBrand).length)
      sanitizedProduct.brand = Object.values(productBrand);
  }
  if (product.attributes) {
    product.attributes.forEach(attr => {
      Object.keys(attr.name).forEach(lang => {
        const optionArr = attr.options.map(opt => opt[lang]).filter(attr => attr);
        if(optionArr.length){
          const attrKey = `attributes_${lang}`;
          if(!sanitizedProduct[attrKey]) sanitizedProduct[attrKey] = [];
          sanitizedProduct[attrKey].push({
            [attr.name[lang]]: optionArr
          })
        }
      })
    })
  }
  if (product.categories?.length) {
    allowedLanguages.forEach(language => {
      const categories = getCategoryHierarchy(product.categories, language);
      if (Object.keys(categories).length)
        sanitizedProduct[`categories_${language}`] = categories;
    });
  }
  return sanitizedProduct;
};