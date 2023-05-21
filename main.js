// GLOBALS
var courses = []; //array of courses and their respective assignments
var tabId;

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	var tab = tabs[0];
	tabId = tab.id;
});

// EVENT LISTENERS/INITIALIZATION
window.onload = function () {
	// This code will run when the popup DOM is ready to query

	//sets placeholder text to token
	loadToken();

	const scrapeBtn = document.querySelector("#scrapeBtn");
	scrapeBtn.addEventListener("click", async () => {
		await refreshCourses();
		console.log(courses);
	});

	const selectAsgnmsBtn = document.querySelector("#asgnmBtn");
	selectAsgnmsBtn.addEventListener("click", async () => {
		//placeholder
		console.log(courses);
	});

	const tokenInput = document.querySelector("#floatingInput");
	tokenInput.addEventListener("keyup", async function (e) {
		// listen to a keyup event on the input field
		if (e.keyCode == 13) {
			// if user presses enter
			let token = tokenInput.value;
			await storeToken(token);
			refreshCourses();
		}
	});

	const tweakBtn = document.querySelector("#tweaksBtn");
	tweakBtn.addEventListener("click", async () => {
		chrome.scripting.executeScript({
			target: { tabId: tabId },
			files: ["./tweaks.js"],
		});
	});

	const helpBtn = document.querySelector("#helpBtn");
	helpBtn.addEventListener("click", getHelp);
}; //end window.onload

// FUNCTIONS

//send message to autoLoad to load courses
//This function is ASYNC so courses wont be loaded immediately
async function refreshCourses() {
	await chrome.tabs.sendMessage(
		tabId,
		{
			action: "loadCourses",
		},
		(response) => {
			courses = response.courses;
		}
	);
}

async function storeToken(token) {
	await chrome.storage.sync.set({ token: token });
	console.log("saved token: ", token);
}

async function loadToken() {
	var t = await chrome.storage.sync.get("token");
	console.log("loaded token: ", t.token);
	if (t.token == "" || t.token == null || t.token == undefined) {
		return;
	}
	document.querySelector("#floatingInput").placeholder = t.token;
	return t.token;
}

function getHelp() {
	chrome.tabs.create({
		url: "https://github.com/Fryles/canvas-to-calendar#readme",
	});
}

async function getCourses() {
	return await chrome.storage.sync.get("courses").courses;
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
	// Get access token to setup initialization for API request.	
	chrome.identity.getAuthToken({'interactive' : true}, function(token) {
		// Initializes the API request.
		let init = {
			method: 'POST',
			async: true,
			headers: {
				Authorization: 'Bearer ' + token,
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
	});
}

// Get intial authorization to access User's private Calendar data.
function getAuthorization() {
	chrome.identity.getAuthToken({'interactive' : true}, function(token) {
		console.log(token)
	});
}