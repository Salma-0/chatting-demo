const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    msg: {type: String, required: true},
    date: {type: Date, default: Date.now},
    from: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    to: {type: Schema.Types.ObjectId, ref: 'User', required: true}
});

module.exports = MessageSchema = mongoose.model('Message', MessageSchema);