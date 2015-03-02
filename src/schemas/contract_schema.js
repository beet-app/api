var schema = {
    fields:{
        uuid : "string",
        company:{
            table: "company"
        },
        person:{
            table: "person"
        },
        attribute:{
            table: "contract_attribute"
        }
    }
};
module.exports = schema;

