var schema = {
    fields:{
        uuid : "string",
        company:{
            table: "company"
        },
        attribute:{
            table: "expense_company_attribute"
        }
    }

};
module.exports = schema;

