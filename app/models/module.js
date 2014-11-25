var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

var schema = new Schema({
    description : String
});
//stories : [{ type: Schema.Types.ObjectId, ref: 'Story' }]
module.exports = Mongoose.model('Module', schema, 'modules');