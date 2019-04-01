class member2__CardHolder extends __Widget{
    /**
     * Example: Constructor method to make an object representing   
     * the client-side code of the server's PHP widget maker. 
     * It is called from the HTML page's "document ready" code added   
     * by addClientObject() in the widget's PHP class.
     *
     * @param holderId The ID of the DOM element containing the
     * widget's markup.
     * @param options The user options given to the server-side widget.
     */
    // constructor(holderId) {
    //     super('TestingWidget');
    // }
   
    static initClass() {    

        var addKeyupEvent = function(el) {   
        	// Init a timeout variable to be used below
            var timeout = null;

            // Listen for keystroke events
            el.addEventListener('keyup', function() {
                 clearTimeout(timeout);

                timeout = setTimeout(function () {
                    console.log(el.value);
                    member2__CardHolder.onSearch(el.value);
                }, 500);
            });
        };
            
    	setTimeout(function() {
			// Get the input box
            var searchBox = document.getElementById('SearchBox');
            addKeyupEvent(searchBox);
            
        var href = "javascript:$('#member2__Modal34').find('button').click();";
        $('#filterbar').find('#tasks').find('.FilterOptions').append('<a href='+href+'>Other<small> (Propose a task)</a>');
	            $('body').bind('click', function(e) {
    if($(e.target).closest('.Filter').length == 0) {
        member2__CardHolder.onApplyButtonClick();

    }
});
            
            
        }, 1000);
        
        $(document).on('mouseover', '.FilterMore', function () {
               $(this).find('.Popover').stop().slideDown('medium');
        });
        $(document).on('mouseleave', '.FilterMore', function () {
               $(this).find('.Popover').slideUp('medium');
        });
    }
    
    static showFilters()
    {
        $('#filterbar').show();
        $('body').css('overflow', 'hidden');

    }
    
    static hideFilters()
    {
        $('#filterbar').hide();
        $('body').css('overflow', 'auto');
    }

    static getPopularSearches(callback)
    {
        var params = {'X-Algolia-API-Key': '1c2809bfd0b4045523f68a3d84d495e7', 'X-Algolia-Application-Id': "63LY6A3BJN"};
        var res = $.getJSON('https://analytics.algolia.com/2/hits?index=policomm', params, function(data) {
            callback(data)
        });
	}

    sprintf(format, var_args) {
        var args = Array.prototype.slice.call(arguments, 1);

        return format.replace(/{(\d+)}/g, function (match, number) {
            return args[number];
        });
    }

    onReady() {
        console.log('here');
    }

    makeArticleCards(articles, cardFormat) {
        var items = [];

        for (var key in  articles)
        {
        	var article = articles[key];
            var articleContent = article['content'];
            article['content'] = (articleContent.length > 300) ? articleContent.substring(0, 300) + '...' : articleContent;
            var item = this.formatTemplate(cardFormat, article);
            items.push(item);
        }

        return items;
    }
    
    render(params) {
        var widgetMarkup = [];
        var dictionary = params['dictionary'];
        this.dictionary = dictionary;
        var cardFormat = params['cardFormat'];
        var articles = params['articles'];
        var filtersParams = params['filters'];
        var layoutFormat = params['layoutFormat'];
        var cards = this.makeArticleCards(articles, cardFormat);
        var filters = this.getFilters(filtersParams, articles);
        widgetMarkup['filters'] = filters;
        widgetMarkup['cards'] = cards;
        member2__CardHolder.cardsContent = articles;
        member2__CardHolder.filters = Object.keys(filtersParams);
        var templateValues = $.extend(widgetMarkup, dictionary);

        var markup = this.formatTemplate(layoutFormat, templateValues);
        var holder = this.holder;
       	var markupCore = new MarkupCore();
        markupCore.insertElements(markup, $(holder));
    }
    
    
   /**
    * Formats a template with the given values.
    *  
    * @param format string.
    * @param {...*} data parameters.
    * @return New formatted string.
    */
    formatTemplate(format, data) {
        format = JSON.stringify(format);
                
        Object.keys(data).forEach(function (key) {
            if (data[key] instanceof Object)
             	format = format.replace(new RegExp('"%' + key + '\\$s"', 'g'), JSON.stringify(data[key]));
            else
            	format = format.replace(new RegExp('%' + key + '\\$s', 'g'), data[key]);
        });
        format = JSON.parse(format);
        
        return format;
    };
    
    countFilterValues(filterValues) {
        var count = [];
                    
        for (var key in filterValues)
        {
            var filterValue = filterValues[key];
            
            if (!filterValue)
				continue;
            
            if (!count[filterValue])
                count[filterValue] = 0
            
            count[filterValue]++;
        }
        
        return count;
    }
    
    getFilterFormat(filterType)
    {
        if (filterType == 'checkbox')
        {
            var format = {
                tag: 'div',
                'class': 'md-checkbox',
                data: [
                    {
                    	tag: 'input',
                    	id: '%filterValueId$s',
                    	type: 'checkbox',
                        value: "%filterValue$s"
                        
                    },
                    {
                        tag: 'label',
                        'for': '%filterValueId$s',
                        value: "%filterValue$s" + ' (' + "%count$s" + ')'
                    }
                ]
            };
        }
        else if (filterType == 'list')
        {
			var format = {tag: "div", "class": "task-item", data: {"tag": "a", href: "#", "data": "%filterValue$s"}};
        }
        else
        {
			var format = {tag: 'div', data: '%filterValue$s'};
        }
        
        return format;
    }
    
    static syncCheckBoxState(id) {
        var state = $('#sidebar').find('#' + id).prop('checked');
        $('#filterbar').find('#' + id).prop('checked', state);
    }
    
    makeFilter(filterName, filterValues, filterType) {
		var filterOptions = [];
        var format = this.getFilterFormat(filterType);
        
        for (var filterValue in filterValues)
        {
        	var count = filterValues[filterValue];
            var filterValueId = filterValue.replace(/\s+/g, '_').toLowerCase();
            var templateData = {count: count, filterValue: filterValue, filterValueId: filterValueId};
            var markup = this.formatTemplate(format, templateData);
            filterOptions.push(markup);
        }
        
       var filterTitle = filterName.charAt(0).toUpperCase() + filterName.slice(1);
       var filter = {tag: 'div', id: filterName, 'class': 'Filter', data: [
               {"tag": "h3", "class": "FilterTitle", "value": filterTitle},
           	   {"tag": "div", "class": "FilterOptions", data: filterOptions}
       ]};
        
        return filter;
    }
    
    getFilters(filtersParams, content) {
        var arr = [];
        var filters = [];

        for (var filterId in filtersParams)
        {
            arr[filterId] = [];
            var filterParam = filtersParams[filterId];
            var filterType = (filterParam['type']) ? filterParam['type'] : 'checkbox';
            console.log(this.dictionary);
            var filterName = this.dictionary['lbl_' + filterId];

            for (var key in content)
            {
				var article = content[key];
               	var filterValues =  article[filterId];
             	arr[filterId] = arr[filterId].concat(filterValues);                               
            }
            
            arr[filterId].sort();
            var filterValues = this.countFilterValues(arr[filterId]);
            var filter = this.makeFilter(filterId, filterValues, filterType);
            filters.push(filter);
        }
                
        return filters; 
    }
    
    static removeFilterSelection(filter, id) {
        var filterGroup = $('.FilterGroup#' + filter);
        var filterSelection = filterGroup.find('.SelectionItem#' + id);
        
		filterSelection.remove();
        
        if (!filterGroup.children().length)
            filterGroup.remove();
        
        var filterOptions = $('.Filter#' + filter).find('.FilterOptions');
        var checkbox = filterOptions.find('input#' + id);
        checkbox.prop('checked', false);
        
        member2__CardHolder.onApplyButtonClick();
    }
    
    static onApplyButtonClick() {
        var tgtEl = $('.FilterSelection');
        var filters = member2__CardHolder.filters;
        var articles = member2__CardHolder.cardsContent;
        var filterGroups = [];
        
        member2__CardHolder.onFilterBarClick();
        window.scrollTo(500, 0);

        tgtEl.empty();
        $('#filterbar').addClass('is-closed').removeClass('is-active');
        $('.ArticlesContainer').children().hide();
            
        for (var key in filters)
        {
            var filter = filters[key];
			var filterValues = [];
            console.log(filter);
            
            var items = $('.Filters').find('#' + filter +  ' input:checked').map(function() {
                var elem = $(this);
                var val = elem.attr('value');
                var filterValueId = val.replace(/\s+/g, '_').toLowerCase();
                var href = "javascript:member2__CardHolder.removeFilterSelection('"+ filter + "','"+ filterValueId + "')";
                var item = {tag:'div', id: filterValueId, 
                            'class': 'SelectionItem', data: 
                            [val, {tag: 'a', href: href,  data: {tag: 'img', src: 'https://cdn1.iconfinder.com/data/icons/basic-ui-elements-color/700/010_x-128.png'}}]};
                filterValues.push(val);

                return item;                
            }).get();

            console.log(filterValues);

            if (!items.length)
                continue;
            
            for (var i in articles)
            {
				var article = articles[i];
                var id = article['id'];

                if (article[filter])
                {
		        	var articleFilterValues = article[filter];
                	var hasFilter = articleFilterValues.filter(value => -1 !== filterValues.indexOf(value)).length;
                    var elem = $('#' + id);
                    
            		if (hasFilter)
                  		elem.show();
                }         
            }

            if (items.length > 2)
            {
                var popoverList = items.slice(2, items.length);
				 items = [items.slice(0, 2), {tag: 'div', class: 'FilterMore', value: 'and ' + popoverList.length + ' more', 
                                              data: {tag: 'div', 'class': 'Popover', data: popoverList}}];
            }
            
            var filterGroup = {tag: 'div', id: filter, 'class': 'FilterGroup', 'data': items};
            filterGroups.push(filterGroup);
        }
        
        if (!filterGroups.length)
        {
			$('.ArticlesContainer').children().show();
			return;
        }
        
        var total =  Object.keys(articles).length;
        var visibleArticleCount = $('.ArticlesContainer > article:visible').length;
        var articleCount = {tag: 'div', class:'ActiveFiltersLbl', value: visibleArticleCount + ' of  ' + total};
        var sectionLbl = {tag: 'div', class:'ActiveFiltersLbl', value: 'Active Filters:'};
        var clearFiltersLink = {tag: 'a', href: '#', onclick: 'javascript:member2__CardHolder.onResetButtonClick()', 
         	style:'align-self:center;margin-left:1.5rem;', value: 'Clear All Filters'};
        var filterItems = {tag: 'div', 'class': 'FilterItems', data: [articleCount, sectionLbl, filterGroups, clearFiltersLink]};
        var markupCore = new MarkupCore();
        markupCore.insertElements(filterItems, tgtEl);
    }
    
    static onResetButtonClick() {
   		$('#filterbar').addClass('is-closed').removeClass('is-active');
		$(".Filter [type=checkbox]").prop( "checked", false );
        $('.ArticlesContainer').children().show();
        $('.FilterSelection').html('');
    }        
   
   /**
     * Example: Static function to get something done without having
     * to create an object of this class. It is called
     * from the HTML page's "document ready" code added by addClientCode()  
     * in the widget's PHP class.
     *
     * @param holderId The ID of the DOM element containing the
     * widget's markup.
     * @param options The user options given to the server-side widget.
     */
   static doSomethigStatic(holderId, options) {
       // Get the DOM element that contains the widget's markup
       var holder = document.getElementById(holderId);

       // Do something based on the given options
       // holder.style.backgroundColor = 'red';
   }
   
    
    static onFilterBarClick(e)
    {
        // Close the sidebar.
//         $('#sidebar').removeClass('is-open').addClass('is-closed');
//         $('.nav-util-sidebar').find('a').removeClass('open');
        
    	if ($('#filterbar').hasClass('is-closed'))
        {
            $('#filterbar').removeClass('is-closed');
            $('.nav-util-filterbar').find('a').addClass('open');
            $('#filterbar').addClass('is-active');
//    			$("body").css({"overflow":"hidden"});
        }
        else
        {
//    			$("body").css({"overflow":"auto"});
            $('#filterbar').removeClass('is-active');
            $('.nav-util-filterbar').find('a').removeClass('open');
            $('#filterbar').addClass('is-closed');
        }
    }
    
    static onSideBarClick()
    {
        // Close the filterbar.
        $('#filterbar').removeClass('is-open').addClass('is-closed');
        $('.nav-util-filterbar').find('a').removeClass('open');

    	if ($('#sidebar').hasClass('is-closed'))
        {
            $('#sidebar').removeClass('is-closed');
            $('.nav-util-sidebar').find('a').addClass('open');
            $('#sidebar').addClass('is-active');
            $('#sidebar').addClass('is-open');

        }
        else
        {
            $('#sidebar').removeClass('is-open');
            $('#sidebar').removeClass('is-active');
            $('.nav-util-sidebar').find('a').removeClass('open');
            $('#sidebar').addClass('is-closed');
        }
    }
    
    static onSearch(keyword)
    {
		var client = algoliasearch('63LY6A3BJN', '1c2809bfd0b4045523f68a3d84d495e7');
        var index = client.initIndex('policomm');
        var articles = member2__CardHolder.cardsContent;

//         var keyword = $('.Filter:visible').find('#SearchBox').val();  
        var searchDone = function(err, content) {
            if (err) 
                throw err;
             
            var hits = content['hits'];
            
            if (hits.length)
            {
                $('.ArticlesContainer').children().hide();
                $('#NoResultsMessage').hide();

                console.log(hits);

                for (var key in hits)
                {
                    var hit = hits[key];
                    var id = hit['id'];
                    $('#' + id).show();
                }
            }
            else
            {
                $('.ArticlesContainer').children().hide();
                $('#NoResultsMessage').show(); 
                
                var markupCore = new MarkupCore();
                var tgt = $('#SearchTopHits');
            	           if (tgt.is(':empty'))
                     {
                        member2__CardHolder.getPopularSearches(function(data) {
                       		if (!data)
                       			return;

                            var hits = data['hits'];
                            var items = [];
							var objectIds = [];
                            
                            for (var key in hits)
                            {
                                var objectId = hits[key]['hit'];
                                objectIds.push(objectId);
                            }
                            
                            
                           index.getObjects(objectIds, function(err, content) {
                                  if (err) 
                                      throw err;

                                  var results = content.results;
                               	  var items = [];
                               
                               	
                               		for (var key in results)
                                    {
                                        var result = results[key];

                                        if (!result)
                                            continue;
                                        
                                        var id = result['id'];

                                        if (articles[id])
                                        {
											var article = articles[id];
                                            var href = article['articleUrl']; 
                                            var item = {tag: 'li', data: {tag: 'a', href: href, data: article['title']}};
                                            items.push(item);
                                         }  
                                      }
                                        
//                                         console.log(id);
//                                         var href = articles[id]['articleUrl'];                           
//                                         var item = {tag: 'li', data: {tag: 'a', href: href, data: result['title']}};

                                	var topHitList = {tag: 'ul', data: items};
                    				markupCore.insertElements(topHitList, tgt);
                                });
                            
                            

                	});
   
                         

                     }
            
            }
        };
        
        if (keyword.length)
        {
         	index.search({query: keyword}, searchDone);
        }
        else
        {
			$('.ArticlesContainer').children().show();
            $('#NoResultsMessage').hide();
        }
	}
}
