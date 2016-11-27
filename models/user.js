var mongoose = require('mongoose');
var Todo = require('./todo');

var userSchema={
	profile:{
		name:{
			type:String
		},
		picture:{
			type:String
		},
		address:{
			city:{
				type:String
			},
			state:{
				type:String
			},
			about:{
				type:String
			}
		},
		gender:{
			type:String
		},
		data:{
			email:{
				type:String
			},
			username:{
				type:String
			}
		}
	},
	todoList:[Todo.todoSchema]
};

module.exports = new mongoose.Schema(userSchema);
module.exports.userSchema = userSchema;