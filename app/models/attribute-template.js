var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

var schema = new Schema({
    description : String
});

module.exports = Mongoose.model('AttributeTemplate', schema, 'attributes_templates');