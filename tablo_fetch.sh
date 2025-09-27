#!/usr/local/bin/bash
# SCript is written to run on FreeBSD. Path may need to be altered for Linux
#
#IP:8885/server/info			json server information
#/recordings/airings			json list of manual recordings
#/recordings/programs/airings/.*	data about the recording (json format)
#IP:18080/pvr/.*/pl/playlist.m3u8	recording playlist (.ts files)
#
# wget		used to pull json data from the tablo
# ffmpeg	used to save the show to the local hard drive (in .mp4 container)
#
## SET THIS
TABLO_IP=''

date=''
object_id=''
state=''
clean=''
rec_date=''
network=''
show_title=''

do_setup() {
	which -s wget
	if [ $? == 1 ] ; then
		echo wget is not installed
		exit 1
	fi
	which -s ffmpeg
	if [ $? == 1 ] ; then
		echo ffmpeg is not installed
		exit 1
	fi
	if [ "$TABLO_IP" == "" ] ; then
		echo TABLO_IP has not been set.
		get_tablo_addr
		exit 2
	fi
}

# displays a list of recordings from the tablo
get_airings() {
	data=`wget -qO - http://${TABLO_IP}:8885/recordings/airings`
	data=${data#\[}
	data=${data%\]}
	readarray -d , -t airing <<< "$data"
		printf "\n%10s\t%8s\t%8s\t%s\n" "State" "Clean" "RecID" "Title"
	for recording in "${airing[@]}" ; do
		recording=${recording#\"}; recording=${recording%%\"*}
		data=`wget -qO - http://${TABLO_IP}:8885${recording}`
		object_id=${data#*object_id\":}; object_id=${object_id%%,*}
		state=${data#*state\":\"}; state=${state%%\",*}
		clean=${data#*clean\":}; clean=${clean%%,*}
		rec_date=${data#*datetime\":\"}; rec_date=${rec_date%%\",*}
		network=${data#*call_sign_src\":\"}; network=${network%%\",*}
		show_title=${data#*show_title\":\"}; show_title=${show_title%%\"\},*}
		
		printf "%10s\t%8s\t%8d\t%s\n" "$state" "$clean" "$object_id" "$show_title"
	done
}

get_tablo_addr() {
        data=`wget -qO - https://api.tablotv.com/assocserver/getipinfo/`
        public_ip=${data#*\"public_ip\": \"}; public_ip=${public_ip%%\",*}
        private_ip=${data#*\"private_ip\": \"}; private_ip=${private_ip%%\",*}
        devname=${data#*\"name\": \"}; devname=${devname%%\",*}
        devtype=${data#*\"board\": \"}; devtype=${devtype%%\",*}

        printf "%s (%s)\n" "$devname" "$devtype"
        printf "Local IP Address: \t%16s\n" "$private_ip"
        printf "Public IP Address:\t%16s\n" "$public_ip"
}


fetch_details() {
	recording="/recordings/programs/airings/""$1"
        data=`wget -qO - http://${TABLO_IP}:8885${recording}`
        object_id=${data#*object_id\":}; object_id=${object_id%%,*}
        state=${data#*state\":\"}; state=${state%%\",*}
        clean=${data#*clean\":}; clean=${clean%%,*}
        rec_date=${data#*datetime\":\"}; rec_date=${rec_date%%\",*}
        network=${data#*call_sign_src\":\"}; network=${network%%\",*}
        show_title=${data#*show_title\":\"}; show_title=${show_title%%\"\},*}
}

print_details() {
        printf "%s\n" "$show_title"
	printf "\trec_id:  \t%s\n" $object_id
	printf "\tdate:    \t%s\n" $rec_date
	printf "\tnetwork: \t%s\n" $network
	printf "\tstate:   \t%s\n" $state
	printf "\tis clean:\t%s\n" $clean
}

get_details() {
	fetch_details "$1"
	print_details
}

do_setup

# Process command line
case "$1" in 
	'list')	# list all manually created recordings on the tablo
		get_airings
	;;
	'get')	# save the recording to a file
		dir=$2 dir=${dir:-0}
		videotitle=${3:-tablo}
		fetch_details "$2"
		if [ "$videotitle" == "tablo" ] ; then 
			videotitle="${show_title}"
		fi
		if [ "$dir" == "0" ]; then 
			echo MISSING recording ID ; exit 1 
		else
		   echo Saving: "http://${TABLO_IP}:18080/pvr/${dir}/pl/playlist.m3u8"
		   echo To file: "${videotitle}".mp4 
		   ffmpeg -hide_banner -v warning -stats -i "http://${TABLO_IP}:18080/pvr/${dir}/pl/playlist.m3u8" -c copy -bsf:a aac_adtstoasc \
			-metadata:s:a:1 language=eng \
			-metadata comment="${network}_${rec_date}" \
			"${videotitle}".mp4 
		   ffprobe -hide_banner  -i "${videotitle}".mp4
		fi
	;;
	'details') #get details of a specific recording
		get_details "$2"
	;;
	'address') #get the ip address of the local tablo device
		get_tablo_addr
	;;
	*)
	cat <<EOF
Usage: tablo [list | get {rec_id} {title} | details {rec_id} ]
	list       summarizes the manually schedule recordings in the local database.
	get        fetches the item from the tablo and saves it as a .mp4 file
	           the rec_id and title must be specified
	details    provide more details about a recording
	address    attempt to find tablo attached to local network
EOF
	;;
esac
