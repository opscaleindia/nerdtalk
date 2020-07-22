//ZCoU5pq2PacxdJN
function onSignIn(googleUser)
{
	var profile = googleUser.getBasicProfile();
	var id_token=  googleUser.getAuthResponse().id_token;
	gapi.auth2.getAuthInstance().disconnect();

	console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
	console.log('Name: ' + profile.getName());
	console.log('Image URL: ' + profile.getImageUrl());
	console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'http://localhost:3000/OAuth/google');
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.onload = function()
	{

		console.log(JSON.parse(xhr.responseText));
		resp_data= JSON.parse(xhr.responseText);

		switch(resp_data.action)
		{
			case "create_session" : {
				localStorage.setItem("NerdTalk_authorization", resp_data.token);
				window.alert('login in complete!');
				window.location.href= location.origin + '/dashboard';
				break;
			}
			case "redirect" : {
				window.location.href= location.origin + '/' + resp_data.value;
				break;
			}
			case "invalid" : {
				window.alert(resp_data.value);
				break;
			}
			case "error" : {
				window.alert(resp_data.message);
				window.location.href= location.origin + '/' + resp_data.value;
				break;
			}
		}
		
	};
	xhr.send('idtoken=' + id_token + '&action=login');
}

function signOut() 
{
	var auth2 = gapi.auth2.getAuthInstance();
	auth2.signOut().then(function () {
	  console.log('User signed out.');
	});
}

//------------------------------------------------------------------------

document.getElementById("login_submit").onclick= function(e)
{
	let settings= 
	{
		method: "POST", mode: "cors", cache: "no-cache",
		headers:{"Content-Type": "application/json; charset=utf-8"},
		body: JSON.stringify({"email" : document.getElementById("email").value, 
			"password": document.getElementById("password").value,
			"validationType" : "nerdtalk"
		})
	};
	fetch("/login", settings)
	.then(response => response.json())
	.then(resp_data => {

		console.log(resp_data);

		switch(resp_data.action)
		{
			case "create_session" : {
				localStorage.setItem("NerdTalk_authorization", resp_data.token);
				window.alert('login in complete!');
				window.location.href= location.origin + '/dashboard';
				break;
			}
			case "redirect" : {
				window.location.href= location.origin + '/' + resp_data.value;
				break;
			}
			case "invalid" : {
				window.alert(resp_data.value);
				break;
			}
			case "error" : {
				window.alert(resp_data.message);
				window.location.href= location.origin + '/' + resp_data.value;
				break;
			}
		}
	})
	.catch(error => console.log(error));
}

//window.addEventListener("unload", function(){localStorage.removeItem("authorization:" + window.location.host);});