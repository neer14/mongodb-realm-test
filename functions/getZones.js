exports = function(){
  const {MP_BASEURL, APP_AUTH} = context.environment.values;
  const auth = Buffer.from(APP_AUTH).toString(
        'base64'
      );
  return context.http.get({ 
    url: `${MP_BASEURL}/zones`,
    headers: {
      Authorization: [`Basic ${Buffer.from(APP_AUTH).toString(
        'base64'
      )}`],
    } 
  })
    .then(response => {
      // The response body is encoded as raw BSON.Binary. Parse it to JSON.
      const ejson_body = EJSON.parse(response.body.text());
      return ejson_body.rows.filter(zone => zone.id === "INT").map(zone =>{
            zone.allowed_languages = zone.allowed_languages.map(
              lang => lang.split('-')[0].toLowerCase()
            );
        return zone;
      });
    })
};