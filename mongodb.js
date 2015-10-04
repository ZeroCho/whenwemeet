/**
 * Created by Zero on 2015-10-03.
 */
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://zero:Wpfhsms0!@ds031873.mongolab.com:31873/heroku_lhdjlrwx';
var mongoClient = MongoClient.connect(url);
module.exports = mongoClient;