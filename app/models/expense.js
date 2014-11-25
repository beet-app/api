var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

var schema = new Schema({
    attributes: {},
    person :  { type: Schema.Types.ObjectId, ref: 'Person' },
    company : { type: Schema.Types.ObjectId, ref: 'Company' }
});
module.exports = Mongoose.model('Expense', schema, 'expenses');