var app = {};

// Models
app.Item = Backbone.Model.extend({
  defaults: {
    title: '',
    completed: false
  },
  toggle: function(){
    this.save({completed: !this.get('completed')});
  }
});

// Whole list model
app.ShoppingList = Backbone.Model.extend({
  defaults: {
    title: "Shopping List"
  },
  urlRoot: '/lists',
  initialize: function(){
    this.set('items', new app.Items());
  }
});

// Collections
app.Items = Backbone.Collection.extend({
  url: function(){
    return app.shoppingList.url() + '/items'
  },
  model: app.Item,
  completed: function(){
    return this.filter(function(item){
      return item.get('completed');
    });
  },
  remaining: function(){
    return this.without.apply(this, this.completed());
  }
});

// Views

// ONE ITEM _____________________________________________________
app.ItemView = Backbone.View.extend({
  tagName: 'li',
  template: _.template($('#item-template').html()),
  render: function(){
    this.$el.html(this.template(this.model.toJSON()));
    this.input = this.$('.edit');
    return this;
  },
  initialize: function(){
    this.model.on('change', this.render, this);
    this.model.on('destroy', this.remove, this);
  },
  events: {
    'dblclick label' : "edit",
    'keypress .edit' : 'updateOnEnter',
    'blur .edit'     : 'close',
    'click .toggle'  : 'toggleCompleted',
    'click .destroy' : 'destroy'
  },
  edit: function(){
    this.$el.addClass('editing');
    this.input.focus();
  },
  close: function(){
    var value = this.input.val().trim();
    if(value){
      this.model.save({title: value});
    }
    this.$el.removeClass('editing');
  },
  updateOnEnter: function(e){
    if(e.which == 13){
      this.close();
    }
  },
  toggleCompleted: function(){
    this.model.toggle();
  },
  destroy: function(){
    this.model.destroy();
  }
});

// MANY ITEMS _____________________________________________________
app.ItemsView = Backbone.View.extend({
  el: '#items-list',
  initialize: function () {
    this.input = this.$('#new-item');
    this.collection.on('add', this.addOne, this);
    this.collection.on('reset', this.addAll, this);
  },
  events: {
    'click #add'     : 'createItemOnClick',
    'keypress #new-item': 'createItemOnEnter'
  },
  createItemOnEnter: function(e){
    if ( e.which !== 13 || !this.input.val().trim()) { // 13 == return
      return;
    }
    this.collection.create(this.newAttributes());
    this.input.val('');
  },
  createItemOnClick: function(){
    this.collection.create(this.newAttributes());
    $('#new-item').val('');
  },
  addOne: function(item){
    var view = new app.ItemView({model: item});
    $('#shopping-list__body').append(view.render().el);
  },
  addAll: function(){
    this.$('#shopping-list__body').html('');
    switch(window.filter){
      case 'tobuy':
        _.each(this.collection.remaining(), this.addOne);
        break;
      case 'bought':
        _.each(this.collection.completed(), this.addOne);
        break;
      default:
        this.collection.each(this.addOne, this);
        break;
    }
  },
  newAttributes: function(){
    return {
      title: this.input.val().trim(),
      completed: false
    }
  }
});

// NAME PLUS ITEMS ___________________________________________________
app.ShoppingListView = Backbone.View.extend({
  el: '#shopping-list',
  render: function(){
    this.$el.html('<h1>' + this.model.get('title') +'</h1>')
  },
  initialize: function(){
    this.itemsView = new app.ItemsView({
      collection: this.model.get('items')
    });
    this.render()
  }
})


// routers
app.Router = Backbone.Router.extend({
  routes: {
    '*filter' : 'setFilter'
  },
  setFilter: function(params){
    // console.log('app.router.params = ' + params);
    window.filter = params.trim() || '';
    app.shoppingList.get('items').trigger('reset');
  }
});

// Initializers
app.shoppingList = new app.ShoppingList();
app.router = new app.Router();
Backbone.history.start();
app.shoppingListView = new app.ShoppingListView({
  model: app.shoppingList
})