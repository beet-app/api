var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

var schema = new Schema({
    description : String,
    menus:[{ type: Schema.Types.ObjectId, ref: 'Menu' }]
});

module.exports = Mongoose.model('Profile', schema, 'profiles');