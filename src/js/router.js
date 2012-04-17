API_demo.Router = Backbone.Router.extend({
	routes: {
		"": "home"
	},

	home: function () {
		(new API_demo.Views.home()).show();
	}
})