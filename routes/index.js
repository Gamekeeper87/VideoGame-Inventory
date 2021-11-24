var express = require('express')
var router = express.Router()
var async = require('async')
var Anime = require('../models/anime')
var Genre = require('../models/genre')
const { body, validationResult } = require('express-validator')

/* GET home page. */
// Home page router to display genres
router.get('/', function (req, res, next) {
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
        title: 'Anime-Inventory',
        err: err,
        data: results,
      })
    }
  )
})

// Get form for adding genres
router.get('/add/genre', function (req, res, next) {
  res.render('genre_form', { title: 'Add Genre' })
})

// Post form for adding genres
router.post('/add/genre', [
  // Validate and Sanitize the fields
  body('name', 'Name must not be empty').trim().isLength({ min: 1 }).escape(),
  body('poster', 'Poster must not be empty.').trim().isLength({ min: 1 }),

  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation Erros from a request
    const errors = validationResult(req)

    // Create a genre object with escaped and trimmed data.
    var genre = new Genre({ name: req.body.name, poster: req.body.poster })

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages
      res.render('genre_form', {
        title: 'Create Genre',
        genre: genre,
        errors: errors.array(),
      })

      return
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists
      Genre.findOne({ name: req.body.name }).exec(function (err, found_genre) {
        if (err) {
          return next(err)
        }

        if (found_genre) {
          // Genre exists, redirect to its detail page.
          res.redirect('/genres')
        } else {
          genre.save(function (err) {
            if (err) {
              return next(err)
            }

            // Genre saved. Redirect to home page
            res.redirect('/genres')
          })
        }
      })
    }
  },
])

// Get form for adding animes
router.get('/add/anime', (req, res, next) => {
  async.parallel(
    {
      genres: function (callback) {
        Genre.find(callback)
      },
    },
    function (err, results) {
      if (err) {
        return next(err)
      }

      res.render('anime_form', {
        title: 'Create Anime',
        genres: results.genres,
      })
    }
  )
})

// Post form for adding animes
router.post('/add/anime', [
  // Validate and sanitise fields
  body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description must not be empty.')
    .trim()
    .isLength({ min: 5 }),
  body('poster', 'Poster must not be empty.').trim().isLength({ min: 1 }),
  body('genre.*').escape(),

  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req)

    // Create a Anime object with escaped and trimmed
    var anime = new Anime({
      name: req.body.name,
      description: req.body.description,
      poster: req.body.poster,
      genre: req.body.genre,
    })

    if (!errors.isEmpty()) {
      // There are erros. Render form again with sanitized values/error messages
      // Get all genres for form
      async.parallel(
        {
          genres: function (callback) {
            Genre.find(callback)
          },
        },
        function (err, results) {
          if (err) {
            return next(err)
          }

          // Mark our selected genres as checked
          for (let i = 0; i < results.genres.isLength; i++) {
            if (anime.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = 'true'
            }
          }
          res.render('anime_form', {
            title: 'Create Anime',
            genres: results.genres,
            anime: anime,
            erros: errors.array(),
          })
        }
      )
      return
    } else {
      // Data from form is valid. Save Anime
      anime.save(function (err) {
        if (err) {
          return next(err)
        }

        // Successful - redirect to new anime record
        res.redirect('/genres')
      })
    }
  },
])

// Update anime
router.get('/update/:id', (req, res, next) => {
  // Get book for form
  async.parallel(
    {
      anime: function (callback) {
        Anime.findById(req.params.id).exec(callback)
      },
    },
    function (err, results) {
      if (err) {
        return next(err)
      }

      if (results.anime === null) {
        // No results
        var err = new Error('Anime not found')
        err.status = 404
        return next(err)
      }

      // Success
      res.render('anime_form', {
        title: 'Update Anime',
        anime: results.anime,
      })
    }
  )
})

router.post('/update/:id', [
  // Convert the genre to an Array
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') req.body.genre = []
      else req.body.genre = new Array(req.body.genre)
    }
    next()
  },

  // validate and sanitize fields
  body('name', 'name must not be empty').trim().isLength({ min: 1 }).escape(),
  body('description', 'description must not be empty')
    .trim()
    .isLength({ min: 1 }),
  body('poster', 'Poster must not be empty.').trim().isLength({ min: 1 }),
  body('genre', 'Genre must not be empty').trim().isLength({ min: 1 }).escape(),

  // process request after vlaidation and sanitization
  (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req)

    // Create a Anime Object with escaped/trimmed data and old id
    var anime = new Anime({
      name: req.body.name,
      description: req.body.description,
      poster: req.body.poster,
      genre: req.body.genre,
      _id: req.params.id, // this is required, or a new ID will be assigned!
    })

    if (!errors.isEmpty()) {
      // There are erros. Render form again with sanitized values/error messages.

      // Get all genres for form
      async.parallel(
        {
          genres: function (callback) {
            Genre.find(callback)
          },
        },
        function (err, results) {
          if (err) {
            return next(err)
          }

          res.render('anime_form', {
            title: 'Update Anime',
            genres: results.genres,
            anime: anime,
            errors: errors.array(),
          })
        }
      )
      return
    } else {
      // Data from form is valid. Update the record
      Anime.findByIdAndUpdate(
        req.params.id,
        anime,
        {},
        function (err, theanime) {
          if (err) {
            return next(err)
          }

          // Successful - rediect to home page
          res.redirect('/genres')
        }
      )
    }
  },
])

// Delete anime
router.get('/delete/:id', (req, res, next) => {
  async.parallel(
    {
      anime: function (callback) {
        Anime.findById(req.params.id).exec(callback)
      },
    },
    function (err, results) {
      if (err) {
        return next(err)
      }
      if (results.anime === null) {
        res.redirect('/genres')
      }

      res.render('anime_delete', {
        title: 'Delete Anime',
        anime: results.anime,
      })
    }
  )
})

router.post('/delete/:id', (req, res, next) => {
  async.parallel(
    {
      anime: function (callback) {
        Anime.findById(req.params.id).exec(callback)
      },
    },
    function (err, results) {
      if (err) {
        return next(err)
      } else {
        Anime.findByIdAndRemove(req.params.id, function deleteAnime(err) {
          if (err) return next(err)

          res.redirect('/genres')
        })
      }
    }
  )
})

module.exports = router
