# Tablo_Lite
A single document simple web UI for the Tablo OTA PVR device. The Tablo is a network attached OTA PVR produced by Nuvyyo LLC.

If you are looking for the official web app for the Tablo, it's at ![http://my.tablotv.com/](http://my.tablotv.com/). Use it. it's better.

## Installation

Put the "index.html" and "tablo_ota.js" files in the same directory. They can be loaded directly into a web browser using the "file:" method or served from a web server. If they are served from a web server, they must be over http (not https).

The need to serve them over http is due to the tablo device not having an https server and modern browsers not supporting mixed security functionality.

## Current Functionality
- Manual setup of device IP and storing the IP Address in a cookie for future use.
- List device information.
- List available channels and play live show directly in the browser. Does not include guide data.
- List recordings and play directly from the device.
- List scheduled recordings.

### Sample home (default) screen
![Tablo Lite Home screen - alpha](https://github.com/user-attachments/assets/a1d609c8-c2d3-438b-88b8-5c4c7424d974)

Tablo device information is displayed at the top with a list of the configured channels below. Selecting a channel switches to the watch interface and starts playing the live TV channel from the Tablo device.

## Planned Functionality
- Settings page to display details of device settings and maybe edit.
- Schedule new manual recording. (maybe)
- Delete scheduled recording.
- Delete failed recordings.
