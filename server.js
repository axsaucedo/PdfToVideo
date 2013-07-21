//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , fs = require('fs')
    , port = (process.env.PORT || 8081)
	, pandoc = require('pdc')
	, nlp = require('nlp-node');
	
//Setup Express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(server.router);
});

//setup the errors
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', { locals: { 
                  title : '404 - Not Found'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX' 
                },status: 404 });
    } else {
        res.render('500.jade', { locals: { 
                  title : 'The Server Encountered an Error'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX'
                 ,error: err 
                },status: 500 });
    }
});
server.listen(port);

//Setup Socket.IO
var io = io.listen(server);

//this function gets the currently online ids
var socketIds = function() {
	var onlineClients = io.sockets.clients(); //get the function to retreive the clients  
	var idArray = [];

	for (var client in onlineClients) {
		idArray.push(onlineClients[client].id);
	}

	return idArray;
}

//This object contains the PDFs transformed to text.
//The keys are the USER session (socket) ids
var pdfMadeText = {};

io.sockets.on('connection', function(socket){
    console.log('Client Connected');
	socket.emit('join', socket.id);

    socket.on('disconnect', function(){
        console.log('Client Disconnected. Deleting Temporary Book.');
		delete pdfMadeText[socket.id];
    });

	socket.on('get-page', function(uuid, pageNum) {
		clean_page(socket, pdfMadeText[uuid][pageNum], pageNum);	
	});
});

//Handling the book upload
server.post('/api/book-upload', function(req, res) {
    //var serverPath = '/books/' + req.files.book.name;

    console.log("working");

    var pdf_extract = require('pdf-extract');
    var absolute_path_to_pdf = '/home/axsauze/Desktop/richdad.pdf';
    var options = {
        type: 'text'  // extract the actual text in the pdf file
    }
    var processor = pdf_extract(absolute_path_to_pdf, options, function(err) {
        console.log("inside extract");
        if (err) {
            console.log(err);
            res.send({
                error : err
            });
        }
    });
    processor.on('complete', function(data) {
        console.log("complete");

		//console.log(data.text_pages);

		pdfMadeText[req.body.uuid] = data.text_pages;

        res.send({ });
    });
    processor.on('error', function(err) {
        console.log("error");
        inspect(err, 'error while extracting pages');
        res.send({
            error: err
        });
    });
});

function clean_page(socket, page, pageNum) {
	pandoc(page, 'markdown', 'asciidoc', function(err, result) {
		if (err)
		    throw err;

		result = result.replace(/(\s{2,}|\t)/g, '. ');
		result = result.replace(/(\r\n|\n|\r|--+)/gm," ");

		var sentences = nlp.sentenceparser(result);
		var lessThan100Chars = [];

		for ( var s in sentences ) {

			var currentSentence = sentences[s];
			currentSentence = currentSentence.replace(/[^a-zA-Z?!., ]/g, '');
			currentSentence = currentSentence.replace(/\t+/g, ' ');
			currentSentence = currentSentence.replace(/\s{2,}/g, ' ');
			currentSentence = currentSentence.trim();
			currentSentence = currentSentence.charAt(0).toUpperCase() + currentSentence.slice(1).toLowerCase();

			console.log("###### " + s + " # " + currentSentence);
			
			if (currentSentence.length > 100) {
				var wordArr = currentSentence.split(" ");
				var tempSentence = "";

				for (var word in wordArr) {
					if (tempSentence.length + wordArr[word].length < 80) {
						tempSentence += " " + wordArr[word];
					}
					else {
						lessThan100Chars.push(tempSentence);

						tempSentence = wordArr[word];
					}	
				}
			} else {
				lessThan100Chars.push(currentSentence);
			}
		}

		socket.emit('receive-page', lessThan100Chars, pageNum);
	});
}


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req,res){
    res.render('index.jade', {
        locals : {
              title : 'BookStory'
             ,description: 'Books to Video'
             ,author: 'Alejandro Saucedo'
             ,analyticssiteid: 'XXXXXXX' 
            }
    });
});


//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );
