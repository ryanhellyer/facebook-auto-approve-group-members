
function faa_save_options() {
	var facebook_group_id = document.getElementById('facebook_group_id').value;
	var facebook_refresh_delay = document.getElementById('facebook_refresh_delay').value;
	var facebook_sleep_start = document.getElementById('facebook_sleep_start').value;
	var facebook_sleep_end = document.getElementById('facebook_sleep_end').value;
	var facebook_log = document.getElementById('facebook_log').innerHTML;

	chrome.storage.sync.set({
		facebook_group_id: facebook_group_id,
		facebook_refresh_delay: facebook_refresh_delay,
		facebook_sleep_start: facebook_sleep_start,
		facebook_sleep_end: facebook_sleep_end,
		facebook_log: facebook_log,
	}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		status.textContent = 'Settings saved.';
		setTimeout(function() {
			status.textContent = '';
		}, 750);
	});
}

function faa_restore_options() {
	chrome.storage.sync.get({
		facebook_group_id: '',
		facebook_refresh_delay: '',
		facebook_sleep_start: '',
		facebook_sleep_end: '',
		facebook_log: '',
	}, function(items) {

		document.getElementById('facebook_group_id').value = items.facebook_group_id;
		document.getElementById('facebook_refresh_delay').value = items.facebook_refresh_delay;
		document.getElementById('facebook_sleep_start').value = items.facebook_sleep_start;
		document.getElementById('facebook_sleep_end').value = items.facebook_sleep_end;

		document.getElementById('facebook_log').innerHTML = items.facebook_log;

		var url = "https://m.facebook.com/groups/"+items.facebook_group_id+"/madminpanel/requests/";
		var current_unix_time_in_milliseconds = new Date().getTime();

		// If page has reloaded within 3x of expected refresh delay, then spawn a new window
		var lag = current_unix_time_in_milliseconds - ( items.facebook_refresh_delay * 1000 * 60 * 3 ) - items.facebook_log;
		if ( lag > 0 ) {
			window.open(url);
		}

		document.getElementById('button').href = url;
	});
}
document.addEventListener('DOMContentLoaded', faa_restore_options);
document.getElementById('save').addEventListener('click',faa_save_options);
