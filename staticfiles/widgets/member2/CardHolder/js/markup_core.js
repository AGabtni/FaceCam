// ==========================================================================
// Project: UniWeb
// All Rights Reserved
// UniWeb by Proximify is proprietary software.
// ==========================================================================

/**
 * Creates the markup singleton.
 * @class Represents the operations to construct HTML elements with appropriate
 * css classes.	
 * @constructor
 * @extends CoreClass
 */
class MarkupCore 
{
    createElements(data, target, serializer, acceptRules) {
        if (typeof target == 'string')
            target = (target[0] != '#' && target[0] != '.') ? $('#' + target) : $(target);
        
        target.html('');
        
        return this.insertElements(data, target, serializer, acceptRules);
    }
    
    /**
     * Adds a class name to the property 'class' in the given 'attributes' object.
     */
    addClass(attributes, className) {
        if (attributes['class'])
            attributes['class'] += ' ' + className;
        else
            attributes['class'] = className;
            
        return attributes;
    }
    
    /**
     * Checks if the attribute has the word 'word' assuming that words are
     * separated by spaces.
     * eg, attr = "Hello world"
     * this.hasWord(attr, 'world') // returns true
     * @return boolean True of the string has the word and false otherwise.
     */
    hasWord(attribute, word) {
        var words = (attribute) ? attribute.split(' ') : [ ];
            
        return words.indexOf(word) != -1;
    }

    /**
     * Represents the attribues attributes[key] = value of the object as the string
     * 'key0="value0" key1="value1" ...'
     * @return string
     */
    stringify(attributes) {
        var str = '';
        
        for (var name in attributes)
        {
            if (typeof attributes[name] != 'undefined')
                str += name + '="' + attributes[name] + '" ';
        }
            
        return str;
    }
    
    /**
     * Creates a string with the HTML text to create the tag
     * with given attributes and content.
     */
    makeTag(tag, attributes, content) {
        var str = '<' + tag;
        
        if (attributes)
            str += ' ' + this.stringify(attributes);
        
        if (typeof content != 'undefined')
            str += '>' + content + '</' + tag + '>';
        else
            str += '/>';
            
        return str;
    }
    
    /**
     * Adds additional html attributes to the tags that need it. Very few do.
     */
    addSpecialAttributes(tag, attributes) {
        if (tag == 'input' && !attributes['type'])
            attributes['type'] = 'text';	
    }
    
        /**
     * Adds additional bootstrap classes to the tags that need it. Very few do.
     */
    addSpecialClasses(tag, attributes) {
        var classes = attributes['class'];
        
        if (tag == 'button' && !this.hasWord(classes, 'close'))
            this.addClass(attributes, 'btn');
    }
    
    /**
     * Extract content parameters from the attributes. The content depends
     * on the tag.
     */
    extractContent(tag, attributes) {
        var content = '';
        
        // Extract the content according to the tag
        if (tag == 'button')
        {
            content = this.removeAttribute('label', attributes);
        }
        else if (tag == 'fieldset')
        {
            // Admit both label and legend as the name of the label attribute
            var lblTag = (attributes.label) ? 'label' : 'legend';
            var text = this.removeAttribute(lblTag, attributes);
            
            if (text)
                content = '<legend>' +  text + '</legend>';
        }
        else if (tag == 'select')
        {
            var options = this.removeAttribute('options', attributes);
            var selected = this.removeAttribute('value', attributes);
            
            var makeItem = function(key, value) 
            {
                if (key == 'optgroup')
                {
                    content += '<optgroup label="' + value + '">';
                }
                else if (key == '/optgroup')
                {
                    content += '</optgroup>';
                }
                else
                {
                    content += '<option value="' + key + '"';
                    content += (key === selected) ? ' selected="selected">' : '>';
                    content += value + '</option>';
                }
            };
            
            if (options) 
            {
                if ($.isArray(options))
                {
                    for (var i = 0; i < options.length; i++)
                        makeItem(options[i][0], options[i][1]);
                }
                else
                {
                    for (var key in options)
                        makeItem(key, options[key]);
                }
            }
        }
        else if (tag != 'input') // input has a value attribute!
        {
            content = this.removeAttribute('value', attributes);

            if (content instanceof Object)
            {
                var activeLang = window.activeLanguage;
                content = content[activeLang] ? content[activeLang] : '';
            }
        }
        
        if (content === null && (tag == 'input' || tag == 'textarea'))
            return '';
        
        return content;
    }
    
        /**
     * Extract the attributes whose value is a function. The content depends
     * on the tag.
     *
     * @return Object with the attributes that had a function value in 'attributes'.
     */
    extractFunctions(tag, attributes) {
        var events = { };
        
        for (var attName in attributes)
        {
            if (typeof attributes[attName] == 'function')
                events[attName] = this.removeAttribute(attName, attributes);
        }
        
        return events;
    }
    
    
        /**
     * Removes the attribute named 'name' from 'attributes' and returns
     * its value.
     * @return Value of the attribute removed, or 'undefined' if the 
     * attribute does no exist.
     */
    removeAttribute(name, attributes) {	
        if (typeof attributes[name] != 'undefined')
        {
            var value = attributes[name];
            
            delete attributes[name];
            
            return value;
        }
    }
    
  	/**
     * Every property other than 'tag', 'widget', 'data', and 'params' is considered 
     * an attribute.
     * @return the attributes in the given data
     */
    getTagAttributes(data) {
        var keywords = ['tag', 'data', 'params', 'widget', 'jquery', 
            'validate', 'rule', 'ajaxSubmit', 'help', 'help-inline'];
            
        var attributes = { };
            
        for (var key in data)
        {
            if (keywords.indexOf(key) == -1)
                attributes[key] = data[key];
        }
        
        return attributes;
    }
    
	insertElements(data, target, serializer, acceptRules, position) {
//         assert(!serializer || serializer instanceof FormSerializer,
//             'Invalid serializer object');
                    
        if (typeof target == 'string')
            target = (target[0] != '#' && target[0] != '.') ? $('#' + target) : $(target);
        
        // NOTE: the position parameter is not to be passed recursively, or used when data
        // is an array. It is only used for the first _insertElement operation of one element.
        
        if ($.isArray(data))
        {
            var elems = [ ];
                    
            for (var i = 0; i < data.length; i++)
                elems.push(this.insertElements(data[i], target, serializer, acceptRules, position));
                
            return elems;
        }
        else if (typeof data == 'string')
        {
            target.append(data);
            
            return target;
        }
        else if (data)
        {		
            var type = (data.tag) ? data.tag.toLowerCase() : 'div';
                    
            var elem = this._insertElement(type, this.getTagAttributes(data), target, position);
            
            if (data.help)
                elem.after(this.makeHelpElement(data.help, false));
            else if (data['help-inline'])
                elem.after(this.makeHelpElement(data['help-inline'], true));
                                    
            if (data.widget)
            {
                // Pass the ajaxSubmit attribute as a parameter of the widget.
                if (data.ajaxSubmit)
                {
                    if (data.params === undefined)
                        data.params = { };
                        
                    if (!data.params.ajaxSubmit)
                        data.params.ajaxSubmit = $.extend(true, { }, data.ajaxSubmit);
                }	
                
                if (data.data === undefined && data.value !== undefined)
                    data.data = data.value;
                
                elem = this.createWidget(data.widget, elem, data.data, data.params);
                type = 'widget';
            }
            else if (data.jquery)	
            {
                elem = this.createJQueryWidget(data.jquery, $('#' + data.id), 
                    data.data, data.params);
                type = 'jquery';
            }
            else
            {			
                if (type == 'form')
                {
                    if (data.ajaxSubmit)
                    {
                        if (!serializer)
                            serializer = this.newSerializer(data.ajaxSubmit);
                        
                        if (!data.validate)
                            this.setupFormSubmit(elem, data.ajaxSubmit, serializer);
                    }
                        
                    if (data.validate)
                    {
                        this.setupFormValidation(elem, data.validate, 
                            data.ajaxSubmit, serializer);
                            
                        acceptRules = true;
                    }
                }
                
                var group = (serializer && data.name && !serializer.isSerializable(type));
                
                if (group)
                    serializer.beginGroup(data.name);
                    
                this.insertElements(data.data, elem, serializer, acceptRules);
                
                if (group)
                    serializer.endGroup();
                
                //if (data.rule && type != 'form')
                //	dbg_log(data);
                
                if (acceptRules && data.rule && type != 'form')
                    elem.rules('add', data.rule);
            }
            
            if (serializer)
                serializer.add((data.name) ? data.name : data.id, type, elem);
                
            return elem;
        }
    }
    
     _insertElement(tag, attributes, target, position) {
        if (typeof target != 'object' || typeof target.append != 'function')
            throw Error('Invalid object holder of type:' + typeof target);
            
        if (!position)
            position = 'append';
        
        // Remove the binding of events from the attributes
        var bindings = this.removeAttribute('bind', attributes);
        
        // Remove the attributes that are function objects
        var events = this.extractFunctions(tag, attributes);
        
        // Get the content first because 'label' might be content!!!
        var content = this.extractContent(tag, attributes);
        
        // Then get the label
        var label = (attributes.label) ? this.extractLabel(attributes) : false;
        
        // Get the element's help attribute (if it exists)
        var helpData = this.removeAttribute('help', attributes);
        
        // Add classes required for styling the tag
        this.addSpecialClasses(tag, attributes);
        
        // Add attributes required for the tag
        this.addSpecialAttributes(tag, attributes);
        
        // Now the attributes should have the appropriate info
        var elem = $(this.makeTag(tag, attributes, content));
        
        if (label)
        {
            if (uniweb.usingOldFramework())
            {
                var group = $(this.makeTag('div', {'class':'control-group'}));
                var ctrl = $(this.makeTag('div', {'class':'controls'}));
                
                target[position](group);
                group.append($(label));
                group.append(ctrl);
                ctrl.append(elem);
            }
            else
            {
                var group = $(this.makeTag('div', {'class':'form-group form-row'}));
                var ctrl = $(this.makeTag('div', {'class':'col-sm-20'})); // or col-auto ?
                var lblobj = $(label);

                // Only for horizonatl forms, though
                lblobj.addClass('col-sm-6 col-form-label');
                //elem.addClass('form-control');
                
                target[position](group);
                group.append(lblobj);
                group.append(ctrl);
                ctrl.append(elem);
            }
        }
        else
        {
            target[position](elem);
        }
        
        // Bind the events in the bindings object
        if (bindings)
            elem.bind(bindings);
        
        // Assign the events specified as attributes
        for (var eventName in events) {

            if(elem[eventName] !== undefined)
                elem[eventName](events[eventName]);
            else
                elem.on(eventName, events[eventName]);
        }
        
        // Auto-inject SVG images	
        if (tag == 'img' && attributes['data-src'])
            SVGInjector(elem[0]);
            
        return elem;
    }
}