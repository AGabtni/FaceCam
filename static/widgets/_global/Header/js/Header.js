var previousScrollPosition = 0;

$('#member2-Header1').css("padding", "30px");
$(window).scroll(function(){
 	var scrollPosition = $("body, html").scrollTop();
    var currentScrollPosition = scrollPosition + $(window).height();

    if (scrollPosition == 0)
    {    
      $('#member2-Header1').css("background-color", "rgba(0, 0, 0, 0.5)");
      $('#member2-Header1').css("padding", "30px");
    }
	
    if (currentScrollPosition > previousScrollPosition)
    {
        $('#member2-Header1').css("background-color", "#51ae90");
        $('#member2-Header1').css("padding", "10px");
    }
    
    previousScrollPosition = currentScrollPosition;
});

	   
