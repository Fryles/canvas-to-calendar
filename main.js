var courses = []; //array of courses and their respective assignments
var token = "";

// Authorization token (OAuth2.0 token)
var authToken = "";

/*
SCRAPPED CODE FOR INJECTING SCRIPT INTO CURRENT TAB

var tabId;
// The ID of the extension we want to talk to.

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	var tab = tabs[0];
	console.log(tab.id);
	tabId = tab.id;
});

	chrome.scripting
				.executeScript({
					target: { tabId: tabId },
					files: ["scraping.js"],
				})
				.then(() => console.log("script injected"));
*/

window.onload = function () {
	// This code will run when the popup DOM is ready to query
	loadToken();
	const scrapeBtn = document.querySelector("#scrapeBtn");
	scrapeBtn.addEventListener("click", async () => {
		
		getAuthorization();
		var aEvent = {
			'summary': 'Google I/O 2015',
			'location': '800 Howard St., San Francisco, CA 94103',
			'description': 'A chance to hear more about Google\'s developer products.',
			'start': {
			  'dateTime': '2023-05-28T09:00:00-07:00',
			  'timeZone': 'America/Los_Angeles'
			},
			'end': {
			  'dateTime': '2023-05-28T17:00:00-07:00',
			  'timeZone': 'America/Los_Angeles'
			},
			'recurrence': [
			  'RRULE:FREQ=DAILY;COUNT=2'
			],
			'attendees': [
			  {'email': 'lpage@example.com'},
			  {'email': 'sbrin@example.com'}
			],
			'reminders': {
			  'useDefault': false,
			  'overrides': [
				{'method': 'email', 'minutes': 24 * 60},
				{'method': 'popup', 'minutes': 10}
			  ]
			}
		  };
		insertEvent(aEvent);
		/*loadAssignments();
		console.log(courses);*/
	});

	const tokenInput = document.querySelector("#floatingInput");
	tokenInput.addEventListener("keyup", (e) => {
		// listen to a keyup event on the input field
		if (e.keyCode == 13) {
			// if user presses enter
			token = tokenInput.value;
			storeToken(token);
		}
	});
}; //end window.onload

function loadAssignments() {
	var base = "https://canvas.ucsc.edu/api/v1/"; //base url for canvas api
	fetch(
		//fetch all courses
		base + "courses" + "?per_page=100&include[]=concluded&include[]=favorites",
		{
			headers: {
				//headers for authorization (token)
				Accept: "application/json",
				Authorization: "Bearer " + token,
			},
		}
	)
		.then((response) => response.json())
		.then((data) => {
			if (data.errors.length > 0) {
				// bad request
				alert(data.errors[0].message);
				return;
			}
			//Courses have been fetched and converted to JSON
			for (let i = 0; i < data.length; i++) {
				// filter all courses by concluded and is_favorite to get only active courses
				if (data[i].concluded == false && data[i].is_favorite == true) {
					courses.push(data[i]);
				}
			}
			//courses now contains all active courses
			//now we need to get all assignments for each course
			for (let i = 0; i < courses.length; i++) {
				courses[i].assignments = [];
				fetch(base + "courses/" + courses[i].id + "/assignments", {
					headers: {
						//headers for authorization (token)
						Accept: "application/json",
						Authorization: "Bearer " + token,
					},
				})
					.then((response) => response.json())
					.then((data) => {
						//assignments have been fetched and converted to JSON
						for (let j = 0; j < data.length; j++) {
							//push all assignments to their respective course
							courses[i].assignments.push(data[j]);
						}
					});
			}
		});
}

function storeToken(token) {
	chrome.storage.sync.set({ token: token }, function () {
		console.log("saved token: ", token);
	});
}

function loadToken() {
	chrome.storage.sync.get("token", function (obj) {
		console.log("loaded: " + obj.token);
		token = obj.token;
		if (token != "" && token != null && token != undefined) {
			document.querySelector("#floatingInput").placeholder = token;
		}
	});
}

// Ask for user's permission if it can modify it's Google Calendar and gets authToken if granted.
function getAuthorization () {
	chrome.identity.getAuthToken({ 'interactive' : true}, function(authToken) {
		console.log(authToken)
	});
}

// Still working on this.
function createEvent (/*something*/) {
	var event = {
		'summary': 'Google I/O 2015',
		'location': '800 Howard St., San Francisco, CA 94103',
		'description': 'A chance to hear more about Google\'s developer products.',
		'start': {
		  'dateTime': '2023-05-28T09:00:00-07:00',
		  'timeZone': 'America/Los_Angeles'
		},
		'end': {
		  'dateTime': '2023-05-28T17:00:00-07:00',
		  'timeZone': 'America/Los_Angeles'
		},
		'recurrence': [
		  'RRULE:FREQ=DAILY;COUNT=2'
		],
		'attendees': [
		  {'email': 'lpage@example.com'},
		  {'email': 'sbrin@example.com'}
		],
		'reminders': {
		  'useDefault': false,
		  'overrides': [
			{'method': 'email', 'minutes': 24 * 60},
			{'method': 'popup', 'minutes': 10}
		  ]
		}
	  };
}

// Takes an event and inserts it into Google Calendar.
function insertEvent(aEvent) {		
	// Initializes the API request.
	let init = {
		method: 'POST',
		async: true,
		headers: {
			Authorization: 'Bearer ' + authToken,
			'Content-Type': 'application/json'
		},		
		body: JSON.stringify(aEvent)
	};
		 
	// Fetches the API request.
	fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', init)
	.then((response) => response.json()) // Transform the data into json
	.then(function(data) {
		console.log(data);
	  })
}