var express = require('express');
var fs = require('fs');
var html = fs.readFileSync('./view/testfile.html', 'utf8');

var cheerio = require('cheerio');
var pdf = require('html-pdf');

var app = express();

app.use(express.static('view'));


app.get('/htmlpdf', function(req, res){
	var serverAddress = getHostAddress(req);
	var input = html;
	var filename = 'testfile.pdf'
	var parsedInput = parseHtml(input, serverAddress);

	res.setHeader('Content-disposition', 'attachment; filename=' + filename);
	generate(parsedInput, res);

});

app.get('/parse', function(req, res){
	var serverAddress = getHostAddress(req);
	var input = html;

	res.send(parseHtml(input, serverAddress))
});

function getHostAddress(req){
	return req.protocol + '://' + req.get('host') + "/";
}

function parseHtml(input, serverAddress){
	var $ = cheerio.load(input);

	$('body').css({
		// "font-family": "monospace"
		"font-family": "serif"
	});

	$('table').css({
		"width": "100%",
		"display":"table",
		// "table-layout":"fixed",
		"border-collapse": "collapse"
	});

	$('table td').css({
		"padding":"2px",
		"text-align": "center",
		"vertical-align": "middle"
	});

	$('table, th, tr, td').css({
		"border": "1px solid black"
	});

	var fullWidthColumnNames = ["CSLN", "Region", "Severity", "SR Id", "Incident ID", "Country", "Status", "MIC Number"];

	$('table').each(function(i, table){
		$(table).find('td').each(function(){
			// Get th of this td
			var $th = $(table).find('th').eq($(this).index());

			if(fullWidthColumnNames.indexOf($th.text()) > -1){
				$(this).css({
					"width":"initial",
					"word-break": "normal"
				})
			}
			else{
				$(this).css({
					"width":"initial",
					"word-break": "break-word"
				})			
			}			
		})

	})

	// $('table *').each(function(){
	// 	var $th = $(this).closest('table').find('th').eq($(this).index());
	// 	if(fullWidthColumnNames.indexOf($th.text()) > -1){
	// 		$(this).css({
	// 			"width":"initial",
	// 			"word-break": "normal"
	// 		})
	// 	}
	// 	else{
	// 		$(this).css({
	// 			"width":"initial",
	// 			"word-break": "break-word"
	// 		})			
	// 	}
	// });


	$("*[src]").each(function(){
		var newSrc = serverAddress + $(this).attr("src");
		$(this).attr("src", newSrc);
	});

	return $.html();
};

function generate(html, res){
	var config = {
		"height": "16.5in",
		"width": "23.4in",
		"border": {
			"top": "0.5in",            // default is 0, units: mm, cm, in, px 
			"right": "0.7in",
			"bottom": "0.5in",
			"left": "0.7in"
		},
		// "format": "A3",
		// "orientation": "landscape",
		// "header": {
		// 	"height": "45mm",
		// 	"contents": '<div style="text-align: center;">Author: Marc Bachmann</div>'
		// },
		"footer": {
			"height": "8mm",
			"contents": {
				default: '<div style="text-align: center;><span style="color: #444;">{{page}}</span>/<span>{{pages}}</span></div>', // fallback value 
			}
		},
		// Rendering options
		// "base": "/", // Base path that's used to load files (images, css, js) when they aren't referenced using a host
		// "base": "file:///Users/pawatsupaongprapa/Desktop/test-pdf/view/", // Base path that's used to load files (images, css, js) when they aren't referenced using a host

		// File options 
		"type": "pdf",             // allowed file types: png, jpeg, pdf 
		// "quality": "50",           // only used for types png & jpeg 

	}

	pdf.create(html, config).toStream(function(err, stream){
	  // stream.pipe(fs.createWriteStream('./foo.pdf'));
	  stream.pipe(res)
	});
};

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send(String(err));
});




app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});


