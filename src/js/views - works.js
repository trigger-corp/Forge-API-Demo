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
    },

    goBack: function() {
        (new API_demo.Views.home({'back':true})).show();
        API_demo.router.navigate('');
    },

    toggleExpandable: function (eventObject) {
        target = $(eventObject.currentTarget);
        parent = target.parent();
        exp = $(".expandable",parent);
        //check to see if we need to show or hide the expandable view
        if(exp.css('display') == 'none'){ 
            exp.show(); 
        } else { 
            exp.hide(); 
            $("#output",parent).text("\u00A0");
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
        this.options.snippet($('#output',this.el));
    },

    render: function () {
        forge.logging.log('Rendering expandable view.');
        data = {
            snippet:this.options.snippet.toString()
        };

        page = Mustache.to_html(API_demo.Templates.expandable, {});
    
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
    events: {
        'click .function_name':'toggleExpandable'
    },

    generateExpandables: function () {
        $('.function_name',this.el).forEach( function(name){
            var parent = $(name).parent();
            var snippet = _this.generateSnippet($(name).text());
            parent.append((new API_demo.Views.expandable({
                'snippet':snippet
            })).el);
        })
    },

    generateSnippet: function(text) {
        eval('var func = function(output){\n\toutput.text('+text+')\n};');
        return func;
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
       this.generateExpandables();

        return this;
    }
});

API_demo.Views.component_communication = API_demo.Views.Page.extend({
    render: function () {   
        forge.logging.log('Rendering component communication view.');

        page = API_demo.Templates.component_communication;
        
        $(this.el).append(page);

        return this;
    }
});

API_demo.Views.notifications = API_demo.Views.Page.extend({
    render: function () {   
        forge.logging.log('Rendering notifications view.');

        page = API_demo.Templates.notifications;
        
        $(this.el).append(page);

        return this;
    }
});

API_demo.Views.requests = API_demo.Views.Page.extend({
    events: {
        'click .function_name':'toggleExpandable'
    },

    generateExpandables: function () {
        $('.function_name',this.el).forEach( function(name){
            var parent = $(name).parent();
            var snippet = _this.generateSnippet($(name).text());
            parent.append((new API_demo.Views.expandable({
                'snippet':snippet
            })).el);
        })
    },

    generateSnippet: function(text) {
        eval('var func = function(output){\n\toutput.text('+text+')\n};');
        return func;
    },

    getWeatherInfo: function(outputElement) {
        forge.logging.log('[getWeatherInfo] getting weather for Boston');
        _this =this;
        forge.request.get({
            url:"http://www.google.com/ig/api?weather=boston",     ///need to change url
            success: function(data){
                forge.logging.log('Get call success');
                forge.logging.log('data is '+data);
                forge.logging.log('Current temperature in Boston is '+_this.xmlToJson(data,['temp_f']).temp_f);
                $('#get_success').css('display','block');
            },
            error: function(jqXHR, textStatus, errorThrown){
                forge.logging.log('ERROR! [getWeatherInfo] '+textStatus);
            }
        })
    },

    ajaxWeatherInfo: function(outputElement) {
        forge.request.ajax({
            url:"http://www.google.com/ig/api?weather=boston",
            dataType: 'xml',
            success: function(data, textStatus, jqXHR){
                console.log('Ajax call success');
                outputElement.text("Temperature in Boston: "+$('temp_f',data).attr('data'));
            },
            error: function(jqXHR, textStatus, errorThrown){
                forge.logging.log('ERROR! [ajaxWeatherInfo] '+textStatus);
            }
        })
    },

    xmlToJson: function(doc, keys) {
        var result = {};

        for (var counter=0; counter<keys.length; counter+=1) {
            result[keys[counter]] = $(keys[counter], doc).attr('data');
        }
        return result;
    },

    render: function () {   
        forge.logging.log('Rendering requests view.');

        page = API_demo.Templates.requests;
        
        $(this.el).append(page);

        return this;
    }
});

API_demo.Views.geolocation = API_demo.Views.Page.extend({
    render: function () {   
        forge.logging.log('Rendering geolocation view.');

        page = API_demo.Templates.geolocation;
        
        $(this.el).append(page);

        return this;
    }
});

API_demo.Views.tools = API_demo.Views.Page.extend({
    render: function () {   
        forge.logging.log('Rendering tools view.');

        page = API_demo.Templates.tools;
        
        $(this.el).append(page);

        return this;
    }
});

API_demo.Views.logging = API_demo.Views.Page.extend({
    render: function () {   
        forge.logging.log('Rendering logging view.');

        page = API_demo.Templates.logging;
        
        $(this.el).append(page);

        return this;
    }
});

API_demo.Views.tabs_management = API_demo.Views.Page.extend({
    render: function () {   
        forge.logging.log('Rendering tabs management view.');

        page = API_demo.Templates.tabs_management;
        
        $(this.el).append(page);

        return this;
    }
});

API_demo.Views.preferences = API_demo.Views.Page.extend({
    render: function () {   
        forge.logging.log('Rendering preferences view.');

        page = API_demo.Templates.preferences;
        
        $(this.el).append(page);

        return this;
    }
});

API_demo.Views.toolbar_button = API_demo.Views.Page.extend({
    render: function () {   
        forge.logging.log('Rendering toolbar button view.');

        page = API_demo.Templates.toolbar_button;
        
        $(this.el).append(page);

        return this;
    }
});

API_demo.Views.file_and_camera = API_demo.Views.Page.extend({
    render: function () {   
        forge.logging.log('Rendering file and camera view.');

        page = API_demo.Templates.file_and_camera;
        
        $(this.el).append(page);

        return this;
    }
});

API_demo.Views.events = API_demo.Views.Page.extend({
    render: function () {   
        forge.logging.log('Rendering events view.');

        page = API_demo.Templates.events;
        
        $(this.el).append(page);

        return this;
    }
});

API_demo.Views.user_interface = API_demo.Views.Page.extend({
    render: function () {   
        forge.logging.log('Rendering user interface view.');

        page = API_demo.Templates.user_interface;
        
        $(this.el).append(page);

        return this;
    }
});

API_demo.Views.contacts = API_demo.Views.Page.extend({
    render: function () {   
        forge.logging.log('Rendering contacts view.');

        page = API_demo.Templates.contacts;
        
        $(this.el).append(page);

        return this;
    }
});

API_demo.Views.sms = API_demo.Views.Page.extend({
    render: function () {   
        forge.logging.log('Rendering sms view.');

        page = API_demo.Templates.sms;
        
        $(this.el).append(page);

        return this;
    }
});