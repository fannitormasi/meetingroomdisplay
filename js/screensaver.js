/*
$(document).ready(function () {
    console.log(1);
    let mousetimeout;
    let screensaver_active = false;

    function show_screensaver() {
        $('#screensaver').fadeIn();
        screensaver_active = true;
        screensaver_animation();
    }

    function stop_screensaver() {
        $('#screensaver').fadeOut();
        screensaver_active = false;
    }

    $(document).click(function () {
        clearTimeout(mousetimeout);

        if (screensaver_active) {
            stop_screensaver();
        }

        mousetimeout = setTimeout(function () {
            show_screensaver();
        }, 1000); // 2 hours
    });
    $(document).mousemove(function () {
        clearTimeout(mousetimeout);

        mousetimeout = setTimeout(function () {
            show_screensaver();
        }, 1000); // 2 hours
    });

    function screensaver_animation() {
        if (screensaver_active) {
            $('#screensaver').animate(
                screensaver_animation);
        }
    }
});
*/
