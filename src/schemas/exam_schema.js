var schema = {
    fields:{
        uuid : "string",
        company:{
            table: "company"
        },
        attribute:{
            table: "exam_attribute"
        }
    },
    detail:{
        attribute:{
            table: "exam_detail_attribute"
        },
        candidate:{
            table: "candidate"
        }
    }
};
module.exports = schema;