var schema = {
    fields:{
        uuid : "string",
        company:{
            table: "company"
        },
        attribute:{
            table: "expense_company_attribute",
	        multiple:true
        }
    }

};
module.exports = schema;

