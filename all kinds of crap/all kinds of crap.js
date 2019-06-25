/*https_request.post({
    url: 'https://github.com/login/oauth/access_token?' + qs.stringify({
        client_id: 'f6dc434ee0ebe8a16973',
        client_secret: '29aa31a9e1f5bed6e6788a63824afd5f4b2d62c3',
        code: request.query.code})
	},
  (error, res, bdy) => {
    // The response will contain your new access token
    // this is where you store the token somewhere safe
    // for this example we're just storing it in session
    console.log(qs.parse(bdy));
    console.log(res);
    response.send(qs.parse(bdy))
  }
);

/*superagent
.get('https://api.github.com/user')
.set('Authorization', 'token ' + chunk.access_token)
.set('User-Agent', 'NerdTak')
.then(resp => {
    console.log(resp.body);
}).catch(err => console.log(err));*/


/*// Build the post string from an object
//backup of github authentication
var post_data = qs.stringify({ 
    client_id: 'f6dc434ee0ebe8a16973', 
    client_secret: '29aa31a9e1f5bed6e6788a63824afd5f4b2d62c3', 
    code: request.query.code
});

// An object of options to indicate where to post to
var post_options = { host: 'github.com', path: '/login/oauth/access_token', method: 'POST',
    headers: { 
    'Content-Type': 'application/x-www-form-urlencoded', 
    'Content-Length': Buffer.byteLength(post_data),
    'Accept' : 'application/json'}
};

// Set up the request
var post_req = https.request(post_options, function(post_res)
{
    post_res.setEncoding('utf8');
    post_res.on('data', function(chunk)
    {
        
        chunk= JSON.parse(chunk);
        console.log("tooken: ", chunk.access_token);

        return new Promise(function(resolve, reject)
        {
            let get_options = {
                host: "api.github.com",
                path: "/user",
                method: "GET",
                headers: {'Authorization' : 'token ' + chunk.access_token, 'User-Agent': 'Mozilla/5.0'}
            };
            
            let get_req = https.request(get_options, function(get_res)
            {  
                get_res.setEncoding('utf8');
                get_res.on('data', data => {
                    resolve(data)

                });
            });
            get_req.on('error', e => reject(e));
            get_req.end();
        })
        .then(user_data => response.send(user_data))
        .catch(err => console.log('error', e));

    });
});

// post the data
post_req.on('error', e => console.log('error', e));
post_req.end(post_data);*/

//------------------------------------------------------------------------------------
//google OAuth get request
/*router.post('/google', urlencodedParser, function(request, response)
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

        var options = {
            host: "oauth2.googleapis.com",
            path: "/tokeninfo?id_token=" + request.body.idtoken,
            method: "GET",
            headers: {"Content-Type": "application/json; charset=utf-8"}
        };

        var req = https.request(options, function(res)
        {  
            res.on('data', data =>
            {
                console.log(JSON.parse(data));
                data= JSON.parse(data);
                let user_data= {
                    email: data.email,
                    name: data.name,
                    id: data.sub,
                    image: data.picture,
                    validationType: data.iss
                }

                database.create(path.join(__dirname, "../data/" + user_data.email + ".json"), JSON.stringify(user_data), err => {
                    response.send(err ? err : "logged in as " + user_data.name);
                });
            });
        });

        req.on('error', e =>console.log(e));
        req.end();

    }
    verify().catch(console.error);
});*/