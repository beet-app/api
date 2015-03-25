var schema = {
    fields:{
        uuid : "string",
	    expense_person:{
            table: "expense_person"
        },
        attribute:{
            table: "expense_person_detail_attribute"
        }
    }

};
module.exports = schema;

