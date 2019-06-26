const express = require('express');
const path= require('path');
const bodyParser= require('body-parser');
const https = require('https');
const http = require('http');
const qs = require('querystring');
const utility= require(path.join(__dirname, '../lib/utility-functions.js'));
//gogle oauth client keys
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client('187100638059-bmdb2o84d54j32lqmn1r4kh3prg48s5e.apps.googleusercontent.com');
//github client keys
const clientID = 'f6dc434ee0ebe8a16973'
const clientSecret = '29aa31a9e1f5bed6e6788a63824afd5f4b2d62c3'

var router = express.Router();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var JSON_parser= bodyParser.json();

router.get('/github', urlencodedParser, function(request, response)
{//get oauth code from url and post to github in exchange for token
	var post_data = qs.stringify({ 
		client_id: clientID, 
		client_secret: clientSecret, 
		code: request.query.code,
		scope: 'user:email'
	});

	var post_options = { host: 'github.com', path: '/login/oauth/access_token', method: 'POST',
		headers: { 
		'Content-Type': 'application/x-www-form-urlencoded', 
		'Content-Length': Buffer.byteLength(post_data),
		'Accept' : 'application/json'}
	};

	utility.create_HTTPS_request(post_options, (err, chunk) => {
		if(err) console.log(err);
		else
		{
			let get_options = {
		        host: "api.github.com",
		        path: "/user",
		        method: "GET",
		        headers: {'Authorization' : 'token ' + JSON.parse(chunk).access_token, 'User-Agent': 'Mozilla/5.0'}
		    };
			utility.create_HTTPS_request(get_options, (err, userdata) => {
				userdata= JSON.parse(userdata)//if valid tiken received send to sign up page to finish sign up
				if(userdata.email === null || userdata.email === undefined)
					response.send(userdata);
				else
				{
					let post_data= {
						email: userdata.email,
						name: userdata.login,
						id: userdata.id,
						image: userdata.avatar_url,
						validationType: 'github'
					}

			    	let post_options = { 
						host: 'localhost', 
						port: 3000,
						path: '/' + (request.query.location == 'login' ? 'login' : 'signup'), 
						method: 'POST',
						headers: { 
							'Content-Type': "application/json"
						}
					}

					utility.create_HTTP_request(post_options, (err, dat) => {
						if(err) console.log(err);
						response.send(dat);
					}, JSON.stringify(post_data));
				}
			});
		}
	}, post_data);

});

router.get('/github/login', urlencodedParser, (request, response) => response.redirect('/OAuth/github?code=' + request.query.code + '&location=login'));


router.post('/google', urlencodedParser, function(request, response)
{
	async function verify()
	{
		const ticket = await client.verifyIdToken({
			idToken: request.body.idtoken, 
			audience: '187100638059-bmdb2o84d54j32lqmn1r4kh3prg48s5e.apps.googleusercontent.com',  
			// Specify the CLIENT_ID of the app that accesses the backend
		});
		const payload = ticket.getPayload();
		const userid = payload['sub'];

		var get_options = {
			host: "oauth2.googleapis.com",
			path: "/tokeninfo?id_token=" + request.body.idtoken,
			method: "GET",
			headers: {"Content-Type": "application/json; charset=utf-8"}
		};

		utility.create_HTTPS_request(get_options, (err, userdata) => {
			userdata= JSON.parse(userdata);
			
			let post_data= {
				email: userdata.email,
				name: userdata.name,
				id: userdata.sub,
				image: userdata.picture,
				validationType: 'google'
			}

	    	let post_options = { 
				host: 'localhost', 
				port: 3000,
				path: '/' + request.body.action, 
				method: 'POST',
				headers: { 
					'Content-Type': "application/json"
				}
			}

			utility.create_HTTP_request(post_options, (err, dat) => {
				//console.log(err ? err : dat);
				response.send(err ? err : dat);
			}, JSON.stringify(post_data));

		});

	}
	verify().catch(console.error);
});

module.exports= router; 