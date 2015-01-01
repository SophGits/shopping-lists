//This will serve the files AND do the API

var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost/shopping_list');

var app = express();

var ShoppingList = mongoose.model('ShoppingList', {
  title: String
});

app.use('/', express.static('assets'));

app.use(bodyParser.json());

app.post('/lists', function(req, res){
  var title = req.body.title;
  var list = new ShoppingList({
    title: title
  });
  list.save(function(err, list){
    if(err){
      res.status(500).end();
    } else {
      res.json(list.toObject());
    }
  });
});

app.patch('/lists/:id', function(req, res){
  ShoppingList
    .findById(req.params.id, function(err, list){
      if(err){
        res.status(404).end();
        return
      }
      list.title = req.body.title;
      list.save(function(err, list){
        if(err){
          res.status(500).end();
          return;
        }
        res.json(list.toObject());
      })
    });
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