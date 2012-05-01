API_demo.Views.Page = Backbone.View.extend({
   events: {
      'click .method': 'setEvents'
   },

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
         window.onpopstate = this.goBack;
      }
      this.render();
   },

   goBack: function(eventObject) {
      eventObject.preventDefault();
      (new API_demo.Views.home({'back':true})).show();
      API_demo.router.navigate('');
   },

   setEvents: function(e) {
      e.preventDefault();
      this.toggleExpandable(e,this);
   },

   toggleExpandable: function(eventObject, calling_view) {
      target = $(eventObject.currentTarget);
      parent = target.parent();
      exp = $(".expandable",parent);
      if(exp.length == 0) {
         view = new API_demo.Views.expandable({
            data:calling_view.generateExpandableData(target.text())
         })
         parent.append(view.el);
         exp = $(".expandable",parent);
      }

      if(exp.css('display') == 'none'){
         if(API_demo.visible) {
            exp.ready = false;
            $(API_demo.visible).hide();
         }
         API_demo.visible = exp;
         exp.show();

      } else { 
         exp.ready = false;
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
      'click #setup_execute' : 'setup',
      'click #execute': 'toRun'
   },

   initialize: function () {
      this.render();
   },

   setup: function() {
      forge.logging.log('in setup')
      platforms = this.options.data.platforms;
      output = $('#output',this.el);

      if(this.checkPlatforms()) {
         this.options.data.setup_snippet(output,this);
      } else {
         str = 'Only available on ';
         platforms.forEach(function(platform){
            str = str + platform + " ";
         })
         output.text(str);
      }
   },

   toRun: function(){
      platforms = this.options.data.platforms;

      if(!this.ready) {
         $('#output',this.el).text('You have to run setup first');
         return 0;
      } else {
         if(this.checkPlatforms()) {
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

   checkPlatforms: function () {
      platforms = this.options.data.platforms;
      result = false;
      if(platforms[0] == 'all') {
         result = true;
      } else {
         platforms.forEach(function(platform){
            if(forge.is[platform]()) {
               result = true;
            }
         })
      }
      return result;
   },

   render: function () {
      forge.logging.log('Rendering expandable view.');
      options = this.options.data;
      if(options.setup == true){
         if(options.setup_snippet) {
            data = {
               snippet: options.snippet.toString(),
               setup_snippet: options.setup_snippet.toString(),
               description: options.description
            }
            page = Mustache.to_html(API_demo.Templates.setup_expandable,data);
            this.ready = false;
         } else {
            forge.logging.log("Setup is necessary, but the setup code is missing.");
         }
      } else {
         data = {
            snippet: this.options.data.snippet.toString(),
            description: this.options.data.description
         }
         page = Mustache.to_html(API_demo.Templates.expandable, data);
         this.ready = true;
      }
      
      $(this.el).html(page);

      return this;
   }
});

API_demo.Views.home = API_demo.Views.Page.extend({

   events: {
      'click h3.forward': 'openCategory'
   },

   openCategory: function(eventObject) {
      eventObject.preventDefault();
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

API_demo.Views.toolbar_button = API_demo.Views.Page.extend({
   generateExpandableData: function(text) {
      var data = {};
      data.setup = false;
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
            output.text('Error setting icon: ' + JSON.stringify(content));
         })
      }, function(content){
         output.text('Error getting url for icon: ' + JSON.stringify(content));
      });
   },

   setUrl: function(output) {
      forge.button.setUrl('alternative.html',function(){
         output.text('Set the toolbar button URL. Please reopen extension to see the effect.');
      },function(content){
         output.text('Error setting URL: ' + JSON.stringify(content));
      })
   },

   onClicked: function(output) {
      forge.button.onClicked.addListener(function(){
         output.text('Toolbar button clicked!')
      });
      output.text('Added listener to toolbar button.');
   },

   setBadge: function(output) {
      forge.button.setBadge(1,function(){
         output.text('Set badge to 1.');
      }, function(content){
         output.text('Failed to set badge: ' + JSON.stringify(content));
      })
   },

   setBadgeBgrColor: function(output) {
     forge.button.setBadgeBackgroundColor([0,255,255,255],function(){
         output.text('Set badge color to [0,255,255,255]');
      }, function(content){
         output.text('Failed to set badge color: ' + JSON.stringify(content));
      }) 
   },

   setTitle: function(output) {
      forge.button.setTitle('New API Demonstration Title', function(){
         output.text('Set button title to "New API Demonstration Title"');
      }, function(content){
         output.text('Failed to set button title: ' + JSON.stringify(content));
      })
   },

   render: function () {   
      forge.logging.log('Rendering toolbar button view.');

      page = API_demo.Templates.toolbar_button;
        
      $(this.el).append(page);
      return this;
   }
});

API_demo.Views.contacts = API_demo.Views.Page.extend({
   generateExpandableData: function(text) {
      var data = {};
      data.setup = false;
      data.platforms = ['mobile'];
      data.snippet = this.selectContact;
      return data;
   },

   selectContact: function(output) {
      forge.contact.select(function(contact){
         output.text('You selected '+ contact.displayName);
      }, function(content){
         output.text('Error selecting contact: ' + JSON.stringify(content));
      })
   },

   render: function () {   
      forge.logging.log('Rendering contacts view.');

      page = API_demo.Templates.contacts;
        
      $(this.el).append(page);
      return this;
   }
});

API_demo.Views.events = API_demo.Views.Page.extend({
  generateExpandableData: function(text) {
      var data = {};
      data.setup = false;
      data.platforms = ['all'];
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
         case 'forge.event.connectionStateChange.addListener()': {
            data.description = 'Triggered when the device connection state changes, use forge.is.connection.connected() and forge.is.connection.wifi() to test new connection state.';
            data.snippet = this.connectionStateChange;
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
         output.text('Error adding menu button listener: ' + JSON.stringify(content));
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
         output.text('Error adding listener for orientation change: ' + JSON.stringify(content));
      })
      output.text("Now change your device's orientation.");
   },

   connectionStateChange: function (output) {
      forge.event.connectionStateChange.addListener(function(){
         if(forge.is.connection.connected()) {
            if(forge.is.connection.wifi()) {
               output.text('Connected through wifi.');
            } else {
               output.text('Connected');
            }
         } else {
            output.text('Disconnected');
         }
      },function(content){
         output.text('Error adding a connection state change listener: ' + JSON.stringify(content));
      });
      output.text('Now change connection state.');
   },

   messagePushed: function (output) {
      forge.event.messagePushed.addListener(function(data){
         output.text('Will show up when message is pushed');
      },function(content){
         output.text('Error adding a pushed message listener: ' + JSON.stringify(content));
      })
      output.text("Now listening for pushed messages.");
   },

   render: function () {   
      forge.logging.log('Rendering events view.');

      page = API_demo.Templates.events;
        
      $(this.el).append(page);
      return this;
   }
});

API_demo.Views.file_and_camera = API_demo.Views.Page.extend({
   generateExpandableData: function(text) {
      var data = {};
      data.platforms = ['mobile'];
      data.setup = false;
      switch (text){
         case 'forge.file.getImage()': {
            data.description = 'Returns a file object for a image selected by the user from their photo gallery or (if possible on the device) taken using their camera.';
            data.snippet = this.getImage;
            break;
         }
         case 'forge.file.getVideo()': {
            data.description = 'Returns a file object for a video selected by the user from their photo gallery or (if possible on the device) taken using their camera.';
            data.snippet = this.getVideo;
            break;
         } 
         case 'forge.file.getLocal()': {
            data.description = 'Returns a file object for a file included in the src folder of your app.';
            data.snippet = this.getLocal;
            break;
         }
         case 'forge.file.cacheURL()': {
            data.description = 'Downloads a file at a specified URL and returns a file object which can be used for later access.';
            data.snippet = this.cacheURL;
            break;
         } 
         case 'forge.file.isFile()': {
            data.setup = true;
            data.description = 'Returns true or false based on whether a given object is a file object and points to an existing file on the current device.';
            data.snippet = this.isFile;
            data.setup_snippet = this.setup_isFile;
            break;
         }
         case 'forge.file.URL()': {
            data.setup = true;
            data.description = 'Returns a URL which can be used to display an image. Height and width will be limited by the values given when originally selecting the image.';
            data.snippet = this.URL;
            data.setup_snippet = this.setup_URL;
            break;
         }
         case 'forge.file.base64()': {
            data.setup = true;
            data.description = 'Returns the base64 value for a files content.';
            data.snippet = this.base64;
            data.setup_snippet = this.setup_base64;
            break;
         }
         case 'forge.file.string()': {
            data.description = 'Returns the string value for a files content.';
            data.snippet = this.string;
            break;
         }
         case 'forge.file.remove()': {
            data.setup = true;
            data.description = 'Delete a file from the local filesystem, will work for cached files but not images stored in the users photo gallery.';
            data.snippet = this.remove;
            data.setup_snippet = this.setup_remove;
            break;
         }
         case 'forge.file.clearCache()': {
            data.description = 'Deletes all files currently saved in the local cache.';
            data.snippet = this.clearCache;
            break;
         }
      }
      return data;
   },
  
   getImage: function (output){
      forge.file.getImage({
         width:200,
         source:'camera',
         saveLocation:'file'
      }, function(file){
         forge.file.URL(file,function(url){
            output.html('<img src="'+url+'">')
         }, function(content){
            output.text('Error getting image url: ' + JSON.stringify(content));
         })
      }, function(content){
         output.text('Error getting image: ' + JSON.stringify(content));
      })
   },

   getVideo: function (output){
      forge.file.getVideo({
         source:'camera'
      }, function(file){
         forge.file.URL(file,function(url){
            output.html('<video controls="controls">'+
               '<source src="'+url+'"/>'+
               'Could not open video.'+
               '</video>')
         },function(content){
            output.text('Error getting video url: ' + JSON.stringify(content));
         })
      }, function(content){
         output.text('Error getting video: ' + JSON.stringify(content));
      })
   },

   getLocal: function (output) {
      forge.file.getLocal('img/T-128x128.png', function(file){
         forge.file.URL(file,function(url){
            output.html('<img src="'+url+'">');
         }, function(content){
            output.text('Error getting local file url: ' + JSON.stringify(content));
         })
         
      }, function(content){
         output.text('Error getting local file: ' + JSON.stringify(content));
      })
   },

   cacheURL: function (output){
      forge.file.cacheURL('https://trigger.io/forge-static/css/trigger/f/logo-header-small-caps.png',
         function(file){
            forge.file.URL(file,function(url){
               output.html('<img src="'+url+'">')  
            }, function(content){
               output.text('Error getting URL: ' + JSON.stringify(content));
            })
      }, function(content){
         output.text('Error caching URL: ' + JSON.stringify(content));
      })
   },

   isFile: function (output) {
      forge.file.isFile(this.file,function(isFile){
         if(isFile)
            output.text('It is a file.');
         else
            output.text('It is not a file.');
      })
   },

   setup_isFile: function(output, that) {
      _this = this;
      forge.file.getImage({
         width:200,
         saveLocation:'file'
      }, function(file){
         _this.file = file;
         output.text('Setup complete.');
         that.ready = true;
      }, function(content){
         output.text('Setup failed: ' + JSON.stringify(content));
         that.ready = false;
      })
   },

   URL: function (output){
      forge.file.URL(this.file, function(url){
         output.text('url is '+url);
      }, function(content){
         output.text('Error getting URL: ' + JSON.stringify(content));
      })
   },

   setup_URL: function(output, that) {
      _this = this;
      forge.file.getLocal('img/T-128x128.png', function(file){
         _this.file = file;
         output.text('Setup complete');
         that.ready = true;
      }, function(content){
         output.text('Setup failed: ' + JSON.stringify(content));
         that.ready = false;
      })
   },

   base64: function (output) {
      forge.file.base64(this.file, function(base64string){
         output.text(base64string);
      }, function(content){
         output.text('Error getting base64 string: ' + JSON.stringify(content));
      })
   },

   setup_base64: function (output, that) {
      _this = this;
      forge.file.getLocal('text_file.txt', function(file){
         _this.file = file;
         output.text('Setup complete');
         that.ready = true;
      }, function(content){
         output.text('Setup failed: ' + JSON.stringify(content));
         that.ready = false;
      })
   },

   string: function (output){
      forge.file.getLocal('text_file.txt', function(file){
         forge.file.string(file, function(string){
            output.text(string);
         }, function(content){
            output.text('Error getting string value of file: ' + JSON.stringify(content));
         })
      }, function(content){
         output.text('Error getting local file: ' + JSON.stringify(content));
      })
   },

   remove: function (output) {
      _this = this;
      forge.file.remove(_this.file,function(){
         forge.file.isFile(_this.file,function(isFile){
            if(isFile)
               output.text('It is no longer a file.');
            else
               output.text('It is a file.');
         }, function(content){
            output.text('Error checking if file exits: ' + JSON.stringify(content));
         })
      }, function(content){
         output.text('Error removing file: ' + JSON.stringify(content));
      })
   },

   setup_remove: function(output, that) {
      _this = this;
      forge.file.getImage({
         width:200,
         source:'camera',
         saveLocation:'file'
      }, function(file){
         forge.file.URL(file,function(url){
            _this.file = file;
            that.ready = true;
            output.text('Setup complete.')
         }, function(content){
            that.ready = false;
            output.text('Setup failed: ' + JSON.stringify(content));
         })
      }, function(content){
         isReady = false;
         output.text('Setup failed: ' + JSON.stringify(content));
      })
   },
   clearCache: function (output){
      forge.file.clearCache(function(){
         output.text('Cleared cache.');
      },function(content){
         output.text('Error clearing cache: ' + JSON.stringify(content));
      })
   },

   render: function () {   
      forge.logging.log('Rendering file and camera view.');

      page = API_demo.Templates.file_and_camera;
       
      $(this.el).append(page);
      return this;
   }
});

API_demo.Views.geolocation = API_demo.Views.Page.extend({


   generateExpandableData: function (text) {
      return {
         'setup': false,
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
            output.text('Error getting position: ' + JSON.stringify(content));
      })
   },

   render: function () {   
      forge.logging.log('Rendering geolocation view.');

      page = API_demo.Templates.geolocation;
        
      $(this.el).append(page);
      return this;
   }
}); 

API_demo.Views.platform_detection = API_demo.Views.Page.extend({

   generateExpandableData: function(text) {
      data = {};
      data.setup = false;
      if(text.substring(0,21)=='forge.is.orientation.' || text.substring(0,20) == 'forge.is.connection.') {
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
            data.description = "Returns true if running as a hosted web app";
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
         case 'forge.is.connection.connected()': {
            data.description = "Returns true if a mobile device has an active internet connection.";
            break;
         }
         case 'forge.is.connection.wifi()': {
            data.description = "Returns true if a mobile device is connected via wifi.";
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
         ],
         connection: [
            {'command':'forge.is.connection.connected()'},
            {'command':'forge.is.connection.wifi()'}
         ]
      };
        
      var page = Mustache.to_html(API_demo.Templates.platform_detection, data);
      
      $(this.el).append(page);
      return this;
   }
});

API_demo.Views.logging = API_demo.Views.Page.extend({

   generateExpandableData: function(text) {
      var data = {};
      data.setup = false;
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
      return this;
   }
});

//TODO might require modification to add message listeners or senders

API_demo.Views.component_communication = API_demo.Views.Page.extend({
   generateExpandableData: function(text) {
      var data = {};
      data.setup = false;
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
         output.text('Error listening to message: ' + JSON.stringify(content));
      })
      output.text('Listening for messages of type randomType');
   },

   broadcast:function(output) {
      forge.message.broadcast('randomType','Hello',function(content){
         output.text(content);
      }, function(content){
         output.text('Error broadcasting message: ' + JSON.stringify(content));
      })
   },

   broadcastBackground:function(output) {
      forge.message.broadcastBackground('randomType','Hello',function(content){
         output.text(content);
      }, function(content){
         output.text('Error broadcasting message to background: ' + JSON.stringify(content));
      })
   },

   toFocussed:function(output) {
      output.text('Nobody listening');
      forge.message.toFocussed('randomType','toFocussed Hello',function(content){
         output.text(content);
      }, function(content){
         output.text('Error broadcasting message: ' + JSON.stringify(content));
      });
   },

   render: function () {   
      forge.logging.log('Rendering component communication view.');

      page = API_demo.Templates.component_communication;
        
      $(this.el).append(page);
      return this;
   }
});

API_demo.Views.notifications = API_demo.Views.Page.extend({
   generateExpandableData: function(text) {
      return {
         setup: false,
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
            output.text('Error creating notification: ' + JSON.stringify(content));
         })
   },

   render: function () {   
      forge.logging.log('Rendering notifications view.');

      page = API_demo.Templates.notifications;
       
      $(this.el).append(page);
      return this;
   }
});

API_demo.Views.preferences = API_demo.Views.Page.extend({

   generateExpandableData: function(text) {
      var data = {};
      data.setup = false;
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
         output.text('Error getting "page" preference: ' + JSON.stringify(content));
      })
   },

   setPref: function (output) {
      forge.prefs.set('page', 1, function(){
         output.text("Set 'page' preference.");
      }, function(error){
         output.text('Error setting "page" preference: ' + JSON.stringify(content));
      })
   },

   clearPref: function (output) {
      forge.prefs.clear('page',function(){
         output.text("Cleared 'page' preference.");
      }, function(error){
         output.text('Error clearing "page" preference: ' + JSON.stringify(content));
      })
   },

   clearAllPrefs: function (output) {
      forge.prefs.clearAll(function(){
         output.text("Cleared all preferences");
      }, function(error){
         output.text('Error clearing all preferences: ' + JSON.stringify(content));
      })
   },

   prefKeys: function (output) {
      forge.prefs.keys(function(keys){
         if(keys.length ==0)
            output.text("No stored keys");
         else
            output.text("Preference keys are:\n"+keys);
      }, function(error){
         output.text('Error getting preferences keys: ' + JSON.stringify(content));
      })
   },

   render: function () {   
      forge.logging.log('Rendering preferences view.');

      page = API_demo.Templates.preferences;
        
      $(this.el).append(page);
      return this;
   }
});

API_demo.Views.requests = API_demo.Views.Page.extend({

   generateExpandableData: function(text) {
      var data = {};
      data.setup = false;
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
      }, function(content){
         forge.logging.log('Error doing a GET request: ' + JSON.stringify(content));
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
               errorThrown);
         }
      })
   },

   render: function () {   
      forge.logging.log('Rendering requests view.');

      page = API_demo.Templates.requests;
        
      $(this.el).append(page);
      return this;
   }
});

API_demo.Views.sms = API_demo.Views.Page.extend({
   generateExpandableData: function(text) {
      var data = {};
      data.setup = false;
      data.platforms = ['mobile'];
      data.snippet = this.sendSMS;
      return data;
   },

   sendSMS: function (output) {
      forge.sms.send({
         body: 'Hello World!',
         to:['123456789','987654321']
      }, function(){
         output.text('Successfully opened sms app.');
      }, function(content){
         output.text('Error sending message: ' + JSON.stringify(content));
      })
   },
   
   render: function () {   
      forge.logging.log('Rendering sms view.');

      page = API_demo.Templates.sms;
        
      $(this.el).append(page);
      return this;
   }
});

API_demo.Views.native_tab_bar = API_demo.Views.Page.extend({
   generateExpandableData: function(text) {
      var data = {};
      data.setup = false;
      data.platforms = ['mobile'];
      switch (text){
         case 'forge.tabbar.setTint()': {
            data.description = 'Set a colour to tint the tabbar with, in effect the tabbar will become this colour with a gradient effect applied.';
            data.snippet = this.setTint;
            break;
         } 
         case 'forge.tabbar.setActiveTint()': {
            data.description = 'Set a colour to tint active tabbar item with.';
            data.snippet = this.setActiveTint;
            break;
         }
         case 'forge.tabbar.addButton()': {
            data.description = 'Add a button with an icon and text to the tabbar.';
            data.snippet = this.addButton;
            break;
         }
         case 'forge.tabbar.removeButtons()': {
            data.description = 'Remove all buttons from the tabbar.';
            data.snippet = this.removeButtons;
            break;
         }
         case 'forge.tabbar.setInactive()': {
            data.description = 'Unselect any currently active tab, leaving the tabbar with no tabs selected.';
            data.snippet = this.setInactive;
            break;
         }

      }
      return data;
   },

   setTint: function (output) {
      forge.tabbar.setTint([120,120,120,255], function(){
         output.text('Set tabbar tint to [120,120,120,255].');
      }, function(content){
         output.text('Error setting tabbar color: ' + JSON.stringify(content));
      })
   },

   setActiveTint: function (output) {
      forge.tabbar.setActiveTint([255,255,0,255], function(){
         output.text('Set tabbar active tint to [0,255,255,255].');
      }, function(content){
         output.text('Error setting tabbar color: ' + JSON.stringify(content));
      })
   },

   addButton: function (output) {
      forge.tabbar.addButton({
         icon:'img/T-128x128.png',
         text:'Trigger',
         index: 0
      },function(button){
         button.setActive();
         button.onPressed.addListener(function(){
            output.text('Pressed tabbar button');
         })
      },function(content){
         output.text('Error adding button to tabbar: ' + JSON.stringify(content));
      })
   },

   removeButtons: function (output) {
      forge.tabbar.removeButtons(function(){
         output.text('Removed tabbar buttons');
      }, function(content){
         output.text('Error removing tabbar buttons: ' + JSON.stringify(content));
      })
   },
   
   setInactive: function (output) {
      forge.tabbar.setInactive(function(){
         output.text('Set tabbar to inactive.');
      }, function(content){
         output.text('Error setting tabbar to inactive: ' + JSON.stringify(content));
      })
   },

   render: function () {   
      forge.logging.log('Rendering native tab bar view.');

      page = API_demo.Templates.native_tab_bar;
        
      $(this.el).append(page);
      return this;
   }
});

API_demo.Views.tabs_management = API_demo.Views.Page.extend({
  generateExpandableData: function(text) {
      var data = {};
      data.setup = false;
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
            output.text('Error opening tab: ' + JSON.stringify(content));
      })
   },

   openTabWOptions: function (output) {
      forge.tabs.openWithOptions({
         url:'http://www.trigger.io/',
         keepFocus:true
      },function(object){
         output.text('Successfully opened new tab.');
      },function(content){
         output.text('Error opening tab: ' + JSON.stringify(content));
      })
   },

   closeTab: function (output) {
      forge.tabs.closeCurrent(function(content){
         output.text('Error closing tab: ' + JSON.stringify(content));
      })
   },

   render: function () {   
      forge.logging.log('Rendering tabs management view.');

      page = API_demo.Templates.tabs_management;
        
      $(this.el).append(page);
      return this;
   }
});

API_demo.Views.tools = API_demo.Views.Page.extend({
   
   generateExpandableData: function(text) {
      var data = {};
      data.setup = false;
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
      forge.tools.getURL('img/trigger-logo.png',function(url){
         output.html('<img src="'+url+'">');   
      },function(content){
         output.text('Error getting a URL: ' + JSON.stringify(content));
      })
   },

   render: function () {   
      forge.logging.log('Rendering tools view.');

      page = API_demo.Templates.tools;
        
      $(this.el).append(page);
      return this;
   }
});

API_demo.Views.native_top_bar = API_demo.Views.Page.extend({
   generateExpandableData: function(text) {
      var data = {};
      data.setup = false;
      data.platforms = ['mobile'];
      switch (text){
         case 'forge.topbar.setTitle()': {            
            data.description = 'Set the title displayed in the top bar.';
            data.snippet = this.setTitle;
            break;
         } 
         case 'forge.topbar.setTitleImage()': {
            data.description = 'Set the title displayed in the top bar to an image.';
            data.snippet = this.setTitleImage;
            break;
         } 
         case 'forge.topbar.setTint()': {
            data.description = 'Set a colour to tint the topbar with, in effect the topbar will become this colour with a gradient effect applied.';
            data.snippet = this.setTint;
            break;
         }
         case 'forge.topbar.addButton()': {
            data.description = 'Add a button with an icon to the top bar.';
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

   setTitle: function (output) {
      forge.topbar.setTitle('Forge API Demo',function(){
         output.text('Set top bar title.');
      }, function(content){
         output.text('Error setting top bar title: ' + JSON.stringify(content));
      })
   },

   setTitleImage: function (output) {
      forge.topbar.setTitleImage('img/logo-forge.png',function(){
         output.text('Set top bar title image.');
      }, function(content){
         output.text('Error setting top bar title image: ' + JSON.stringify(content));
      })
   },

   setTint: function (output) {
      forge.topbar.setTint([120,120,120,255], function(){
         output.text('Set topbar tint to [120,120,120,255].');
      }, function(content){
         output.text('Error setting topbar color: ' + JSON.stringify(content));
      })
   },
   addButton: function (output) {
      forge.topbar.addButton({
         text: "Search",
         position: "left"
      }, function () {
         output.text("Search pressed.");
      }, function(content){
         output.text('Error creating top bar button: ' + JSON.stringify(content));
      })
   },

   removeButtons: function (output) {
      forge.topbar.removeButtons(function(){
         output.text('Removed top bar buttons');
      }, function(content){
         output.text('Error removing top bar buttons: ' + JSON.stringify(content));
      })
   },

   render: function () {   
      forge.logging.log('Rendering native top bar view.');

      page = API_demo.Templates.native_top_bar;
        
      $(this.el).append(page);
      return this;
   }
});
