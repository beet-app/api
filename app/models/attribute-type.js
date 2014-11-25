var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

var schema = new Schema({
    description : String,
    selection: [],
    properties: {},
    events: {},
    template : String
});

module.exports = Mongoose.model('AttributeType', schema, 'attributes_types');

