var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AnimeSchema = new Schema({
  poster: { type: String, required: true },
  genre: { type: Array, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true, minLength: 3, maxLength: 1000 },
})

// Virtual for Video Game's url
AnimeSchema.virtual('url').get(function () {
  return '/' + this._id;
})

module.exports = mongoose.model('Anime', AnimeSchema);
