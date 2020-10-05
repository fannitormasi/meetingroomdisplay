new_uri = "ws://10.11.10.16:1880/ws/bgsound"
let conn = new WebSocket(new_uri);
let VOLUME_CHANGE = "Client.OnVolumeChanged";
conn.onopen = function () {
    console.log("Connection established!");
};

conn.onmessage = function (e) {
    divRep("wsstatus_lr", HtmlEncode(e.data));
};

let updateWSStatus_tmr = setInterval(updateWSStatus, 1000);

function updateWSStatus() {
    let socketStatus = conn.readyState;
    // document.getElementById("wsstatus_int").innerHTML = socketStatus;

    switch (socketStatus) {
        case 0:
            divRep("wsstatus_str", "CONNECTING");
            //setLedColor("miwssled","2");
            break;
        case 1:
            divRep("wsstatus_str", "OPEN");
            //setLedColor("miwssled","0");
            //hideDiv("errorws");
            break;
        case 2:
            divRep("wsstatus_str", "CLOSING");
            //setLedColor("miwssled","2");
            break;
        case 3:
            divRep("wsstatus_str", "CLOSED");
            //setLedColor("miwssled","1");
            //showDiv("errorws");
            break;
        default:
            divRep("wsstatus_str", "UNKNOWN");
            //setLedColor("miwssled","5");
            //showDiv("errorws");
            break;
    }
    /*
    *    Constant		Value	Description
    *    CONNECTING	0		The connection is not yet open.
    *    OPEN			1		The connection is open and ready to communicate.
    *    CLOSING		2		The connection is in the process of closing.
    *    CLOSED		3		The connection is closed or couldn't be opened.
    */
}

function sendVol(action, id, vol, timeout) {
    let DeviceAction = {
        action: action,
        id: id,
        vol: vol,
        timeout: timeout
    };
    sendJson(DeviceAction);
}

function playNextTrack() {
    let DeviceAction = {
        action: "nexttrack"
    }
    sendJson(DeviceAction);
    let popup = document.getElementById("myPopupNextTrack");
    popup.classList.toggle("show");
    setTimeout(() => {
        popup.classList.toggle("show")
    }, 1000)
    console.log(DeviceAction);
}

function volumeOff(action, id, vol, timeout) {
    let DeviceAction = {
        action: action,
        id: id,
        vol: vol,
        timeout: timeout
    };
    sendJson(DeviceAction);
    console.log(DeviceAction);
}

function sendJson(DeviceAction) {
    divRep("wsstatus_ls", JSON.stringify(DeviceAction));
    conn.send(JSON.stringify(DeviceAction));
}


function divRep(divid, content) {
    let div = document.getElementById(divid);
    if (div != null) {
        if (div.innerHTML != content) {
            //console.log('divRep:'+divid);
            //console.log('divRep-content:'+content);
            //console.log('divRep-inner:'+div.innerHTML);
            div.innerHTML = content;
        }
    }
}


function HtmlEncode(s) {
    let el = document.createElement("div");
    el.innerText = el.textContent = s;
    s = el.innerHTML;
    return s;
}

function sleep(delay) {
    let start = new Date().getTime();
    while (new Date().getTime() < start + delay) ;
}

function sendMsg(text) {
    let DeviceAction = {
        action: "msg",
        text: text
    };
    sendJson(DeviceAction);
}

let volumeSlider = document.getElementById("myVolumeRange");
volumeSlider.innerHTML = volumeSlider.value; // Display the default slider value

if (roomName === "karotargyalo") {
    volumeSlider.oninput = function () {
        sendVol("setvol", 'Bejarat', this.value, timeUntilCurrentMeetingEnd);
        sendVol("setvol", 'Csoki', this.value, timeUntilCurrentMeetingEnd);
    }
}
if (roomName === "pikktargyalo") {
    volumeSlider.oninput = function () {
        sendVol("setvol", "Etkezo", this.value, timeUntilCurrentMeetingEnd);
    }
}

if (roomName === "pikktargyalo") {
    document.getElementById('volumeOff').onclick = function () {
        volumeOff("setvol", 'Etkezo', 0, timeUntilCurrentMeetingEnd);
        volumeSlider.value = 0;
        let popup = document.getElementById("myPopup");
        popup.classList.toggle("show");
        setTimeout(() => {
            popup.classList.toggle("show")
        }, 1000)
    }
}

if (roomName === "karotargyalo") {
    document.getElementById('volumeOff').onclick = function () {
        volumeOff("setvol", 'Bejarat', 0, timeUntilCurrentMeetingEnd)
        volumeOff("setvol", 'Csoki', 0, timeUntilCurrentMeetingEnd);
        volumeSlider.value = 0;
        let popup = document.getElementById("myPopup");
        popup.classList.toggle("show");
        setTimeout(() => {
            popup.classList.toggle("show")
        }, 1000)
    }
}

function sendLed(action, rpi, reserved) {
    let color = "0,255,0";
    if (reserved) {
        color = "255,0,0";
    } else {
        color = "0,255,0";
    }
    let DeviceAction = {
        action: action,
        rpi: rpi,
        color: color
    };
    sendJson(DeviceAction);
}

window.colourLed = function (action, roomId, reserved) {
    sendLed(action, roomId, reserved);
}
