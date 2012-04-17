API_demo.Views.Page = Backbone.View.extend({
   className: "page",

   initialize: function () {
      if(this.options.title) {
         //loading some of the inner views, so we need to load the top first
         data = {
            'title': this.options.title
         }
         var page = Mustache.to_html(API_demo.Templates.top, data);
         $(this.el).html(page);
         $('.back',this.el).click(this.goBack);
      }
      this.render();
      $('.function_name',this.el).click(this.toggleExpandable);
   },

   goBack: function() {
      (new API_demo.Views.home({'back':true})).show();
      API_demo.router.navigate('');
   },

   generateExpandables: function (self) {
      $('.function_name',self.el).forEach( function(name){
         var parent = $(name).parent();
         var data = self.generateExpandableData($(name).text());
         parent.append((new API_demo.Views.expandable({
            'data':data
         })).el);
      })
   },

   toggleExpandable: function (eventObject) {
      target = $(eventObject.currentTarget);
      parent = target.parent();
      exp = $(".expandable",parent);

      //check to see if we need to show or hide the expandable view
      if(exp.css('display') == 'none'){
         if(API_demo.visible) {
            $(API_demo.visible).hide();
         }
         API_demo.visible = exp;
         exp.show();

      } else { 
         exp.hide(); 
         API_demo.visible = undefined;
         $("#output",exp).text("\u00A0");
      }
   },

   show: function () {
      $('.page').css({"position": "absolute"});
      this.$el = $(this.el);
      var direction_coefficient = this.options.back ? -1 : 1;
      forge.logging.log('direction_coefficient is '+ direction_coefficient);
      if ($('.page').length) {
         var $old = $('.page').not(this.el);

         // This fix was hard-won -
         // just doing .css(property, '') doesn't work!
         $old.get(0).style["margin-left"] = ""
         $old.get(0).style["-webkit-transform"] = ""

         this.$el.appendTo('body').hide();
         this.$el.show().css(
            {"margin-left": 320 * direction_coefficient});
         this.$el.anim(
            {translate3d: -320 * direction_coefficient +'px,0,0'},
            0.3, 'linear');
         $old.anim(
            {translate3d: -320 * direction_coefficient + 'px,0,0'},
            0.3, 'linear', function() {
               $old.remove();
               $('.page').css({"position": "static"});
            });
      } else {
         this.$el.appendTo('body').hide();
         this.$el.show();
      }
      this.$el.width($('body').width());
      window.scrollTo(0, 0);
   }
});

API_demo.Views.expandable = Backbone.View.extend({
   className: 'expandable',
   events: {
      'click #execute': 'toRun'
   },

   initialize: function () {
      this.render();
   },

   toRun: function(){
      platforms = this.options.data.platforms;

      if(platforms[0] == 'all')
         this.options.data.snippet($('#output',this.el));
      else {
         var shouldRun = false;
         platforms.forEach(function(platform){
            eval('if(forge.is.'+platform+'()){shouldRun = true;}');   
         })
         
         if(shouldRun){
            this.options.data.snippet($('#output',this.el));   
         } else {
            str = 'Only available on ';
            platforms.forEach(function(platform){
               str = str + platform + " ";
            })
            $('#output',this.el).text(str);
         }
      }
   },

   render: function () {
      forge.logging.log('Rendering expandable view.');
      data = {
         snippet:this.options.data.snippet.toString(),
         description:this.options.data.description
      };

      page = Mustache.to_html(API_demo.Templates.expandable, data);
    
      $(this.el).html(page);

      return this;
   }
});

API_demo.Views.home = API_demo.Views.Page.extend({

   events: {
      'click h3.forward': 'openCategory'
   },

   openCategory: function(eventObject) {
      var target = $(eventObject.currentTarget);
      var id = target.attr('id');
      var title = target.text().substr(0,target.text().length-2);
      API_demo.router.navigate(id);
      (new API_demo.Views[id]({'title':title})).show();
   },

   render: function () {   
      forge.logging.log('Rendering home view.');

      page = API_demo.Templates.home;
    
      $(this.el).html(page);

      return this;
   }
});

API_demo.Views.platform_detection = API_demo.Views.Page.extend({

   generateExpandableData: function(text) {
      data = {};
      if(text.substring(0,21)=='forge.is.orientation.') {
         data.platforms = ['mobile'];
      } else{
         data.platforms = ['all'];
      }
      eval('data.snippet = function(output){\n output.text('+text+')\n};');

      switch (text){
         case 'forge.is.mobile()': {
            data.description = "Returns true if running on a mobile device";
            break;
         } 
         case 'forge.is.desktop()': {
            data.description = "Returns true if running on a desktop/laptop computer";
            break;
         }
         case 'forge.is.web()': {
            data.description = "Returns true if running on as a hosted web app";
            break;
         }
         case 'forge.is.android()': {
            data.description = "Returns true if running on an Android device";
            break;
         }
         case 'forge.is.ios()': {
            data.description = "Returns true if running on an IOS device";
            break;
         }
         case 'forge.is.chrome()': {
            data.description = "Returns true if running on Chrome browser";
            break;
         }
         case 'forge.is.firefox()': {
            data.description = "Returns true if running on Firefox browser";
            break;
         }
         case 'forge.is.safari()': {
            data.description = "Returns true if running on Safari browser";
            break;
         }
         case 'forge.is.ie()': {
            data.description = "Returns true if running on IE browser";
            break;
         } 
         case 'forge.is.orientation.portrait()': {
            data.description = "Returns true if a mobile device has a portrait orientation";
            break;
         }
         case 'forge.is.orientation.landscape()': {
            data.description = "Returns true if a mobile device has a landscape orientation";
            break;
         } 
      }

      return data;
   },

   render: function () {   
      forge.logging.log('Rendering platform detection view.');
      _this = this;
       
      var data = {
         platform: [
            {'command':'forge.is.mobile()'},
            {'command':'forge.is.desktop()'},
            {'command':'forge.is.web()'},
            {'command':'forge.is.android()'},
            {'command':'forge.is.ios()'},
            {'command':'forge.is.chrome()'},
            {'command':'forge.is.firefox()'},
            {'command':'forge.is.safari()'},
            {'command':'forge.is.ie()'}
         ],
         orientation: [
            {'command':'forge.is.orientation.portrait()'},
            {'command':'forge.is.orientation.landscape()'}
         ]

      };
        
      var page = Mustache.to_html(API_demo.Templates.platform_detection, data);
      
      $(this.el).append(page);
      this.generateExpandables(this);

      return this;
   }
});

API_demo.Views.component_communication = API_demo.Views.Page.extend({
   generateExpandableData: function(text) {
      var data = {};
      data.platforms = ['desktop'];
      switch (text){
         case 'forge.message.listen()': {
            data.description = 'Sets up a handler function which will receive messages sent ("broadcast") by your extension.';
            data.snippet = this.listen;
            break;
         } 
         case 'forge.message.broadcast()': {
            data.description = "Sends a message to be received by other components of your extension. Messaging will not be recieved by the background page.";
            data.snippet = this.broadcast;
            break;
         }
         case 'forge.message.broadcastBackground()': {
            data.description = "Sends a message to be received by listeners in your background code.";
            data.snippet = this.broadcastBackground;
            break;
         }
         case 'forge.message.toFocussed()': {
            data.description = "Like broadcast, this method sends a message to be received by content script listeners.";
            data.snippet = this.toFocussed;
            break;
         }
      }
      return data;
   },

   listen:function(output) {
      forge.message.listen(function(content,reply){
         output.text('Received '+content);
         reply("Foreground received '"+content+"'");
      },function(content){
         output.text('Error listening to message');
      })
      output.text('Listening for messages of type randomType');
   },

   broadcast:function(output) {
      forge.message.broadcast('randomType','Hello',function(content){
         output.text(content);
      }, function(content){
         output.text("Error broadcasting message "+ content);
      })
   },

   broadcastBackground:function(output) {
      forge.message.broadcastBackground('randomType','Hello',function(content){
         output.text(content);
      }, function(content){
         output.text("Error broadcasting message to background "+ content);
      })
   },

   toFocussed:function(output) {
      output.text('Nobody listening');
      forge.message.toFocussed('randomType','toFocussed Hello',function(content){
         output.text(content);
      }, function(content){
         output.text("Error broadcasting message "+ content);
      });
   },

   render: function () {   
      forge.logging.log('Rendering component communication view.');

      page = API_demo.Templates.component_communication;
        
      $(this.el).append(page);
      this.generateExpandables(this);
      return this;
   }
});

API_demo.Views.notifications = API_demo.Views.Page.extend({
   generateExpandableData: function(text) {
      return {
         platforms:['all'],
         snippet:this.createNotification,
         description:'Notifications allow you to send alerts.'
      };
   },

   createNotification: function(output) {
      forge.notification.create(
         'Example Notification',
         'This is just an example',
         function(){
            //called when successful
            output.text('Notification created');
         }, function(content){
            output.text('Error creating notification');
         })
   },

   render: function () {   
      forge.logging.log('Rendering notifications view.');

      page = API_demo.Templates.notifications;
       
      $(this.el).append(page);
      this.generateExpandables(this);
      return this;
   }
});

API_demo.Views.requests = API_demo.Views.Page.extend({

   generateExpandableData: function(text) {
      var data = {};
      data.platforms = ['all'];
      switch (text){
         case 'forge.request.get()': {
            data.description = 'This method allows you to make a GET request and get a string response';
            data.snippet = this.getWeatherInfo;
            break;
         } 
         case 'forge.request.ajax()': {
            data.description = 'This function is closer to the jQuery.ajax method than forge.request.get. However, the full range of jQuery options are not supported for this method, due to the structure of browser and mobile apps.';
            data.snippet = this.ajaxWeatherInfo;
            break;
         }
      }
      return data;
   },

   getWeatherInfo: function(output) {
      url= "http://www.google.com/ig/api?weather=boston";
      forge.request.get(url, function(data){
         pattern= /temp_f data="[0-9]+"/i;
         str= pattern.exec(data).toString();
         degrees= str.substr(13,str.length-14);
         output.text(degrees+" degrees in Boston.");
      }, function(status){
         forge.logging.log('ERROR! [getWeatherInfo] '+status);
      })
   },

   ajaxWeatherInfo: function(output) {
      forge.request.ajax({
         url:"http://www.google.com/ig/api?weather=boston",
         dataType: 'xml',
         success: function(data, status, jqXHR){
            output.text($('temp_f',data).attr('data')+
               " degrees in Boston.");
         },
         error: function(jqXHR, status, errorThrown){
            forge.logging.log('ERROR! [ajaxWeatherInfo] '+
               status);
         }
      })
   },

   render: function () {   
      forge.logging.log('Rendering requests view.');

      page = API_demo.Templates.requests;
        
      $(this.el).append(page);
      this.generateExpandables(this);

      return this;
   }
});

API_demo.Views.geolocation = API_demo.Views.Page.extend({


   generateExpandableData: function (text) {
      return {
         'platforms':['mobile'],
         'snippet':this.getLocation,
         'description':'Although geolocation APIs are part of the HTML5 specification, on some platforms, the default permissions dialogs can be cumbersome and annoying to your users.'
      };
   },

   getLocation: function (output) {
      forge.geolocation.getCurrentPosition(
         null, 
         function(position){
            output.text(JSON.stringify(position));
         }, function(error){
            output.text('Error getting position:' +  
            error.message);
      })
   },

   render: function () {   
      forge.logging.log('Rendering geolocation view.');

      page = API_demo.Templates.geolocation;
        
      $(this.el).append(page);
      this.generateExpandables(this);
      return this;
   }
});   

API_demo.Views.tools = API_demo.Views.Page.extend({
   
   generateExpandableData: function(text) {
      var data = {};
      data.platforms = ['all'];
      switch (text){
         case 'forge.tools.UUID()': {
            data.description = 'A UUID is a globally unique token; when represented as a string, they look something like 18ADF182-7B12-4FA1-AF0B-6032108C0AE8.';
            data.snippet = this.getUUID;
            break;
         } 
         case 'forge.tools.getURL()': {
            data.description = 'Resolve this name to a fully-qualified local or remote resource.';
            data.snippet = this.getURL;
            break;
         }
      }
      return data;
   },

   getUUID: function (output) {
      output.text(forge.tools.UUID());
   },

   getURL: function (output) {
      forge.tools.getURL('external.html',function(url){
         forge.request.get(url,function(data){
            output.html(data);   
         }, function(error){
            output.text = "Error loading url";
         })
      },function(error){
         output.text('URL error');
      })
   },

   render: function () {   
      forge.logging.log('Rendering tools view.');

      page = API_demo.Templates.tools;
        
      $(this.el).append(page);
      this.generateExpandables(this);
      return this;
   }
});

API_demo.Views.logging = API_demo.Views.Page.extend({

   generateExpandableData: function(text) {
      var data = {};
      data.platforms = ['all'];
      switch (text){
         case 'forge.logging.log()': {
            data.description = 'Allows you to log a message, and optionally an exception, to the console service provided by the underlying platform.';
            data.snippet = this.loggingLog;
            break;
         } 
         case 'forge.logging.debug()': {
            data.description = 'Allows you print a debug message to the console service provided by the underlying platform';
            data.snippet = this.loggingDebug;
            break;
         } 
         case 'forge.logging.info()': {
            data.description = 'Allows you print an info message to the console service provided by the underlying platform';
            data.snippet = this.loggingInfo;
            break;
         } 
         case 'forge.logging.warning()': {
            data.description = 'Allows you print a warning message to the console service provided by the underlying platform';
            data.snippet = this.loggingWarning;
            break;
         } 
         case 'forge.logging.error()': {
            data.description = 'Allows you print a error message to the console service provided by the underlying platform';
            data.snippet = this.loggingError;
            break;
         } 
         case 'forge.logging.critical()': {
            data.description = 'Allows you print a critical message to the console service provided by the underlying platform';
            data.snippet = this.loggingCritical;
            break;
         } 
      }
      return data;
   },

   loggingLog: function (output) {
      forge.logging.log("forge.logging.log()");
      output.text('wrote "forge.logging.log()" to console');
   },

   loggingDebug: function (output) {
      forge.logging.debug("forge.logging.debug()");
      output.text('wrote "forge.logging.debug()" to console');
   },

   loggingInfo: function (output) {
      forge.logging.info("forge.logging.info()");
      output.text('wrote "forge.logging.info()" to console');
   },

   loggingWarning: function (output) {
      forge.logging.warning("forge.logging.warning()");
      output.text('wrote "forge.logging.warning()" to console');
   },

   loggingError: function (output) {
      forge.logging.error("forge.logging.error()");
      output.text('wrote "forge.logging.error()" to console');
   },

   loggingCritical: function (output) {
      forge.logging.critical("forge.logging.critical()");
      output.text('wrote "forge.logging.critical()" to console');
   },

   render: function () {   
      forge.logging.log('Rendering logging view.');

      page = API_demo.Templates.logging;
        
      $(this.el).append(page);
      this.generateExpandables(this);
      return this;
   }
});

API_demo.Views.tabs_management = API_demo.Views.Page.extend({
  generateExpandableData: function(text) {
      var data = {};
      data.platforms = ['all'];
      switch (text){
         case 'forge.tabs.open()': {
            data.description = 'Opens a new tab with the specified url with an option to retain focus on the calling tab.';
            data.snippet = this.openTab;
            break;
         } 
         case 'forge.tabs.openWithOptions()': {
            data.description = 'As open but takes an object of parameters, additionally accepts a match pattern on mobile (see modal views for more detail).';
            data.snippet = this.openTabWOptions;
            break;
         }
         case 'forge.tabs.closeCurrent()': {
            data.platforms = ['desktop'];
            data.description = 'Close the tab which makes the call.';
            data.snippet = this.closeTab;
            break;
         }
      }
      return data;
   },

   openTab: function (output) {
      forge.tabs.open('http://www.trigger.io/', true, 
         function(object){
            output.text('Successfully opened new tab.');
         },function(content){
            output.text('Error opening tab.');
      })
   },

   openTabWOptions: function (output) {
      forge.tabs.openWithOptions({
         url:'http://www.trigger.io/',
         keepFocus:true
      },function(object){
         output.text('Successfully opened new tab.');
      },function(content){
         output.text('Error opening tab.');
      })
   },

   closeTab: function (output) {
      forge.tabs.closeCurrent(function(content){
         output.text('Error closing tab');
      })
   },

   render: function () {   
      forge.logging.log('Rendering tabs management view.');

      page = API_demo.Templates.tabs_management;
        
      $(this.el).append(page);
      this.generateExpandables(this);
      return this;
   }
});

API_demo.Views.preferences = API_demo.Views.Page.extend({

   generateExpandableData: function(text) {
      var data = {};
      data.platforms = ['all'];
      switch (text){
         case 'forge.prefs.get()': {
            data.description = 'Allows you to read an application preference  by key';
            data.snippet = this.getPref;
            break;
         } 
         case 'forge.prefs.set()': {
            data.description = 'Allows you to store/modify an application preference by key';
            data.snippet = this.setPref;
            break;
         }
         case 'forge.prefs.clear()': {
            data.description = 'Allows you to clear an application preference by key';
            data.snippet = this.clearPref;
            break;
         } 
         case 'forge.prefs.clearAll()': {
            data.description = 'Allows you to clear all application preferences';
            data.snippet = this.clearAllPrefs;
            break;
         }
         case 'forge.prefs.keys()': {
            data.description = 'Allows you to read a list of preferences keys';
            data.snippet = this.prefKeys;
            break;
         }
      }
      return data;
   },

   getPref: function (output) {
      forge.prefs.get('page', function(page){
         if(page)
            output.text("'page' is "+page);
         else
            output.text("'page' has not been set.");
      }, function(error){
         output.text("Error getting 'page' preference.");
      })
   },

   setPref: function (output) {
      forge.prefs.set('page', 1, function(){
         output.text("Set 'page' preference.");
      }, function(error){
         output.text("Error setting 'page' preference.");
      })
   },

   clearPref: function (output) {
      forge.prefs.clear('page',function(){
         output.text("Cleared 'page' preference.");
      }, function(error){
         output.text("Error clearing 'page' preference.");
      })
   },

   clearAllPrefs: function (output) {
      forge.prefs.clearAll(function(){
         output.text("Cleared all preferences");
      }, function(error){
         output.text("Error clearing all preferences.");
      })
   },

   prefKeys: function (output) {
      forge.prefs.keys(function(keys){
         if(keys.length ==0)
            output.text("No stored keys");
         else
            output.text("Preference keys are:\n"+keys);
      }, function(error){
         output.text("Error getting preferences keys.");
      })
   },

   render: function () {   
      forge.logging.log('Rendering preferences view.');

      page = API_demo.Templates.preferences;
        
      $(this.el).append(page);
      this.generateExpandables(this);
      return this;
   }
});

API_demo.Views.toolbar_button = API_demo.Views.Page.extend({
   generateExpandableData: function(text) {
      var data = {};
      data.platforms = ['desktop'];
      switch (text){
         case 'forge.button.setIcon()': {
            data.description = 'Sets the icon for the toolbar button.';
            data.snippet = this.setButtonIcon;
            break;
         } 
         case 'forge.button.setUrl()': {
            data.description = 'Sets the path to the HTML page that should be opened when the toolbar button is clicked.';
            data.snippet = this.setUrl;
            break;
         }
         case 'forge.button.onClicked.addListener()': {
            data.description = 'Sets a function to be executed when the toolbar button is clicked.';
            data.snippet = this.onClicked;
            break;
         } 
         case 'forge.button.setBadge()': {
            data.description = 'Sets a number to appear as a notification badge on the toolbar button.';
            data.snippet = this.setBadge;
            break;
         }
         case 'forge.button.setBadgeBackgroundColor()': {
            data.description = 'Sets the background color for the badge. (Not supported on Safari)';
            data.platforms = ['chrome','firefox','ie'];
            data.snippet = this.setBadgeBgrColor;
            break;
         }
         case 'forge.button.setTitle()': {
            data.description = 'Set the tooltip text for a toolbar button.';
            data.snippet = this.setTitle;
            break;
         }
      }
      return data;
   },

   setButtonIcon: function(output) {
      forge.tools.getURL('img/T-128x128.png', function(url){
         forge.button.setIcon(url,function(){
            output.text('Set the toolbar button icon');
         },function(content){
            output.text('Error setting icon');
         })
      }, function(content){
         output.text('Error getting url for icon');
      });
   },

   setUrl: function(output) {
      forge.button.setUrl('alternative.html',function(){
         output.text('Set the toolbar button URL. Please reopen extension to see the effect.');
      },function(content){
         output.text('Error setting URL');
      })
   },

   onClicked: function(output) {
      output.text('TODO');
   },

   setBadge: function(output) {
      forge.button.setBadge(1,function(){
         output.text('Set badge to 1.');
      }, function(content){
         output.text('Failed to set badge.');
      })
   },

   setBadgeBgrColor: function(output) {
     forge.button.setBadgeBackgroundColor([0,255,255,255],function(){
         output.text('Set badge color to [0,255,255,255]');
      }, function(content){
         output.text('Failed to set badge color.');
      }) 
   },

   setTitle: function(output) {
      forge.button.setTitle('New API Demonstration Title', function(){
         output.text('Set button title to "New API Demonstration Title"');
      }, function(content){
         output.text('Failed to set button title.');
      })
   },

   render: function () {   
      forge.logging.log('Rendering toolbar button view.');

      page = API_demo.Templates.toolbar_button;
        
      $(this.el).append(page);
      this.generateExpandables(this);
      return this;
   }
});

API_demo.Views.file_and_camera = API_demo.Views.Page.extend({
   generateExpandableData: function(text) {
      //TODO
      /*
      var data = {};
      data.platforms = ['mobile'];
      switch (text){
         case 'forge.file.getImage()': {
            data.description = 'Sets the icon for the toolbar button.';
            data.snippet = this.render;
            break;
         } 
         case 'forge.button.setUrl()': {
            data.description = 'Sets the path to the HTML page that should be opened when the toolbar button is clicked.';
            data.snippet = this.render;
            break;
         }
         case 'forge.button.onClicked.addListener()': {
            data.description = 'Sets a function to be executed when the toolbar button is clicked.';
            data.snippet = this.render;
            break;
         } 
         case 'forge.button.setBadge()': {
            data.description = 'Sets a number to appear as a notification badge on the toolbar button.';
            data.snippet = this.render;
            break;
         }
         case 'forge.button.setBadgeBackgroundColor()': {
            data.description = 'Sets the background color for the badge. (Not supported on Safari)';
            data.platforms = ['chrome','firefox','ie'];
            data.snippet = this.render;
            break;
         }
         case 'forge.button.setTitle()': {
            data.description = 'Set the tooltip text for a toolbar button.';
            data.snippet = this.render;
            break;
         }
      }
      return data;
      */
   },
  

   render: function () {   
      forge.logging.log('Rendering file and camera view.');

      page = API_demo.Templates.file_and_camera;
       
      $(this.el).append(page);
      //this.generateExpandables(this);
      return this;
   }
});

API_demo.Views.events = API_demo.Views.Page.extend({
  generateExpandableData: function(text) {
      var data = {};
      data.platforms = ['mobile'];
      switch (text){
         case 'forge.event.menuPressed.addListener()': {
            data.platforms = ['android'];
            data.description = 'Triggered when the menu button is pressed on an Android device.';
            data.snippet = this.menuPressed;
            break;
         } 
         case 'forge.event.orientationChange.addListener()': {
            data.description = 'Triggered when the device is rotated, use forge.is.orientation.portrait() and forge.is.orientation.landscape() to determine orientation.';
            data.snippet = this.orientationChange;
            break;
         }
         case 'forge.event.messagePushed.addListener()': {
            data.description = 'Triggered when a push notification is received both while the application is running or if the application is launched via that notification.Currently available as part of our integration with Parse.';
            data.snippet = this.messagePushed;
            break;
         }
      }
      return data;
   },

   menuPressed: function (output) {
      forge.event.menuPressed.addListener(function(){
         output.text('Menu Pressed.');
      }, function(){
         output.text("Error when menu is pressed.");
      })
      output.text('Now press the Menu key.');
   },

   orientationChange: function (output) {
      forge.event.orientationChange.addListener(function(){
         if(forge.is.orientation.portrait()){
            output.text("Portrait orientation detected.");
         } else {
            output.text("Landscape orientation detected.");
         }
      }, function(content){
         output.text('Error during orientation change.');
      })
      output.text("Change your device's orientation.");
   },

   messagePushed: function (output) {
      forge.event.messagePushed.addListener(function(data){
         output.text('Will show up when message is pushed');
      },function(content){
         output.text('Error during orientation change.');
      })
      output.text("Listening for pushed messages.");
   },

   render: function () {   
      forge.logging.log('Rendering events view.');

      page = API_demo.Templates.events;
        
      $(this.el).append(page);
      this.generateExpandables(this);
      return this;
   }
});

API_demo.Views.contacts = API_demo.Views.Page.extend({
   generateExpandableData: function(text) {
      var data = {};
      data.platforms = ['mobile'];
      data.snippet = this.selectContact;
      return data;
   },

   selectContact: function(output) {
      forge.contact.select(function(contact){
         output.text('You selected '+ contact.displayName);
      }, function(content){
         output.text('Error selecting contact');
      })
   },

   render: function () {   
      forge.logging.log('Rendering contacts view.');

      page = API_demo.Templates.contacts;
        
      $(this.el).append(page);
      this.generateExpandables(this);
      return this;
   }
});

API_demo.Views.sms = API_demo.Views.Page.extend({
   generateExpandableData: function(text) {
      var data = {};
      data.platforms = ['mobile'];
      data.snippet = this.sendSMS;
      return data;
   },

   sendSMS: function (output) {
      forge.sms.send({
         body: 'Hello World!',
         to:['123456789','987654321']
      }, function(){
         output.text('Message sent.');
      }, function(content){
         output.text('Error sending message.');
      })
   },
   
   render: function () {   
      forge.logging.log('Rendering sms view.');

      page = API_demo.Templates.sms;
        
      $(this.el).append(page);
      this.generateExpandables(this);
      return this;
   }
});

API_demo.Views.native_top_bar = API_demo.Views.Page.extend({
   generateExpandableData: function(text) {
      var data = {};
      data.platforms = ['mobile'];
      switch (text){
         case 'forge.topbar.homePressed.addListener()': {
            data.platforms = ['android'];
            data.description = 'Triggered when the home button on the top bar is pressed on an Android device';
            data.snippet = this.homePressed;
            break;
         } 
         case 'forge.topbar.setTitle()': {
            data.description = 'Set the title displayed in the top bar.';
            data.snippet = this.setTitle;
            break;
         }
         case 'forge.topbar.addButton()': {
            data.description = 'Add a button with an icon to the top bar. The first parameter is an object containing a icon property.';
            data.snippet = this.addButton;
            break;
         }
         case 'forge.topbar.removeButtons()': {
            data.description = 'Remove currently added buttons from the top bar.';
            data.snippet = this.removeButtons;
            break;
         }

      }
      return data;
   },

   homePressed: function (output) {
      //forge.topbar.homePressed.addListener()
   },

   setTitle: function (output) {
      //forge.topbar.setTitle()
   },

   addButton: function (output) {
      //forge.topbar.addButton()
   },

   removeButtons: function (output) {
      //forge.topbar.removeButtons()
   },

   render: function () {   
      forge.logging.log('Rendering native top bar view.');

      page = API_demo.Templates.native_top_bar;
        
      $(this.el).append(page);
      this.generateExpandables(this);
      return this;
   }
});
