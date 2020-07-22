const crypto= require('crypto');
const https = require('https');
const http = require('http');
const fileSystem= require('fs');
const path= require('path');


var utility= {};

utility.hash= function(password)
{//hash the password using SHA256 algorithm and send back the hashed password. we do not store the plain password
	var hash= crypto.createHmac('sha256', 'thisisasecretkey').update(password).digest('hex');
	return hash;
}

utility.JSON_parse= function(buffer)//try to parse JSON without causing errors
{
	try{
		let obj= JSON.parse(buffer);
		return boj;
		}
	catch(err)
	{
		console.log("couldn't parse json!"); 
		return false;
	};
}

utility.create_token= function()//creating a 20 charracter random token
{
	var length= 20;
	var chars= "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	var token= "";
	for(var i= 0; i < length; i++)
		token= token + chars[Math.floor(Math.random() * chars.length)];
	return token;
}

utility.create_uniqueID= function()//creating a 10 char random ID
{
    var length= 10;
    var chars= "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var token= "";
    for(var i= 0; i < length; i++)
        token= token + chars[Math.floor(Math.random() * chars.length)];
    return token;
}

utility.validate_email= function(email) //validate an email.
{
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

utility.create_HTTPS_request= function(options, callback, payload= null)
{
	return new Promise(function(resolve, reject)
    {     
    	let reqst = https.request(options, (resp) => {  
            resp.setEncoding('utf8');
            var buffer= "";
            resp.on('data',  stream => buffer= buffer + stream);
            resp.on('end', () => resolve(buffer));
        });
        reqst.on('error', err => reject(err));
        reqst.end(payload);
    })
    .then(d => callback(false, d))
    .catch(err => callback(err, undefined));
}

utility.create_HTTP_request= function(options, callback, payload= null)
{
	return new Promise(function(resolve, reject)
    {     
    	let reqst = http.request(options, (resp) => {  
            resp.setEncoding('utf8');
            var buffer= "";
            resp.on('data',  stream => buffer= buffer + stream);
            resp.on('end', () => resolve(buffer));
        });
        reqst.on('error', err => reject(err));
        reqst.end(payload);
    })
    .then(d => callback(false, d))
    .catch(err => callback(err, undefined));
}

utility.manage_tokens= function(method, path, callback, payload= null)
{

   let options = { 
        host: 'localhost', 
        port: 3000,
        path: path, 
        method: method,
        headers: { 'Content-Type': "application/json"}
    }

    return new Promise(function(resolve, reject)
    {     
        let reqst = http.request(options, (resp) => {  
            resp.setEncoding('utf8');
            var buffer= "";
            resp.on('data',  stream => buffer= buffer + stream);
            resp.on('end', () => resolve(buffer));
        });
        reqst.on('error', err => reject(err));
        reqst.end(payload);
    })
    .then(d => callback(d))
    .catch(err => callback(err));
}

utility.clear_tokens= function(callback)//this function checks database and removes all expired tokens
{
    let items, i, removed_tokens= 0;
    fileSystem.readdir(path.join(__dirname, "../data/tokens/"), (err, Files) => {//get a list of all token files in the tokens database
        if(err || Files.length <= 0) callback(err);
        else
        { 
            items= Files;
            i= items.length - 1;
            recursive_remove(removed_tokens);//check if token is invalid and remove. 
            callback(removed_tokens);
        }
    });

    function recursive_remove(removed_tokens)
    {//this is recursive function. it is executed once for every token file
        fileSystem.readFile(path.join(__dirname, '/../data/tokens/' + items[i]), 'utf-8', function(err, data)
        {//read the token file
            if(err) console.log(err);
            else
            {
                data= JSON.parse(data);
                if(data.validity < Date.now())//check if token is still valid
                {
                    fileSystem.unlink(path.join(__dirname, '/../data/tokens/' + items[i]), function(err)
                    {//delete token
                        if(err) console.log(err);
                        else removed_tokens++;
                        i--;
                        if(i > 0) recursive_remove(removed_tokens);//check the next token file
                    });
                }
            }
        });
    }
};


module.exports= utility;