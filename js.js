fetchData();
showCurrentTime()
setInterval(showCurrentTime, 1000);

function fetchData() {
    let url = "http://10.11.10.16:1880/meetingroomdata";
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (jsonData) {
            showTable(jsonData);
        });
}

function showTable(jsonData) {
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
    let currentTime = new Date();

    for (let i = 0; i < Object.keys(jsonData[0]).length; i++) {
        let th = document.createElement('th');
        th.innerHTML = Object.keys(jsonData[0])[i];
        trHead.appendChild(th);
    }

    for (let i = 0; i < jsonData.length; i++) {
        let startDate = new Date(jsonData[i].Start).toTimeString();
        if (startDate > currentTime.toTimeString()) {
            trBody = document.createElement('tr');
            trBody.setAttribute('id', i)
            if (param === 'all') {
                fillTableWithData(jsonData, keys, trBody, i);
                tbody.appendChild(trBody);
            }

            if (defineUrlParam(jsonData[i].Location) === param) {
                fillTableWithData(jsonData, keys, trBody, i);
                tbody.appendChild(trBody);
            }
        }

        thead.appendChild(trHead);
        table.appendChild(thead);
        table.appendChild(tbody);
        container.appendChild(table);
    }
}

let select = document.querySelector('.room-select');
let oneMeetingDiv = document.querySelector('.one-meeting-table');
select.addEventListener('change', (event) => {
    let value = event.target.value;
    history.pushState(value, value, '#location=' + value);
    oneMeetingDiv.innerHTML = '';
    fetchData();
});


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
    let currentDate = date.toLocaleString();

    let div = document.querySelector('.current-date');
    div.innerHTML = currentDate;
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

function fillTableWithData(data, header, parentElement, iterator) {
    for (let j = 0; j < header.length; j++) {
        let th = document.createElement('th');
        th.innerHTML = data[iterator][header[j]];
        th.addEventListener('click', function () {
            showOneMeeting(data, iterator);
        });
        parentElement.appendChild(th);
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

    console.log(oneMeetingData);

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

function sortDataByDate(data) {
    let temp;
    for (let i = 0; i < data.length; i++) {
        for (let j = i + 1; j < data.length; j++) {
            let firstDate = new Date(data[i].Start);
            let secondDate = new Date(data[j].Start);
            if (firstDate > secondDate){
                temp = data[i];
                data[i] = data[j];
                data[j] = temp;
            }
        }
    }
}
