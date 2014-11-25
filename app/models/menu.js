var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    description : String,
    url : String,
    icon_class : String,
    active : Boolean,
    modules: [{ type: Schema.Types.ObjectId, ref: 'Module' }] 
    //menus: [{ type: Schema.Types.ObjectId, ref: 'Menu' }]
});

module.exports = mongoose.model('Menu', schema, 'menus');