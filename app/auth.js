function setupAuth(User, app) {
	var passport = require('passport');
	var FacebookStrategy = require('passport-facebook').Strategy;
	var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
	TwitterStrategy = require('passport-twitter').Strategy;
	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});
	passport.deserializeUser(function(id, done) {
		User.findOne({
			_id : id
		}).exec(done);
	});
	passport.use(new GoogleStrategy({

	        clientID        : '38091033467-rgm3haomjtqqlk5s8abt0kgrms4pv29n.apps.googleusercontent.com',
	        clientSecret    : 'ryRG7g1p1TN0IAtGqVg9Fysc',
	        callbackURL     : 'http://localhost:8181/auth/google/callback',

	    },
	    function(token, refreshToken, profile, done) {

	        // make the code asynchronous
	        // User.findOne won't fire until we have all our data back from Google
	        process.nextTick(function() {

	            // try to find the user based on their google id
	            User.findOne({ 'google.id' : profile.id }, function(err, user) {
	                if (err)
	                    return done(err);

	                if (user) {

	                    // if a user is found, log them in
	                    return done(null, user);
	                } else {
	                    // if the user isnt in our database, create a new user
	                    var newUser          = new User();

	                    // set all of the relevant information
	                    newUser.profile.data.id    = profile.id;
	                    newUser.profile.data.token = token;
	                    newUser.profile.name  = profile.displayName;
	                    newUser.profile.data.email = profile.emails[0].value; // pull the first email

	                    // save the user
	                    newUser.save(function(err) {
	                        if (err)
	                            throw err;
	                        return done(null, newUser);
	                    });
	                }
	            });
	        });

	    }));

	passport.use(new TwitterStrategy({

        consumerKey     : 'hK6eaHbP16RnGEHgPAttdR0hm',
        consumerSecret  : 'uULlyaXZEk0lzojRHf7MYFJZyVJJUYQzTsVyDw6SBNMWhGJMLK',
        callbackURL     : 	"http://127.0.0.1:8181/auth/twitter/callback"

    },
    function(token, tokenSecret, profile, done) {
        process.nextTick(function() {
        	
            User.findOne({ 'profile.data.id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);
                if (user) {
                    return done(null, user); 
                } else {
                    var newUser                 = new User();
                    newUser.profile.data.id          = profile.id;
                    newUser.profile.data.token       = token;
                    newUser.profile.data.username    = profile.username;
                    newUser.profile.name = profile.displayName;
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });

    });

    }));

	passport.use(new FacebookStrategy(
			{
				clientID : '273119373025709',
				clientSecret : 'a8c74dc77aff9972ca2ad0d6e969a0e3',
				callbackURL : "http://localhost:8181/auth/facebook/callback",
				"profileFields" : [ "id", "email", "displayName", "gender",
						"location" ]
			}, function(accessToken, refreshToken, profile, done) {
				if (!profile.emails || !profile.emails.length) {
					return done('No emails associated with this account. . .');
				}
				User.findOneAndUpdate({
					'profile.data.outh' : profile.id
				}, {
					$set : {
						'profile.data.email' : profile.emails[0].value,
						'profile.name' : profile.displayName,
						'profile.picture' : 'http://graph.facebook.com/'
								+ profile.id.toString() + '/picture?type=large'
					}
				}, {
					'new' : true,
					upsert : true,
					runValidators : true
				}, function(error, user) {
					done(error, user);
				});
			}));
	// Express middlewares
	app.use(require('express-session')({
		secret : 'this is a secret',
		resave : true,
		saveUninitialized : true
	}));
	app.use(passport.initialize());
	app.use(passport.session());

	// Express routes for auth

	app
			.get(
					'/auth/facebook',
					function(req, res, next) {
						var redirect = encodeURIComponent(req.query.redirect
								|| '/');
						passport
								.authenticate(
										'facebook',
										{
											scope : [ 'email', 'user_location',
													'user_birthday',
													'public_profile' ],
											callbackURL : 'http://localhost:8181/auth/facebook/callback?redirect='
													+ redirect
										})(req, res, next);
					});

	app.get('/auth/facebook/callback', function(req, res, next) {
		var url = 'http://localhost:8181/auth/facebook/callback?redirect='
				+ encodeURIComponent(req.query.redirect);
		passport.authenticate('facebook', {
			callbackURL : url
		})(req, res, next);
	}, function(req, res) {
		res.redirect(req.query.redirect);
	});
	app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
    app.get('/auth/google/callback',
            passport.authenticate('google', {
                    successRedirect : '/profile',
                    failureRedirect : '/'
            }));
	app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));
	app.get('/auth/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
}
module.exports = setupAuth;