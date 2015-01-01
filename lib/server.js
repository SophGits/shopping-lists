//This will serve the files AND do the API

var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    _ = require('underscore');

mongoose.connect('mongodb://localhost/shopping_list');

var app = express();

var ShoppingList = mongoose.model('ShoppingList', {
  title: String,
  items: [{ title: String, completed: Boolean }]
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
  ShoppingList
    .findById(req.params.id, function(err, list){
      if(err){
        res.status(404).end();
        return
      }
    list.items.push({
      title: req.body.title,
      completed: req.body.completed
    });

    var item = list.items[list.items.length -1];

    list.save(function(err, list){
      if(err){
        res.status(500).end();
        return;
      }
      res.json(item);
    });
  });
});

app.patch('/lists/:list_id/items/:id', function(req, res){
  res.json({});
});

app.delete('/lists/:list_id/items/:id', function(req, res){
  res.json({});
});


app.listen(8888, function(){});