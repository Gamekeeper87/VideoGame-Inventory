#! /usr/bin/env node

console.log('This script populates some test animes and genres');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);

var async = require('async')
var Anime = require('./models/anime')
var Genre = require('./models/genre')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var animes = []
var genres = []

function genreCreate(name, poster, cb) {
  var genre = new Genre({name: name, poster: poster});

  genre.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New genre: ' + genre);
    genres.push(genre)
    cb(null, genre);
  });
}

function animeCreate(poster, genre, name, description, cb) {
  animedetail = {
    poster: poster,
    name: name,
    description: description,
  }

  if (genre != false) animedetail.genre = genre

  var anime = new Anime(animedetail)
  anime.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }

    console.log('New Anime: ' + anime)
    animes.push(anime)
    cb(null, anime)
  })
}

function createGenres(cb) {
  async.series(
    [
      function(callback) {
        genreCreate('Shounen', 'https://fanart.tv/fanart/tv/78857/tvposter/naruto-5b088962e013a.jpg', callback);
      },
      function(callback) {
        genreCreate('Isekai', 'https://fanart.tv/fanart/tv/259640/tvposter/sword-art-online-53dd331b6355d.jpg', callback);
      },
      function(callback) {
        genreCreate('Ecchi', 'https://img.moviesrankings.com/t/p/w1280/d5Ddv3OR6afzwzTvEcOnwS9RsZ1.jpg', callback);
      },
    ],
    // optional callback
    cb);
}

function createAnimes(cb) {
  async.parallel(
    [
      function (callback) {
        animeCreate(
          'https://fanart.tv/fanart/tv/78857/tvposter/naruto-5b088962e013a.jpg',
          'Shounen',
          'Naruto',
          'On the day of Naruto Uzamakis birth the village of Konoha was attacked by the 9-tailed fox demon.',
          callback
        );
      },
      function (callback) {
        animeCreate(
          'https://picfiles.alphacoders.com/379/379367.jpg',
          'Shounen',
          'Hunter x Hunter',
          'For some unknown reason, Gon Freecsss father left him as a baby long time ago. 12 years later Gon finds out that his father is a Hunter, a person that has a license to go almost anywhere in the world and do almost anything. Now, Gon will have to undergo many challenges to become a Hunter and to gather more information about his father.',
          callback
        );
      },
    ],
    // optional callback
    cb
  )
}

async.series(
  [createGenres, createAnimes],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log('FINAL ERR: ' + err)
    } else {
      console.log('Animes: ' + animes)
    }

    // All done, disconnect from database
    mongoose.connection.close()
  }
)
