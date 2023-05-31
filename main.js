// GLOBALS
var courses = []; //array of courses and their respective assignments
var tabId;

// Array of assignments within all the courses.
//var allEvents = []; 
var allList = [];

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
		console.log(courses);

		// Temporary placement, but it works
		insertAllTask();
		console.log(allList);
		/*createEvents();
		for(let i = 0; i < allEvents.length; i++) {
			await insertEvent(allEvents[i]);
			console.log(i, "request");
		}
		console.log(allEvents);*/
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

// Inserts all the Task List along with their corresponding Task.
async function insertAllTask () {
	for (let someCourse = 0; someCourse < courses.length; someCourse++) {
		// Initialize a taskList requestBody.
		let taskList = {
			'title': courses[someCourse].course_code		
		};

		// Create the Task List
		await createList(taskList);
		for (let anAssignment = 0; anAssignment < courses[someCourse].assignments.length; anAssignment++) {
			// Convert the time from UTC to local time.
			if(courses[someCourse].assignments[anAssignment].due_at == null) {
				continue;
			}
			let dueDate = convertTime(courses[someCourse].assignments[anAssignment].due_at);
			
			// Check if the assignment is past due.
			let currentTime = new Date(), status = "needsAction";
			currentTime = currentTime.toISOString();
			if(dueDate < currentTime) {
				status = "completed";
			}

			// Initialize a task requestBody.
			let task = {
				'title': courses[someCourse].assignments[anAssignment].name,
				'notes': "Assignment Link: " + courses[someCourse].assignments[anAssignment].html_url,
				'status': status,
				'due': dueDate
			};

			// Create the Task.
			await createTask(task, allList[someCourse].id);
		}
	}
}

// This will take extract all the necessary metadata from the courses array, create events with it, and push those events onto allEvents array.
/*function createEvents () {
	for (let someCourse = 0; someCourse < courses.length; someCourse++) {
		let courseCode = courses[someCourse].course_code;
		for (let anAssignment = 0; anAssignment < courses[someCourse].assignments.length; anAssignment++){
			
			let startTime = courses[someCourse].assignments[anAssignment].unlock_at;
			// Checks if there's an actual start time.
			if(startTime == null) {
				startTime = courses[someCourse].assignments[anAssignment].created_at;
			}

			// Initialize the event with the needed metadata
			let event = {
				'summary': courses[someCourse].assignments[anAssignment].name + " (" + courseCode + ")",
				'description': "Assignment Link: " + courses[someCourse].assignments[anAssignment].html_url + "\n" + courses[someCourse].assignments[anAssignment].description,
				'start': {
				  'dateTime': startTime,
				  'timeZone': courses[someCourse].time_zone
				},
				'end': {
				  'dateTime': courses[someCourse].assignments[anAssignment].due_at,
				  'timeZone': courses[someCourse].time_zone
				},
				'reminders': {
					'useDefault': false,
				}
			};

			// Push this event to our allEvents array
			allEvents.push(event);
		}
	}
}

// Takes an event and inserts it into Google Calendar.
/*async function insertEvent(aEvent) {	
	return new Promise((resolved) => {
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
				resolved();
	  		})
		});
	});
}*/

// Creates an API request to create a new Task List.
async function createList (aList) {
	return new Promise((resolved) => {
		// Get access token to setup intialization for API requestBody.
		chrome.identity.getAuthToken({'interactive' : true}, function(token) {
			// Initialize requestBody.
			let init = {
				method: 'POST',
				async: true,
				headers: {
					Authorization: 'Bearer ' + token,
					'Content-Type': 'Canvas To Calendar Extension/createList'
				},
				body: JSON.stringify(aList)
			};

			// Fetched the API request.
			fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists", init)
			.then((response) => response.json()) // Transform the response to JSON.
			.then(function(data) {
				allList.push(data);
				resolved();
			})
		});
	});
}

// Creates an API request to create a new Task.
async function createTask(aTask, listID) {
	return new Promise ((resolved) => {
		// Get access token to setup intialization for API requestBody.
		chrome.identity.getAuthToken({'interactive' : true}, function(token) {
			// Initialize requestBody.
			let init = {
				method: 'POST',
				async: true,
				headers: {
					Authorization: 'Bearer ' + token,
					'Content-Type': 'Canvas To Calendar Extension/createTask'
				},
				body: JSON.stringify(aTask)
			};

			// Fetch the API request.
			fetch("https://tasks.googleapis.com/tasks/v1/lists/" + listID + "/tasks", init)
			.then ((response) => response.json()) // Transform the response to JSON.
			.then(function(data) {
				console.log(data);
				resolved();
			})
		});
	});
}

// Converts the UTC time received from API to local time.
function convertTime (date) {
	let offSet = new Date(date).getTimezoneOffset();
	let time = new Date(date).getTime();
	var newDate = new Date((time - (offSet * 60 * 1000)));
    newDate = newDate.toISOString();
	return newDate;   
}

// Get intial authorization to access User's private Calendar data.
function getAuthorization() {
	chrome.identity.getAuthToken({'interactive' : true}, function(token) {
		console.log(token)
	});
}