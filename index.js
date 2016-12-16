
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
		  console.log(uidmap);
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

	var tableBody = document.getElementById("table");
	tableBody.innerHTML = "";

	for(var i =0; i<highscores.length; i++){
		var newRow = document.createElement("tr");
		tableBody.appendChild(newRow);
		var nameCell = document.createElement("td");
		nameCell.textContent = highscores[i]._name;
		var scoreCell = document.createElement("td");
		scoreCell.textContent = highscores[i]._score;

		newRow.appendChild(nameCell);
		newRow.appendChild(scoreCell);
	}
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
		  console.log(leaderboard);
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
            logInSucceeded();
        } else {
            logInFailed();
        }
    });
}

function logInSucceeded() {
    $("#login").hide();
    $("body").css("overflow","scroll");
    $("#wrapper").css("overflow","scroll");
    getHighscore();
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
       [username] : score,
    });
}

$(document).keypress(function (e) {
    if (e.which == 13) {
        tryLogIn();
    }
});

$(document).ready(function() {
    userhash = sessionStorage.getItem('userhash');
    username = sessionStorage.getItem('username');
    if (userhash) {
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

	keyLeft = false;
	keyRight = false;
    keySpace = false;
});

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
    console.log("render");
    var i = 0;
    while(i<tcs.length){
        tcs[i].render();
        i++;
    }
    console.log(rects.length);
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
    console.log("initxml");
    loadXML(init);
}

function init(){
    console.log("init");
    lastTime = Date.now();
    
    setup();
    main();
}
