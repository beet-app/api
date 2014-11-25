var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

var schema = new Schema({
    attributes: {},
    active: Boolean,
    company : { type: Schema.Types.ObjectId, ref: 'Company' }
});
//stories : [{ type: Schema.Types.ObjectId, ref: 'Story' }]
module.exports = Mongoose.model('Person', schema, 'persons');