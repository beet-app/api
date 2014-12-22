var schema = {
    fields:{
        uuid : "string",
        plan:{
            table: "plan"
        },
        user:{
            table: "user_company"
        },
        attribute:{
            table: "company_attribute"
        }
    }
};
module.exports = schema;

