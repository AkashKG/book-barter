var mongoose = require('mongoose');
var _ = require('underscore');
var autoIncrement = require('mongoose-auto-increment');
module.exports = function(wagner){
	var connection = mongoose.connect('mongodb://localhost:27017/bb');
	autoIncrement.initialize(connection);
	var Book = mongoose.model('Book', require('./book'), 'books');
	var User = mongoose.model('User', require('./user'), 'users');
	var models = {
			Book:Book,
			User:User
	}
	_.each(models, function(value, key) {
	    wagner.factory(key, function() {
	      return value;
	    });
	});
	return models;
}