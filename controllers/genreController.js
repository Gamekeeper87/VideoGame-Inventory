const Genre = require('../models/genre')
const Anime = require('../models/anime')
const async = require('async')

// Display list of all Genre
exports.genre_list = function (req, res, next) {
  Genre.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_genres) {
      if (err) {
        return next(err)
      }

      res.render('genre_list', {
        title: 'Genre List',
        genre_list: list_genres,
      })
    })
}