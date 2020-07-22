const express = require('express');
const path= require('path');
const bodyParser= require('body-parser');
const https = require('https');

const databaseSystem= require(path.join(__dirname, '../lib/data.js'));
const utility= require(path.join(__dirname, '../lib/utility-functions.js'));

var router = express.Router();
var database= new databaseSystem();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var JSON_parser= bodyParser.json();

router.get('/', (request, response) => response.sendFile(path.join(__dirname, '../public/dashboard/dashboard.html')));


module.exports= router;