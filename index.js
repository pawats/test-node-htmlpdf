var express = require('express');
var fs = require('fs');
var html = fs.readFileSync('./view/testfile.html', 'utf8');

var cheerio = require('cheerio');
var pdf = require('html-pdf');

var app = express();

app.use(express.static('view'));


app.get('/htmlpdf', function(req, res){
	var input = html;
	var filename = 'testfile.pdf'
	var parsedInput = parseHtml(input)
	res.setHeader('Content-disposition', 'attachment; filename=' + filename);
	generate(parsedInput, res);

});

app.get('/parse', function(req, res){
	var input = html;
	res.send(parseHtml(input))
});

function parseHtml(input){
	var $ = cheerio.load(input);

	$('body').css({
		"font-family": "monospace"
		// "font-family": "serif"
	})

	$('table').css({
		"width":"100%",
		"display":"table",
		// "table-layout":"fixed",
		"border-collapse": "collapse"
	});

	$('table *').each(function(){
		$(this).css({
			"width":"initial",
			"word-break": "break-word"
		})
	})

	$('table, th, tr, td').each(function(){
		$(this).css({
			"border": "1px solid black"
		})
	})

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
		"base": "/", // Base path that's used to load files (images, css, js) when they aren't referenced using a host

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


