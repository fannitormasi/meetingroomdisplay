fetchData();
setInterval(fetchData, 1000);
showCurrentTime()
setInterval(showCurrentTime, 1000);
let occupied = false;
let allData;
let noMeetingToday = true;

let select = document.querySelector('.room-select');
select.addEventListener('click', (event) => {
    let value = event.target.value;
    history.pushState(value, value, '#location=' + value);
    document.querySelector('.one-meeting-table').innerHTML = '';
    document.querySelector('.countdown').innerHTML = '';
    document.querySelector('body').setAttribute('class', 'colour-div free');
    document.querySelector('.condition').innerHTML = '';
    document.querySelector('.next-meeting').innerHTML = '';
    document.querySelector('.room-name').innerHTML = '';
    noMeetingToday = true;
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

    parseTimestamp(jsonData);
    sortDataByDate(jsonData);

    let url = window.location.href;
    let param = url.split('location=')[1];
    let keys = Object.keys(jsonData[0]);

    let container = document.querySelector('.table-container');
    container.innerHTML = '';
    let table = document.createElement('table');
    table.setAttribute('class', 'table border')
    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');
    let trHead = document.createElement('tr');
    let trBody;

    createHeader(jsonData, trHead);

    // fill out the table with values
    for (let i = 0; i < jsonData.length; i++) {
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
                document.querySelector('body').setAttribute('class', 'colour-div all-room');
                document.querySelector('.condition').innerHTML = 'ALL ROOMS';
                fillTableWithData(jsonData, keys, trBody, i);
                tbody.appendChild(trBody);
            } else if (defineUrlParam(jsonData[i].Location) === param) {
                noMeetingToday = false;
                document.querySelector('.room-name').innerHTML = jsonData[i].Location.toUpperCase();
                fillTableWithData(jsonData, keys, trBody, i);
                tbody.appendChild(trBody);
                if (occupied) {
                    showCurrentMeeting(jsonData, param);
                    document.querySelector('.condition').innerHTML = 'OCCUPIED';
                    countDownUntilTheEndOfCurrentMeeting(jsonData, currentTime, param);
                } else {
                    showNextMeeting(jsonData, param);
                    document.querySelector('.condition').innerHTML = 'AVAILABLE';
                }
            }
        }
        if (noMeetingToday) {
            document.querySelector('.condition').innerHTML = 'AVAILABLE';
            document.querySelector('.next-meeting').innerHTML = 'No scheduled meeting for today!';
            document.querySelector('.room-name').innerHTML = '';
        }
        colourIfOccupied(jsonData, currentTime, param);

        thead.appendChild(trHead);
        table.appendChild(thead);
        table.appendChild(tbody);
        container.appendChild(table);
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

    let divDate = document.querySelector('.current-date');
    let divTime = document.createElement('div');
    divDate.innerHTML = currentDate;
    divTime.innerHTML = currentTime;

    divDate.appendChild(divTime);

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
        }
    }
}

function colourIfOccupied(data, currentTime, room) {
    for (let i = 0; i < data.length; i++) {
        let body = document.querySelector('body');
        if (defineUrlParam(data[i].Location) === room) {
            let startDate = new Date(data[i].Start);
            let endDate = new Date(data[i].End);

            if ((currentTime >= startDate && currentTime <= endDate)) {
                body.setAttribute('class', 'colour-div occupied');
                occupied = true;
                break;
            } else {
                body.setAttribute('class', 'colour-div free')
                occupied = false;
            }
        } else {
            occupied = false;
        }
    }
}

function getNextMeeting(data, currentTime, room) {
    let nextMeeting;
    for (let i = 0; i < data.length; i++) {
        if (defineUrlParam(data[i].Location) === room) {
            if (new Date(data[i].Start).getTime() > currentTime.getTime()) {
                nextMeeting = data[i];
                break;
            } else {
                continue;
            }
        }
    }
    return nextMeeting;
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
        let th = document.createElement('th');
        th.innerHTML = Object.keys(data[0])[i];
        parent.appendChild(th);
    }
}

function showNextMeeting(data, room) {
    let nextMeeting = getNextMeeting(data, new Date(), room);
    let divMeeting = document.querySelector('.next-meeting');
    divMeeting.innerHTML = '';
    if (nextMeeting === undefined) {
        return;
    } else if (defineUrlParam(nextMeeting.Location) === room) {
        let title = document.createElement('div');
        title.innerHTML = 'NEXT MEETING:'
        let pTime = document.createElement('p');
        pTime.innerHTML = new Date(nextMeeting.Start).toLocaleTimeString() + ' - ' + new Date(nextMeeting.End).toLocaleTimeString();
        pTime.setAttribute('class', 'next-meeting-p');

        let pOrg = document.createElement('p');
        pOrg.innerHTML = 'Organizer: ' + nextMeeting.Organizer;
        pOrg.setAttribute('class', 'next-meeting-p');

        divMeeting.appendChild(title)
        divMeeting.appendChild(pTime)
        divMeeting.appendChild(pOrg)
    }
}

function showCurrentMeeting(data, room) {
    let currentMeeting = getCurrentMeeting(data, new Date(), room);
    let div = document.querySelector('.next-meeting');
    div.innerHTML = '';

    if (defineUrlParam(currentMeeting.Location) === room) {
        let title = document.createElement('div');
        title.innerHTML = 'CURRENT MEETING:'
        let pTime = document.createElement('p');
        pTime.innerHTML = new Date(currentMeeting.Start).toLocaleTimeString() + ' - ' + new Date(currentMeeting.End).toLocaleTimeString();
        pTime.setAttribute('class', 'next-meeting-p');

        let pOrg = document.createElement('p');
        pOrg.innerHTML = 'Organizer: ' + currentMeeting.Organizer;
        pOrg.setAttribute('class', 'next-meeting-p');

        div.appendChild(title)
        div.appendChild(pTime)
        div.appendChild(pOrg)
    }
}

function showOneMeeting(data, i) {
    let oneMeetingData = data[i];

    let div = document.querySelector('.one-meeting-table');
    div.innerHTML = '';

    let table = document.createElement('table');
    table.setAttribute('class', 'table border')
    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');
    thead.innerHTML = oneMeetingData.Location;
    table.appendChild(thead);
    table.appendChild(tbody);
    div.appendChild(table);

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
    let divCountDown = document.querySelector('.countdown');
    divCountDown.innerHTML = '';
    let currentMeeting = getCurrentMeeting(data, currentTime, room);
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

    divCountDown.innerHTML = hours.toLocaleString() + ' : ' + minutes.toLocaleString() + ' : ' + seconds.toLocaleString();

    let div = document.createElement('div');
    div.innerHTML = ' from current meeting';
    div.setAttribute('class', 'countdown-text')
    divCountDown.appendChild(div);
}

/*function countDownUntilNextMeeting(data, currentTime) {
    let divCountDown = document.querySelector('.countdown');
    let nextMeeting = getNextMeeting(data, currentTime);
    if (nextMeeting !== null) {
        let nextMeetingStart = new Date(nextMeeting.Start);
        let diff = (nextMeetingStart.getTime() - currentTime.getTime()) / 1000;
        let hourText = 'hour';
        let hours;
        let minutesText = 'minutes';

        let minutes = Math.ceil(diff / 60);

        if (minutes > 59) {
            hours = Math.floor(minutes / 60);
            if (hours > 1) {
                hourText = 'hours';
            }
            minutes = minutes % 60;
            if (minutes === 1) {
                minutesText = 'minute';
            }
        } else {
            hours = 0;
        }

        divCountDown.innerHTML = hours.toLocaleString() + ' ' + hourText + ' ' + minutes.toLocaleString() + ' ' + minutesText + ' until the next meeting.';
        let p = document.createElement('p');
        p.innerHTML = 'Organizer: ' + nextMeeting.Organizer;
        p.setAttribute('class', '')
        divCountDown.appendChild(p);
    } else {
        divCountDown.innerHTML = 'No meetings today!'
    }
}*/

