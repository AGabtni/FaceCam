$('.NavigationItem.Widget').click(function(){
	//var id = $(this).attr('id');

	//window.analytic.trackEvent(id, 'click');

	var dropdown = $(this).find('.dropdown-menu');

	var bodyWidth = $('body').width();

	var dropdownWidth = dropdown.width();

	var dropdownLeft = $(this).offset().left;

	if(dropdownWidth + dropdownLeft > bodyWidth)
	{
		dropdown.addClass('dropdown-menu-right');
	}
	else
	{
		dropdown.removeClass('dropdown-menu-right');
	}
});