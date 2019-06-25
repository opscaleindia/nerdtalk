const express = require('express');
const path= require('path');
const http = require('http');
const bodyParser= require('body-parser');
var JSON_parser= bodyParser.json();

const databaseSystem= require(path.join(__dirname, '../lib/data.js'));

var router = express.Router();
var database= new databaseSystem();

router.get('/', (request, response) => {

	let user_data= {
		email: "@dhsakld",
		name: "dsad",
		id: 12344,
		image: "asdasdadasdsadsadsadsada",
		validationType: "goosdsdsgle"
	}

	database.create(path.join(__dirname, "../data/" + user_data.id), JSON.stringify(user_data), err => {
		response.send(err ? err : "Works!!!");
	});

});

router.get('/req', (request, response) => {

	return new Promise(function(resolve, reject)
    {     
    	var post_options = { 
			host: 'localhost', 
			port: 3000,
			path: '/test/req', 
			method: 'POST',
			headers: { 
				'Content-Type': "application/json"
			}
		}

    	var post_req= http.request(post_options, function(post_res)
		{
			var buffer= "";
			post_res.on('data',  function(stream){buffer= buffer + stream;});
			post_res.on('end', function()
			{
				buffer= JSON.parse(buffer);
				response.end(JSON.stringify({'Token' : buffer.Token}));
			});
		});
		var post_data= {'name' : 'jack'};
		post_req.end(JSON.stringify(post_data));
    })
    .then(d => response.send(d))
    .catch(err => response.send('err'));

});

router.post('/req', JSON_parser, (request, response) => console.log(request.body));

module.exports= router;