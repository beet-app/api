var schema = {
  fields:{
    uuid : "string",
    description:"string",
    order:"string",
    attribute:{
      table: "feature_attribute"
    }
  }
};
module.exports = schema;

