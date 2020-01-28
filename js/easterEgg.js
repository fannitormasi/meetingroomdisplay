let counter = 0;

roomNameDiv.onclick = function () {
    counter++;
    if (counter === 2) {
        $('#gameModal').modal('show');
        counter = 0;
    }
}

$('.modal-backdrop').click(function () {
    $('#gameModal').setAttribute('style', 'display: none;')
})


$(document).ready(function () {
    $('#patterncontainer').patternLock({
        rows: 4,
        columns: 4,
        centerCircle: true,
        selectionColor: 'white',
        centerCircleSize: 20,
        drawEnd: function (data) {
            const patternContainer = document.querySelector('#patterncontainer');
            console.log(data);
            if (data == "1,6,11,16,12,8,4,3,2") {
                console.log("ok");
                let modal = document.getElementById("changeMusicModal");
                let iframe = document.querySelector('iframe');
                iframe.src = "http://10.11.30.30:6690/index.php";
                modal.setAttribute('style', 'display: block;');
                modal.onclick = function () {
                    modal.style.display = "none";
                }
                $('#gameModal').modal('hide');
            }
            if (data == '1,6,11,16,15,14,13,9,5') {
                patternContainer.innerHTML = `<iframe src='game.html'></iframe>`;

            }
        }
    });
});
