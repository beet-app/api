var schema = {
    fields:{
        uuid : "string",
        company:{
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

