/**
 * @file Controller for stories
 * @author Mingze Ma
 */

const requestUtils = require('../utils/requestUtils');

const Story = require('../models/stories');

const getStoryList = (req, res) => {
  Story.aggregate()
    .lookup({
      from: 'assets',
      localField: 'photo_id',
      foreignField: '_id',
      as: 'photo_info',
    })
    .unwind('$photo_info')
    .project({
      _id: 0,
      story_id: '$_id',
      title: 1,
      content: 1,
      author: 1,
      date: 1,
      photo: '$photo_info.url',
    })
    .sort('-date')
    .exec()
    .then(stories => {
      requestUtils.buildSuccessResponse(res, {
        data: stories,
      });
    });
};

module.exports = {
  getStoryList,
};
