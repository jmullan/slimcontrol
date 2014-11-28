
/**

File:    SlimControl - slimcontrol.html
Description: Remote Control for SlimServer and Squeezebox
Version: 0.3 GNU GPL release
Date: 2007-03-19
      
Authors:    Harald Walker, Darren Tarbard

Copyright:   © Copyright 2005 Harald Walker, 2007 Darren Tarbard
        
Contact & Information: Harald Walker http://www.bitwalker.nl, Darren Tarbard http://www.tarbard.co.uk
					


License:
This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA

  
*/

	var req;
	var req_cv;
	var req_time;
	var player_id;
	var cauth;
	var server = "";
	var port = "9000";
	var volume;
	var time;
	var newVolume;
	var newTime;
	var posfactor;
	var position = new Date();
	var status = false;
	
	function showFront() 
	{
		var front = document.getElementById("front");
		var back = document.getElementById("back");	

    	if (window.widget)
	        widget.prepareForTransition("ToBack");

		back.style.display = "none";		
		window.resizeTo(399, 122);
 		front.style.display = "block";

		cauth = document.getElementById("cauth").value;

		if (window.widget) {
			// update preferences
			widget.setPreferenceForKey(server, "server");
			widget.setPreferenceForKey(port, "port");
			widget.setPreferenceForKey(player_id, "player_id");1
			widget.setPreferenceForKey(cauth, "cauth");
        	setTimeout ('widget.performTransition();', 0); 
		}
	}
	
	function showBack()
	{
	
	    var front = document.getElementById("front");
	    var back = document.getElementById("back");
	    
		window.resizeTo(399, 122);
   	
    	if (window.widget)
	        widget.prepareForTransition("ToBack");

   	    front.style.display="none";
    	back.style.display="block";	


	    if (window.widget)
    	    setTimeout ('widget.performTransition();', 0);  
    	    
   	    document.getElementById('fliprollie').style.display = 'none';

	}
	
   function getElementTextNS(prefix, local, parentElement, index) {
	   
	   var element = null;	   
	   var result = "";
	   
	   element = parentElement.getElementsByTagNameNS("*", local)[index];
	   
	   if (element) {
			// get text, accounting for possible
			// whitespace (carriage return) text nodes 
			if (element.childNodes.length > 1) {
				if (element.childNodes[1].nodeValue)
					return element.childNodes[1].nodeValue;
				else
					return result;
			} else {
				if (element.firstChild.nodeValue)
					return element.firstChild.nodeValue;  
				else
					return result;
			}
		} else {
			return result;
		}
	}
	
	function getElementText(local, parentElement, index) {

    	var result = "";
    
    	elements = parentElement.getElementsByTagName(local)[index];
    
    	if (elements) {
        	if (elements.childNodes.length > 1) {
        		return elements.childNodes[1].nodeValue;
        	} else {
            	return elements.firstChild.nodeValue;    		
        	}
    	} 
    	
	}


	function clearPlayerList() 
	{
    	var list = document.getElementById("player");
    	while (list.length > 0) {
        	list.remove(0);
    	}
	}

	function buildPlayerList() 
	{
		var list = document.getElementById("player");  
   		var items = req.responseXML.getElementsByTagName("player");
   		if (items.length >0 ) {
   			clearPlayerList();  			
   			
    		for (var i = 0; i < items.length; i++) {
    			var newOption;
    			newOption = document.createElement("option");
    			newOption.value = getElementText("player_id", items[i], 0);
				if (newOption.value == player_id)
					newOption.selected = true;								
										
    			newOption.appendChild(document.createTextNode(getElementTextNS("","player_name", items[i], 0) ) );
    			list.appendChild(newOption);
    			}
    			document.getElementById("serverStatus").style.display = "none";
				document.getElementById("player").style.display = "block";
			} else {
			// obviously no player available. Let's reset the list
			clearPlayerList();
			player_id = "";
			document.getElementById("serverStatus").style.display = "block";
			document.getElementById("player").style.display = "none";
			document.getElementById("serverStatus").firstChild.data = "Did not find any player devices"; 
			}
		
	}

	function getPlayerStatus()
	{
		
		var items = req.responseXML.getElementsByTagName("player_status");
		
		if (items && items.length > 0 ) 
		{
			
			playmode = getElementText("playmode", items[0], 0);
			var audioitems = items[0].getElementsByTagNameNS("*","audio");
			
			volume = getElementText("volume", audioitems[0], 0);
			if (volume) {
				if (newVolume != null)
					changeVolume(newVolume);
				else	
					document.getElementById("volumeslider").value = volume;
			}
			else {
				alert("Could not fetch volume");
			}
		}
		else {
			alert("Player Status empty");
		}
		
		items = req.responseXML.getElementsByTagName("current_song");
		
		if (items && items.length > 0 ) 
		{
			
			if (items[0].getElementsByTagNameNS("*","title")[0].firstChild.nodeValue)
					document.getElementById("d1").firstChild.data = items[0].getElementsByTagNameNS("*","title")[0].firstChild.nodeValue.substr(0,25);
				else
					document.getElementById("d1").firstChild.data = "-";
					document.getElementById("cover").src = 'http://' + server + ':' + port +getElementTextNS("","cover", items[0], 0);
					document.getElementById("d2").firstChild.data = getElementTextNS("","artist", items[0], 0).substr(0,25);
			document.getElementById("d3").firstChild.data = getElementTextNS("","duration", items[0], 0);
		
			var seconds_total= getElementTextNS("","seconds_total", items[0], 0);
			
			if (seconds_total && seconds_total.length > 0 )	
			{		
				// alert("Seconds total: " + seconds_total);
				posfactor = 100/parseInt(seconds_total);
				
				var seconds_elapsed = getElementTextNS("","seconds_elapsed", items[0], 0)
				
				if (seconds_elapsed && seconds_elapsed.length > 0 ) {
					// alert("Seconds elapsed: " + seconds_elapsed);
					var currentPosition = parseInt(seconds_elapsed);
				
					if (!currentPosition)
						currenttime = "0:00";
					else {
						minutes = Math.floor(currentPosition / 60);
						seconds = currentPosition % 60;
						currenttime = minutes + ":" + ((seconds < 10) ? "0" : "") + seconds;
					}
					time =  Math.floor(currentPosition*posfactor);		 	
				 	document.getElementById("position").value = time;
				}
				else {
					alert("could not get time information");
				}
			}	
		 	document.getElementById("d3").firstChild.data = currenttime + " of " + getElementTextNS("","duration", items[0], 0);		
		 	
		}
		else {
			document.getElementById("d1").firstChild.data = "Not playing";
			document.getElementById("d2").firstChild.data = "";
			document.getElementById("d3").firstChild.data = "";		
		}
		
	}
	
	function statusHandler() 
	{
    	if (req.readyState == 4) {
        	// only if "OK"
        	if (req.status == 200) {


        		window.clearTimeout("timeout");
        		if (status == false) {
        			status = true;
        			document.getElementById("controls").style.display = "block";
					document.getElementById("volume").style.display = "block";
					document.getElementById("position").style.display = "block";
				}
				// update properties
				// alert("updating status");
				buildPlayerList();
				getPlayerStatus();				
    		}
   		else {
    		status == false;
    		window.clearInterval(checkstatus);
    		document.getElementById("controls").style.display = "none";
			document.getElementById("volume").style.display = "none";
			document.getElementById("position").style.display = "none";
			document.getElementById("serverStatus").style.display = "block";
			document.getElementById("player").style.display = "none";
    		document.getElementById("serverStatus").firstChild.data = "Could not connect to server"; 
    		showBack();
    		}
    	}
    }	 
	
	function loadSlimStatusXML() 
	{
		
		req = new XMLHttpRequest();
	
		// if a XML response arrived, responseHandler is being called
		req.onreadystatechange = statusHandler;
	
		var	url = "http://" + server + ":" + port + "/SlimControl/status.xml";
			
		if (player_id && player_id.length > 0 )
			url = url + "?player=" + player_id;	
			
		req.open("GET", url, false);	
		
		req.send(null);
		
	}	 
	
	function sendSlimControl(command) 
	{
		var ctrlreq = new XMLHttpRequest();
	
		var	url = "http://" + server + ":" + port + "/SlimControl/status.xml" + command;
			
		if (player_id && player_id.length > 0 )
			url = url + "&player=" + player_id + ";cauth=" + cauth;	
			
		ctrlreq.open("GET", url, false);	
		ctrlreq.send(null);
		
	}	 
	
	function onhidden() {
	window.clearInterval(checkstatus);
	}
	
	function onshown() {
	checkstatus = window.setInterval("loadSlimStatusXML()",1000);
	}
	
	function init() 
	{

		if (window.widget) // check to see if the widget object exists
		{

		widget.onhidden = onhidden;
		widget.onshown = onshown;

		server = widget.preferenceForKey("server");
		if (server == undefined)
			server = "";
		port = widget.preferenceForKey("port");
		if (port == undefined)
			port = "";

		cauth = widget.preferenceForKey("cauth");
		if (cauth == undefined)
			cauth = "";	

		player_id = widget.preferenceForKey("player_id");
		if (player_id == undefined)
			player_id = "";


		}

		if (server && server.length > 0 ) {
			document.getElementById("server").value = server;
			document.getElementById("port").value = port;
			document.getElementById("cauth").value = cauth;
			//check status every 2 seconds
			checkstatus = window.setInterval("loadSlimStatusXML()",1000);
		} else {
			showBack();
		}
	}
	
	function changeVolume(vol) {
		
		if ( status == true ) {
			newVolume = vol;
		
			if (newVolume == volume)
				newVolume = null;
		
			if ((!req_cv || req_cv.readyState != 1) && newVolume != null ) {
				// don't send too many requests at once. Only if state is not loading, send a new request
				req_cv = new XMLHttpRequest();
				var url = "http://" + server + ":" + port + "/SlimControl/status.xml?p0=mixer&p1=volume&p2=" + newVolume;
				if (player_id && player_id.length > 0 )
				url = url + "&player=" + player_id + ";cauth=" + cauth;	
			
				// alert("Changing Volume: " + url);
				req_cv.open("GET", url, false);
				req_cv.send(null);		
			} 
		}
	}
	
	function changePosition(seconds) {
	
	if ( status == true ) {
			newTime = seconds;
		
			if (newTime == time)
				newTime = null;
		
			if ((!req_time || req_time.readyState != 1) && newTime != null ) {
				// don't send too many requests at once. Only if state is not loading, send a new request
				req_time = new XMLHttpRequest();
				var url = "http://" + server + ":" + port + "/SlimControl/status.xml?p0=time&p1=" + Math.floor(newTime / posfactor);
				if (player_id && player_id.length > 0 )
				url = url + "&player=" + player_id;	
	
				req_time.open("GET", url, false);
				alert("Changing position: " + url);
				req_time.send(null);		
			} 
		}
	}
	
function checkServer() {
	
	server = document.getElementById('server').value; 
	port = document.getElementById('port').value; 
	checkstatus = window.setInterval('loadSlimStatusXML()',1000);
	document.getElementById('serverStatus').firstChild.data=' ';

}


// PREFERENCE BUTTON ANIMATION (- the pref flipper fade in/out)

var flipShown = false;		// a flag used to signify if the flipper is currently shown or not.


// A structure that holds information that is needed for the animation to run.
var animation = {duration:0, starttime:0, to:1.0, now:0.0, from:0.0, firstElement:null, timer:null};


// mousemove() is the event handle assigned to the onmousemove property on the front div of the widget. 
// It is triggered whenever a mouse is moved within the bounds of your widget.  It prepares the
// preference flipper fade and then calls animate() to performs the animation.

function mousemove (event)
{
	if (!flipShown)			// if the preferences flipper is not already showing...
	{
		if (animation.timer != null)			// reset the animation timer value, in case a value was left behind
		{
			clearInterval (animation.timer);
			animation.timer  = null;
		}
		
		var starttime = (new Date).getTime() - 13; 		// set it back one frame
		
		animation.duration = 500;												// animation time, in ms
		animation.starttime = starttime;										// specify the start time
		animation.firstElement = document.getElementById ('flip');		// specify the element to fade
		animation.timer = setInterval ("animate();", 13);						// set the animation function
		animation.from = animation.now;											// beginning opacity (not ness. 0)
		animation.to = 1.0;														// final opacity
		animate();																// begin animation
		flipShown = true;														// mark the flipper as animated
	}
}

// mouseexit() is the opposite of mousemove() in that it preps the preferences flipper
// to disappear.  It adds the appropriate values to the animation data structure and sets the animation in motion.

function mouseexit (event)
{
	if (flipShown)
	{
		// fade in the flip widget
		if (animation.timer != null)
		{
			clearInterval (animation.timer);
			animation.timer  = null;
		}
		
		var starttime = (new Date).getTime() - 13;
		
		animation.duration = 500;
		animation.starttime = starttime;
		animation.firstElement = document.getElementById ('flip');
		animation.timer = setInterval ("animate();", 13);
		animation.from = animation.now;
		animation.to = 0.0;
		animate();
		flipShown = false;
	}
}


// animate() performs the fade animation for the preferences flipper. It uses the opacity CSS property to simulate a fade.

function animate()
{
	var T;
	var ease;
	var time = (new Date).getTime();
		
	
	T = limit_3(time-animation.starttime, 0, animation.duration);
	
	if (T >= animation.duration)
	{
		clearInterval (animation.timer);
		animation.timer = null;
		animation.now = animation.to;
	}
	else
	{
		ease = 0.5 - (0.5 * Math.cos(Math.PI * T / animation.duration));
		animation.now = computeNextFloat (animation.from, animation.to, ease);
	}
	
	animation.firstElement.style.opacity = animation.now;
}


// these functions are utilities used by animate()

function limit_3 (a, b, c)
{
    return a < b ? b : (a > c ? c : a);
}

function computeNextFloat (from, to, ease)
{
    return from + (to - from) * ease;
}

// these functions are called when the info button itself receives onmouseover and onmouseout events

function enterflip(event)
{
	document.getElementById('fliprollie').style.display = 'block';
}

function exitflip(event)
{
	document.getElementById('fliprollie').style.display = 'none';
}