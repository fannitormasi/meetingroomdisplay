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
let oneMeetingTable = document.querySelector('.one-meeting-table');
let countDownDiv = document.querySelector('.countdown');
let body = document.querySelector('body');
let conditionDiv = document.querySelector('.condition');
let nextOrCurrentMeetingDiv = document.querySelector('.next-or-current-meeting');
let bookTimeSlider = document.querySelector('.book-time-slider');
let bookTimeButton = document.querySelector('.book-time-btn');
let select = document.querySelector('.room-select');
let tableContainer = document.querySelector('.table-container');
let finishMeetingButton = document.querySelector('.finish-meeting');
let adHocMeetingDiv = document.querySelector('ad-hoc-meeting');
let volumeSlider = document.querySelector('.volume-slider');

if (finishMeetingButton !== null) {
    finishMeetingButton.style.display = "none";
}

if (adHocMeetingDiv !== null) {
    adHocMeetingDiv.style.display = "none";
}
if (bookTimeSlider !== null) {
    bookTimeSlider.style.display = "none";
}

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

function fetchData() {
    let url = "http://10.11.10.16:1880/meetingroomdata";
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (jsonData) {
            allData = jsonData;
            showTable(allData);
        });
}


function showTable(jsonData) {
    let currentTime = new Date();
    noMeetingToday = true;

    parseTimestamp(jsonData);
    sortDataByDate(jsonData);

    let url = window.location.href;
    let param = url.split('location=')[1];
    let keys = Object.keys(jsonData[0]);

    tableContainer.innerHTML = '';
    let table = document.createElement('table');
    table.setAttribute('class', '')
    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');
    let trHead = document.createElement('tr');
    let trBody;

    createHeader(jsonData, trHead);

    // fill out the table with values
    for (let i = 0; i < jsonData.length; i++) {
        if (param === 'aa-fejlesztoitargyalo') {
            roomNameDiv.innerHTML = 'FEJLESZTŐI TÁRGYALÓ'
        }
        if (param === 'kistargyalo') {
            roomNameDiv.innerHTML = 'KIS TÁRGYALÓ'
        }
        if (param === 'aa-ablakostargyalo') {
            roomNameDiv.innerHTML = 'ABLAKOS TÁRGYALÓ'
        }
        if (param === 'aa-projecttargyalo') {
            roomNameDiv.innerHTML = 'PROJECT TÁRGYALÓ'
        }
        if (jsonData[i].Location === 'ExchangeControllRecord') {
            continue;
        }
        //show only what meeting is happening later
        if (new Date(jsonData[i].End) < currentTime) {
            continue;
        } else {
            trBody = document.createElement('tr');
            if (param === 'all' || param === undefined) {
                noMeetingToday = false;
                body.setAttribute('class', 'colour-div all-room');
                conditionDiv.innerHTML = 'ALL ROOMS';
                if (bookTimeButton !== null) {
                    bookTimeButton.style.display = "none";
                }
                if (finishMeetingButton !== null) {
                    finishMeetingButton.style.display = "none";
                }
                fillTableWithData(jsonData, keys, trBody, i);
                tbody.appendChild(trBody);
            } else if (defineUrlParam(jsonData[i].Location) === param) {
                noMeetingToday = false;
                fillTableWithData(jsonData, keys, trBody, i);
                tbody.appendChild(trBody);
            }
        }
    }
    if (noMeetingToday) {
        conditionDiv.innerHTML = 'AVAILABLE';
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
    colourIfOccupied(jsonData, currentTime, param);

    thead.appendChild(trHead);
    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
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

function fillTableWithData(data, header, parentElement, i) {
    for (let j = 0; j < header.length; j++) {
        if (header[j] === 'Cancelled') {
            continue;
        }
        let th = document.createElement('th');
        th.innerHTML = data[i][header[j]];
        th.addEventListener('click', function () {
            showOneMeeting(data, i);
        });
        parentElement.appendChild(th);
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
            if (data[i].Location === 'Fejlesztői tárgyaló') {
                data[i].Location = 'AA - Fejlesztői tárgyaló'
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
                body.setAttribute('class', 'colour-div occupied');
                showCurrentMeeting(data, room);
                conditionDiv.innerHTML = 'OCCUPIED';
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
                conditionDiv.innerHTML = 'AVAILABLE';
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
        title.innerHTML = 'NEXT MEETING:'
        let pTime = document.createElement('p');
        pTime.innerHTML = new Date(nextMeetingData.Start).toLocaleTimeString() + ' - ' + new Date(nextMeetingData.End).toLocaleTimeString();
        pTime.setAttribute('class', 'next-meeting-p');

        let pOrg = document.createElement('p');
        pOrg.innerHTML = 'Organizer: ' + nextMeetingData.Organizer;
        pOrg.setAttribute('class', 'next-meeting-p');

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
            title.innerHTML = 'CURRENT MEETING:'
            let pTime = document.createElement('p');
            pTime.innerHTML = new Date(currentMeeting.Start).toLocaleTimeString() + ' - ' + new Date(currentMeeting.End).toLocaleTimeString();
            pTime.setAttribute('class', 'next-meeting-p');

            let pOrg = document.createElement('p');
            pOrg.innerHTML = 'Organizer: ' + currentMeeting.Organizer;
            pOrg.setAttribute('class', 'next-meeting-p');

            nextOrCurrentMeetingDiv.appendChild(title)
            nextOrCurrentMeetingDiv.appendChild(pTime)
            nextOrCurrentMeetingDiv.appendChild(pOrg)
        }
    }
}

function showOneMeeting(data, i) {
    let oneMeetingData = data[i];

    let table = document.createElement('table');
    table.setAttribute('class', 'table border')
    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');
    thead.innerHTML = oneMeetingData.Location;
    table.appendChild(thead);
    table.appendChild(tbody);

    let trOrganizer = document.createElement('tr');
    trOrganizer.innerHTML = 'Organizer: ' + oneMeetingData.Organizer;
    tbody.appendChild(trOrganizer);

    let trStart = document.createElement('tr');
    trStart.innerHTML = 'Start time: ' + oneMeetingData.Start;
    tbody.appendChild(trStart);

    let trEnd = document.createElement('tr');
    trEnd.innerHTML = 'End time: ' + oneMeetingData.End;
    tbody.appendChild(trEnd);
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

        countDownDiv.innerHTML = hours.toLocaleString() + ' : ' + minutes.toLocaleString() + ' : ' + seconds.toLocaleString();

        let div = document.createElement('div');
        div.innerHTML = ' from current meeting';
        div.setAttribute('class', 'countdown-text')
        countDownDiv.appendChild(div);
    }
    fetchData();
}

let slider = document.getElementById("myRange");
let output = document.getElementById("time-value");
output.innerHTML = slider.value + ' minutes'; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function () {
    if (this.value === '1') {
        output.innerHTML = this.value + ' minute';
    } else {
        output.innerHTML = this.value + ' minutes';
    }
}

function toggleBookTime() {
    if (bookTimeSlider.getAttribute('style') === 'display: none;') {
        bookTimeSlider.setAttribute('style', 'display: block;');
        if (volumeSlider.getAttribute('style') === 'display: block;') {
            volumeSlider.setAttribute('style', 'display: none;');
        }
    } else {
        bookTimeSlider.setAttribute('style', 'display: none;');
    }
}

function bookTimeNow() {
    clearInterval(x);
    let output = document.getElementById('myRange');
    let room = window.location.href.split('location=')[1];
    let currentDate = new Date()
    let finishTime = new Date(currentDate.getTime() + output.value * 60000);
    let nextMeeting = getNextMeeting(allData, new Date(), room);

    if (nextMeeting !== undefined && (finishTime > new Date(nextMeeting.Start))) {
        let modal = document.getElementById("myModal");
        let span = document.getElementsByClassName("close")[0];
        modal.style.display = "block";
        span.onclick = function () {
            modal.style.display = "none";
        }
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    } else {
        conditionDiv.innerHTML = 'OCCUPIED';
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
        div.innerHTML = 'AD HOC MEETING UNTIL';
        countDownDiv.innerHTML = finishTime.toLocaleTimeString();

        setTimeout(changeFetchLoop, output.value * 60000);
        toggleBookTime();
    }
}

function changeFetchLoop() {
    x = setInterval(fetchData, 1000);
}

function finishMeeting() {
    window.location.reload();
    fetchData();
}

function showMeetingRooms() {
    bookTimeSlider.style.display = 'none';
    volumeSlider.style.display = 'none';
    let modal = document.getElementById("roomSelectModal");
    if (modal.getAttribute('style') === 'display: none;') {
        modal.setAttribute('style', 'display: block;');
    } else {
        modal.setAttribute('style', 'display: none;');
        modal.onclick = function () {
            modal.style.display = "none";
        }
    }
}

function showMeetings() {
    bookTimeSlider.style.display = 'none';
    volumeSlider.style.display = 'none';
    let modal = document.getElementById("tableModal");
    if (modal.getAttribute('style') === 'display: none;') {
        modal.setAttribute('style', 'display: block;');
    } else {
        modal.setAttribute('style', 'display: none;');
        modal.onclick = function () {
            modal.style.display = "none";
        }
    }
}

function toggleVolume() {
    if (volumeSlider.getAttribute('style') === 'display: none;') {
        volumeSlider.setAttribute('style', 'display: block;');
        if (bookTimeSlider.getAttribute('style') === 'display: block;') {
            bookTimeSlider.setAttribute('style', 'display: none;');
        }
    } else {
        volumeSlider.setAttribute('style', 'display: none;');
    }
}
