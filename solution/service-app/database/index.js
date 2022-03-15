const mongoose = require('mongoose');

const MONGODB = 'mongodb://localhost:27017/secret-agent';

mongoose.Promise = global.Promise;

connection = mongoose.connect(MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  checkServerIdentity: false,
})
  .then(() => {
    console.log('connection to mongodb worked!');
  })
  .catch((error) => {
    console.log('connection to mongodb did not work! ' + JSON.stringify(error));
  });
