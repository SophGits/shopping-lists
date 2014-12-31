//This will serve the files AND do the API

var express = require('express');

var app = express();

app.use('/', express.static('assets'));

app.listen(8888, function(){});