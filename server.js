//This will serve the files AND do the API

var express = require('express');

var app = express();

app.use(express.static('.')); // tells it to use this static middleware, using the current directory ('.')

app.listen(8888, function(){
  console.log("Ready. Server running on 8888")
});