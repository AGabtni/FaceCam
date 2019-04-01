//initialize list
$(".video-menu ul li:first-child").addClass('active');
//for toggle menu in video pannel
var btn = ".videoContent .video-box #menuToggle";
var videoMenu = ".videoContent .video-box .video-menu";
/*$(btn).on("click",function(e){
	if($(videoMenu).css("display") == "none")
		$(videoMenu).show();
	else
		$(videoMenu).hide();
	$(document).one("click", function(){
		$(videoMenu).hide();
	});
	e.stopPropagation();	
});*/

function changeIframeVideo()
{
    var e = window.event; 
    if($(videoMenu).css("display") == "none")
        $(videoMenu).show();
    else
        $(videoMenu).hide();
    $(document).one("click", function(){
        $(videoMenu).hide();
    });
    e.stopPropagation();    
}

$(videoMenu).on("click", function(e){
	e.stopPropagation();
});
//functions in list of menu in panel
function changeIframe(vid, item) {
    var e = window.event;
    var videoMenu = document.getElementsByClassName('video-menu')[0];
    var videoListItems = videoMenu.getElementsByTagName('li');

    for(var i = 0; i < videoListItems.length; i++) {
        //videoListItems[i].className = '';
        $(videoListItems[i]).removeClass('active');
    }
    $(item).addClass('active');

    var videoDiv = document.getElementsByClassName('active-video')[0];
    if(videoDiv.getElementsByTagName('iframe').length == 1 && videoDiv.getElementsByTagName('iframe')[0].src.indexOf(vid) > -1) {
    }
    else {
        var el = document.createElement('iframe');
        el.width = '560';
        el.height = '315';
        el.src = vid+'?showinfo=0';
        el.setAttribute('frameborder','0');
        el.setAttribute('allowfullscreen','');
        videoDiv.innerHTML = '';
        videoDiv.appendChild(el);
    }
    if(($(videoMenu).css('display') != 'none') && ($('#menuToggle').css('display') != 'none'))
        $(videoMenu).hide();
    
    e.stopPropagation();
}