const express = require('express');
const path= require('path');
const bodyParser= require('body-parser');

const databaseSystem= require(path.join(__dirname, '../lib/data.js'));
const utility= require(path.join(__dirname, '../lib/utility-functions.js'));

var router = express.Router();
var database= new databaseSystem();
var JSON_parser= bodyParser.json();

router.post('/validate', JSON_parser, function(request, response)
{//check if a token is expired or not
	database.read(path.join(__dirname, "../data/tokens/" + request.body.token + ".json"), (err, token_data) =>
	{
		if(err)
		{
			console.log('\x1b[31m%s\x1b[0m', err);
			response.send(JSON.stringify({"action" : "error", "value" : "login", "message" : "server error, couldn't validate token!"}));
		}
		else
		{
			token_data= JSON.parse(token_data);		
			if(Date.now() < token_data.validity)
			{
				database.read(path.join(__dirname, "../data/" + token_data.validationType + "/" + token_data.email + ".json"), (err, user_data) => {
					if(err)
					{
						console.log('\x1b[31m%s\x1b[0m', err);
						response.send(JSON.stringify({"action" : "error", "value" : err, "message" : "server error, couldn't find user"}));
					}
					else response.send(JSON.stringify({"action" : "validated", "value" : JSON.parse(user_data)}));
				});
			}
			else response.send(JSON.stringify({"action" : "expired", "value" : "login", "message" : "session expired. Please login again!"}));

		}
	});
});

router.post('/', JSON_parser, function(request, response)
{//generate a new token
	let token= utility.create_token();
	var token_data= {};
	token_data.email= request.body.email;
	token_data.validationType= request.body.validationType;
	token_data.token= token;
	token_data.validity= Date.now() + (1000 * 60 * 30);//token validity is upto 10 minutes from creation

	database.create(path.join(__dirname, "../data/tokens/" + token + ".json"), JSON.stringify(token_data), function(err)
	{//save token and validity information in a database file
		response.end(err ? JSON.stringify({"action" : "error", "message" : "Error!, please try again later"}) : JSON.stringify({"action" : "authenticate", "token": token}));
		if(err) console.log('\x1b[31m%s\x1b[0m', err);
	});
});

router.put('/', JSON_parser, function(request, response)
{
	//extend token validity by 30 minutes
	database.read(path.join(__dirname, "../data/tokens/" + request.body.token + ".json"), (err, token_data) =>
	{
		if(err)
		{
			console.log('\x1b[31m%s\x1b[0m', err);
			response.send(JSON.stringify({"action" : "error", "value" : err, "message" : "server error, couldn't update token!"}));
		}
		else
		{
			token_data= JSON.stringify(token_data);
			token_data.validity= token_data.validity + (1000 * 60 * 30);
			database.update(path.join(__dirname, "../data/tokens/" + request.body.token + ".json"), JSON.stringify(token_data), function(err)
			{//tokens validity is increased by 10 minutes from now
				if(err)
				{
					console.log('\x1b[31m%s\x1b[0m', err);
					response.send(JSON.stringify({"action" : "error", "value" : err, "message" : "server error, couldn't update token!"}));
				}
				else
					response.end(JSON.stringify({"action" : "authenticate", "token": token}));

			});
		}
	});
});

router.delete('/', JSON_parser, function(request, response)
{
	database.delete(path.join(__dirname, "../data/tokens/" + request.body.token + ".json"), function(err)
	{//removing the token file from database
		if(err)
		{
			console.log('\x1b[31m%s\x1b[0m', err);
			response.end(JSON.stringify({"action" : "error", "value" : err, "message" : "server error, couldn't delete token!"}));
		}
		else
			response.end(JSON.stringify({"message" : "token sucessfully deleted!"}));
	});
});

module.exports= router;