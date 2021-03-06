var app = {};

// Models
app.Item = Backbone.Model.extend({
  defaults: {
    title: '',
    completed: false
  },
  idAttribute: '_id',
  toggle: function(){
    this.save({completed: !this.get('completed')}, {patch: true});
  }
});

// Whole list model
app.ShoppingList = Backbone.Model.extend({
  defaults: {
    title: "Shopping List"
  },
  idAttribute: '_id',
  urlRoot: '/lists',
  initialize: function(){
    this.set('items', new app.Items([], this));
  },
  parse: function(res){
    var items = res.items;
    if(items){
      res.items = new app.Items(items, this);
    }
    return res;
  }
});

// Collections
app.Items = Backbone.Collection.extend({
  url: function(){
    return this.shoppingList.url() + '/items'
  },
  model: app.Item,
  initialize: function(items, shoppingList){
    this.shoppingList = shoppingList;
  },
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
    if(!this.$el.hasClass("editing")){
      return;
    }

    this.$el.removeClass('editing');

    var value = this.input.val().trim();
    if(value){
      this.model.save({title: value}, {patch: true});
    }
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
  events: {
    'click #save' : 'update'
  },
  render: function(){
    this.$el.html('<h1 contenteditable="true" class="title">' + this.model.get('title') +'</h1><button id="save">Save</button>')
  },
  update: function(){
    var title = this.$('.title').html();
    // this.model.set('title', title);
    this.model.save(
      { title: title },
      { patch: true }
    );
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
    'lists/:id' : 'showlist',
    '*filter' : 'setFilter'
  },
  setFilter: function(filter){
    window.filter = filter || '';
    var list = new app.ShoppingList();
    new app.ShoppingListView({model: list});
    list.get('items').trigger('reset');
  },
  showlist: function(id){
    var list = new app.ShoppingList({'_id': id});
    list.fetch({
      success: function(){
        new app.ShoppingListView({model: list});
        list.get('items').trigger('reset');
      }
    });
  }
});

// Initializers
app.shoppingList = new app.ShoppingList();
app.router = new app.Router();
Backbone.history.start();