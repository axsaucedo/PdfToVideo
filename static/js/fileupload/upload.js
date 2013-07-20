$(document).ready(function() {
    status('Please select a pdf book');

		var userId;

		var socket = io.connect();

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
								
								userId = response.userId;

                console.log('enabling button');
                $("#start-button").removeAttr('disabled');

								status("Book has been processed, please press start to begin the journey!");

            }
        });

        return false;
    });

    $("#start-button").click(function() {
								
    });

    function status(message) {
        $('#status').text(message);
    }

});
