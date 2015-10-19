var schema = {
    fields:{
        uuid : "string",
        company:{
            table: "company"
        },
        attribute:{
            table: "movie_attribute"
        }
    }

};
module.exports = schema;

