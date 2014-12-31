//This will serve the files AND do the API

var express = require('express');

var app = express();

app.use('/', express.static('assets'));

app.post('/lists', function(req, res){
  var body = {
    id: 3
  };
  res.json(body);
});

app.put('/lists/:id', function(req, res){
  res.json({});
});

app.post('/lists/:id/items', function(req, res){
  var body = {
    id: 4
  }
  res.json(body);
});

app.put('/lists/:list_id/items/:id', function(req, res){
  res.json({});
});

app.delete('/lists/:list_id/items/:id', function(req, res){
  res.json({});
});


app.listen(8888, function(){});