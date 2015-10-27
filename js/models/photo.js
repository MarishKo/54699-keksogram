'use strict';

define(function() {
  /**
   * @constructor
   * @extends {Backbone.Model}
   */
  var PhotoModel = Backbone.Model.extend({
    /** @override */
    initialize: function() {
      this.attributes.liked = false;
    },

    like: function() {
      this.set('likes', this.get('likes') + 1);
      this.set('liked', true);
    },

    dislike: function() {
      this.set('likes', this.get('likes') - 1);
      this.set('liked', false);
    }
  });

  return PhotoModel;
});
