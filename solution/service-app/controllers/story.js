/**
 * @file Controller for stories
 * @author Mingze Ma
 */

const requestUtils = require('../utils/requestUtils');

const Story = require('../models/stories');

const assetController = require('./asset');

const getStoryList = (req, res) => {
  Story.aggregate()
    // join Assets
    .lookup({
      from: 'assets',
      localField: 'photo_id',
      foreignField: '_id',
      as: 'photo_info',
    })
    // handle raw data
    .project({
      _id: 0,
      story_id: '$_id',
      title: 1,
      content: 1,
      author: 1,
      date: 1,
      photo: '$photo_info[0].url',
    })
    // sort by date
    // .sort('-date')
    .exec()
    .then(stories => {
      console.log('--stories--\n', stories);
      requestUtils.buildSuccessResponse(res, {
        data: stories,
      });
    })
    .catch((err) => {
      requestUtils.buildErrorResponse(res, {
        error: err,
        message: 'Invalid data or not found!',
      });
    });
};

const createStory = async (req, res) => {
  const params = req.body;
  // check data format
  if (params == null) {
    requestUtils.buildErrorResponse(res, {
      status: 403,
      error: new Error('No data sent!'),
      message: 'No data sent!',
    });
    return;
  }

  // insert new story
  const currentAsset = await assetController.findAssetByPath(params.photo);
  const newStory = new Story({
    title: params.title,
    author: params.author,
    content: params.content,
    date: new Date(),
    photo_id: currentAsset._id,
  });
  // save new story to db
  newStory.save()
    .then((result) => {
      requestUtils.buildSuccessResponse(res, {
        data: {
          story_id: result._id,
        }
      })
    })
    .catch((err) => {
      requestUtils.buildErrorResponse(res, {
        message: 'Could not insert - probably incorrect data! ',
        error: err,
      });
    });
};

module.exports = {
  getStoryList,
  createStory,
};
