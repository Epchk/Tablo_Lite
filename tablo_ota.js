var tablo_ipv4_addr = "192.168.89.120";

const tbaseurl = `http://${tablo_ipv4_addr}:8885`;

// Support Functions - these should be private

async function tgetRESTData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {throw new Error(`Response status: ${response.status} (${url})`); }
  
        const json = await response.json();
        if (json.error) {
            throw new Error(`REST Error: ${json.error.description} (${url})`);
        } else {
            return json;
        }
    } catch (error) { console.error(error.message); }
}

async function tpostRESTData(url, data) {
    try {
        const response = await fetch(url, {method: "POST", body: data});
        if (!response.ok) {throw new Error(`Response status: ${response.status} (${url})`); }
  
        const json = await response.json();
        if (json.error) {
            throw new Error(`REST Error: ${json.error.description} (${url})`);
        } else {
            json.then(value => {return json;});
        }
    } catch (error) { console.error(error.message); }
}

async function tpatchRESTData(url, data) {
    try {
        const response = await fetch(url, {method: "PATCH", body: data});
        if (!response.ok) {throw new Error(`Response status: ${response.status} (${url})`); }
  
        const json = await response.json();
        if (json.error) {
            throw new Error(`REST Error: ${json.error.description} (${url})`);
        } else {
            return json;
        }
    } catch (error) { console.error(error.message); }
}

// API Calls - these should be exported
//  All API calls return a JSON structure
//  if an error is encountered check the error log for details

// returns a json list of paths for each channel configured on the Tablo device
function tgetChannelList() {
    return tgetRESTData(`${tbaseurl}/guide/channels`);
}

// takes a path from the output of tgetChannels() and returns a details data structure
function tgetChannelDetails(path) {
    return tgetRESTData(`${tbaseurl}${path}`);
}

function tgetServerInfo() {
    return tgetRESTData(`${tbaseurl}/server/info`);
}

// get data about the attached harddrives
function tgetHarddrive() {
    return tgetRESTData(`${tbaseurl}/server/harddrives`).then(result => {return result});
}
