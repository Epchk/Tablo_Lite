# Tablo_Lite
A single page simple web UI for the Tablo OTA PVR device made by Nuvyyo LLC.

If you are looking for the official web app for the Tablo, it's at ![http://my.tablotv.com/](http://my.tablotv.com/). Use it. It's better.

## Installation

Put the following files into a directory. It can be local to your PC or on a web server that serves static http (not https)<sup>(1)</sup> conent.

* index.html
* tablo_lite.css
* tablo_lite.js
* tablo_ota.js

To run it, load the index.html in a web browser running on a computer that is on the same network as your TabloTV device.

(1) The need to serve them over http is due to the tablo device not having an https server and modern browsers not supporting mixed security functionality.

## Current Functionality

### Setup
- Manually enter IP address of TabloTV device and store in a cookie.
- Manually enter the URL of a guide data website and store in a cookie.

#### Limitations

Some Tablo devices do not encode video in a format that is supported by the video player in most web browser. Older tablo devices encoded in h.264, which is supported.

### Channels
- List basic device information.
- List available channels, 50 at a time.
- Play a live channel.
- Does NOT provide guide data.

### Recordings
- List recordings, 50 at a time.
- Play a recording.
- Delete recordings one at a time.

### Schedule
- List scheduled recordings, 50 at a time.
- Manually add a scheduled recording.
- Delete scheduled recordings one at a time.

### Settings
- Display device settings.

### Sample home (default) screen

![Tablo Lite Home screen - alpha](https://github.com/Epchk/Tablo_Lite/blob/main/screenshots/Home.jpg?raw=true)

Tablo device information is displayed at the top with a list of the configured channels below. Selecting a channel switches to the watch interface and starts playing the live TV channel from the Tablo device.

## Planned Functionality

The following did not get included in the 1.0 release
- Select recording and live tv quality
- Select preferred audio track

### Potential Functionality

These may not be possible with 3rd party apps like this one.

- Update additional settings on the tablo device (name, LED status, Zip/Postal Code).
- Rescan/update the available OTA channels. _This does not appear to be possible without using the authenticated API_
