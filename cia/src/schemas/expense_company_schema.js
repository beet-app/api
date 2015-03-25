var schema = {
    fields:{
        uuid : "string",
        company:{
            table: "company"
        },
        attribute:{
            table: "expense_company_attribute"
        }
    },
    detail:{
        attribute:{
            table: "expense_company_detail_attribute"
        }
    }

};
module.exports = schema;

