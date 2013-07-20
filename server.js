//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , fs = require('fs')
    , port = (process.env.PORT || 8081);
	
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
		console.log(uuid);
		console.log(pageNum);
		socket.emit('receive-page', clean_page(pdfMadeText[uuid][pageNum]), pageNum);	
	});
});

//Handling the book upload
server.post('/api/book-upload', function(req, res) {
    //var serverPath = '/books/' + req.files.book.name;

    console.log("working");

    var pdf_extract = require('pdf-extract');
    var absolute_path_to_pdf = '/home/axsauze/Desktop/example.pdf';
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

function clean_page(page) {
	return page;
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
