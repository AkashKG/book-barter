var bodyparser = require('body-parser');
var express = require('express');
var status = require('http-status');

module.exports = function(wagner) {
	var api = express.Router();
	api.use(bodyparser.json());
	
	api.get('/user/me',wagner.invoke(function(User){
		return function(req,res){
			if(req.user==undefined){
				return res.json({error:'Not logged in.'});			
			}
			else{
				console.log(req.user.profile);
				res.json({profile:req.user.profile});
			}
		}
	}));
	api.get('/user/me/id',wagner.invoke(function(User){
		return function(req,res){
			if(req.user==undefined){
				return res.json({error:'Not logged in.'});			
			}
			else{
				//console.log(req.user.profile);
				res.json({id:req.user._id});
			}
		}
	}));
	api.get('/me', isLoggedIn, function(req, res) {// done
		if (!req.user) {
			return res.status(status.UNAUTHORIZED).json({
				error : 'Not logged in'
			});
		}

		req.user.populate({
			path : 'data.profile',
			model : 'Todo'
		}, handleOne.bind(null, 'user', res));
	});
	return api;
}


function handleOne(property, res, error, result) {
	if (error) {
		return res.status(status.INTERNAL_SERVER_ERROR).json({
			error : error.toString()
		});
	}
	if (!result) {
		return res.status(status.NOT_FOUND).json({
			error : 'Not found'
		});
	}

	var json = {};
	json[property] = result;
	res.json(json);
}

function handleMany(property, res, error, result) {
	if (error) {
		return res.status(status.INTERNAL_SERVER_ERROR).json({
			error : error.toString()
		});
	}

	var json = {};
	json[property] = result;
	res.json(json);
}
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}