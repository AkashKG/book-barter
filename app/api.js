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
				// console.log(req.user.profile);
				res.json({profile:req.user.profile});
			}
		}
	}));
	
	api.get('/user/userbooks',wagner.invoke(function(User){
		return function(req,res){
			if(req.user==undefined){
				return res.json({error:'Not logged in.'});			
			}
			else{
				// console.log(req.user.bookList);
				res.json({books:req.user.bookList});
			}
		}
	}));
	
	api.get('/user/requestedBooks',wagner.invoke(function(User){
		return function(req,res){
			if(req.user==undefined){
				return res.json({error:'Not logged in.'});			
			}
			else{
				// console.log(req.user.bookList);
				res.json({books:req.user.requestedBooks});
			}
		}
	}));
	
	api.post('/book/newbook', wagner.invoke(function(User) {
		return function(req, res) {
			if(req.user._id==undefined){
				res.json({error:"Error"})
			}
			else{
			if(req.user._id == req.body.__id ){
				User.update({ _id: req.user._id }, 
						{ $addToSet: { bookList: req.body } },function(err,done){
							if(err)
								res.send(err);
							res.json({success:'Book was added successfully!'});
						}
				);
			}
			else{
				return res.status(status.UNAUTHORIZED).json({error:'Unauthorized access, your account will be reported'});
			}
			}
		}
	}));
	api.put('/user/me/updateInfo', wagner.invoke(function(User){
		return function(req, res){
			if(req.user._id){
				//console.log(req.body);
				User.update({_id:req.user._id},{$set:{'profile.address':req.body}}, function(err,done){
					// console.log(err);
					if(err){
						res.json({error:'Something went wrong'})
					}
					console.log(done);
					res.json({success:'Success'})
				})
			}
			else{
				return res.status(status.UNAUTHORIZED).json({error:'Unauthorized access, your account will be reported'});	
			}
		}
	}))
	
	api.put('/user/request/:_aid/:_bid', wagner.invoke(function(User){//a: author, b: book
		return function(req, res){
			if(req.user._id){
				if(req.user._id == req.params._aid){
					res.json({success:'Cannot request yourself a book.'})
				}
				else{
					var bid = req.params._bid;
					var pos = 'bookList.$.requestors';
					var obj = {};
					obj[pos] = bid;
					User.update({_id:req.params._aid, 'bookList._id':req.params._bid},{"$set":obj}, function(err, data){
						User.update({_id:req.user._id},{"$addToSet":{requestedBooks:req.params._bid}}, function(err, data){
							res.json({success:"Requested"});
						})
					})
				}
			}
			else{
				return res.status(status.UNAUTHORIZED).json({error:'Unauthorized access, your account will be reported'});	
			}
		}
	}))
	
	api.get('/universe/bookbyid/:_bid', wagner.invoke(function(User){
		return function(req, res){
			User.find({'bookList._id' : req.params._bid},{profile:0, requestedBooks:0, 'bookList.requestors':0, bookList : {$elemMatch : { _id : req.params._bid}}}, function(err,data){
				if(err)
					res.json({error:error});
				else
					res.json({data:data[0].bookList[0]});
			})
		}
	}))
	
	api.get('/user/me/id',wagner.invoke(function(User){
		return function(req,res){
			if(req.user==undefined){
				return res.json({error:'Not logged in.'});			
			}
			else{
				// console.log(req.user.profile);
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
			model : 'Book'
		}, handleOne.bind(null, 'user', res));
	});
	/* Optimize Further */
	api.get('/universe/book/:query', wagner.invoke(function(User, Book) {// done
		return function(req, res) {
			User.find({},{profile:0, _id:0, requestedBooks:0, 'bookList': {$elemMatch: {'info.title': req.params.query}}}, function(err, data){
				res.json({data:data});
			})
		};
	}));
	
	api.delete('/user/book/:id/:__id', wagner.invoke(function(User){// done
		return function(req, res){
			if(req.user._id == req.params.__id){
				User.update({_id:req.params.__id},{$pull:{bookList:{_id:req.params.id}}}, function(err,data){
					if(err)
						res.send(err);
					res.json({success:'The notebook was deleted succesfully'})
				});
			}
			else{
				return res.status(status.UNAUTHORIZED).json({error:'Unauthorized access, your account will be reported'});
			}
		}
	}));
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