var schema = {
    fields:{
        uuid : "string",
        person:{
            table: "person"
        },
        attribute:{
            table: "expense_person_attribute"
        }
    },
    detail:{
        attribute:{
            table: "expense_person_detail_attribute"
        }
    }

};
module.exports = schema;

