const express = require('express');
const path= require('path');
const bodyParser= require('body-parser');
const https = require('https');
const {OAuth2Client} = require('google-auth-library');

const client = new OAuth2Client('187100638059-bmdb2o84d54j32lqmn1r4kh3prg48s5e.apps.googleusercontent.com');

const databaseSystem= require(path.join(__dirname, '../lib/data.js'));
const utility= require(path.join(__dirname, '../lib/utility-functions.js'));

var router = express.Router();
var database= new databaseSystem();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var JSON_parser= bodyParser.json();

router.get('/', (request, response) => response.sendFile(path.join(__dirname, '../public/signup/signup.html')));

router.post('/', JSON_parser, function(request, response)
{
	let post_data= {userID : utility.create_uniqueID(), user_name: request.body.name}

	let post_options = { 
		host: 'localhost', 
		port: 3000,
		path: '/getstream/createUser', 
		method: 'POST',
		headers: { 'Content-Type': "application/json"}
	}

	utility.create_HTTP_request(post_options, (err, streamuser) =>{
		if(err || streamuser === undefined)
		{
			console.log(err);
			response.send(request.body.validationType == 'github' ? '<script>window.alert("unable to create user. Please sign in again"); window.location.href= location.origin + "/signup";</script>'
					: JSON.stringify({"action" : "error", "value" : '/signup', "message" : "unable to create user. Please sign in again"}));
		}
		else
		{
			let user_data= {};
			if(request.body.validationType === "google")
			{
				user_data= {
					email: request.body.email,
					name: request.body.name,
					socialID: post_data.userID,
					image: request.body.image,
					id: request.body.id,
					validationType: request.body.validationType,
				}
			}
			else if(request.body.validationType === "github")
			{
				user_data= {
					email: request.body.email,
					name: request.body.name,
					socialID: post_data.userID,
					image: request.body.image,
					id: request.body.id,
					validationType: request.body.validationType,
				}
			}
			else
			{
				user_data= {
					email: request.body.email,
					name: request.body.name,
					socialID: post_data.userID,
					validationType: request.body.validationType,
					password: utility.hash(request.body.password)
				}
			}

			database.create(path.join(__dirname, "../data/" + request.body.validationType + '/' + user_data.email + ".json"), JSON.stringify(user_data), err => {
				console.log(err.errno == -4075 ? "this account is already registered" : !err ? "created new user" + user_data.name : err);
				
				if(err) 
				{
					if(err.errno == -4075 ) 
					{
						response.send(user_data.validationType == 'github' ? '<script>window.alert("User already exists, please login"); window.location.href= location.origin + "/login";</script>'
						: JSON.stringify({"action" : "redirect", "value" : '/login'}));
					}
					else
					{
						console.log('\x1b[31m%s\x1b[0m', err);
						response.send(JSON.stringify({"action" : "error", "message" : 'Whoops. please try again', "value" : "/signup"}));
					}
				}
				else
				{
					let token= utility.manage_tokens('POST', '/token', result => {
						result= JSON.parse(result);
						if(result.action == 'authenticate')
						{
							response.send(user_data.validationType == 'github' ? '<script>window.alert("signed up sucessfully!"); localStorage.setItem("NerdTalk_authorization", ' + "'" +  result.token + "'" + ' ); window.location.href= location.origin + "/dashboard";</script>' 
								: JSON.stringify({"action" : "create_session", "token" : result.token}));
						}
						else
						{
							console.log('\x1b[31m%s\x1b[0m', result);
							response.send(user_data.validationType == 'github' ? '<script>window.alert("unable to generate token. please try again"); window.location.href= location.origin + "/signup";</script>' 
									: JSON.stringify({"action" : "error", "value" : 'signup', 'message' : "unable to generate token. please try again"}));
						}
					}, JSON.stringify(user_data));
				}
			});
		}
	}, JSON.stringify(post_data));
});


module.exports= router; 