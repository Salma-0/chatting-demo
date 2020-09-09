const mongoose = require('mongoose');
const config = require('config');

const MONGO_URI = config.get('mongoURI');


async function connect(){
    try {
        await mongoose.connect(MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false}, err => {
            if(err) throw err;
            else
              console.log('MongoDB connected..');
        })
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = connect;

