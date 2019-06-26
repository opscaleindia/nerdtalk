const express = require('express');
const path= require('path');
const bodyParser= require('body-parser');
const stream = require('getstream');

const databaseSystem= require(path.join(__dirname, '../lib/data.js'));
const utility= require(path.join(__dirname, '../lib/utility-functions.js'));

var router = express.Router();
var database= new databaseSystem();
var JSON_parser= bodyParser.json();
client = stream.connect('zkx3smx8spd3', '9dyd2rqbxuke5cpmh4dhw36fqtx4nwg8gqq3najy6jrpwwwamy3u7vhd6y78m5r9', '54318');

router.post('/token', JSON_parser, (request, response) => {
	console.log(request.body);
	response.send(JSON.stringify({getstreamToken: client.createUserToken(request.body.userID)}));
});

router.post('/createUser', JSON_parser, (request, response) => {
	client.user(request.body.userID).getOrCreate({ name: request.body.user_name})
	.then(user_info => response.send(JSON.stringify(user_info.full)))
	.catch(err => console.log(err));
});
 
router.post('/addActivity', JSON_parser, function(request, response)
{
	var current_user = client.feed('user', request.body.userID);
	var activity = {actor: 'User:' + request.body.actor, verb: request.body.verb, message: request.body.message, object: request.body.object, foreign_id: request.body.foreign_id, time: new Date()};

	current_user.addActivity(activity)
	.then( data => response.send(JSON.stringify(data)))
	.catch(err => response.send(JSON.stringify({'error': err})));

});

router.post('/getfeed', JSON_parser, function(request, response)
{
	/*client.user('john-doe').get()
	.then(user_info => console.log(user_info))
	.catch(err => console.log(err));*/

	var current_user = client.feed(request.body.feedGroup, request.body.userID);

	current_user.get({ limit:10, withRecentReactions: true, withReactionCounts: true})
	.then(successData => response.send(JSON.stringify(successData)))
	.catch(errorData => response.send(JSON.stringify(errorData)));

});

router.post('/follow', JSON_parser, function(request, response)
{

	if(request.body.action === "follow")
	{
		var follower_feed = client.feed('timeline', request.body.followerID);
		follower_feed.follow('user', request.body.followeeID)
		.then(successData => response.send(JSON.stringify(successData)))
		.catch(errorData => response.send(JSON.stringify(errorData)));
	}
	else
	{
		var follower_feed = client.feed('timeline', request.body.followerID);
		follower_feed.unfollow('user', request.body.followeeID)
		.then(successData => response.send(JSON.stringify(successData)))
		.catch(errorData => response.send(JSON.stringify(errorData)));
	}
})

router.get('*', (request, response) => response.send('unauthorized!'));


module.exports= router;