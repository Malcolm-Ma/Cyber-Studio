const mongoose = require('mongoose');

const MONGODB = 'mongodb://localhost:27017/secret-agent';

mongoose.Promise = global.Promise;

try {
  const connection = mongoose.createConnection(MONGODB);
  console.log("connection to mongodb worked!");
} catch (e) {
  console.log('error in db connection: ' + e.message)
}
