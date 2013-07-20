/* Author: YOUR NAME HERE
*/

$(document).ready(function() {   

    var socket = io.connect();

    $('#sender').bind('click', function() {
        socket.emit('message', 'Message Sent on ' + new Date());
    });

    socket.on('server_message', function(data){
				console.log(data);
        $('#receiver').append('<li>' + data.paragraph + '</li>');
    });
});
