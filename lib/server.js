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

app.get('/lists/:id', function(req, res){
  ShoppingList.findById(req.params.id, function(err, list){
    if(err){
      res.status(404).end();
      return
    }
    res.json(list.toObject());
  });
});


app.post('/lists', function(req, res){
  var attributes = _.pick(req.body, 'title');
  var list = new ShoppingList(attributes);

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

    var attributes = _.pick(req.body, 'title', 'completed');
    list.items.push(attributes);

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


  ShoppingList
    .findById(req.params.list_id, function(err, list){
      if(err){
        res.status(404).end();
        return
      }
    var item = list.items.id(req.params.id);
    if( item === null ){
      res.status(404).end();
      return;
    }
    var attributes = _.pick(req.body, 'title', 'completed');

    for(var key in attributes){
      item[key] = attributes[key];
    }
    list.save(function(err){
      if(err){
        res.status(500).end();
        return;
      }
      res.json(item);
    });
  });
});

app.delete('/lists/:list_id/items/:id', function(req, res){
  ShoppingList
    .findById(req.params.list_id, function(err, list){
      if(err){
        res.status(404).end();
        return
      }

      list.items.remove(req.params.id)

      list.save(function(err){
        if(err){
          res.status(500).end();
          return;
        }
        res.status(200).end();
      });

  });
});


app.listen(8888, function(){});