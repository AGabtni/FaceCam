class member2__SVG {

    /**
      * Example: A class initializer that is called once per HTML page, 
      * regardless of the number of the objects of this class in the page.
      * It is called from the HTML page's "document ready" code added by 
      * getOnReadyCode() in the widget's PHP class.
      */
     static initClass() {
        console.log('The class is ready');
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
    constructor(holderId, options) {
        // Keep the options for later
        this.options = options;

        // Find the DOM element that contains the widget's markup
        this.holder = document.getElementById(holderId);
        
        // Optionally, call this.doSomething() now.
    }
    
    /**
     * Example: Member function to get something done. It is called
     * from the HTML page's "document ready" code added by addClientObject()  
     * in the widget's PHP class.
     */
    doSomething() {
        console.log('The object "' + this.holder.id + '" is ready');
        
        // Do something based on this.options
        // this.holder.style.backgroundColor = 'red';
    }
  
    /**
     * Example: Storing a given object in an *static* class property so
     * that that it remains alive outside of its creation scope. It is 
     * called from the HTML page's "document ready" code added by 
     * addClientObject() in the widget's PHP class.
     */
    static keepObjectAlive(elem) {
        // Note: "this" is the static class and NOT an object
        this.elements = this.elements || {};
        this.elements[elem.holder.id] = elem;
    }
    
    /**
     * Example: Removing an object of this class that was previously made 
     * persistent by a call to keepObjectAlive(). It is not currently
     * called from anywhere (it's meant to show how the removal could be done).
     *
     * @param holderId The ID of the DOM element containing the
     * widget's markup.
     */
    static removeObject(holderId) {
        // Note: "this" is the static class and NOT an object
        delete this.elements[holderId];
    }
}