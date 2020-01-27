let x;
let currentDateDiv = document.querySelector('.current-date');

fetchData();
x = setInterval(fetchData, 1000);

showCurrentTime()
setInterval(showCurrentTime, 1000);
let occupied = false;
let allData;
let noMeetingToday = true;

let roomNameDiv = document.querySelector('.room-name');
let countDownDiv = document.querySelector('.countdown');
let body = document.querySelector('body');
let conditionDiv = document.querySelector('.condition');
let nextOrCurrentMeetingDiv = document.querySelector('.next-or-current-meeting');
let bookTimeSlider = document.querySelector('.book-time-slider');
let bookTimeButton = document.querySelector('.book-time-btn');
let tableContainer = document.querySelector('.table-container');
let finishMeetingButton = document.querySelector('.finish-meeting');
let adHocMeetingDiv = document.querySelector('ad-hoc-meeting');
let url = window.location.href;
let param = url.split('location=')[1];
let timeSliderModal = document.getElementById("timeSliderModal");
let volumeModal = document.getElementById("volumeModal");

if (finishMeetingButton !== null) {
    finishMeetingButton.style.display = "none";
}

if (adHocMeetingDiv !== null) {
    adHocMeetingDiv.style.display = "none";
}
if (bookTimeSlider !== null) {
    bookTimeSlider.style.display = "none";
}

let table = document.createElement('table');
let thead = document.createElement('thead');
let tbody = document.createElement('tbody');
let trHead = document.createElement('tr');
let trBody;

function fetchData() {
    let url = "http://10.11.10.16:1880/meetingroomdata";
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (jsonData) {
            allData = jsonData;
            createBaseProperties(jsonData);
        });
}

setTimeout(() => {
    createTableWithUpcomingMeetings(allData)
}, 2000);

function createBaseProperties(jsonData) {
    let currentTime = new Date();
    parseTimestamp(jsonData);
    sortDataByDate(jsonData);
    colourIfOccupied(jsonData, currentTime, param);

    for (let i = 0; i < jsonData.length; i++) {
        if (param === 'kortargyalo') {
            roomNameDiv.innerHTML = 'KŐR TÁRGYALÓ'
        }
        if (param === 'pikktargyalo') {
            roomNameDiv.innerHTML = 'PIKK TÁRGYALÓ'
        }
        if (param === 'trefftargyalo') {
            roomNameDiv.innerHTML = 'TREFF TÁRGYALÓ'
        }
        if (param === 'karotargyalo') {
            roomNameDiv.innerHTML = 'KÁRÓ TÁRGYALÓ'
        }
        if (jsonData[i].Location === 'ExchangeControllRecord') {
            continue;
        }
    }
}

function createTableWithUpcomingMeetings(jsonData) {
    let currentTime = new Date();
    noMeetingToday = true;
    let keys = Object.keys(jsonData[0]);
    tableContainer.innerHTML = '';

    createHeader(jsonData, trHead);

    // fill out the table with values
    for (let i = 0; i < jsonData.length; i++) {
        //show only what meeting is happening later
        if (new Date(jsonData[i].End) < currentTime) {
            continue;
        } else {
            trBody = document.createElement('tr');
            if (defineUrlParam(jsonData[i].Location) === param) {
                noMeetingToday = false;
                fillTableWithData(jsonData[i], keys, trBody, i);
                tbody.appendChild(trBody);
            }
        }
    }
    if (noMeetingToday) {
        let div = document.createElement('h3');
        div.setAttribute('class', 'text-white mt-5 pt-5 no-meetings')
        div.innerText = 'Nincs több meeting a mai napon'
        tableContainer.appendChild(div);

        conditionDiv.innerHTML = 'SZABAD';
        body.setAttribute('class', 'colour-div free');
        countDownDiv.innerHTML = '';
        table.style.display = "none";
        if (bookTimeButton !== null) {
            bookTimeButton.style.display = "block";
        }
        if (finishMeetingButton !== null) {
            finishMeetingButton.style.display = "none";
        }
    }
    thead.appendChild(trHead);
    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
}

function fillTableWithData(data, header, parentElement, i) {
    for (let j = 0; j < header.length; j++) {
        if (header[j] === 'Cancelled') {
            continue;
        }
        let th = document.createElement('th');
        th.innerHTML = data[header[j]];
        parentElement.appendChild(th);
    }
}

function defineUrlParam(url) {
    let charsWith = ['á', 'é', 'í', 'ú', 'ü', 'ű', 'ó', 'ö', 'ő'];
    let charsWithout = ['a', 'e', 'i', 'u', 'u', 'u', 'o', 'o', 'o'];
    let newUrl = url.toLowerCase();
    for (let i = 0; i < newUrl.length; i++) {
        if (newUrl[i] === ' ') {
            newUrl = newUrl.replace(newUrl[i], '');
        }
    }
    for (let i = 0; i < newUrl.length; i++) {
        for (let j = 0; j < charsWith.length; j++) {
            if (newUrl[i] === charsWith[j]) {
                newUrl = newUrl.replace(newUrl[i], charsWithout[j])
            }
        }
    }
    return newUrl;
}

function showCurrentTime() {
    let date = new Date();
    let currentDate = date.toLocaleDateString();
    let currentTime = date.toLocaleTimeString();

    currentDateDiv.innerHTML = currentDate;
    let divTime = document.createElement('div');
    divTime.setAttribute('class', 'current-time-div')
    divTime.innerHTML = currentTime;

    currentDateDiv.appendChild(divTime);
}

function parseTimestamp(jsonData) {
    for (let i = 0; i < jsonData.length; i++) {
        if (jsonData[i].Location !== 'ExchangeControllRecord') {
            let timeStampStart = parseInt(jsonData[i].Start.slice(6, 19));
            let timeStampEnd = parseInt(jsonData[i].End.slice(6, 19));

            jsonData[i].Start = new Date(timeStampStart).toLocaleString();
            jsonData[i].End = new Date(timeStampEnd).toLocaleString();
        }
    }
}

function sortDataByDate(data) {
    let temp;
    for (let i = 0; i < data.length; i++) {
        for (let j = i + 1; j < data.length; j++) {
            let firstDate = new Date(data[i].Start);
            let secondDate = new Date(data[j].Start);
            if (firstDate > secondDate) {
                temp = data[i];
                data[i] = data[j];
                data[j] = temp;
            }
        }
    }
}

function colourIfOccupied(data, currentTime, room) {
    for (let i = 0; i < data.length; i++) {
        if (defineUrlParam(data[i].Location) === room) {
            let startDate = new Date(data[i].Start);
            let endDate = new Date(data[i].End);

            if ((currentTime >= startDate && currentTime <= endDate)) {
                stop_screensaver();
                body.setAttribute('class', 'colour-div occupied');
                showCurrentMeeting(data, room);
                conditionDiv.innerHTML = 'FOGLALT';
                if (bookTimeButton !== null) {
                    bookTimeButton.style.display = "none";
                }
                if (finishMeetingButton !== null) {
                    finishMeetingButton.style.display = "none";
                }
                countDownUntilTheEndOfCurrentMeeting(data, currentTime, room);
                occupied = true;
                break;
            } else {
                body.setAttribute('class', 'colour-div free')
                showNextMeeting(data, room);
                conditionDiv.innerHTML = 'SZABAD';
                if (bookTimeButton !== null) {
                    bookTimeButton.style.display = "block";
                }
                if (finishMeetingButton !== null) {
                    finishMeetingButton.style.display = "none";
                }
                occupied = false;
            }
        } else {
            occupied = false;
        }
    }
}

function getNextMeeting(data, currentTime, room) {
    let nextMeetingData;
    for (let i = 0; i < data.length; i++) {
        if (defineUrlParam(data[i].Location) === room) {
            if (new Date(data[i].Start).getTime() > currentTime.getTime()) {
                nextMeetingData = data[i];
                break;
            } else {
                continue;
            }
        }
    }
    return nextMeetingData;
}

function getCurrentMeeting(data, currentTime, room) {
    let currentMeeting;
    for (let i = 0; i < data.length; i++) {
        if (defineUrlParam(data[i].Location) === room) {
            if ((currentTime >= new Date(data[i].Start).getTime() && currentTime <= new Date(data[i].End).getTime())) {
                currentMeeting = data[i];
                break;
            } else {
                continue;
            }
        }
    }
    return currentMeeting;
}


function createHeader(data, parent) {
    for (let i = 0; i < Object.keys(data[0]).length; i++) {
        if (Object.keys(data[0])[i] === 'Cancelled') {
            continue
        }
        let th = document.createElement('th');
        th.innerHTML = Object.keys(data[0])[i];
        parent.appendChild(th);
    }
}

function showNextMeeting(data, room) {
    let nextMeetingData = getNextMeeting(data, new Date(), room);
    nextOrCurrentMeetingDiv.innerHTML = '';
    if (nextMeetingData === undefined) {
        return;
    } else if (defineUrlParam(nextMeetingData.Location) === room) {
        let title = document.createElement('div');
        title.innerHTML = 'KÖVETKEZŐ MEETING'
        let pTime = document.createElement('p');
        pTime.innerHTML = new Date(nextMeetingData.Start).toLocaleTimeString() + ' - ' + new Date(nextMeetingData.End).toLocaleTimeString();
        pTime.setAttribute('class', 'next-meeting-p');

        let pOrg = document.createElement('p');
        pOrg.innerHTML = 'Szervező: ' + nextMeetingData.Organizer;
        pOrg.setAttribute('class', 'next-meeting-org');

        nextOrCurrentMeetingDiv.appendChild(title)
        nextOrCurrentMeetingDiv.appendChild(pTime)
        nextOrCurrentMeetingDiv.appendChild(pOrg)
    }
}

function showCurrentMeeting(data, room) {
    let currentMeeting = getCurrentMeeting(data, new Date(), room);
    nextOrCurrentMeetingDiv.innerHTML = '';
    if (currentMeeting !== undefined) {
        if (defineUrlParam(currentMeeting.Location) === room) {
            let title = document.createElement('div');
            title.innerHTML = 'AKTUÁLIS MEETING:'
            let pTime = document.createElement('p');
            pTime.innerHTML = new Date(currentMeeting.Start).toLocaleTimeString() + ' - ' + new Date(currentMeeting.End).toLocaleTimeString();
            pTime.setAttribute('class', 'next-meeting-p');

            let pOrg = document.createElement('p');
            pOrg.innerHTML = 'Szervező: ' + currentMeeting.Organizer;
            pOrg.setAttribute('class', 'next-meeting-org');

            nextOrCurrentMeetingDiv.appendChild(title)
            nextOrCurrentMeetingDiv.appendChild(pTime)
            nextOrCurrentMeetingDiv.appendChild(pOrg)
        }
    }
}

function countDownUntilTheEndOfCurrentMeeting(data, currentTime, room) {
    countDownDiv.innerHTML = '';
    let currentMeeting = getCurrentMeeting(data, currentTime, room);
    if (currentMeeting !== undefined) {
        let currentMeetingEnd = new Date(currentMeeting.End);
        let diff = (currentMeetingEnd.getTime() - currentTime.getTime()) / 1000;
        let hours;
        let seconds;

        let minutes = Math.floor(diff / 60);
        seconds = Math.ceil(diff % 60);
        if (seconds === 60) {
            seconds = '0';
        }

        if (minutes > 58) {
            hours = Math.floor(minutes / 60);
            minutes = minutes % 60;
        } else {
            hours = 0;
        }
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        if (hours === 0) {
            hours = '0' + hours;
        }
        if (seconds < 10) {
            seconds = '0' + seconds;
        }
        if (hours.toLocaleString() === "00" && minutes.toLocaleString() === "00" && seconds.toLocaleString() === "00") {
            window.location.reload();
            fetchData();
        } else {
            bookTimeSlider.setAttribute('class', '');
            countDownDiv.innerHTML = hours.toLocaleString() + ' : ' + minutes.toLocaleString() + ' : ' + seconds.toLocaleString();
        }
    }
}

function bookTimeNow() {
    clearInterval(x);
    let slider = document.querySelector(".book-time-slider");
    let output = document.getElementById('myRange');
    let room = window.location.href.split('location=')[1];
    let currentDate = new Date()
    let finishTime = new Date(currentDate.getTime() + output.value * 60000);
    let nextMeeting = getNextMeeting(allData, new Date(), room);

    if (nextMeeting !== undefined && (finishTime > new Date(nextMeeting.Start))) {
        let modal = document.getElementById('myModal');
        let span = document.querySelector(".close");
        timeSliderModal.classList.add('d-block');
        slider.classList.add('d-block');
        modal.classList.add('d-block')
        modal.onclick = function () {
            modal.classList.remove('d-block');
        }
        span.onclick = function () {
            modal.classList.remove('d-block');
        }
    } else {
        timeSliderModal.classList.remove('d-block');
        slider.classList.remove('b-block')
        conditionDiv.innerHTML = 'FOGLALT';
        body.setAttribute('class', 'colour-div occupied');
        if (bookTimeButton !== null) {
            bookTimeButton.style.display = 'none';
        }
        if (finishMeetingButton !== null) {
            finishMeetingButton.style.display = 'block';
        }
        if (adHocMeetingDiv !== null) {
            adHocMeetingDiv.style.display = 'block';
        }
        if (noMeetingToday) {
            nextOrCurrentMeetingDiv.innerHTML = '';
        }

        let div = document.querySelector('.ad-hoc-meeting');
        div.innerHTML = 'AD HOC MEETING A KÖVETKEZŐ IDŐPONTIG';
        let timeUntilAdHocMeetingEnd = finishTime.toLocaleTimeString();
        let array = timeUntilAdHocMeetingEnd.split(':');
        timeUntilAdHocMeetingEnd = array[0] + ':' + array[1];
        countDownDiv.innerHTML = timeUntilAdHocMeetingEnd;

        setTimeout(changeFetchLoop, output.value * 60000);
    }
}

function changeFetchLoop() {
    x = setInterval(fetchData, 10000);
}

function finishMeeting() {
    window.location.reload();
}

function showMeetings() {
    let modal = document.getElementById("tableModal");
    modal.setAttribute('style', 'display: block;');
    modal.onclick = function () {
        modal.style.display = "none";
    }
}

function toggleVolume() {
    volumeModal.setAttribute('style', 'display: block;');
    bookTimeSlider.setAttribute('style', 'display: none;');
    volumeModal.onclick = function () {
        volumeModal.style.display = "none";
    }
}

function toggleBookTime() {
    let slider = document.querySelector(".book-time-slider");
    timeSliderModal.classList.add('d-block')
    slider.classList.add('d-block')
}

function cancelBooking() {
    timeSliderModal.classList.remove('d-block')
}

function refresh() {
    window.close();
    window.open(window.location.href, '_blank');
}

let slider = document.getElementById("myRange");
let output = document.getElementById("time-value");
output.innerHTML = slider.value + ' perc'; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function () {
    output.innerHTML = this.value + ' perc';
}

let screensaver_active = false;

function show_screensaver() {
    $('#screensaver').fadeIn();
    screensaver_active = true;
}

function stop_screensaver() {
    $('#screensaver').fadeOut();
    screensaver_active = false;
}

$(document).ready(function () {
    let mouseTimeout;

    $(document).click(function () {
        clearTimeout(mouseTimeout);

        if (screensaver_active) {
            stop_screensaver();
        }
        mouseTimeout = setTimeout(function () {
            show_screensaver();
        }, 7200000); // 2 hours
    });
    $(document).mousemove(function () {
        clearTimeout(mouseTimeout);

        mouseTimeout = setTimeout(function () {
            show_screensaver();
        }, 7200000); // 2 hours
    });
});
