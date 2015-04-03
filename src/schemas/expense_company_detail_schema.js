var schema = {
    fields:{
        uuid : "string",
        expense_company:{
            table: "expense_company"
        },
        attribute:{
            table: "expense_company_detail_attribute"
        }
    }

};
module.exports = schema;

