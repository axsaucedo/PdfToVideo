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
					
					displayAllSentences(page, 0);
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
	
	function image_request(keywords) {
		console.log('image request: ' + keywords);
	}

	function query_and_display_image(sentence) {
		
		var yahooUrl = "http://search.yahooapis.com/ContentAnalysisService/V1/termExtraction";

		yahoo_request_keyword_extraction(yahooUrl, sentence, image_request);
	}

	function yahoo_request_keyword_extraction(path, context, callBack) {
		var appid = "Lb3az57V34EImc3pRh6bycZVyylHS2f_zt2wV2VYq7SI0sSfkal4ip4cORW_u8s.66QdN.yyGtXdHSlVfFrlWSQwJfvyez8-";
		var output = "JSON";

		params = {
			  appid : appid
			, context : context
			, output : output
			, callback : "callback"
		};

		$.post(path, params)
			.done(function(response) {
				callBack(response);	
		});
	}

	function displayAllSentences(sentences, curr) {
		if(curr < sentences.length) 
		{
			var textToSpeechRequest = sentences[curr];

			query_and_display_image(textToSpeechRequest);

			textToSpeechRequest =  textToSpeechRequest.replace(/\./g, '');
			textToSpeechRequest = textToSpeechRequest.replace(/\t+/g, ' ');

			textToSpeechRequest = textToSpeechRequest.replace(/\s{2,}/g, ' ');
			textToSpeechRequest = textToSpeechRequest.trim();


			var encodedRequest = textToSpeechRequest.replace(/\s/g, '%20');

			var url = "http://speechutil.com/convert/ogg?text=";
			//var url = "http://translate.google.com/translate_tts?ie=utf-8&tl=en&q="; 

			var urlRequest = url + encodedRequest; 
			
			console.log(sentences[curr]);		
			console.log(urlRequest);

			audio = $("#audio");

			audio.empty();
			audio.remove();

			audio = $("<audio id='audio'></audio>");

			var newSrc = $("<source>")
					.attr("src", urlRequest)
						.appendTo(audio);	


			audio[0].addEventListener('ended', function () { 
				console.log("ENDED");
				displayAllSentences(sentences, curr+1);
			});

			
			audio[0].load();
			audio[0].play();

			$('#subtitles-area').html(sentences[curr]);

		}
	}

});
