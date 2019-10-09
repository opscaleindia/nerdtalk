const express = require('express');
const path= require('path');
const bodyParser= require('body-parser');
const stream = require('getstream');

const databaseSystem= require(path.join(__dirname, '../lib/data.js'));
const utility= require(path.join(__dirname, '../lib/utility-functions.js'));

var router = express.Router();
var database= new databaseSystem();
var JSON_parser= bodyParser.json();
//initilize client
client = stream.connect('xxxxxxx', 'xxxxxxxxxxxxxx', '54189');

router.post('/token', JSON_parser, (request, response) => {
	console.log(request.body);//generate a user token
	response.send(JSON.stringify({getstreamToken: client.createUserToken(request.body.userID)}));
});

router.post('/createUser', JSON_parser, (request, response) => {
	//create a new nerdtalk user on getstream
	client.user(request.body.userID).getOrCreate({ name: request.body.user_name})
	.then(user_info => response.send(JSON.stringify(user_info.full)))
	.catch(err => console.log(err));
});
 
router.post('/addActivity', JSON_parser, function(request, response)
{
	//add new activity to a users user feed
	var current_user = client.feed('user', request.body.userID);
	var activity = {actor: 'User:' + request.body.actor, verb: request.body.verb, message: request.body.message, object: request.body.object, foreign_id: request.body.foreign_id, time: new Date()};

	current_user.addActivity(activity)
	.then( data => response.send(JSON.stringify(data)))
	.catch(err => response.send(JSON.stringify({'error': err})));

});

router.post('/getfeed', JSON_parser, function(request, response)
{
	//retreve a users timeline or user feed
	var current_user = client.feed(request.body.feedGroup, request.body.userID);
	current_user.get({ limit:10, withRecentReactions: true, withReactionCounts: true})
	.then(successData => response.send(JSON.stringify(successData)))
	.catch(errorData => response.send(JSON.stringify(errorData)));

});

router.post('/follow', JSON_parser, function(request, response)
{

	if(request.body.action === "follow")
	{//folow a pirticular user
		var follower_feed = client.feed('timeline', request.body.followerID);
		follower_feed.follow('user', request.body.followeeID)
		.then(successData => response.send(JSON.stringify(successData)))
		.catch(errorData => response.send(JSON.stringify(errorData)));
	}
	else
	{//unfollow a pirticulat user
		var follower_feed = client.feed('timeline', request.body.followerID);
		follower_feed.unfollow('user', request.body.followeeID)
		.then(successData => response.send(JSON.stringify(successData)))
		.catch(errorData => response.send(JSON.stringify(errorData)));
	}
})

router.get('*', (request, response) => response.send('unauthorized!'));


module.exports= router;
