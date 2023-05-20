// GLOBALS
var courses = []; //array of courses and their respective assignments
var enrollments = []; //array of enrollments (used to get grades)
var token = "";
var tabId;
var canvasUserObj = {}; //object containing user info

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	var tab = tabs[0];
	tabId = tab.id;
});

// EVENT LISTENERS/INITIALIZATION
window.onload = function () {
	// This code will run when the popup DOM is ready to query
	loadToken();

	// Gets authorization from User once extension is opened.
	getAuthorization();

	const scrapeBtn = document.querySelector("#scrapeBtn");
	scrapeBtn.addEventListener("click", async () => {
		loadAssignments()
		console.log(courses);
	});

	const selectAsgnmsBtn = document.querySelector("#asgnmBtn");
	selectAsgnmsBtn.addEventListener("click", async () => {
		//placeholder
		console.log(courses);
	});

	const tokenInput = document.querySelector("#floatingInput");
	tokenInput.addEventListener("keyup", (e) => {
		// listen to a keyup event on the input field
		if (e.keyCode == 13) {
			// if user presses enter
			token = tokenInput.value;
			storeToken(token);
			getUser();
		}
	});

	const tweakBtn = document.querySelector("#tweaksBtn");
	tweakBtn.addEventListener("click", async () => {
		chrome.scripting.executeScript({
			target: { tabId: tabId },
			files: ["./tweaks.js"],
		});
	});
}; //end window.onload

// FUNCTIONS
function getUser() {
	return fetch("https://canvas.ucsc.edu/api/v1/users/self", {
		headers: {
			//headers for authorization (token)
			Accept: "application/json",
			Authorization: "Bearer " + token,
		},
	})
		.then((response) => response.json())
		.then((data) => {
			canvasUserObj = data;
			loadEnrollments();
			return data;
		});
}

function loadAssignments() {
	courses = []; //reset courses
	var base = "https://canvas.ucsc.edu/api/v1/"; //base url for canvas api
	fetch(
		base + "courses" + "?per_page=100&include[]=concluded&include[]=favorites", //fetch all courses
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
			if (data.errors && data.errors.length > 0) {
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
			//now we need to get all assignments and grades for each course

			let courseGrades = []; //for tweaks script
			for (let i = 0; i < courses.length; i++) {
				courses[i].assignments = [];
				//get grade for each course
				for (let j = 0; j < enrollments.length; j++) {
					if (enrollments[j].course_id == courses[i].id) {
						courses[i].grade = enrollments[j].grades.current_score;
						courseGrades.push({
							course: courses[i].name,
							courseId: courses[i].id,
							courseCode: courses[i].course_code,
							courseOgName: courses[i].original_name,
							grade: enrollments[j].grades.current_score,
							letterGrade: enrollments[j].grades.current_grade,
						});
					}
				}
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
			//save courseGrades to storage for tweaks script
			chrome.storage.sync.set({ courseGrades: courseGrades }, function () {
				console.log("saved courseGrades: ", courseGrades);
			});
		});
}

function loadEnrollments() {
	return fetch(
		"https://canvas.ucsc.edu/api/v1/users/" + canvasUserObj.id + "/enrollments",
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
			//enrollments have been fetched and converted to JSON
			enrollments = data;
			return enrollments;
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
			getUser();
		}
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