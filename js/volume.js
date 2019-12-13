new_uri = "ws://10.11.10.16:1880/ws/bgsound"
let conn = new WebSocket(new_uri);
conn.onopen = function (e) {
    console.log("Connection established!");
};

conn.onmessage = function (e) {
    divRep("wsstatus_lr", HtmlEncode(e.data));

    let msg = JSON.parse(e.data);

    if (msg.action === "Client.OnVolumeChanged") {
        /*console.log(msg.id);
        console.log(msg.percent);*/
    }
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
    console.log(DeviceAction);
}

function playNextTrack() {
    let DeviceAction = {
        action: "nexttrack"
    }
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

function volumeOff(action, id, vol, timeout) {
    let DeviceAction = {
        action: action,
        id: id,
        vol: vol,
        timeout: timeout
    };
    sendJson(DeviceAction);
}

function changeMusic() {
    let modal = document.getElementById("changeMusicModal");
    let iframe = document.querySelector('iframe');
    iframe.src = "http://10.11.30.30:6690/index.php";
    modal.setAttribute('style', 'display: block;');
    modal.onclick = function () {
        modal.style.display = "none";
    }
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

let volumeSlider = document.getElementById("myVolumeRange");
volumeSlider.innerHTML = volumeSlider.value; // Display the default slider value

if (param === "karotargyalo") {
    volumeSlider.oninput = function () {
        sendVol("setvol", 'Bejarat', this.value, 10);
        sendVol("setvol", 'Csoki', this.value, 10);
    }
}
if (param === "pikktargyalo") {
    volumeSlider.oninput = function () {
        console.log(volumeSlider.value);
        console.log(this.value);
        sendVol("setvol", "Etkezo", this.value, 10);
    }
}

if (param === "pikktargyalo") {
    document.getElementById('volumeOff').onclick = function () {
        volumeOff("setvol", 'Etkezo', 0, 10)
    }
}

if (param === "karotargyalo") {
    document.getElementById('volumeOff').onclick = function () {
        volumeOff("setvol", 'Bejarat', 0, 10)
        volumeOff("setvol", 'Csoki', 0, 10)
        volumeSlider.value = 0;
    }
}
