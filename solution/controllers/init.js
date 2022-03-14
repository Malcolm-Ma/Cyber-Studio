const fs = require('fs');

const Story = require('../models/stories');
const Asset = require('../models/assets');

exports.init = async function () {
  // uncomment if you need to drop the database
  Story.remove({}, (err) => {
     console.log('collection removed')
  });
  Asset.remove({}, (err) => {
     console.log('collection removed')
  });

  const base64Demo = (() => {
    console.log();
    const bitmap = fs.readFileSync('assets/demo.jpg');
    // base64 encode
    return Buffer.from(bitmap, 'binary').toString('base64');
  })();

  let asset = new Asset({
    file_name: 'demo.jpg',
    base64: base64Demo
  });

  let photoId;

  await asset.save()
    .then((results) => {
      photoId = results._id;
      console.log("Asset" + "object created in init: " + JSON.stringify(results));
    })
    .catch((error) => {
      console.log(JSON.stringify(error));
    });

  let story = new Story({
    title: 'Demo of MongoDB',
    author_name: 'Malcolm Ma',
    description: 'This is a demo for testing MongoDB connection',
    photo_id: photoId
  });

  await story.save()
    .then ((results) => {
      console.log("Story" + "object created in init: "+ JSON.stringify(results));
    })
    .catch ((error) => {
      console.log(JSON.stringify(error));
    });
}
