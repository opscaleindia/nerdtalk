const fileSystem= require('fs');
const path= require('path');

var lib= function()
{
	//check if a file of specified name and path already exists. if so, execute callback with error. if not, create new one
	this.create= (dir, data, callback) => new Promise((resolve, reject) => fileSystem.open(dir, 'wx', (err, file) => err ? reject(err) : resolve(file)))//check if file exists
		.then((file) => new Promise((resolve, reject) => fileSystem.writeFile(file, data, err => err ? reject(err) : resolve(file))))//write contents into file
		.then((file) => new Promise((resolve, reject) => fileSystem.close(file, err => err ? reject(err) : resolve(file))))//close the opened file
		.then(() => callback(false))//when done call calback function with err= false
		.catch(err => callback(err));//catch all errors and send them back via callback

	//read file and send back raw contents
	this.read= (dir, callback) => fileSystem.readFile(dir, 'utf-8', (err, data) => callback(err, data));

	//update data in a file
	this.update= (dir, data, callback) => new Promise((resolve, reject) => fileSystem.open(dir, 'wx', (err, file) => err ? reject(err) : resolve(file)))
		.then((file) => new Promise((resolve, reject) => fileSystem.truncate(file, err => err ? reject(err) : resolve(file))))
		.then((file) => new Promise((resolve, reject) => fileSystem.writeFile(file, data, err => err ? reject(err) : resolve(file))))
		.then((file) => new Promise((resolve, reject) => fileSystem.close(file, err => err ? reject(err) : resolve(file))))
		.then(() => callback(false))
		.catch(err => callback(err));//catch all errors and send them back via callback


/*	this.update= function(dir, data, callback)
	{
		fileSystem.open(dir, 'r+', function(err, file)
		{
			if(err1)
				callback(err1);//file doesn't exist
			else
			{
				fileSystem.truncate(file, function(err2)
				{
					if(err2)
						callback(err2);//couldn't truncate file
					else
					{
						fileSystem.writeFile(file, data, function(err3)
						{
							if(err3)
								callback(err3);// couldn't write to file
							else
							{
								fileSystem.close(file, function(err4)
								{
									if(err4)
										callback(err4);//couldn't close file
									else
										callback(false);
								});
							}
						});
					}
				});
			}
		});
	};*/

	//removing the file from database
	this.delete= (dir, callback) => fileSystem.unlink(dir, err =>{
		if(err) callback(err);
		else callback(false);
	});
};

module.exports= lib;