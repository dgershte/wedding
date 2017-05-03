
var uidmap = {};
var leaderboard = {};

function getUIDMap(){
	uidmap = {};
	firebase.database().ref('/uidmap/').once('value').then(
		function(snapshot) {
		  var uids = snapshot.val();
		  for(var uid in uids){
			if(uids.hasOwnProperty(uid)){
				uidmap[uid] = uids[uid];
		  }
		  //console.log(uidmap);
		}
	});
}

function Highscore(name, score){
	this._name = name;
	this._score = score;
}

function compareHighscores(hscore0, hscore1){
	if(hscore0._score > hscore1._score){
		return -1;
	}
	if(hscore0._score < hscore1._score){
		return 1;
	}
	return 0;
}

function drawLeaderboard(){
	var highscores = [];
	for(name in leaderboard){
		highscores.push(new Highscore(name, leaderboard[name]));
	}
	highscores = highscores.sort(compareHighscores);

	var tableBody = document.getElementById("leaderboardTable");
	tableBody.innerHTML = "";

	for(var i =0; i<highscores.length; i++){
 		var newRow = document.createElement("tr");
		tableBody.appendChild(newRow);
		var numCell = document.createElement("td");
        numCell.textContent = i + 1;
		var nameCell = document.createElement("td");
		nameCell.textContent = highscores[i]._name;
		var scoreCell = document.createElement("td");
        scoreCell.className = "scoreCell";
		scoreCell.textContent = highscores[i]._score;

		newRow.appendChild(numCell);
		newRow.appendChild(nameCell);
		newRow.appendChild(scoreCell);
	}
}

function drawRSVP() {
    var list = document.getElementById("rsvpList");
    list.innerHTML = "";

    var i = 0;
    Object.keys(rsvpObj).forEach(function(key,index) {
        var attending = rsvpObj[key]["attending"];
        var menu = rsvpObj[key]["menu"];
        var name = key.split(/(?=[A-Z])/).join(" ");

        var isGuest = name == "Guest";
        var guestValue = "Guest";
        if (isGuest && rsvpObj[key]["name"]) {
           guestValue = rsvpObj[key]["name"];
        } 
        $(list).append("<li class='" + key + "'>" +
                            "<input type='checkbox' " + (attending?"checked":"") + 
                                (isGuest?" id='" + key + "' onchange='guestClicked(this)'><input id='guestName' type='textbox' value='" + guestValue + "'  placeholder='Enter guest name'>":" id='" + key + "'><label>" + name) + 
                                (isGuest?"</input>":"</label>") +
                            "<input type='radio' name='menu" + i + "' " + (menu==="beef"?"checked":"") + " value='beef'><img src='beef.png'>" + 
                            "<input type='radio' name='menu" + i + "' " + (menu==="veg"?"checked":"") + " value='veg'><img src='carrot.png'/>" +
                         "</li>");

        i++;

    });
}


function getLeaderboard(){
	var listener = firebase.database().ref('/scores/');
	listener.on('value',
		function (snapshot) {
		  var scores = snapshot.val();
		  for(var name in scores){
			if(scores.hasOwnProperty(name)){
				var hname = "";
				if(uidmap.hasOwnProperty(name)){
					hname = uidmap[name];
				} else {
					hname = name;
				}
				leaderboard[hname] = scores[name];
			}
		  }
		  //console.log(leaderboard);
		  drawLeaderboard();
		});
}

function getHighscore(){
	var listener = firebase.database().ref(userhash+'/score/');
	listener.on('value',
		function (snapshot) {
		  var score = snapshot.val();
		  displayHighscore(score);
		});
}

function displayHighscore(highscore){
	var highscoreElem = document.getElementById("highscoreval");
	highscoreElem.innerHTML = highscore;
}


function tryLogIn() {
    var userid = $("#username").val();
    var password = $("#password").val();
    var hash = md5(userid+password);
    firebase.database().ref('/'+ hash).once('value').then(function(snapshot) {
        var user = snapshot.val();
        if(user) {
            sessionStorage.setItem('userhash', hash);
            sessionStorage.setItem('username', userid);
            username = userid;
            userhash = hash;
            logInSucceeded();
        } else {
            logInFailed();
        }
    });
}

function getRSVP() {
    firebase.database().ref('/'+userhash+'/rsvp').once('value').then(function(snapshot) {
        rsvpObj = snapshot.val();
        drawRSVP();
    });
}

function logInSucceeded() {
    $("#login").hide();
    $("#details").css("display","flex");
    $("#rsvp").css("display","block");
    $("#proposal").css("display","block");
    $("#play").css("display","block");
    getHighscore();
    getRSVP();
}

function logInFailed() {
    $("#error").css("opacity","1");
}

function updateScore(score) {
    firebase.database().ref('/' + userhash).update({
        score: score,
    });
    var userid = username.split(".").join("");
    firebase.database().ref('/scores').update({
       [userid] : score,
    });
}

$(document).keypress(function (e) {
    if (e.which == 13) {
        tryLogIn();
    }
});

window.mobilecheck = function() {
      var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
          return check;
};

function forceLower(strInput) 
{
    strInput.value=strInput.value.toLowerCase();
}

function guestClicked(button) {
    if (button.checked) {
        $("#guestName").val("").focus();
    } else {
        $("#guestName").val("Guest");
    return;
    }
}

$(document).ready(function() {
    if (sessionStorage.getItem('userhash')) {
        userhash = sessionStorage.getItem('userhash');
        username = sessionStorage.getItem('username');
        logInSucceeded();
    }
    
    getUIDMap();
    getLeaderboard();
    
    $("#DateCountdown").TimeCircles({
        "animation": "smooth",
        "bg_width": 0.9,
        "fg_width": 0.025,
        "circle_bg_color": "#929599",
        "time": {
            "Days": {
                "text": "Days",
                "color": "#ffffff",
                "show": true
            },
            "Hours": {
                "text": "Hours",
                //"color": "#99CCFF",
                "color": "#ffffff",
                "show": true
            },
            "Minutes": {
                "text": "Minutes",
                //"color": "#BBFFBB",
                "color": "#ffffff",
                "show": true
            },
            "Seconds": {
                "text": "Seconds",
                //"color": "#FF9999",
                "color": "#ffffff",
                "show": true
            }
        }
    });
    $("#sign-in").on('click',function() { tryLogIn() });
    $(window).on('scroll',function(){
        if (window.mobilecheck()) return;
        stop = Math.round($(window).scrollTop());
        if (stop > 50) {
            $('#menu').addClass('secondary-header');
        } else {
            $('#menu').removeClass('secondary-header');
        }
    });
    
    // Create the canvas
    var canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = 550;
    canvas.height = 650;

	canvas.addEventListener("mousedown", mouseDown, false);
	canvas.addEventListener("mousemove", mouseXY, false);
	canvas.addEventListener("touchstart", touchDown, false);
	canvas.addEventListener("touchmove", touchXY, true);
	canvas.addEventListener("touchend", touchUp, false);

	document.body.addEventListener("mouseup", mouseUp, false);
	document.body.addEventListener("touchcancel", touchUp, false);

    resizeCanvas();

    $("#playscroll").on("click touchstart", function(){
        $('#play').scrollView();
    });

    $("#submitRSVP").on("click touchstart", function() {
        var success = updateRSVPObject();
        if (!success) return;

        firebase.database().ref('/' + userhash).update({
            rsvp: rsvpObj,
        });
        
        var userid = username.split(".").join("");
        firebase.database().ref('/rsvp/').update({
            [userid] : true,
        });
        swal({
            title: "Thank You!", 
            text: formatAttendees(success) +
                  "<br><br>Need to change something? Please do so by <b>July 8th</b> :)", 
            type: "success",
            html: true
        });
    });
    $('.your-class').slick({
        centerMode: false,
        slidesToShow: 3,
        variableWidth: true,
        infinite:false,
        dots:true,
        prevArrow:'hidden',
        nextArrow:'hidden',
/*        responsive: [
            {
                breakpoint: 768,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 3
                }
            },
            {
                breakpoint: 480,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 1
              }
            }
          ]*/
    });

	keyLeft = false;
	keyRight = false;
    keySpace = false;
    
});

function formatAttendees(list) {
    if (list.length == 0) 
        return "We’re sorry that you won’t be able to join us on our special day - you will be missed!";
    var str = ""
    for(var i = 0; i < list.length; i++) {
        str += list[i];
        if(i == list.length - 2) {
            str += " and ";
        } else if (list.length > 1 && i < list.length - 1) {
            str += ", ";
        }
    }
    return "We've received your RSVP. <br><br>Looking forward to seeing " + str + " on September 8th!";
}

function updateRSVPObject() {
    var list = document.getElementById("rsvpList");
    var i = 0;
    var attendees = [];
    for (var key in rsvpObj) {
        if (rsvpObj.hasOwnProperty(key)) {
            var attending = $("#"+key).is(':checked');
            var guestName;
            if (key === "Guest") {
                if (attending) {
                    guestName = $("#guestName").val();
                    if (!guestName) {
                        swal({
                            title: "Almost..", 
                            text: "Please enter your Guest's name",
                            type: "error",
                        });
                        return false;
                    }
                    rsvpObj[key]["name"] = guestName;
                } else {
                    rsvpObj[key]["name"] = "";
                }
            }
            rsvpObj[key]["attending"] = attending;
            var groupName = "menu"+i;
            var menu = $("input[name='" + groupName + "']:checked").val();
            if (attending) {
                var name = key.split(/(?=[A-Z])/).join(" ");
                if (menu) {
                    rsvpObj[key]["menu"] = menu;
                    if (guestName) {
                        attendees.push(guestName);
                    } else {
                        attendees.push(name);
                    }
                } else {
                    swal({
                        title: "Almost..", 
                        text: "Please select a menu choice for " + name,
                        type: "error",
                    });
                    return false;
                }
            } else {
                rsvpObj[key]["menu"] = "";
            }
        }
        i++;
    };
    return attendees;
}

function resizeCanvas(){
    var new_width = Math.min(550,window.innerWidth);
    var new_height = Math.min(650,window.innerHeight-window.innerHeight/6);

    ctx.canvas.style.width = new_width;
    ctx.canvas.style.height = new_height;

    ctx.canvas.width = 550;
    ctx.canvas.height = 550/new_width*new_height;

    var gameContainer = document.getElementById("gameContainer");
    gameContainer.style.width = new_width;
    gameContainer.style.height = new_height;

    var replay = document.getElementById("replay");
    replay.style.width = new_width;

    screenw = ctx.canvas.width;
    screenh = ctx.canvas.height;
}

window.onresize = function(event) {
    resizeCanvas();
};

$.fn.scrollView = function () {
    return this.each(function () {
        $('body').animate({
            scrollTop: $(this).offset().top
        }, 1000);
    });
};
	
window.onkeydown = function(e) {
    var key = e.keyCode ? e.keyCode : e.which;

    if (key == 37) {
        keyLeft = true;
    } else if (key == 39) {
        keyRight = true;
    } else if(key == 32){
        keySpace = true;
    }
}

window.onkeyup = function(e) {
   var key = e.keyCode ? e.keyCode : e.which;

    if (key == 37) {
        keyLeft = false;
    } else if (key == 39) {
        keyRight = false;
    } else if(key == 32){
        keySpace = false;
    }
}

var canX = [], canY = [],
    mouseIsDown = 0, len = 0;

function mouseUp() {
    mouseIsDown = 0;
    mouseXY();
}

function mouseDown() {
    mouseIsDown = 1;
    mouseXY();
}

function touchDown() {
    mouseIsDown = 1;
    touchXY();
}

function touchUp(e) {
    if (!e) {
        e = event;
        len = e.targetTouches.length;
    }

    mouseIsDown = 0;
    touchXY();
}

function mouseXY(e) {
    if (!e)
        e = event;
    canX[0] = e.pageX - canvas.offsetLeft;
    canY[0] = e.pageY - canvas.offsetTop;
    len = 1;
}

function touchXY(e) {
    if (!e)
        e = event;
    e.preventDefault();
    len = e.targetTouches.length;
    for (i = 0; i < len; i++) {
        canX[i] = e.targetTouches[i].pageX - canvas.offsetLeft;
        canY[i] = e.targetTouches[i].pageY - canvas.offsetTop;
    }
}

// The main game loop
var lastTime;
function main() {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;

    update(dt);
    render();

    lastTime = now;
    requestAnimationFrame(main);

};

function update(dt) {
    everyframe(dt);
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //console.log("render");
    var i = 0;
    while(i<tcs.length){
        tcs[i].render();
        i++;
    }
    //console.log(rects.length);
    ctx.beginPath();
    var i = 0;
    while(i<rects.length){
        drawRect(rects[i]._x,rects[i]._y,rects[i]._w,rects[i]._h);
        i++;
    }
    ctx.closePath();
    rects.splice(0, rects.length);
}

resources.onReady(initXML);

function initXML(){
    //console.log("initxml");
    loadXML(init);
}

function init(){
    //console.log("init");
    lastTime = Date.now();
    
    setup();
    main();
}
