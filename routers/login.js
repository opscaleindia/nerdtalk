const express = require('express');
const path= require('path');
const bodyParser= require('body-parser');
const https = require('https');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client('xxxxx-xxxxxxxxxx.apps.googleusercontent.com');

const databaseSystem= require(path.join(__dirname, '../lib/data.js'));
const utility= require(path.join(__dirname, '../lib/utility-functions.js'));

var router = express.Router();
var database= new databaseSystem();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var JSON_parser= bodyParser.json();

router.get('/', (request, response) => response.sendFile(path.join(__dirname, '../public/login/login.html')));

router.post('/', JSON_parser, function(request, response)
{//check if user file exists. if so read its contents
	database.read(path.join(__dirname, "../data/" + request.body.validationType + '/' + request.body.email + ".json"), (err, user_info) => {
		if(err)
		{	
			if(err.errno == -4058)
			{//if file doesnt exist.  rediret to signe in page
				response.send(request.body.validationType === "github" ? '<script>window.alert("user does not exist. please sign up"); window.location.href= location.origin + "/signup";</script>'
				: JSON.stringify({"action" : "error", "value" : 'signup', "message" : "user does not exist. please sign up"}));
			}
			else
			{
				console.log(err);
				response.send(JSON.stringify({"action" : "error", "message" : 'whoops. Pease try again', "value" : "login"}));
			} 
		}
		else
		{//user data sucessfully retreved
			user_info= JSON.parse(user_info);
			let token= utility.manage_tokens('POST', '/token', result => {
				//send user data based on authenticatcion type
				result= JSON.parse(result);
				if(result.action == 'authenticate')
				{
					if(request.body.validationType === "google")
					{
						response.send(user_info.id === request.body.id ? JSON.stringify({"action" : "create_session", "token" : result.token}) 
							: JSON.stringify({"action" : "invalid", "value" : 'Invalid credentials. please try again'}));
					}
					else if(request.body.validationType === "github")
					{
						response.send(user_info.id === request.body.id ? '<script>window.alert("Logged in sucessfully!"); localStorage.setItem("NerdTalk_authorization", ' + "'" +  result.token + "'" + ' ); window.location.href= location.origin + "/dashboard";</script>' 
							: '<script>window.alert("invalid credentias. please try again"); window.location.href= location.origin + "/login";</script>');
					}
					else
					{
						if(user_info.password === utility.hash(request.body.password) && user_info.email === request.body.email) response.send(JSON.stringify({"action" : "create_session", "token" : result.token}));
						else response.send(JSON.stringify({"action" : "invalid", "value" : 'Invalid credentials. please try again'}));
					}	
				}
				else
				{
					console.log('\x1b[31m%s\x1b[0m', result);
					response.send(request.body.validationType == 'github' ? '<script>window.alert("unable to generate token. please try again"); window.location.href= location.origin + "/signup";</script>' 
							: JSON.stringify({"action" : "error", "value" : 'signup', 'message' : "unable to generate token. please try again"}));
				}
			}, JSON.stringify(request.body));		
		}
	});
});


module.exports= router;
