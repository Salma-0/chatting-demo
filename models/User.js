const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    nickname: {type: String, required: true},
    email: {type: String, required: true, unique: true}, 
    password: {type: String, required: true},
    friends: [{type: Schema.Types.ObjectId, ref: 'User'}]
});

module.exports = User = mongoose.model('User', UserSchema);

