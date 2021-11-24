var express = require('express')
var router = express.Router()
var Genre = require('../models/genre')
var Anime = require('../models/anime')

// Individual genre from /catalog
router.get('/', function (req, res, next) {
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
})

router.get('/view/:name', function (req, res, next) {
  const { name } = req.params,
    template = 'view_genre'

  Anime.find({ genre: name })
    .sort([['name', 'ascending']])
    .exec(function (err, list_animes) {
      if (err) {
        return next(err)
      }

      res.render(template, {
        title: `${name} Animes`,
        anime_list: list_animes,
      })
    })
})

router.get('/anime/:id', function (req, res) {
  res.redirect('/genres')
})

router.get('/genre/:id', function (req, res) {
  res.redirect('/genres')
})

module.exports = router;
