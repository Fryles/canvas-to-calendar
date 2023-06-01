// GLOBALS
var courses = []; //array of courses and their respective assignments
var tabId;

// Array of assignments within all the courses.
var allEvents = [];

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
		createEvents();
		for (let i = 0; i < allEvents.length; i++) {
			await insertEvent(allEvents[i]);
			console.log(i, "request");
		}
		console.log(allEvents);
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

	//redirect user to github repo
	const aboutBtn = document.querySelector("#aboutBtn");
	aboutBtn.addEventListener("click", redirectAbout);

	//hide container and show directions in place
	const helpBtn = document.querySelector("#helpBtn");
	helpBtn.addEventListener("click", showInstructions);

	const eventBtn = document.querySelector('#uniqueBtn');
	uniqueBtn.addEventListener("click", showUniqueEventMenu);

	const dropdownBtn = document.querySelector('#asgnmBtn');
	asgnmBtn.addEventListener("click", showDropdown);
	
	//toast for api storage
	document
		.getElementById("floatingInput")
		.addEventListener("keyup", function (event) {
			if (event.key === "Enter") {
				event.preventDefault();
				showToast();
			}
		});
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
			}
		);
	});
}

async function storeToken(token) {
	await chrome.storage.local.set({ token: token });
	console.log("saved token: ", token);
}

async function loadToken() {
	var t = await chrome.storage.local.get("token");
	console.log("loaded token: ", t.token);
	if (t.token == "" || t.token == null || t.token == undefined) {
		return;
	}
	document.querySelector("#floatingInput").placeholder = t.token;
	return t.token;
}

//creates new chrome tab and redirects user to specified link
function redirectAbout() {
	chrome.tabs.create({
		url: "https://github.com/Fryles/canvas-to-calendar#readme",
	});
}

//toggles display css property on all containers
function showInstructions() {
	const container = document.querySelector(".container");
	const footer = document.querySelector(".footer");
	const instruction = document.querySelector(".instruction");
	const heading = document.getElementById("c2cHeading");

	container.classList.toggle("invisible");
	footer.classList.toggle("invisible");
	heading.classList.add("invisible");
	if (container.classList.contains("invisible") && footer.classList.contains("invisible")) {

		console.log("containers invisible");

		instruction.classList.remove("invisible"); // Show the instruction element
		var closeBtn = document.createElement("button");
		closeBtn.id = "closeBtn";
		closeBtn.innerHTML = "X";
		closeBtn.style.width = "30px";
		closeBtn.style.height = "30px";
		closeBtn.style.position = "absolute";
		closeBtn.style.top = "6px";
		closeBtn.style.right = "6px";
		closeBtn.style.borderRadius = "50%";
		closeBtn.style.backgroundColor = "rgba(#6485c4,0.5)";
		closeBtn.style.color = "White";
		closeBtn.style.fontSize = "20px";
		closeBtn.style.borderStyle = "solid";
		closeBtn.style.borderColor = "#6485c4";
		closeBtn.style.fontFamily = "sans-serif";
		closeBtn.style.cursor = "pointer";

		closeBtn.addEventListener("click", () => {
			container.classList.toggle("invisible");
			footer.classList.toggle("invisible");
			instruction.classList.toggle("invisible");
			heading.classList.remove("invisible");
		});
		instruction.appendChild(closeBtn);
	} else {
		instruction.classList.add("invisible"); // Hide the instruction element
	}
}
 
function showUniqueEventMenu(){
	const container = document.querySelector(".container");
	const footer = document.querySelector(".footer");
	const events = document.querySelector(".event");
	const heading = document.getElementById("c2cHeading");

	container.classList.toggle("invisible");
	footer.classList.toggle("invisible");
	heading.classList.add("invisible");

	if (container.classList.contains("invisible") && footer.classList.contains("invisible")) {
		console.log("event menu is shown");

		events.classList.remove("invisible"); // Show the events element
		var closeBtn = document.createElement("button");
		closeBtn.id = "closeBtn";
		closeBtn.innerHTML = "X";
		closeBtn.style.width = "30px";
		closeBtn.style.height = "30px";
		closeBtn.style.position = "absolute";
		closeBtn.style.top = "6px";
		closeBtn.style.right = "6px";
		closeBtn.style.borderRadius = "50%";
		closeBtn.style.backgroundColor = "rgba(#6485c4,0.5)";
		closeBtn.style.color = "White";
		closeBtn.style.fontSize = "20px";
		closeBtn.style.borderStyle = "solid";
		closeBtn.style.borderColor = "#6485c4";
		closeBtn.style.fontFamily = "sans-serif";
		closeBtn.style.cursor = "pointer";

		closeBtn.addEventListener("click", () => {
			console.log("am i getting here");
			container.classList.toggle("invisible");
			footer.classList.toggle("invisible");
			events.classList.toggle("invisible");
			heading.classList.remove("invisible");
		});
		events.appendChild(closeBtn);
	} else {
		events.classList.add("invisible"); // Hide the events element
	}
}

function showDropdown() {
	const container = document.querySelector(".container");
	const footer = document.querySelector(".footer");
	const dropdown = document.querySelector(".dropdown");
	const heading = document.getElementById("c2cHeading");

	container.classList.toggle("invisible");
	footer.classList.toggle("invisible");
	heading.classList.add("invisible");
	if (container.classList.contains("invisible") && footer.classList.contains("invisible")) {

		console.log("containers invisible");

		dropdown.classList.remove("invisible"); // Show the instruction element
		var closeBtn = document.createElement("button");
		closeBtn.id = "closeBtn";
		closeBtn.innerHTML = "X";
		closeBtn.style.width = "30px";
		closeBtn.style.height = "30px";
		closeBtn.style.position = "absolute";
		closeBtn.style.top = "6px";
		closeBtn.style.right = "6px";
		closeBtn.style.borderRadius = "50%";
		closeBtn.style.backgroundColor = "rgba(#6485c4,0.5)";
		closeBtn.style.color = "White";
		closeBtn.style.fontSize = "20px";
		closeBtn.style.borderStyle = "solid";
		closeBtn.style.borderColor = "#6485c4";
		closeBtn.style.fontFamily = "sans-serif";
		closeBtn.style.cursor = "pointer";

		closeBtn.addEventListener("click", () => {
			container.classList.toggle("invisible");
			footer.classList.toggle("invisible");
			dropdown.classList.toggle("invisible");
			heading.classList.remove("invisible");
		});
		dropdown.appendChild(closeBtn);
	} else {
		dropdown.classList.add("invisible"); // Hide the instruction element
	}
}

function showToast() {
	const toastContainer = document.createElement("div");
	toastContainer.className = "toast-container";

	var toast = document.createElement("div");
	toast.className = "toast";
	toast.innerHTML = "User API key saved!";

	toastContainer.appendChild(toast);
	document.body.appendChild(toastContainer);

	setTimeout(function () {
		toastContainer.remove();
	}, 3000);
}

function getHelp() {
	chrome.tabs.create({
		url: "https://github.com/Fryles/canvas-to-calendar#readme",
	});
}

async function getCourses() {
	return await chrome.storage.local.get("courses").courses;
}

// This will take extract all the necessary metadata from the courses array, create events with it, and push those events onto allEvents array.
function createEvents() {
	for (let someCourse = 0; someCourse < courses.length; someCourse++) {
		let courseCode = courses[someCourse].course_code;
		for (
			let anAssignment = 0;
			anAssignment < courses[someCourse].assignments.length;
			anAssignment++
		) {
			let startTime = courses[someCourse].assignments[anAssignment].unlock_at;
			// Checks if there's an actual start time.
			if (startTime == null) {
				startTime = courses[someCourse].assignments[anAssignment].created_at;
			}

			// Initialize the event with the needed metadata
			let event = {
				summary:
					courses[someCourse].assignments[anAssignment].name +
					" (" +
					courseCode +
					")",
				description:
					"Assignment Link: " +
					courses[someCourse].assignments[anAssignment].html_url +
					"\n" +
					courses[someCourse].assignments[anAssignment].description,
				start: {
					dateTime: startTime,
					timeZone: courses[someCourse].time_zone,
				},
				end: {
					dateTime: courses[someCourse].assignments[anAssignment].due_at,
					timeZone: courses[someCourse].time_zone,
				},
				reminders: {
					useDefault: false,
				},
			};

			// Push this event to our allEvents array
			allEvents.push(event);
		}
	}
}

// Takes an event and inserts it into Google Calendar.
async function insertEvent(aEvent) {
	return new Promise((resolved) => {
		// Get access token to setup initialization for API request.
		chrome.identity.getAuthToken({ interactive: true }, function (token) {
			// Initializes the API request.
			let init = {
				method: "POST",
				async: true,
				headers: {
					Authorization: "Bearer " + token,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(aEvent),
			};

			// Fetches the API request.
			fetch(
				"https://www.googleapis.com/calendar/v3/calendars/primary/events",
				init
			)
				.then((response) => response.json()) // Transform the data into json
				.then(function (data) {
					console.log(data);
					resolved();
				});
		});
	});
}

// Get intial authorization to access User's private Calendar data.
function getAuthorization() {
	chrome.identity.getAuthToken({ interactive: true }, function (token) {
		console.log("got GCal auth: ", token);
	});
}
