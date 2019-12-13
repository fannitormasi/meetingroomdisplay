let select = document.querySelector('.room-select');

select.addEventListener('click', (event) => {
    let value;
    if (event.target.id === 'roomSelectModal') {
        return;
    } else {
        value = event.target.id;
    }
    history.pushState(value, value, '#location=' + value);
    countDownDiv.innerHTML = '';
    body.setAttribute('class', 'colour-div free');
    conditionDiv.innerHTML = '';
    nextOrCurrentMeetingDiv.innerHTML = '';
    roomNameDiv.innerHTML = '';
    bookTimeSlider.style.display = "none";
    noMeetingToday = true;
    if (adHocMeetingDiv) {
        adHocMeetingDiv.innerHTML = '';
    }
    finishMeeting();
    fetchData();
});

function showMeetingRooms() {
    bookTimeSlider.style.display = 'none';
    volumeSlider.style.display = 'none';
    let modal = document.getElementById("roomSelectModal");
    modal.setAttribute('style', 'display: block;');
    modal.onclick = function () {
        modal.style.display = "none";
    }
}
