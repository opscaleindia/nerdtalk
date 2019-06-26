const express= require('express');
var path= require('path');
var app= new express();

const databaseSystem= require(path.join(__dirname, '/lib/data.js'));
const utility= require(path.join(__dirname, '/lib/utility-functions.js'));
var database= new databaseSystem();

app.use(express.static('public'));

//routes-----------------------------------------------------------------------------------------------------
app.get('/', function(request, response)
{
	response.sendFile(path.join(__dirname, '/public/index.html'));
});

var login_handler= require('./routers/login.js');
app.use('/login', login_handler);

var signup_handler= require('./routers/signup.js');
app.use('/signup', signup_handler);

var OAuth_handler= require('./routers/OAuth.js');
app.use('/OAuth', OAuth_handler);

var tokens_handler= require('./routers/token.js');
app.use('/token', tokens_handler);

var dashboard_handler= require('./routers/dashboard.js');
app.use('/dashboard', dashboard_handler);

var getstream_handler= require('./routers/getstream.js');
app.use('/getstream', getstream_handler);

app.get('*', (request, response) => response.send('whoops'));
app.get('/favicon.ico', (request, response) => response.send('#'));

let interval= setInterval(() => utility.clear_tokens(result => {if(result) console.log("tokens removed!")}),60000);

app.listen(3000, err => console.log( err ? err : "listening on port: 3000"));
//--