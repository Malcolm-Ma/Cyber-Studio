const mongoose = require('mongoose');

const { convertImgToBase64 } = require('../utils/imageUtils');
const Story = require('../models/stories');
const Asset = require('../models/assets');

exports.init= function() {
  // uncomment if you need to drop the database

  // Story.remove({}, function(err) {
  //    console.log('collection removed')
  // });
  // Asset.remove({}, function(err) {
  //    console.log('collection removed')
  // });

  const base64Demo = (() => {
    let base64;
    convertImgToBase64('../assets/demo.jpg', (res) => {
      base64 = res;
    });
    console.log('--base64--\n', base64);
    return base64;
  })();

  let asset = new Asset({
    file_name: 'demo.png',
  });

  let story = new Story({
    title: 'Demo of MongoDB',
    author_name: 'Malcolm Ma',
    description: 'This is a demo for testing MongoDB connection',
    photo_id: Schema.Types.ObjectId
  });
  // console.log('dob: '+character.dob);

  story.save()
    .then ((results) => {
      console.log("object created in init: "+ JSON.stringify(results));
    })
    .catch ((error) => {
      console.log(JSON.stringify(error));
    });
}
