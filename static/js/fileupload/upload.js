$(document).ready(function() {
    status('Please select a pdf book');

    //Check to see when a user has selected a file
//    var timerId;
//    timerId = setInterval(function() {
//        if($('#book-file').val() !== '') {
//            clearInterval(timerId);
//
//            $('#book-form').submit();
//        }
//    }, 500);

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