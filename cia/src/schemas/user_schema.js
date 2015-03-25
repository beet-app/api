var schema = {
  fields:{
    uuid : "string",
    email:"string",
    password:"string",
    active:"number",
    user:{
      table: "user_company"
    },
    attribute:{
      table: "user_attribute"
    }
  }
};
module.exports = schema;

