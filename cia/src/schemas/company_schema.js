var schema = {
    fields:{
        uuid : "string",
        plan:{
            table: "plan"
        },
        user:{
            table: "user_company"
        },
        company_type:{
            table: "company_type"
        },
        attribute:{
            table: "company_attribute"
        }
    }

};
module.exports = schema;

