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
  initialize: function(){
    this.set('items', new app.Items());
  }
});

// Collections
app.Items = Backbone.Collection.extend({
      model: app.Item,
      localStorage: new Store("shoppinglist"),
      completed: function(){
        return this.filter(function(item){
          return item.get('completed');
        });
      },
      remaining: function(){
        return this.without.apply(this, this.completed());
      }
    });
app.items = new app.Items();


// Views

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

app.ItemsView = Backbone.View.extend({
  el: '#items-list',
  initialize: function () {
    this.input = this.$('#new-item');
    app.items.on('add', this.addOne, this);
    app.items.on('reset', this.addAll, this);
    app.items.fetch();
  },
  events: {
    'click #add'     : 'createItemOnClick',
    'keypress #new-item': 'createItemOnEnter'
  },
  createItemOnEnter: function(e){
    if ( e.which !== 13 || !this.input.val().trim()) { // 13 == return
      return;
    }
    app.items.create(this.newAttributes());
    this.input.val('');
  },
  createItemOnClick: function(){
    app.items.create(this.newAttributes());
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
        _.each(app.items.remaining(), this.addOne);
        break;
      case 'bought':
        _.each(app.items.completed(), this.addOne);
        break;
      default:
        app.items.each(this.addOne, this);
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

// routers
app.Router = Backbone.Router.extend({
  routes: {
    '*filter' : 'setFilter'
  },
  setFilter: function(params){
    // console.log('app.router.params = ' + params);
    window.filter = params.trim() || '';
    app.items.trigger('reset');
  }
});

// Initializers
app.router = new app.Router();
Backbone.history.start();
app.itemsView = new app.ItemsView();