console.log("ready!");
var userID, userName, streamToken, client;

let updateFeed= function()
{
	let get_feed= HTTP_post_request("/getstream/getfeed", {userID : userID, feedGroup : "timeline"});
	get_feed.then(feed_data => {
		console.log(feed_data.results);

		let elements = document.querySelectorAll(".feed");
    	elements.forEach((el) => el.parentNode.removeChild(el));

		feed_data.results.forEach(userInfo => {
			console.log(userInfo);
			let feed= document.getElementById("feed-tempate").cloneNode(true);
			feed.setAttribute("id", userInfo.id);
			feed.setAttribute("class", "feed");
			feed.removeAttribute("hidden");
			feed.querySelector("img").setAttribute("src", document.getElementById("avatar").getAttribute("src"));
			feed.querySelector("h3").innerHTML= userInfo.actor.split(":")[1] + ", posted a " + userInfo.verb;
			feed.querySelector("p").innerHTML= userInfo.message;
			feed.querySelector(".upvote").innerHTML=  userInfo.latest_reactions.upvote ? userInfo.latest_reactions.upvote.length > 0 ? "Upvoted " + userInfo.latest_reactions.upvote.length : "Upvote" : "Upvote";

			if(userInfo.latest_reactions.comment)
			{
				userInfo.latest_reactions.comment.forEach(itm => {
					let new_commentbox= document.createElement("div");
					new_commentbox.setAttribute("id", itm.id);
					new_commentbox.setAttribute("class", "commentItem");
					new_commentbox.innerHTML= '<span class= "commenter">' + itm.user.data.name + '</span> <span class= "comment-text">' + itm.data.message + '</span><br>';
					feed.querySelector(".comments-container").appendChild(new_commentbox);
				})
			}
			
			document.getElementById("container").appendChild(feed);
		})
	});
	get_feed.catch(err => console.log(err));
}

let home= function()
{console.log("home");let elements = document.querySelectorAll(".feed");
    	elements.forEach((el) => el.parentNode.removeChild(el));
	let get_feed= HTTP_post_request("/getstream/getfeed", {userID : userID, feedGroup : "user"});
	get_feed.then(feed_data => {
		console.log(feed_data.results);

		

		feed_data.results.forEach(userInfo => {
			console.log(userInfo);
			let feed= document.getElementById("feed-tempate").cloneNode(true);
			feed.setAttribute("id", userInfo.id);
			feed.setAttribute("class", "feed");
			feed.removeAttribute("hidden");
			feed.querySelector("img").setAttribute("src", document.getElementById("avatar").getAttribute("src"));
			feed.querySelector("h3").innerHTML= userInfo.actor.split(":")[1] + ", posted a " + userInfo.verb;
			feed.querySelector("p").innerHTML= userInfo.message;
			feed.querySelector(".upvote").innerHTML=  userInfo.latest_reactions.upvote ? userInfo.latest_reactions.upvote.length > 0 ? "Upvoted " + userInfo.latest_reactions.upvote.length : "Upvote" : "Upvote";

			if(userInfo.latest_reactions.comment)
			{
				userInfo.latest_reactions.comment.forEach(itm => {
					let new_commentbox= document.createElement("div");
					new_commentbox.setAttribute("id", itm.id);
					new_commentbox.innerHTML= '<span class= "commenter">' + itm.user.data.name + '</span> <span class= "comment-text">' + itm.data.message + '</span><br>';
					feed.querySelector(".comments-container").appendChild(new_commentbox);
				})
			}
			
			document.getElementById("container").appendChild(feed);
		})
	});
	get_feed.catch(err => console.log(err));
}

let follow= function(folow_user)
{
	let get_feed= HTTP_post_request("/getstream/follow", {action: "follow", followerID : userID, followeeID : "maya_1"});
	get_feed.then(result => console.log(result));
	get_feed.then(err => console.log(err));
}

let unfollow= function(folow_user)
{
	let get_feed= HTTP_post_request("/getstream/follow", {action: "unfollow", followerID : userID, followeeID : "maya_1"});
	get_feed.then(result => console.log(result));
	get_feed.then(err => console.log(err));
}

document.getElementById("create-post").onclick= function(event)
{
	let get_feed= HTTP_post_request("/getstream/addActivity", {userID : userID, actor: userName, verb : "tweet", message : document.getElementById("text-box").value, object : "obj_1", foreign_id : "foreignid_1"});
	get_feed.then(activity_data => {
		console.log(activity_data)
		updateFeed();
		/*let feed= document.getElementById("feed-tempate").cloneNode(true);
		feed.removeAttribute("id");
		feed.removeAttribute("hidden");
		feed.querySelector("img").setAttribute("src", document.getElementById("avatar").getAttribute("src"));
		feed.querySelector("h3").innerHTML= document.getElementById("actor").innerHTML;
		feed.querySelector("p").innerHTML= document.getElementById("text-box").value;
		document.getElementById("container").appendChild(feed);*/
	});
	get_feed.catch(err => console.log(err));
}

let initilze= function()
{
	HTTP_post_request('/token/validate', {"token" : localStorage.getItem("NerdTalk_authorization")})
	.then(result => {
		console.log(result);
		if(result.action == "validated")
		{
			HTTP_post_request('/getstream/token', {userID: result.value.socialID})
			.then(res => {
				streamToken= res.getstreamToken;
				userID= result.value.socialID;
				userName= result.value.name;
				document.getElementById("avatar").src= result.value.image;
				document.getElementById("actor").innerHTML= result.value.name;
				client = stream.connect('zkx3smx8spd3', streamToken,  '54318');
				updateFeed();
			})
			.catch(err => console.log(err));
		}
		else
		{
			console.log(result.message);
			window.location.href= location.origin + '/login';
		}
	})
	.catch(er => console.log(er));

}

let upvote= function(event)
{
	client.reactions.add("upvote", event.parentElement.id)
	.then(result => event.innerHTML= "Upvoted")
	.catch(err => console.log({err : err}));
}

let comment= function(target)
{
	target.parentElement.querySelector("textarea").removeAttribute("hidden");
	target.parentElement.querySelectorAll("button")[2].removeAttribute("hidden");
}

let submit_comment= function(target)
{
	client.reactions.add("comment", target.parentElement.parentElement.id, {message : target.parentElement.querySelector("textarea").value})
	.then(result => {
		console.log(result);
		let commentElt= document.getElementById("comment").cloneNode(true);
		commentElt.setAttribute("id", result.data.id);
		commentElt.querySelector("span").innerHTML= result.user.data.name;
		commentElt.querySelectorAll("span")[1].innerHTML= result.data.message;
		document.getElementById("comment").parentElement.appendChild(commentElt);
	})
	.catch(err => console.log({err : err}));
}

let HTTP_post_request= function(path, payload)
{
	postsettings= 
	{
		method: "POST", mode: "cors", cache: "no-cache",
		headers:{"Content-Type": "application/json; charset=utf-8"},
		body: JSON.stringify(payload)
	};
	
	return new Promise((resolve, reject) => {
		fetch(path, postsettings)
		.then(raw => raw.json())
		.then(data => resolve(data))
		.catch(err => reject(err));
	})
}

initilze();