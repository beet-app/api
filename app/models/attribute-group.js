var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

var schema = new Schema({
    description : String,
    module : { type: Schema.Types.ObjectId, ref: 'Module' },
    order : Number
});

module.exports = Mongoose.model('AttributeGroup', schema, 'attributes_groups');