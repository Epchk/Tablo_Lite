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
            return json;
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
//  All API calls return a promise for a JSON structure
//  if an error is encountered check the error log for details

// returns a json list of paths for each channel configured on the Tablo device
function tgetChannelList() {
    return tgetRESTData(`${tbaseurl}/guide/channels`);
}

//get details about the server
function tgetServerInfo() {
    return tgetRESTData(`${tbaseurl}/server/info`);
}

// get data about the attached harddrives
function tgetHarddrive() {
    return tgetRESTData(`${tbaseurl}/server/harddrives`);
}

// get a list of scheduled recordings
function tgetScheduledRecordings() {
    return tgetRESTData(`${tbaseurl}/guide/airings`);
}

// get a list of the completed recordings
function tgetRecordings() {
    return tgetRESTData(`${tbaseurl}/recordings/airings`);
}

// get details about a live channel, or recording
function tgetWatchDetails(path) {
    return tpostRESTData(`${tbaseurl}${path}/watch`,'');
}

// returns the current system settings
function tgetSettings() {
    return tgetRESTData(`${tbaseurl}/settings/info`);
}

// return details from a Channel, Schedule, Recording endpoint, Quality
function tgetDetails(path) {
    return tgetRESTData(`${tbaseurl}${path}`);
}

// return the details from a list of channels, schedules, recordings, endpoints
//  NOTE: the batch endpoint will not accept more than 50 entries
function tbatchDetails(list) {
    tpostRESTData(`${tbaseurl}/batch`, list);
}