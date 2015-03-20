var schema = {
    fields:{
        uuid : "string",
        person:{
            table: "person"
        },
        attribute:{
            table: "person_expense_attribute",
	        multiple:true
        }
    }
};
module.exports = schema;