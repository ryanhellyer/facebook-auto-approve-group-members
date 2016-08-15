
if ( "undefined" == test_items ) {
	var test_items;
}
faa_fire_callback(test_items);

/**
 * Accessing stored settings.
 */
function faa_fire_callback(items) {

	if ( 'undefined' != typeof faa_test ) {

		faa_callback(items);

	} else {

		chrome.storage.sync.get({
			facebook_group_id: '',
			facebook_refresh_delay: '',
			facebook_sleep_start: '',
			facebook_sleep_end: '',
		}, function(items) {
// Can we just call the function, here instead of using a closure?
			faa_callback(items);

		});
	}

}

/**
 * Callback for storage data request.
 *
 * @param  object  items  The stored data
 */
function faa_callback(items) {

	var unix_time_in_seconds = new Date().getTime();

	chrome.storage.sync.set(
		{
			facebook_log: unix_time_in_seconds,
		},
		function() {
			console.log( 'logging');
			// Nothing useful happens here
		}
	);

	if (
		false == faa_is_numeric( items.facebook_refresh_delay )
		||
		false == faa_is_numeric( items.facebook_sleep_start )
		||
		false == faa_is_numeric( items.facebook_sleep_end )
		||
		false == faa_is_numeric( items.facebook_group_id )
	) {
		console.log( 'The Facebook Auto Approve Group Members extension requires more settings to set first.' );
		return;
	}

	// Adding randomisation to refresh delay to ensure we don't look like a bot.
	var rand = ( Math.random() * ( 2 ) -1 )
	var facebook_refresh_delay = Math.floor( items.facebook_refresh_delay );
	var randomisation = ( rand * facebook_refresh_delay * 0.3 );
	var refresh_delay_in_minutes = ( randomisation + facebook_refresh_delay );
	var refresh_delay_in_seconds = refresh_delay_in_minutes * 60;
	var refresh_delay_in_milliseconds = refresh_delay_in_seconds * 1000;

	// Process users if not in sleep mode
	var sleep_start = parseInt( items.facebook_sleep_start );
	var sleep_end = parseInt( items.facebook_sleep_end );
	var currentdate = new Date();
	var current_hours = currentdate.getHours()
	if (
		(
			sleep_start > sleep_end
			&&
			(
				(
					sleep_start <= current_hours
					&&
					sleep_end <= current_hours
				)
				||
				(
					sleep_start >= current_hours
					&&
					sleep_end >= current_hours
				)
			)
		)
		||
		(
			sleep_start < sleep_end
			&&
			sleep_start <= current_hours
			&&
			sleep_end >= current_hours
		)
	) {
		// We're in sleep mode, so just try reloading in a minutes time
		setInterval(faa_fire_callback, 1000 * 10);
	} else {
console.log('Initialising processing');
		// Set delay after page refresh before processing users
		var button_click_delay_seconds = Math.floor(Math.random() * 5) + 2;
		var button_click_delay_in_milliseconds = 1000 * button_click_delay_seconds;

		// Process users
		setInterval(faa_process_users, button_click_delay_in_milliseconds );

		// Reload the page
		setInterval(faa_reload, refresh_delay_in_milliseconds);

	}

}

/**
 * Process the users in the queue.
 * Time until button click is randomised.
 */
function faa_process_users() {

	// Loop through each user
	var users = document.getElementsByClassName('_3y7');
	for (var key in users) {

		// Bail out if key not numeric
		if ( isNaN( key ) ) {
			break;
		}

		// Ignoring users who are the member of too many groups (common spammer behaviour)
		var member_of_x_groups = users[key].getElementsByClassName('_5pkb _55wp _3y9')[0].childNodes[1].innerHTML;
		if ( true == ( member_of_x_groups.indexOf("Member of ") > -1 ) ) {
			member_of_x_groups = member_of_x_groups.replace("Member of ", "");
			member_of_x_groups = member_of_x_groups.replace(" groups", "");

			ignore = users[key].getElementsByClassName('_54k8 _56bs _56bt')[0];

			if ( 200 < member_of_x_groups ) {

				// Ignore since member of too many groups
				ignore.click();

			} else {

				// Get required data
				var joined_date_human_readable = users[key].getElementsByClassName('_5pkb _55wp _3y9')[0].childNodes[0].childNodes[1].innerHTML;

				var joined_date = new Date(joined_date_human_readable);
				var joined_date_unix = joined_date.getTime();

				var current_time = new Date();
				var current_time_unix = current_time.getTime();

				var membership_age_in_milliseconds = current_time_unix - joined_date_unix;
				membership_age_months = membership_age_in_milliseconds / 1000 / 60 / 60 / 24 / 30;

				var approve = users[key].getElementsByClassName('_54k8 _56bs _56bu')[0];

				// Ignoring users newer than three months
				if ( 3 < membership_age_months ) {
					approve.click();
					break; // Break out so that all members are not processed at once
				} else {
					ignore.click();
				}

			}
		}

	}

}

/**
 * Reload the page.
 */
function faa_reload() {
	window.location.reload(true);
}

/**
 * Determine if value is numeric.
 */
function faa_is_numeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}
