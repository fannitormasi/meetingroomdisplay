$(document).ready(function () {
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
        }, 600000); // 5 secs
    });
    $(document).mousemove(function () {
        clearTimeout(mousetimeout);

        mousetimeout = setTimeout(function () {
            show_screensaver();
        }, 600000); // 5 secs
    });

    function screensaver_animation() {
        if (screensaver_active) {
            $('#screensaver').animate(
                screensaver_animation);
        }
    }
});
