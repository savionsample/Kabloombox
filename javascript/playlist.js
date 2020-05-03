$(document).ready(function() {
    // let link = new URL(window.location.search);
    // const urlParams = new URLSearchParams(link);
    // url_id = urlParams.get('id');
    // url_language = urlParamss.get('language');

    let params = new URLSearchParams(location.search);
    let url_id = params.get('id');
    let url_language = params.get('language');
    let track_uris = [];
    let track_ids = [];

    var loadingScreen = pleaseWait({
         logo: "",
         backgroundColor: '#722BD3',
         loadingHtml: '<img src="../images/boombox.png" id="boombox-loading" draggable="false" /><h3>Creating customized playlist...</h3><div class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>'
   });
    // TODO: send the access token to the post request intstead of getting it through the cookie?
    // const url = 'http://localhost:8080/start-analysis?playlist=' + url_id + '&language=' + url_language;
    $.ajax({
        url: 'http://localhost:8080/start-analysis',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({'playlist': url_id,'language': url_language}),
        success: function(response) {
            let tracks = JSON.parse(JSON.stringify(response));
            tracks = tracks ? tracks : {};
            console.log(tracks);

            for (let i = 0; i < Object.keys(tracks).length; i++) {
                let track = tracks[i];
                let title = track['name'];
                let artist = track['artists']
                let id = track['id'];
                let duration_ms = track['duration_ms'];
                let uri = track['uri'];
                duration_ms = parseInt(duration_ms);
                track_ids.push(id);

                let duration_m = Math.floor((duration_ms / 1000) / 60);
                let duration_s = forceTwoDigits(Math.floor((duration_ms / 1000) % 60));

                let $track = $('<div class="result-playlist-track"><span id="result-track-title">' + title +
                    '</span><span id="result-track-artist">' + artist +
                    '</span><span id="result-track-length">' + duration_m + ':' + duration_s +
                    '</span></div>');
                $track.data('uri', uri);
                $('.result-playlist-body').append($track);

                track_uris.push(uri);
            }

            loadingScreen.finish();
        },
        error: function(response, status, error) {
            console.log(response.status);
            switch(response.status){
                case 401:
                    console.log('401 Auth Error');
                    var cookies = document.cookie.split(";");
                    for (var i = 0; i < cookies.length; i++) {
                        eraseCookie(cookies[i].split("=")[0]);
                    }
                    break;
                case 404:
                    console.log('404 Error Not Found')
                    // document.html = '<h1>HIHIHI</h1>'
                    $('html').html('<h1>Sorry, couldn\'t find that playlist.</h1><br/><a href="/">Return home.</a>')
                    // window.location.replace('/error');
                    break;
                default:
                    break
            }
            loadingScreen.finish();
        }
    });


    // $('body').delegate('.result-playlist-track','click',function() {
    //     console.log('blah');
    //     // alert(1);
    //     $.post('http://localhost:8080/play?uri=' + $('.result-playlist-track').data('uri'));
    // });

    $('body').on('click', '.result-playlist-track', function() {
        console.log('blah');
        alert(1);
        $.post('http://localhost:8080/play?uri=' + $('.result-playlist-track').data('uri'));
    });




    /*Dropdown Menu*/
    $('.dropdown').click(function () {
        $(this).attr('tabindex', 1).focus();
        $(this).toggleClass('active');
        $(this).find('.dropdown-menu').slideToggle(300);
        // $('#arrow').rotate({ endDeg:180, persist:true });

        $('#arrow').animate({ deg: 180 }, {
            duration: 70,
            step: function(now) {
                $(this).css({ transform: 'rotate(' + now + 'deg)' });
            }
        });


    });

    $('.dropdown').focusout(function () {
        $('.dropdown').removeClass('active');
        $('.dropdown').find('.dropdown-menu').slideUp(300);

        $('#arrow').animate({ deg: 360 }, {
            duration: 70,
            step: function(now) {
                $(this).css({ transform: 'rotate(' + now + 'deg)' });
            }
        });
    });


    $('.result-playlist-add-button').click(function () {
        $.ajax({
            url: 'http://localhost:8080/create',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({ 'uris': track_uris.toString() }),
            // data: track_uris.toString(),
            success: function(results) {
                console.log('success');
                console.log(results['message']);
                loadingScreen.finish();
            },
            error: function(response, status, error) {
                console.log(response.status);
                console.log(error);

                let json = JSON.parse(JSON.stringify(response));
                console.log(json.responseText);

                switch(response.status) {

                    case 401:
                        console.log('401 Auth Error');
                        var cookies = document.cookie.split(";");
                        for (var i = 0; i < cookies.length; i++) {
                            eraseCookie(cookies[i].split("=")[0]);
                        }
                        break;
                    case 404:
                        // $('html').html('<h1>Sorry, couldn\'t create that playlist.</h1><br/><a href="/">Return home.</a>')
                        // window.location.replace('/error');
                        break;
                    default:
                        break
                }
                loadingScreen.finish();
            }
        });
    });




});




function forceTwoDigits(n) {
  return ('0' + n).slice(-2);
}