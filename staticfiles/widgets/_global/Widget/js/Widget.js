class __Widget {

    /**
      * Initialize the widget class. It should be called only once per HTML page, 
      * regardless of the number of the objects of this class in the page.
      */
    static initClass() {
        // Normally, this function is overridden in the extended class.
        // For example:
        // super.initClass(); // Make sure to init the ancestor class too
        // console.log('The class is ready');
        // Note: "this" in a static method is the static class and NOT an object
        // this.classSettings = {}; // init static variable
    }

    /**
     * Create an object representing the client-side code of the 
     * server's PHP widget maker. Each object of this class
     * links to an DOM element with given ID.
     *
     * @param holderId The ID of the DOM element containing the
     * widget's markup.
     */
    constructor(holderId) {
        // Store the ID of the DOM container.
        this.holderId = holderId;

        // Gets the DOM element that contains the markup of the widget.
        this.holder = document.getElementById(this.holderId);

        // Make the widget object persistante and reachable
        __Widget.registerWidgetInstance(this);
    }

    /**
	 * A standard function name for the common need of rendering a widget
     * using a JavaScript object. It generates the markup of the widget
     * based on the given user parameters. The widget's DOM container can 
     * be accessed via "this.holder". Normally, this function is overridden 
     * in the extended class.
     * 
     * @param params The user options given to the server-side widget.
	 */
    render(params) {
        // For example:
        // console.log('The object "' + this.holderId + '" is ready');
        // this.options = params;
        // this.holder.style.backgroundColor = this.options.color;
        // this.holder.innerHTML = 'Hello World!';
        // this.trackFirstImpression();
    }

    /**
     * Set an viewport intersection overserver to detect when the
     * widget container is within 100px radius from the viewport.
     * The default code in onIntersection() will call render()
     * the first time a viewport intersection is detected.
     */
    lazzyRender(params) {
        this.needsRendering = true;
        this.renderParams = params;
        __Widget.observeViewportIntersection(this.holder, '100px', 0);
    }

    /**
     * Respond to messages sent by either this.broadcastMessage() or 
     * this.postMessage(). It's used for intra widget communication.
     * Normally, the sender would start by broadcasting a message to find
     * some target widget(s) with whom engage in direct communication via
     * postMessage(). There is no pattern enforced on how to manage those
     * echanges of messages other that the basic methods provided.
     * 
     * @param string message A text message, like "getOptions", sent via
     * postMessage() or broadcastMessage();
     * @param object data The message's data.
     * @param string type The type of message received: 'broadcast' or 'direct'.
     * @return object Some return value for the caller of this.postMessage().
     */
    onMessage(message, data, type) {
        // return undefined if the message is rejected
    }

    /**
     * The default method used by makeIntersectionCallback() to react to
     * intersection events.
     * 
     * Normally, this function is overridden in the extended class, whith
     * a call to super.onIntersection(entry).
     * 
     * @param entry An IntersectionObserverEntry object. See details at
     * https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry
     */
    onIntersection(entry) {
        var ratio = entry.intersectionRatio;

        // Note, entry.isIntersecting is true if the entry describes a transition 
        // into a state of intersection; if it's false, then the transition is 
        // from intersecting to not-intersecting.
        if (entry.isIntersecting) {
            // See if the widget needs to be rendered
            if (this.needsRendering) {
                this.needsRendering = false;
                this.render(this.renderParams);
            }

            // Track first impressions (may be ignored if analytics are off)
            if (!this.firstImpression && ratio >= 0.75) {
                this.firstImpression = true;
                this.trackEvent('first_impression', { ratio: ratio });
            }
        }
    }

    /**
     * Knowing the name of the widget class can be useful when 
     * communicating with messages (see methods below).
     */
    get className() {
        return this.constructor.name;
    }

    /**
     * Track page events for collecting web analytics.
     * 
     * Recommended event names and their parameters can be found at
     * https://developers.google.com/gtagjs/reference/event
     */
    trackEvent(eventName, eventParams = {}) {
        eventParams.widgetId = this.holderId;
        eventParams.role = this.holder.getAttribute('role');

        __Widget.submitAnalytics('event', eventName, eventParams);
    }

    /**
     * Find a widget object by its unique DOM container ID.
     * 
     * @param string holderId The ID of the DOM element containing the
     * widget's markup.
     */
    findWidget(holderId) {
        return __Widget.instances[holderId];
    }

    /**
     * Post a message to a widget object. This method is
     * useful for intra widget communication.
     *  
     * @param string holderId The ID of the DOM element holding the 
     * markup of the receiver.
     * @param string message A text message, like "getOptions".
     * @param object data Some data expected by the receiver.
     * @return object The return value provided by onMessage().
     */
    postMessage(holderId, message, data = {}) {
        if (typeof message == 'string' && typeof data == 'object')
            return this.findWidget(holderId).onMessage(message, data, 'direct');
    }

    /**
     * Post a message to all widget JS objects in the webpage.
     * 
     * @param string message A text message, like "getOptions".
     * @param object data Some data that is understood by the intended 
     * receivers so that they can report back and, for example, accept 
     * direct communication via postMessage().
     * @return object A map from "holderId" to "respose object" of the 
     * widgets that provided responses. The non-empty responses can be 
     * used to indicate that the reciever widget accept direct 
     * communication from the sender widget.
     */
    broadcastMessage(message, data = {}) {
        if (typeof message != 'string' || typeof data != 'object')
            return false;

        var replies = [];

        for (var id in __Widget.instances)
            replies[id] = this.findWidget(id).onMessage(message, data, 'broadcast');

        return replies;
    }

    /**
     * Find DOM elements within the widget container.
     */
    find(selector) {
        return this.holder.querySelector(selector);
    }

    /**
     * Add object notation HTML into the widget holder.
     */
    addMarkup(elements) {
        this.holder.innerHTML += __Widget.makeMarkupString(elements);
    }

    /**
     * Call this.onIntersection(entry) when the
     * widget's container intersects the viewport by at least 75% for 
     * the first time.
     */
    trackFirstImpression() {
        this.firstImpression = false;
        __Widget.observeViewportIntersection(this.holder, '0px', 0.75);
    }

    /**
     * Detect when the holder intersects the viewport. A widget method 
     * is called as soon as the holder comes into view within the specific 
     * margin and amount of viewpoint overlap. The default behaviour
     * is to call onIntersection(entry) on te widget contained in 'holder'.
     *
     * A single IntersectionObserver is used for different widgets when the 
     * same margin, threshold are given in order to reduce overhead.
     * 
     * @param holder Either the DOM element that contains the target widget, 
     * or the ID of that element.
     * @param margin Distance around the viewport. Can have values similar 
     * to the CSS margin property. Defaults to all zeros.
     * @param threshold Either a single number or an array of numbers between 
     * 0 and 1, indicating at what percentage of the target's visibility the 
     * observer's callback should be executed. The default is 0 (ie, soon as 
     * even one pixel is visible).
     */
    static observeViewportIntersection(holder, margin, threshold) {
        if (typeof IntersectionObserver == 'function') {
            if (!this.observers)
                this.observers = [];

            // Reuse observers with the same parameters
            var name = margin.toString() + ':' + threshold.toString();

            if (!this.observers[name]) {
                var callback = this.makeIntersectionCallback();
                var options = { rootMargin: margin, threshold: threshold };

                this.observers[name] = new IntersectionObserver(callback, options);
            }

            if (typeof holder == 'string')
                holder = document.getElementById(holder);

            this.observers[name].observe(holder);
        }
    }

    /**
     * Detect when the holder intersects an ancestor element or the viewport. A   
     * callback function is called when the intersection happens. The default 
     * behaviour is to call widget.onIntersection(entry) if there is a target widget
     * object, or onFirstImpression(entry) if there is no widget object.
     * 
     * @param options An optional object which customizes the observer. Valid keys are:
     *  root: The element that is used as the viewport for checking visiblity 
     *    of the target. Must be the ancestor of the target. Defaults to the  
     *    browser viewport if not specified or if null. 
     *  rootMargin: Margin around the root. Can have values similar to the CSS 
     *    margin property. Defaults to all zeros.
     *  threshold:  Either a single number or an array of numbers which indicate at what
     *    percentage of the target's visibility the observer's callback should 
     *    be executed. The default is 0 (ie, soon as even one pixel is visible).
     * @param entryHandler An optional function entryHandler(entry, observer, widget) 
     * to call for each entry. If null, makeIntersectionCallback() decides what to call.
     * @param holder An optional DOM element that contains the target widget, 
     * or the ID of that element. If given, it becomes the target of the observer.
     * @return An IntersectionObserver object.
     */
    static createIntersectionObserver(options, entryHandler = null, holder = null) {
        if (typeof IntersectionObserver != 'function')
            return false;

        var callback = this.makeIntersectionCallback(entryHandler);

        var observer = new IntersectionObserver(callback, options);

        if (holder) {
            if (typeof holder == 'string')
                holder = document.getElementById(holder);

            observer.observe(holder);
        }
        
        return observer;
    }

    /**
     * Crate a callback for the IntersectionObserver such that the method
     * onIntersection() is called for each target widget that is intersected.
     * It is useful to reuse the same IntersectionObserver on many targets.
     * 
     * @param entryHandler An optional callback function to call for each entry.
     */
    static makeIntersectionCallback(entryHandler) {
        var thisClass = this;

        return function (entries, observer) {
            entries.forEach(function (entry) {
                var widget = thisClass.instances[entry.target.id];

                if (entryHandler)
                    entryHandler(entry, observer, widget);
                else if (widget)
                    widget.onIntersection(entry);
                else
                    thisClass.onFirstImpression(entry, observer);
            });
        };
    }

    /**
     * If a widget insersected with the viewport and there is no 
     * widget object to receive the onIntersection() event, this
     * function is called in order to track the event as a first 
     * impression.
     */
    static onFirstImpression(entry, observer) {
        var holderId = entry.target.id;

        if (entry.isIntersecting) {
            var eventParams = {
                widgetId: holderId,
                ratio: entry.intersectionRatio
            };

            __Widget.submitAnalytics('event', 'first_impression', eventParams);

            observer.unobserve(document.getElementById(holderId));
        }
    }

    /**
     * Store a given object in a static property so that that
     * it remains accesible outside of its creation scope.
     * 
     * @param instance An object instance of this class to keep
     * alive for as long as the webpage itself, or until
     * removeObject() is called explicitly.
     */
    static registerWidgetInstance(instance) {
        // Note: "this" is the static class and NOT an object
        this.instances = this.instances || {};
        this.instances[instance.holder.id] = instance;
    }

    /**
     * Remove a widget was previously made  persistent by a call to 
     * registerWidgetInstance(). This method is provided just in case 
     * it's needed for some special purpose.
     *
     * @param holderId The ID of the DOM element containing the
     * widget's markup.
     */
    static removeWidgetInstance(holderId) {
        // Note: "this" is the static class and NOT an object
        delete this.instances[holderId];
    }

    /**
     * Helper function to convert object notation into HTML markup. For example,
     * { tag:'div', data:[
     *  { tag:'p', class='large', data:'Some text' },
     *  { tag:'a', href='url', data:'Click me' },
     *  ...
     * ] }
     * is converted to 
     * <div><p class="large">Some text</p><a href="url">Click me</a></div>
     */
    static makeMarkupString(elements) {
        if (Array.isArray(elements)) {
            var markup;

            for (var i = 0; i < elements.length; i++)
                markup.push(this.makeMarkupString(elem));

            return markup.join('');
        }
        else if (typeof elements == 'object') {
            var elem, tag, inner, attrs = [];

            for (var key in elements) {
                elem = elements[key];

                if (key == 'tag')
                    tag = elem;
                else if (key == 'data')
                    inner = this.makeMarkupString(elem);
                else if (typeof elem != 'boolean')
                    attrs.push(key + '="' + elem + '"');
                else if (elem)
                    attrs.push(key);
            }

            return '<' + (tag || 'div') + (attrs.length ? ' ' + attrs.join(' ') : '') +
                '>' + (inner !== undefined ? inner + '</' + tag + '>' : '');
        }

        return elements;
    }

    /**
     * Generic function to submit different types of web analytics.
     * 
     * See details at https://developers.google.com/gtagjs/reference/api
     */
    static submitAnalytics(command, param1, param2) {
        if (window.gtag)
            window.gtag(command, param1, param2);
    }
}