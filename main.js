// GLOBALS
var courses = []; //array of courses and their respective assignments
var tabId;

// Array of assignments within all the courses.
var allEvents = []

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	var tab = tabs[0];
	tabId = tab.id;
});

// EVENT LISTENERS/INITIALIZATION
window.onload = function () {
	// This code will run when the popup DOM is ready to query

	//sets placeholder text to token
	loadToken();

	// Gets authorization from User once extension is opened.
	getAuthorization();

	const scrapeBtn = document.querySelector("#scrapeBtn");
	scrapeBtn.addEventListener("click", async () => {
		await refreshCourses();
		// console.log(courses);
		// console.log("Course 1: ", courses[1].assignments);
		// console.log("There are", courses[1].assignments.length, "assignments in this course.");
		// console.log("The first assignment for this course is ", courses[1].assignments[4].name);
		// let event = {
		// 	// 'id': courses[1].assignments[3].id,
		// 	'summary': courses[1].assignments[4].name + " (" + courses[1].course_code + ")",
		// 	'description': "Assignment Link: " + courses[1].assignments[4].html_url + "\n" + courses[1].assignments[4].description,
		// 	'start': {
		// 		'dateTime': courses[1].assignments[4].unlock_at,
		// 		'timeZone': courses[1].time_zone
		// 	},
		// 	'end': {
		// 		'dateTime': courses[1].assignments[4].due_at,
		// 		'timeZone': courses[1].time_zone
		// 	},
		// 	'reminders': {
		// 		'useDefault': false,
		// 	},
		// 	'supportsAttachments': false
		// };


		// insertEvent(event);

		createEvents();
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

async function getCurrentCalendarEvents(){
	let token = await getAuthToken();

	let calEvents = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
		headers: {
			Authorization: 'Bearer ' + token,
			'Content-Type': 'application/json'
		},
	})
	.then(response => response.json());

	let events = {};

	for (let event of calEvents.items){
		events[event.id] = event;
	}
	
	return events
}


// function updateEvent(event, token){
	
// }

async function refreshCourses() {
	return new Promise((resolved) => {
		chrome.tabs.sendMessage(
			tabId,
			{
				action: "loadCourses",
			},
			function (response) {
				console.log("RESPONSE: ", response);
				courses = response.courses;
				resolved();
		});
	});
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

async function createEvents() {

	let currEvents = await getCurrentCalendarEvents();

	courses = courses.splice(1);

	for (let course of courses){

		//Looping through individual assignments i the course
		console.log(course.assignments.map(a => a.name).join('\n'))
		for(let assignment of course.assignments){
			let event = {
				'id': assignment.id,
				'summary': assignment.name + " (" + course.course_code + ")",
				'description': "Assignment Link: " + assignment.html_url + "\n" + assignment.description,
				'start': {
					'dateTime': assignment.unlock_at,
					'timeZone': course.time_zone
				},
				'end': {
					'dateTime': assignment.due_at,
					'timeZone': course.time_zone
				},
				'reminders': {
					'useDefault': false,
				},
				'supportsAttachments': false
			}

			if (!assignment.unlock_at || !assignment.due_at) {
				console.log(`Assignment ${event.summary} has no start/due date.`)
				continue; //If assignment start or due dates are undefined.
			}

			let currentEvent = currEvents[assignment.id];
			let shouldUpdate = false;

			if (currentEvent){
				if( event.description != currentEvent.description || event.start.dateTime != currentEvent.start.dateTime || event.end.dateTime != currentEvent.end.dateTime){
					shouldUpdate = true;
					console.log(`Assignment ${event.summary} changed, updating`)
				} else {
					console.log(`Assignment ${event.summary} already exists`)
					continue;
				}
			}

			await insertEvent(event, shouldUpdate);

			await delay(2000);
		}

		break
	}



	for (let someCourse = 0; someCourse < courses.length; someCourse++) {
		let courseCode = courses[someCourse].course_code;
		for (let anAssignment = 0; anAssignment < courses[someCourse].assignments.length; anAssignment++){
			let event = {
				'summary': 'Google I/O 2015',
				'location': courses[someCourse].assignments.html_url,
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
			  allEvents.push(event);
		}
	}
}

// Takes an event and inserts it into Google Calendar.
async function insertEvent(aEvent, shouldUpdate) {
	// Get access token to setup initialization for API request.

	let token = await getAuthToken();

	let init = {
		method: shouldUpdate ? 'PUT' : 'POST', //ternary to see if shouldUpdate is true or false
		async: true,
		headers: {
			Authorization: 'Bearer ' + token,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(aEvent)
	};

	let url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

	if (shouldUpdate) {
		url += '/' + aEvent.id;
	}

	let response = await fetch(url, init)

	console.log(response.statusCode, aEvent)
}


// Get intial authorization to access User's private Calendar data.
async function getAuthorization() {
	chrome.identity.getAuthToken({'interactive' : true}, function(token) {
		console.log(token)
	});
}

// make auth token request async
function getAuthToken() {
	return new Promise(resolve => chrome.identity.getAuthToken({'interactive' : true}, resolve))
}


function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}