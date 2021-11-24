var Anime = require('../models/anime')
var Genre = require('../models/genre')
var async = require('async')

exports.index = function (req, res) {
  async.parallel(
    {
      anime_count: function (callback) {
        Anime.countDocuments({}, callback)
      },
      genre_count: function (callback) {
        Genre.countDocuments({}, callback)
      },
    },
    function (err, results) {
      res.render('index', {
        title: 'Anime Inventory Home',
        err: err,
        data: results,
      })
    }
  )
}