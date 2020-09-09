const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RequestSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    from: {type: Schema.Types.ObjectId, ref: 'User', required: false},
    date: {type: Date, default: Date.now()}
});

module.exports = FriendshipRequest = mongoose.model('FriendshipRequest', RequestSchema);