var pdf_extract = require('pdf-extract');
    var absolute_path_to_pdf = '/Users/axsauze/Downloads/rich_dad._poor_dad.pdf'
    var options = {
        type: 'text'  // extract the actual text in the pdf file
    }
    var processor = pdf_extract(absolute_path_to_pdf, options, function(err) {
        if (err) {
            console.log("Inside pdf_extract");
        }
    });
    processor.on('complete', function(data) {
        console.log("Inside complete");
    });
    processor.on('error', function(err) {
        console.log("Inside error2");
        console.log(err);
    });
