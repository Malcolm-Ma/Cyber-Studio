const mongoose = require('mongoose');

const { MONGODB_URL } = require('../configure/database');

mongoose.Promise = global.Promise;

connection = mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  checkServerIdentity: false,
})
  .then(() => {
    console.info('connection to mongodb worked!');
  })
  .catch((error) => {
    console.error('connection to mongodb did not work! ' + JSON.stringify(error));
  });
