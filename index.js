

function tryLogIn() {
    var username = $("#username").val();
    var password = $("#password").val();
    var hash = md5(username+password);
    firebase.database().ref('/'+ hash).once('value').then(function(snapshot) {
        var user = snapshot.val();
        if(user) {
            sessionStorage.setItem('currentUser', hash);
            logInSucceeded();
        } else {
            logInFail();
        }
    });
}

function logInSucceeded() {
    $("#login").hide();
    $("body").css("overflow","scroll");
}

function logInFail() {
    $("#error").css("opacity","1");
}

$(document).keypress(function (e) {
    if (e.which == 13) {
        tryLogIn();
    }
});

$(document).ready(function() {
    if (sessionStorage.getItem('currentUser')) {
        logInSucceeded();
    }
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
});
$.fn.scrollView = function () {
    return this.each(function () {
        $('body').animate({
            scrollTop: $(this).offset().top
        }, 1000);
    });
};
