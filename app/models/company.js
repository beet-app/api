var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

var schema = new Schema({
    description : String,
    attributes: {},
    members:[{
    	user: { type: Schema.Types.ObjectId, ref: 'User' },
    	profile : { type: Schema.Types.ObjectId, ref: 'Profile' }
    }]
});
//stories : [{ type: Schema.Types.ObjectId, ref: 'Story' }]
module.exports = Mongoose.model('Company', schema, 'companies');