var mongoose = require('mongoose');

var bookSchema = {
	__id : mongoose.Schema.Types.ObjectId,
	info:{
		date:{
			type:Date
		},
		title : {
			type : String
		},
		description : {
			type : String
		},
		picture:{
			type : String
		},
		isbn:{
			type : String
		},
		available:{
			type : Boolean
		},
		genre:{
			bookType:{
				type : String
			},
			category:{
				type : String
			}
		}
	},
	requestors:[mongoose.Schema.Types.ObjectId],
	trader: mongoose.Schema.Types.ObjectId

}

module.exports = new mongoose.Schema(bookSchema);
module.exports.bookSchema = bookSchema;