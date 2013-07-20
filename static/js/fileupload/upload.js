$(document).ready(function() {
    status('Please select a pdf book');

		var userId;

		var socket = io.connect();

		socket.on('connect', function() {

				socket.on('join', function(uuid) {
								userId = uuid;

							  $('input[name=uuid]').val(uuid);	

								console.log("registered with id: " + uuid);
				});

				socket.on('receive-page', function(page, pageNum) {
					console.log("received page");
					$('#subtitles-area').html(page);
				});
		});

    $('#book-form').submit(function() {
        status('Converting the book...');

        $(this).ajaxSubmit({
            error: function(xhr) {
                status('Error: ' + xhr.status);
            },

            success: function(response) {
                if(response.error) {
                    status(response.error);
                    return;
                }

                console.log('enabling button');
                $("#start-button").removeAttr('disabled');

								status("Book has been processed, please press start to begin the journey!");

            }
        });

        return false;
    });

    $("#start-button").click(function() {
				socket.emit('get-page', userId, 0);	
    });

    function status(message) {
        $('#status').text(message);
    }

});
