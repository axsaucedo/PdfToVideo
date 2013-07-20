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
server.listen( port);

//Setup Socket.IO
var io = io.listen(server);
io.sockets.on('connection', function(socket){
    console.log('Client Connected');
    socket.on('message', function(data){
        socket.broadcast.emit('server_message',data);
        socket.emit('server_message',data);
    });
    socket.on('disconnect', function(){
        console.log('Client Disconnected.');
    });
});

//Handling the book upload
server.post('/api/book-upload', function(req, res) {
    //var serverPath = '/books/' + req.files.book.name;

    console.log("working");
    var inspect = require('eyes').inspector({maxLength:20000});
    var pdf_extract = require('pdf-extract');
    var absolute_path_to_pdf = '/Users/axsauze/Downloads/sample.pdf';
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
        inspect(data.text_pages, 'extracted text pages');
        res.send({
            paragraph : text_pages
        });
    });
    processor.on('error', function(err) {
        console.log("error");
        inspect(err, 'error while extracting pages');
        res.send({
            error: err
        });
    });


//    processor.on('complete', function(data) {
//        console.log("Inside complete");
//        console.log(data);
//        res.send({
//            paragraph: data
//        });
//    });
//
//    processor.on('error', function(err) {
//        console.log("Inside error2");
//        console.log(err);
//        res.send({
//            error: err
//        });
//    });

    //TODO parse the pdf and save it

    //Send the response of the pdf
    console.log("responding");
//    res.send({
//        paragraph: "'Does school prepare children for the real world? 'Study hard and get good \
//            grades and you will find a high-paying job with great benefits,'my parents used \
//            to say. Their goal in life was to provide a college education for my older \
//    sister and me, so that we would have the greatest chance for success in life. \
//        When T finally earned my diploma in 1976-graduating with honors, and near the \
//    top of my class, in accounting from Florida State University-my parents had \
//    realized their goal. It was the crowning achievement of their lives. In \
//    accordance with the 'Master Plan,' I was hired by a 'Big 8' accounting firm, and \
//    I looked forward to a long career and retirement at an early age."
//    });
});


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
