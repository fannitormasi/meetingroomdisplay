let fetchInterval;
let colorIfOccupiedInterval;
let currentDateDiv = document.querySelector('.current-date');
let rpi = 0;

fetchData();
fetchInterval = setInterval(fetchData, 1000);

showCurrentTime()
setInterval(showCurrentTime, 1000);

colorIfOccupiedInterval = setInterval(() => {
    colourIfOccupied(allData, roomName)
}, 60000);

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
let adHocMeetingDiv = document.querySelector('.ad-hoc-meeting');
let url = window.location.href;
let roomName = url.split('location=')[1];
let timeSliderModal = document.getElementById("timeSliderModal");
let volumeModal = document.getElementById("volumeModal");
let table = document.createElement('table');
let thead = document.createElement('thead');
let tbody = document.createElement('tbody');
let trHead = document.createElement('tr');
let trBody;
let nextMeeting;
let currentMeeting;
let timeUntilCurrentMeetingEnd;
let noMeetingHeader = document.createElement('h3');

if (finishMeetingButton !== null) {
    finishMeetingButton.style.display = "none";
}

if (bookTimeSlider !== null) {
    bookTimeSlider.style.display = "none";
}


function fetchData() {
    let url = "http://10.11.10.16:1880/meetingroomdata";
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (jsonData) {
            allData = jsonData;
            createBaseProperties(jsonData);
            nextMeeting = getNextMeeting(jsonData, roomName)
            currentMeeting = getCurrentMeeting(jsonData, roomName);
            getTimeUntilCurrentMeetingEnd(currentMeeting);
            colourIfOccupied(allData, roomName);
        });
}

function createBaseProperties(jsonData) {
    parseTimestamp(jsonData);
    sortDataByDate(jsonData);

    for (let i = 0; i < jsonData.length; i++) {
        if (roomName === 'kortargyalo') {
            roomNameDiv.innerHTML = 'KŐR TÁRGYALÓ'
        }
        if (roomName === 'pikktargyalo') {
            roomNameDiv.innerHTML = 'PIKK TÁRGYALÓ'
        }
        if (roomName === 'trefftargyalo') {
            roomNameDiv.innerHTML = 'TREFF TÁRGYALÓ'
        }
        if (roomName === 'karotargyalo') {
            roomNameDiv.innerHTML = 'KÁRÓ TÁRGYALÓ'
        }
        if (jsonData[i].Location === 'ExchangeControllRecord') {
            continue;
        }
    }
    returnRpiByRoom(roomName);
}

function getTimeUntilCurrentMeetingEnd(currentMeeting) {
    if (currentMeeting !== undefined) {
        let currentMeetingEnd = currentMeeting.End;
        let diff = (new Date(currentMeetingEnd).getTime() - new Date().getTime()) / 1000;
        timeUntilCurrentMeetingEnd = Math.round(diff);
    } else {
        timeUntilCurrentMeetingEnd = 1800;
    }
}

function createTableWithUpcomingMeetings(jsonData) {
    trHead.innerHTML = '';
    tbody.innerText = '';

    if (jsonData) {
        noMeetingToday = true;
        let keys = Object.keys(jsonData[0]);

        createHeader(jsonData, trHead);

        // fill out the table with values
        for (let i = 0; i < jsonData.length; i++) {
            //show only what meeting is happening later
            if (new Date(jsonData[i].End) < new Date()) {
                continue;
            } else {
                trBody = document.createElement('tr');
                if (defineUrlParam(jsonData[i].Location) === roomName) {
                    noMeetingToday = false;
                    fillTableWithData(jsonData[i], keys, trBody, i);
                    tbody.appendChild(trBody);
                }
            }
        }
        if (noMeetingToday) {
            noMeetingHeader.setAttribute('class', 'text-white mt-5 pt-5 no-meetings')
            noMeetingHeader.innerText = 'Nincs több meeting a mai napon'
            tableContainer.appendChild(noMeetingHeader);

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
}

function returnRpiByRoom(roomName) {
    switch (roomName) {
        case 'pikktargyalo':
            rpi = 1;
            break;
        case 'karotargyalo':
            rpi = 2;
            break;
        case 'kortargyalo':
            rpi = 3;
            break;
        case 'trefftargyalo':
            rpi = 4;
            break;
    }
}

setTimeout(() => {
    createTableWithUpcomingMeetings(allData)
}, 1000);

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
    if (url != null) {
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

function colourIfOccupied(data, room) {
    for (let i = 0; i < data.length; i++) {
        if (defineUrlParam(data[i].Location) === room) {
            let startDate = new Date(data[i].Start);
            let endDate = new Date(data[i].End);

            if ((new Date() >= startDate && new Date() <= endDate)) {
                showCurrentMeeting();
                stop_screensaver();
                colourLed('led', rpi, true)
                body.setAttribute('class', 'colour-div occupied');
                conditionDiv.innerHTML = 'FOGLALT';
                if (bookTimeButton !== null) {
                    bookTimeButton.style.display = "none";
                }
                if (finishMeetingButton !== null) {
                    finishMeetingButton.style.display = "none";
                }
                countDownUntilTheEndOfCurrentMeeting();
                occupied = true;
                break;
            } else {
                body.setAttribute('class', 'colour-div free')
                showNextMeeting();
                colourLed('led', rpi, false);
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

function getNextMeeting(data, room) {
    let nextMeetingData;
    for (let i = 0; i < data.length; i++) {
        if (defineUrlParam(data[i].Location) === room) {
            if (new Date(data[i].Start).getTime() > new Date().getTime()) {
                nextMeetingData = data[i];
                break;
            } else {
                continue;
            }
        }
    }
    return nextMeetingData;
}

function getCurrentMeeting(data, room) {
    let currentMeeting;
    for (let i = 0; i < data.length; i++) {
        if (defineUrlParam(data[i].Location) === room) {
            if ((new Date() >= new Date(data[i].Start).getTime() && new Date() <= new Date(data[i].End).getTime())) {
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

function showNextMeeting() {
    nextOrCurrentMeetingDiv.innerHTML = '';
    if (nextMeeting === undefined) {
        return;
    } else {
        let title = document.createElement('div');
        title.innerHTML = 'KÖVETKEZŐ MEETING'
        let pTime = document.createElement('p');
        pTime.innerHTML = new Date(nextMeeting.Start).toLocaleTimeString() + ' - ' + new Date(nextMeeting.End).toLocaleTimeString();
        pTime.setAttribute('class', 'next-meeting-p');

        let pOrg = document.createElement('p');
        pOrg.innerHTML = 'Szervező: ' + nextMeeting.Organizer;
        pOrg.setAttribute('class', 'next-meeting-org');

        nextOrCurrentMeetingDiv.appendChild(title)
        nextOrCurrentMeetingDiv.appendChild(pTime)
        nextOrCurrentMeetingDiv.appendChild(pOrg)
    }
}

function showCurrentMeeting() {
    nextOrCurrentMeetingDiv.innerHTML = '';
    if (currentMeeting !== undefined) {
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

function countDownUntilTheEndOfCurrentMeeting() {
    countDownDiv.innerHTML = '';
    if (currentMeeting !== undefined) {
        let currentMeetingEnd = new Date(currentMeeting.End);
        let diff = (currentMeetingEnd.getTime() - new Date().getTime()) / 1000;
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
        if (seconds === '00') {
            minutes++;
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
        }
        if (hours.toLocaleString() === "00" && minutes.toLocaleString() === "00" && seconds.toLocaleString() === "01") {
            countDownDiv.innerHTML = '';
            window.location.reload(true);
            fetchData();
        } else {
            adHocMeetingDiv.innerHTML = '';
            bookTimeSlider.setAttribute('class', '');
            countDownDiv.innerHTML = hours.toLocaleString() + ' : ' + minutes.toLocaleString() + ' : ' + seconds.toLocaleString();
        }
    }
}

function bookTimeNow() {
    clearInterval(fetchInterval);
    clearInterval(colorIfOccupiedInterval)
    let slider = document.querySelector(".book-time-slider");
    let output = document.getElementById('myRange');
    let currentDate = new Date()
    let finishTime = new Date(currentDate.getTime() + output.value * 60000);

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
        colourLed('led', rpi, true)
        body.setAttribute('class', 'colour-div occupied');
        if (bookTimeButton !== null) {
            bookTimeButton.style.display = 'none';
        }
        if (finishMeetingButton !== null) {
            finishMeetingButton.style.display = 'block';
        }
        if (noMeetingToday) {
            nextOrCurrentMeetingDiv.innerHTML = '';
        }
        let div = document.querySelector('.ad-hoc-meeting');
        div.innerText = 'AD HOC MEETING A KÖVETKEZŐ IDŐPONTIG';
        let timeUntilAdHocMeetingEnd = finishTime.toLocaleTimeString();
        let array = timeUntilAdHocMeetingEnd.split(':');
        timeUntilAdHocMeetingEnd = array[0] + ':' + array[1];
        countDownDiv.innerHTML = timeUntilAdHocMeetingEnd;
        setTimeout(changeFetchLoop, output.value * 60000);
    }
}

function changeFetchLoop() {
    fetchData();
    adHocMeetingDiv.innerHTML = '';
    countDownDiv.innerHTML = '';
    fetchInterval = setInterval(fetchData, 60000);
    colorIfOccupiedInterval = setInterval(() => {
        colourIfOccupied(allData, roomName);
    }, 1000);
}

function finishMeeting() {
    colourLed('led', rpi, false)
    window.location.reload();
}

function showMeetings() {
    createTableWithUpcomingMeetings(allData);
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
    timeSliderModal.classList.remove('d-block');
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

document.addEventListener('contextmenu', event => event.preventDefault());

window.oncontextmenu = function () {
    return false;
}
