exports = async function(changeEvent) {
    const {fullDocument: product} = changeEvent;
    
    /*
    const product = {
      "_id" :  new BSON.ObjectId("61e7f0b71d37e092cd6551cb"),
      "source_sku" : "19LUK20KUM0019739-82",
      "sku" : "JLB19LUK20KUM0019739-82",
      "barcode" : null,
      "external_id" : null,
      "source_url" : "https://www.jilberto.com/limoya-lea-gercek-hasir-oval-okceli-mantar-topuklu-sandalet-82-test",
      "qualified" : 1,
      "archive" : false,
      "warehouse_id" : new BSON.ObjectId("61a5d8db0e2de90013075ba5"),
      "name_i18n" : {
          "tr" : {
              "proofread" : false,
              "text" : "Emmy Gerçek-Hasır Oval Ökçeli Mantar Topuklu Sandalet test"
          },
          "en" : {
              "proofread" : false,
              "text" : "Emmy Real-Wire Oval Heeled Mushroom Heel Sandals test"
          }
      },
      "name_normalize": "EMMY REAL-WIRE OVAL HEELED MUSHROOM HEEL SANDALS TEST",
      "project_id" : new BSON.ObjectId("61a5d6aa25bbb500144af4ad"),
      "description_i18n" : {
          "tr" : {
              "proofread" : false,
              "text" : "TEST"
          }
      },
      "short_description_i18n" : null,
      "brand" : {
          "tr" : "Limoya"
      },
      "images" : {
          "https://www\\u002ejilberto\\u002ecom/Uploads/UrunResimleri/buyuk/emmy-gercek-hasir-oval-okceli-mantar-t-5fa798\\u002ejpg" : "",
          "https://www\\u002ejilberto\\u002ecom/Uploads/UrunResimleri/buyuk/emmy-gercek-hasir-oval-okceli-mantar-t-19ed-4\\u002ejpg" : ""
      },
      "variant" : [ 
          {
              "source_sku" : "19LUK20KUM0019738-393-TEN-38",
              "sku" : "JLB19LUK20KUM0019738-393-TEN-38",
              "vat" : 8,
              "price" : 129.99,
              "market_price" : 259.98,
              "quantity" : 14,
              "archive" : false,
              "barcode" : "2000131730386",
              "weight" : 0.2,
              "source_weight" : 1.82,
              "attributes" : [ 
                  {
                      "name" : {
                          "tr" : "Renk"
                      },
                      "option" : {
                          "tr" : "Ten"
                      }
                  }, 
                  {
                      "name" : {
                          "tr" : "Numara"
                      },
                      "option" : {
                          "tr" : "38"
                      }
                  }
              ]
          }, 
          {
              "source_sku" : "19LUK20KUM0019740-394-TEN-40",
              "sku" : "JLB19LUK20KUM0019740-394-TEN-40",
              "vat" : 8,
              "price" : 129.99,
              "market_price" : 259.98,
              "quantity" : 14,
              "archive" : false,
              "barcode" : "2000131730409",
              "weight" : 0.2,
              "source_weight" : 1.82,
              "attributes" : [ 
                  {
                      "name" : {
                          "tr" : "Renk"
                      },
                      "option" : {
                          "tr" : "Ten"
                      }
                  }, 
                  {
                      "name" : {
                          "tr" : "Numara"
                      },
                      "option" : {
                          "tr" : "40"
                      }
                  }
              ]
          }, 
          {
              "source_sku" : "19LUK20KUM0019735-395-TEN-35",
              "sku" : "JLB19LUK20KUM0019735-395-TEN-35",
              "vat" : 8,
              "price" : 179.99,
              "market_price" : 309.98,
              "quantity" : 14,
              "archive" : true,
              "barcode" : "2000131730355",
              "weight" : 0.2,
              "source_weight" : 1.82,
              "attributes" : [ 
                  {
                      "name" : {
                          "tr" : "Renk"
                      },
                      "option" : {
                          "tr" : "Ten"
                      }
                  }, 
                  {
                      "name" : {
                          "tr" : "Numara"
                      },
                      "option" : {
                          "tr" : "35"
                      }
                  }
              ]
          }
      ],
      "attributes" : [ 
          {
              "name" : {
                  "tr" : "Renk"
              },
              "options" : [ 
                  {
                      "tr" : "Ten"
                  }
              ]
          }, 
          {
              "name" : {
                  "tr" : "Numara"
              },
              "options" : [ 
                  {
                      "tr" : "38"
                  }, 
                  {
                      "tr" : "40"
                  }, 
                  {
                      "tr" : "35"
                  }, 
                  {
                      "tr" : "36"
                  }, 
                  {
                      "tr" : "37"
                  }, 
                  {
                      "tr" : "39"
                  }
              ]
          }, 
          {
              "name" : {
                  "tr" : "Sezon"
              },
              "options" : [ 
                  {
                      "tr" : "Yaz"
                  }
              ]
          }, 
          {
              "name" : {
                  "tr" : "Dis Materyal"
              },
              "options" : [ 
                  {
                      "tr" : "Deri"
                  }
              ]
          }, 
          {
              "name" : {
                  "tr" : "Topuk Yuksekligi"
              },
              "options" : [ 
                  {
                      "tr" : "10 Cm"
                  }
              ]
          }, 
          {
              "name" : {
                  "tr" : "Taban Materyali"
              },
              "options" : [ 
                  {
                      "tr" : "Diger Materyal"
                  }
              ]
          }
      ]
  };
  */
    const mongodb = context.services.get("Cluster0");
    
    const supplier = await mongodb.db("spdev").collection("projects").findOne({ _id: product.project_id });
    
  //   await mongodb.db("spdev").collection("test").insertOne({ product,supplier });
    // indexing primary condition
    if (!supplier.active || product.qualified !== 1) return;
    const currency  = await mongodb.db("spdev").collection("currencies").findOne({ _id: supplier.currency });
    const existingWeight = product.variant.find(pv => pv.weight)?.weight || 0;
    
    let suggestedWeight = 0;
    let weightRule = false;
    if (product.name_normalize) {
      weightRule= await mongodb.db("spdev").collection("product_weight_rules").aggregate([
          {
            $project: {
              _id: 0,
              weight: 1,
              hs_code: 1,
              keyword_length: 1,
              keyword_normalize: 1,
              byteLocation: {
                $indexOfBytes: [
                  product.name_normalize,
                  '$keyword_normalize'
                ]
              }
            }
          },
          { $match: { byteLocation: { $ne: -1 } } },
          { $sort: { keyword_length: -1 } },
          { $limit: 1 }
        ])
        .toArray()
        .then(([entity]) => entity);
      if (!existingWeight) suggestedWeight = weightRule?.weight;
    }
    // indexing primary condition
      if (existingWeight || suggestedWeight) {
          product.variant = product.variant.map(pv => ({
          sku: pv.sku,
          vat: pv.vat,
          price_scy: pv.price,
          market_price_scy: pv.market_price,
          quantity: pv.quantity,
          archive: pv.archive,
          barcode: pv.barcode,
          weight: pv.weight || existingWeight || suggestedWeight,
          attributes: pv.attributes
          }));
          const warehouse  = await mongodb.db("spdev").collection("warehouse").findOne({ _id: product.warehouse_id });
          const fulfillment  = await mongodb.db("spdev").collection("fulfillments").findOne({ _id: warehouse.fulfillment_center_id });
          product.images = Array.isArray(product.images) ? product.images
          : Object.keys(product.images).map(
              key => product.images[key] || key.replace(/\\u002e/g, '.')
              );
          if (product.categories?.length) {
            const categories = await mongodb.db("spdev").collection("categories").find({ _id: { $in: product.categories } });
            product.categories_ids = product.categories;
            product.categories = categories;
          }
          product.product_currency = currency._id;
          product.warehouse = warehouse;
          product.seller_id = supplier.vendor;
          product.handling_time = supplier.handling_time;
          product.supplier_languages = supplier.languages;
          product.price_settings = supplier.price_settings;
          const shippingFields = fulfillment || warehouse;
          product.ship_to = shippingFields.shipto.map(st => st.country);
          product.ship_from = [
          {
              city: shippingFields.address.state || shippingFields.address.city,
              country: shippingFields.address.country
          }
          ];
          const taxClass = product.variant.find(pv => pv.vat)?.vat;
          if (taxClass) product.tax_class = taxClass;
      }
    const zones = await context.functions.execute("getZones");
    // for (const zone of zones) {
    //   if(product?.warehouse?.zones?.includes(zone.id)){
    //     // push to elastic search
    //     context.functions.execute("sendtoElasticProducts", product, zone);
    //     // push to app search
    //     context.functions.execute("sendtoAppSearch", product, zone);
    //   }
    // }
    return context.functions.execute("sendtoElasticProducts", product, zones[0]);
  };
  