if(Hls.isSupported()) {
	var hls = new Hls();
}

// Helper Functions

/* Get the value of a cookie */
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

/* save the tablo ip address to a cookie */
function save_tablo_ip() {
	var input = document.getElementById("tablo_ip_entry").value;
	var tv_listings_url = document.getElementById("tv_listings_url").value;
	document.cookie = `tablo_ip_addr=${input}; max-age=63115200; SameSite=Strict`;
	if (tv_listings_url) {
		document.cookie = `tv_listings_url=${tv_listings_url}; max-age=63115200; SameSite=Strict`;
	}
	bootstrap();
}


//User Interaction

/* Callback to load the Setup section. Just a placeholder. */
function doSetup() {
	StopVideo(); // stop video playing, if it was playing

}

/* Callback to load the Home tab: device info, hd info, channel list */
async function doHome(page = 1) {
	StopVideo(); // stop video playing, if it was playing
  	//Inject the server info into the Home section
	tgetServerInfo().then(server => {
		document.getElementById("Tserver_name").innerHTML = `${server.name} (${server.local_address})`;
		document.getElementById("Tserver_version").innerHTML = server.version;
		document.getElementById("Tserver_model").innerHTML = server.model.name;
	});

  	//Inject the Harddrive data into the Home section
	tgetHarddrive().then(hd => {
		document.getElementById("Thd_info").innerHTML = '';
		for (drive of hd) {
			//NOTE: this will MESS UP if there is more than one HDD (like on the newer models that have an internal HD)
			document.getElementById("Thd_info").innerHTML += `<th>${drive.name}</th><td>${drive.free_mib} MB available of ${drive.size_mib} MB</td>`;
		}
	});

	//Get list of channels and nject the channel detail into the Home section
	tgetChannelList().then(channels => {
		const start_index = (page - 1) * 50; end_index = page * 50;
		let pages = channels.length;

		//Add number of channels found
		document.getElementById("tchannel_count").innerHTML = Object.keys(channels).length;

		//Add page numbers above table
		document.getElementById('channel_pages').innerHTML = '';
		for (let i = 1; i <= Math.ceil(pages / 50); i++) {
			document.getElementById('channel_pages').innerHTML += `<a href="#home" onclick="doHome('${i}')">${i}</a> `;
		}
		
		//Reset table content and add headings
		document.getElementById("tchannels").innerHTML = "<tr><th>Channel</th><th>Network</th><th>Call Sign</th><th>Quality</th></tr>";
		
		//Load channel details in table
		tbatchDetails(JSON.stringify(channels.slice(start_index, end_index))).then(list => {
			let i = start_index + 1;
			for (path in list) {
				const channel = list[path];

				document.getElementById("tchannels").innerHTML += `<tr id="${channel.object_id}"><td>` + 
				`<a href="#watch" onclick="doWatch('${channel.path}');">${channel.channel.major}.${channel.channel.minor}</a></td><td>` + 
				`${channel.channel.network}</td><td>` + 
				`${channel.channel.call_sign}</td><td>` + 
				`${channel.channel.resolution}</td></tr>`;
			}
		});

		// Tuner Status
		tgetTunerInfo().then(list => {
			document.getElementById("tuner_info").innerHTML = '<th>Tuners:</th>';
			for (i in list) {
				tuner = list[i];
				in_use = tuner.in_use ? 'In Use' : 'available';
				recording = tuner.recording ? 'recording' : '';
				document.getElementById("tuner_info").innerHTML += `<td>(${i}): ${in_use} ${recording}</td>`
			}
		});
	});
}

/* Callback to load the Schedule tab: show currently scheduled recordings */
async function doSchedule(page = 1) {
	StopVideo(); // stop video playing, if it was playing
	//inject channel list into new schedule form
	document.getElementById('sched_channel').innerHTML='';
	tgetChannelList().then(channels => {
		tbatchDetails(JSON.stringify(channels)).then(list => {
			for (path in list) {
				const channel = list[path];
				const network_name = channel.channel.network ? channel.channel.network : channel.channel.call_sign;
				document.getElementById('sched_channel').innerHTML += `<option value="${channel.path}">${network_name} ${channel.channel.major}.${channel.channel.minor} (${channel.channel.resolution})</option>`;	
			}
		});
	});

	//inject the list of scheduled recordings
	tgetScheduledRecordings().then(recordings => {	
		const start_index = (page - 1) * 50; end_index = page * 50;
		let pages = recordings.length;

		//reset table headings
		document.getElementById('tschedule_list').innerHTML =
		'<tr><th>ID</th><th>Name</th><th>Channel</th><th>Start</th><th>Duration</th><th>Delete?</th></tr>';
		document.getElementById("tschedule_count").innerHTML = Object.keys(recordings).length;

		//insert page numbers
		document.getElementById('schedule_pages').innerHTML = '';
		for (let i = 1; i <= Math.ceil(pages / 50); i++) {
			document.getElementById('schedule_pages').innerHTML += `<a href="#home" onclick="doSchedule('${i}')">${i}</a> `;
		}

		//insert table details: list of scheduled recordings
		tbatchDetails(JSON.stringify(recordings.slice(start_index, end_index))).then(list => {
			let i = start_index + 1;
			for (path in list) {
				const recording = list[path];

				//Inject details of each recording
				document.getElementById('tschedule_list').innerHTML += `<tr><td>${recording.object_id}</td><td>${recording.airing_details.show_title}</td><td>${recording.airing_details.channel.channel.call_sign}</td><td>${recording.airing_details.datetime}</td><td>${recording.airing_details.duration}</td><td><a href="#schedule" onclick="deleteSchedule('${recording.program_path}');">Delete</a></td></tr>`;
			}
		});
	});
}

/* Callback to save schedule */
function save_new_schedule() {
	const schedule_date=document.getElementById('sched_date').value; //2024-09-03
	const schedule_time=document.getElementById('sched_time').value; //14:30
	tScheduleNewRecording(
		document.getElementById('sched_title').value, 
		schedule_date.split('-')[0],
		schedule_date.split('-')[1],
		schedule_date.split('-')[2],
		schedule_time.split(':')[0],
		schedule_time.split(':')[1],
		document.getElementById('sched_duration').value,
		document.getElementById('sched_channel').value).then(value => {
			document.getElementById('schedule_recording').reset();
			doSchedule();
		});
}

/* delete an existing scheduled recording */
function deleteSchedule(path) {
	tRemoveSchedule(path).then(rv => {doSchedule();});
}

//* Callback to load the Recordings section and list all airings */
async function doRecordings(page = 1) {
	StopVideo(); // stop video playing, if it was playing
	//Inject list of completed recordings
	tgetRecordings().then(recordings => {
		const start_index = (page - 1) * 50; end_index = page * 50;
		let pages = recordings.length;

		document.getElementById('recording_pages').innerHTML = '';
		for (let i = 1; i <= Math.ceil(pages / 50); i++) {
			document.getElementById('recording_pages').innerHTML += `<a href="#recordings" onclick="doRecordings('${i}')">${i}</a> `;
		}

		document.getElementById('Trecordings').innerHTML = "<tr><th>ID</th><th>Name</th><th>Duration</th><th>Is Clean</th><th>Resolution</th><th>Channel</th><th>Data</th><th>Action</th></tr>\n";
		document.getElementById("trec_count").innerHTML = Object.keys(recordings).length;

		tbatchDetails(JSON.stringify(recordings.slice(start_index, end_index))).then(list => {

			let i = start_index + 1;
			for (path in list) {
				const recording = list[path];
				document.getElementById('Trecordings').innerHTML += `<tr><td>${i} - ${recording.object_id}</td><td>` +
					`<a href="#watch" onClick="doWatch('${recording.path}');">${recording.airing_details.show_title}</a></td><td>` + 
					Math.round(recording.video_details.duration/60) + "m </td><td>" +
					`${recording.video_details.clean}</td><td>` +
					`${recording.video_details.height}</td><td>` +
					`${recording.airing_details.channel.channel.call_sign}</td><td>` + 
					`${recording.airing_details.datetime}</td><td>` +
					`<a href=#recordings onclick="deleteRecording('${recording.path}', '${recording.airing_details.show_title}')">Delete</a></tr>\n`;
					i++;
			}
		})
	});
}

function deleteRecording(path, title) {
	if (confirm(`Are you sure you want to delete ${title}?`)) {
		tRemoveRecording(path).then(rv => {
			alert(`${title} has been removed.`); 
			doRecordings();
		});
	}
}

/* Callback to load the Watch section and start the selected video stream */
function doWatch(path) {
	StopVideo(); // stop video playing, if it was playing
	tgetWatchDetails(path).then(stream => {
		document.getElementById('playlist_url').innerHTML = `The playlist URL is "${stream.playlist_url}".`;

		/* EXPERIMENTAL use HLS to play video directly from Tablo */
		var video = document.getElementById('video');
		if(Hls.isSupported()) {
			//var hls = new Hls();
			hls.attachMedia(video);
			hls.loadSource(stream.playlist_url);
			video.play();
		} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
			video.src = stream.playlist_url;
			video.addEventListener('loadedmetadata',function() {
				video.play();
			});
		} else {
			alert("Unable to play the video. Note: the hls.js open source javascript player is needed for this to work.");
		}
	});
}

// callback for the stop button below the video
function StopVideo() {
	var video = document.getElementById('video');
	hls.attachMedia(video);
	hls.stopLoad();
}

/* Callback to load the Settings section. Not yet implemented. */
function doSettings() {
	StopVideo(); // stop video playing, if it was playing
	document.getElementById("device_settings").innerHTML = '';
	tgetSettings().then(setting => {
		tgetDetails(setting.recording_quality).then(quality => {
			document.getElementById("device_settings").innerHTML += `<tr><th>Recording Quality</th><td>${quality.name}</td></th>`;
		})
		tgetDetails(setting.livetv_quality).then(quality => {
			document.getElementById("device_settings").innerHTML += `<tr><th>Live TV Quality</th><td>${quality.name}</td></th>`;
		})
		document.getElementById("device_settings").innerHTML += `<tr><th>LED status</th><td>${setting.led}</td></tr>\n` +
			`<tr><th>extend live recordings</th><td>${setting.extend_live_recordings}</td></tr>\n` +
			`<tr><th>auto delete recordings</th><td>${setting.auto_delete_recordings}</td></tr>\n` +
			`<tr><th>exclude duplicates</th><td>${setting.exclude_duplicates}</td></tr>\n` +
			`<tr><th>fast live startup</th><td>${setting.fast_live_startup}</td></tr>\n` +
			`<tr><th>Audio Format</th><td>${setting.audio}</td></tr>\n` +
			`<tr><th>data collection</th><td>${setting.data_collection}</td></tr>\n` +
			`<tr><th>preferred audio track</th><td>${setting.preferred_audio_track}</td></tr>\n`;
	});

	//Subscription details
	tgetAccount().then(account => {
		document.getElementById("subscriptions").innerHTML = '<tr><th>Name</th><th>Status</th><th>Description</th></tr>';

		for (const subscription of account.subscriptions) {
			document.getElementById("subscriptions").innerHTML += `<tr><td>${subscription.title}</td>` +
				`<td>${subscription.status}</td><td>${subscription.description}</td></tr>`;
		}
	})
}

//BOOSTRAP
function bootstrap() {
	const tablo_ip_addr = getCookie('tablo_ip_addr')
		
	const tv_listings_url = getCookie('tv_listings_url');
	if (tv_listings_url) {
		document.getElementById("tv_listings_link").href = tv_listings_url;
		document.getElementById("tv_listings_url").value = tv_listings_url;
	}
	
	if (tablo_ip_addr) {
		document.getElementById("tablo_ip_entry").value = tablo_ip_addr;
		setTabloIP(tablo_ip_addr);
		doHome();
		location.href = location.href.replace(/#.*$/,'') + "#home";
	} else {
		location.href = location.href.replace(/#.*$/,'') + "#setup";
	}
}