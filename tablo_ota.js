var tablo_ipv4_addr = "192.168.89.120";

const tbaseurl = `http://${tablo_ipv4_addr}:8885`;

// Support Functions - these should be private

async function tgetRESTData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const error_text = await response.json();
            alert(error_text.error.description);
            throw new Error(`Response status: ${response.status} (${url})`); 
        }
  
        const json = await response.json();
        if (json.error) {
            throw new Error(`REST Error: ${json.status} (${url})`);
        }
        return json;

    } catch (error) { console.error(error.message); }
}

async function tpostRESTData(url, data) {
    console.log(data);
    try {
        const response = await fetch(url, {method: "POST", body: data});
        if (!response.ok) {
            const error_text = await response.json();
            alert(error_text.error.description);
            throw new Error(`Response status: ${response.status} (${url})`); 
        }
  
        const json = await response.json();
        if (json.error) {
            throw new Error(`REST Error: ${json.status} (${url})`);
        }
        return json;

    } catch (error) { console.error(error.message); }
}

async function tpatchRESTData(url, data) {
    try {
        const response = await fetch(url, {method: "PATCH", body: data});
        if (!response.ok) {
            const error_text = await response.json();
            alert(error_text.error.description);
            throw new Error(`Response status: ${response.status} (${url})`); 
        }
  
        const json = await response.json();
        if (json.error) {
            throw new Error(`REST Error: ${json.status} (${url})`);
        }
        return json;

    } catch (error) { console.error(error.message); }
}

async function tdeleteRESTData(url) {
    try {
        const response = await fetch(url, {method: "DELETE"});
        if (!response.ok) {
            const error_text = await response.json();
            alert(error_text.error.description);
            throw new Error(`Response status: ${response.status} (${url})`); 
        }
  
        const json = await response.json();
        if (json.error) {
            throw new Error(`REST Error: ${json.status} (${url})`);
        }
            return json;

    } catch (error) { console.error(error.message); } //getting error here, DELETE isn't returning anything.  
}

// API Calls - these should be exported
//  All API calls return a promise for a JSON structure
//  if an error is encountered check the error log for details

function tgetAccount() {
    return tgetRESTData(`${tbaseurl}/account/subscription`);
}

// returns a json list of paths for each channel configured on the Tablo device
function tgetChannelList() {
    return tgetRESTData(`${tbaseurl}/guide/channels`);
}

//get details about the server
function tgetServerInfo() {
    return tgetRESTData(`${tbaseurl}/server/info`);
}

// get current status of turner (and number of tuners)
function tgetTunerInfo() {
    return tgetRESTData(`${tbaseurl}/server/tuners`);
}

// get data about the attached harddrives
function tgetHarddrive() {
    return tgetRESTData(`${tbaseurl}/server/harddrives`);
}

// get a list of scheduled recordings
function tgetScheduledRecordings() {
    return tgetRESTData(`${tbaseurl}/guide/airings`);
}

// manually schedule a new recording. timezone is taken from the local computre, month is a number. hour uses 24 hour clock.
/*
{
    "schedule":{
        "rule":"all",
        "offsets":{"start":0,"end":0,"source":"none"}
    },
    "schedule_rule":"all",
    "config":{
        "title":"new test recording",
        "channel_path":"/guide/channels/357011",
        "duration":1800,
        "kind":"once",
        "once":{"year":"2024","month":"09","day":"30","hour":"08","minute":"00","timezone":"America/Toronto"}}}
*/
function tScheduleNewRecording(title, year, month, day, hour, minute, duration, channel_path) {
    /* this is the minimum data needed in the POST */
    var data={
        "schedule":{
            "rule":"all",
            "offsets":{"start":0,"end":0,"source":"none"}
        },
        "schedule_rule":"all",
        "config":{
            "title":"test",
            "channel_path":"/guide/channels/357025",
            "duration":3600,
            "kind":"once",
            "once":{"year":2038,"month":1,"day":19,"hour":3,"minute":14,"timezone":"America/Toronto"}
        },"program":{"title":"test"},"show_counts":{"airing_count":1,"conflicted_count":0,"scheduled_count":1},"keep":{"rule":"none","count":null},"recordings_path":null};

    data.config.once.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    data.config.title=title;
    data.config.once.year=parseInt(year);
    data.config.once.month=parseInt(month);
    data.config.once.day=parseInt(day);
    data.config.once.hour=parseInt(hour);
    data.config.once.minute=parseInt(minute);
    data.config.duration=duration*60;
    data.config.channel_path=channel_path;
    data.program.title=title;
    return tpostRESTData(`${tbaseurl}/guide/programs`, JSON.stringify(data));
}

function tRemoveSchedule(path) {
    return tdeleteRESTData(`${tbaseurl}${path}`)
}

// get a list of the completed recordings
function tgetRecordings() {
    return tgetRESTData(`${tbaseurl}/recordings/airings`);
}

// get details about a live channel, or recording
function tgetWatchDetails(path) {
    return tpostRESTData(`${tbaseurl}${path}/watch`,'');
}

function tRemoveRecording(path) {
    return tdeleteRESTData(`${tbaseurl}${path}`)
}


// returns the current system settings
function tgetSettings() {
    return tgetRESTData(`${tbaseurl}/settings/info`);
}

// return details from a Channel, Schedule, Recording, Quality, etc. endpoint
function tgetDetails(path) {
    return tgetRESTData(`${tbaseurl}${path}`);
}

// return the details from a list of channels, schedules, recordings, endpoints
//  NOTE: the batch endpoint will not accept more than 50 entries
function tbatchDetails(list) {
    return tpostRESTData(`${tbaseurl}/batch`, list);
}
