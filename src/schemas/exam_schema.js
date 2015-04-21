var schema = {
    fields:{
        uuid : "string",
        company:{
            table: "company"
        },
        candidate:{
            table: "exam_candidate"
        },
        attribute:{
            table: "exam_attribute"
        }
    },
    detail:{
        attribute:{
            table: "candidate_attribute"
        }
    }

};
module.exports = schema;

