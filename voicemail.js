var net = require('net');
var fs = require('fs');
//var _ = require('underscore');
var port = 2000;
var ejs = require('ejs');


/////Tried to get ejs to work in this way but couldn't figure it out
/////kept getting an error message related to the JSON.parse line
/////I'm running this function at the end of each input branch
/////(addendum)Got it to work by adding a command in an else/if 
	// var ejsFunction = function ejsFunction(){	
	// fs.readFile('./voicemail.json', 'utf8', function(err,data){
	// var parsedMessages = JSON.parse(data);
	// var template = fs.readFileSync('./voicemail.html', 'utf8');
	// var render = ejs.render(template, {array: parsedMessages});
	// fs.writeFileSync('textMessages.html', render);
	// });
	// }

var server = net.createServer(function(connection){
	console.log('connected to client');
	connection.setEncoding('utf8');
	//counter for message ID
	var counter = 0;
	
	connection.on('data', function(userInput){
//cleans user input
		var cleanedInput = userInput.trim().split(" ");
		// if (cleanedInput[0].trim() === "password"){
		// 		connection.write("password correct!");
		// 		console.log(cleanedInput[0].trim());
		
		fs.readFile('./voicemail.json', 'utf8', function(err, data){
			var parsed = JSON.parse(data);
////adding messages
			if (cleanedInput[0] === "add"){
			var command = cleanedInput[0];
			var name = cleanedInput[1];
/////taking out first two index positions and removing commas			
			var message = cleanedInput.slice(2, cleanedInput.length + 1).join().replace(/,/g, " ");
			console.log(message);

			messageObj = {
				name: name,
				message: message,
				id: counter
			}
			counter++;
			parsed.push(messageObj);
			var stringedMessage = JSON.stringify(parsed);
				fs.writeFile('./voicemail.json', stringedMessage, function(){
				})//end of fs.writeFile
			//ejsFunction();
			} else if (cleanedInput[0] === "list"){
				for (var i = 0; i < parsed.length; i++){
					connection.write("From: " + parsed[i].name + "\n");
					connection.write('Message number: ' +parsed[i].id +"\n");
					connection.write(parsed[i].message + "\n");
				}
			} else if (cleanedInput[0] === "deleteAll"){
/////delete all by writing empty array into JSON file				
				var emptyArray = []
				counter = 0;
				var stringed = JSON.stringify(emptyArray);
				fs.writeFile('./voicemail.json', stringed, function(){
					connection.write("all messages have been deleted");
				})
				// ejsFunction();
			} 
			else if (cleanedInput[0] === "delete"){				
/////delete single object by looping backwards through array and checking
				var toDelete = cleanedInput[1];
				for(var i = parsed.length-1; i>=0; i--) {
    				if( parsed[i].id == toDelete) {
    					parsed.splice(i,1);
					}
				}
				console.log(parsed);
				var stringed = JSON.stringify(parsed);
				connection.write("New Message List: " + stringed)
				fs.writeFile('./voicemail.json', stringed, function(){})
				// ejsFunction();
			} else if (cleanedInput[0] === "html"){
/////writes out to HTML file				
				fs.readFile('./voicemail.json', 'utf8', function(err,data){
				var parsedMessages = JSON.parse(data);
				var template = fs.readFileSync('./template.html', 'utf8');
				var render = ejs.render(template, {array: parsedMessages});
				fs.writeFileSync('textMessages.html', render);
				});//end of "html" readFile
			}
		})//end of fs.readFile
	})//end of on.data
})//end of net.createServer

server.listen(port, function(){
	console.log('server up and listening');
})




