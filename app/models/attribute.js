var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

var schema = new Schema({
    description : String,
    type : { type: Schema.Types.ObjectId, ref: 'AttributeType' },
    group : { type: Schema.Types.ObjectId, ref: 'AttributeGroup' },
    size : String,
    order : Number,
    required: Boolean
});
//stories : [{ type: Schema.Types.ObjectId, ref: 'Story' }]
module.exports = Mongoose.model('Attribute', schema, 'attributes');