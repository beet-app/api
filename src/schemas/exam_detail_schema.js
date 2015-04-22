var schema = {
    fields:{
        uuid : "string",
        exam:{
            table: "exam"
        },
        candidate:{
            table: "candidate"
        },
        attribute:{
            table: "exam_detail_attribute"
        }
    }
};
module.exports = schema;

