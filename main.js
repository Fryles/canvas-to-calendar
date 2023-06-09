// GLOBALS

// Array of courses and their respective assignments
var courses = [];
var tabId;


// Array of Task List, the current User's active courses.
var allList = [];
// Array of Task, all the assignments of each course.
var allTask = [];

var assignmentsToRemove = [];

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	var tab = tabs[0];
	tabId = tab.id;
});

// EVENT LISTENERS/INITIALIZATION

// This code will run when the popup DOM is ready to query
window.onload = function () {
	//sets placeholder text to token
	loadToken();

	// Gets authorization from User once extension is opened.
	getAuthorization();

	const scrapeBtn = document.querySelector("#scrapeBtn");
	scrapeBtn.addEventListener("click", async () => {
		await refreshCourses();
		console.log("All active Canvas Courses: ", courses);
		courses = deleteFromArray(courses, getBlacklistAssignments(courses));
		showToast("Exporting to Google Calendar, please wait...");
		await insertAllTask();
		showToast("All done exporting!");
		console.log("All the Task List: ", allList);
		console.log("All the Task: ", allTask);
	});

	const tokenInput = document.querySelector("#floatingInput");
	tokenInput.addEventListener("keyup", async function (e) {
		// listen to a keyup event on the input field
		if (e.keyCode == 13) {
			// if user presses enter
			let token = tokenInput.value;
			if (token.length !== 64) {
				showToast("Invalid API key!");
			} else {
				showToast("API key saved!");
				await storeToken(token);
				refreshCourses();
			}
		}
	});

	// Functionality for Send To Calendar button.
	const sendCalendar = document.querySelector("#injectBtn");
	sendCalendar.addEventListener("click", async () => {
		const taskName = document.querySelector("#nameInput");
		const taskDate = document.querySelector("#dateInput");

		await insertUniqueTask(taskName.value, taskDate.value);
		showToast(taskName.value + " added to Google Calendar!");
	});

	const tweakBtn = document.querySelector("#tweaksBtn");
	tweakBtn.addEventListener("click", async () => {
		chrome.scripting.executeScript({
			target: { tabId: tabId },
			files: ["./tweaks.js"],
		});
	});

	//redirect user to github repo
	const aboutBtn = document.querySelector("#aboutBtn");
	aboutBtn.addEventListener("click", redirectAbout);

	// hide container and show directions in place
	const helpBtn = document.querySelector("#helpBtn");
	helpBtn.addEventListener("click", showInstructions);

	// hide container and show unique menu in place
	const eventBtn = document.querySelector("#uniqueBtn");
	eventBtn.addEventListener("click", showUniqueEventMenu);

	// hide container and show dropdown menu and etc in place
	const dropdownBtn = document.querySelector("#asgnmBtn");
	dropdownBtn.addEventListener("click", showDropdown);
}; //end window.onload

// FUNCTIONS

/**
 * Sets global courses variable to the courses array from the autoload.js
 * @return {Boolean}    Returns true if courses is not undefined and false if it is undefined
 */
async function refreshCourses() {
	return new Promise((resolved) => {
		chrome.tabs.sendMessage(
			tabId,
			{
				action: "loadCourses",
			},
			function (response) {
				courses = response.courses;
				if (courses == undefined) {
					showToast("Error loading courses, check token.");
					resolved(false);
				} else {
					showToast("Courses loaded!");
					resolved(true);
				}
			}
		);
	});
}

/**
 * Stores token in local chrome storage.
 * @param  {String} token  64 char canvas API token
 * @return {Boolean}       Returns true when token is stored
 */
async function storeToken(token) {
	await chrome.storage.local.set({ token: token });
	console.log("saved token: ", token);
	return true;
}

/**
 * Queries chrome storage for token, if found, sets placeholder text to token.
 * @return {String}    Returns token if found, else returns null
 */
async function loadToken() {
	var t = await chrome.storage.local.get("token");
	console.log("loaded token: ", t.token);
	if (t.token == "" || t.token == null || t.token == undefined) {
		return null;
	}
	document.querySelector("#floatingInput").placeholder = t.token;
	return t.token;
}

/**
 Redirects user to github repo README
 */
function redirectAbout() {
	chrome.tabs.create({
		url: "https://github.com/Fryles/canvas-to-calendar#readme",
	});
}

/**
 * toggles instruction/main page display on and off
 */
function showInstructions() {
	const container = document.querySelector(".container");
	const footer = document.querySelector(".footer");
	const instruction = document.querySelector(".instruction");
	const heading = document.getElementById("c2cHeading");

	container.classList.toggle("invisible");
	footer.classList.toggle("invisible");
	heading.classList.add("invisible");
	if (
		container.classList.contains("invisible") &&
		footer.classList.contains("invisible")
	) {
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

/**
 * toggles unique event menu display on and off
 */
function showUniqueEventMenu() {
	const container = document.querySelector(".container");
	const footer = document.querySelector(".footer");
	const events = document.querySelector(".event");
	const heading = document.getElementById("c2cHeading");

	container.classList.toggle("invisible");
	footer.classList.toggle("invisible");
	heading.classList.add("invisible");

	if (
		container.classList.contains("invisible") &&
		footer.classList.contains("invisible")
	) {
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

/**
 * toggles dropdown menu display on and off
 * generates dropdown menu if it has not been generated yet
 */
function showDropdown() {
	const container = document.querySelector(".container");
	const footer = document.querySelector(".footer");
	const dropdown = document.querySelector(".dropdown");
	const heading = document.getElementById("c2cHeading");

	container.classList.toggle("invisible");
	footer.classList.toggle("invisible");
	heading.classList.add("invisible");
	if (
		container.classList.contains("invisible") &&
		footer.classList.contains("invisible")
	) {
		if (document.getElementById("checkboxes").innerHTML == "") {
			(async () => {
				//make sure we have courses and generate dropdown
				courses = await getCourses();
				console.log("BEFORE DROP:", courses);
				generateDropdown(courses);
			})();
		}
		dropdown.classList.remove("invisible"); // Show the dropdown element
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
			const htmlElement = document.documentElement;
			htmlElement.style.height = "fit-content";
		});
		dropdown.appendChild(closeBtn);
	} else {
		dropdown.classList.add("invisible"); // Hide the instruction element
	}
}

/**
 * Displays a toast message for 3 seconds
 * @param {String} contents The message to be displayed in the toast
 */
function showToast(contents) {
	const toastContainer = document.createElement("div");
	toastContainer.className = "toast-container";

	var toast = document.createElement("div");
	toast.className = "toast";
	toast.innerHTML = contents;

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

/**
 * Gets the courses array from chrome storage DOES NOT REFRESH
 * @returns {Array} Returns the courses array from chrome storage
 */
async function getCourses() {
	return (await chrome.storage.local.get("courses")).courses;
}

// Inserts all the Task List along with their corresponding Task.
async function insertAllTask() {
	// Get all the current Task List from the User.
	await getAllTaskList();

	for (let someCourse = 0; someCourse < courses.length; someCourse++) {
		// Initialize a taskList requestBody.
		let taskList = {
			title: courses[someCourse].course_code,
		};

		// Check if the Task List does not exist, if so then create the Task List.
		if (!taskListDuplicate(taskList)) {
			await createList(taskList);
		}

		// Get all the current Task from the respective Task List.
		await getAllTask(allList[someCourse].id);

		for (
			let anAssignment = 0;
			anAssignment < courses[someCourse].assignments.length;
			anAssignment++
		) {
			// Convert the time from UTC to local time.
			if (courses[someCourse].assignments[anAssignment].due_at == null) {
				continue;
			}
			let dueDate = convertTime(
				courses[someCourse].assignments[anAssignment].due_at
			);

			// Check if the assignment is past due.
			let currentTime = new Date(),
				status = "needsAction";
			currentTime = currentTime.toISOString();
			if (dueDate < currentTime) {
				status = "completed";
			}

			// Initialize a task requestBody.
			let task = {
				title: courses[someCourse].assignments[anAssignment].name,
				notes:
					"Assignment Link: " +
					courses[someCourse].assignments[anAssignment].html_url,
				status: status,
				due: dueDate,
			};

			// Check if the Task does not exist in the Task List, if so then create the Task.
			if (!taskDuplicate(task)) {
				await createTask(task, allList[someCourse].id);
			}
		}
	}
}

// Checks to see if taskList already exist in the User's Task List.
function taskListDuplicate(taskList) {
	// Compare taskList to every User's Task List.
	for (let aList = 0; aList < allList.length; aList++) {
		if (taskList.title == allList[aList].title) {
			return true;
		}
	}

	return false;
}

// Checks to see if Task already exist in the User's Task List.
function taskDuplicate(task) {
	// Compare Task to every User's Tasks.
	for (let aTask = 0; aTask < allTask.length; aTask++) {
		if (
			task.title == allTask[aTask].title &&
			task.notes == allTask[aTask].notes &&
			task.due == allTask[aTask].due
		) {
			return true;
		}
	}

	return false;
}

// Inserts a Unique Task to the Canvas To Calendar Task List.
async function insertUniqueTask(name, date) {
	// Get all the current Task List from the User.
	await getAllTaskList();

	// If we haven't created a Canvas To Calendar List, create one.
	let taskList = {
		title: "Canvas To Calendar",
	};
	if (!taskListDuplicate(taskList)) {
		await createList(taskList);
	}

	// Find the Canvas To Calendar Task List in the allList array.
	for (let aList = 0; aList < allList.length; aList++) {
		// Once found, create the Task in that Task List.
		if (allList[aList].title == "Canvas To Calendar") {
			let task = {
				title: name,
				due: date + "T00:00:00.000Z",
			};
			await createTask(task, allList[aList].id);
			break;
		}
	}
}

// Creates an API request to create a new Task List.
async function createList(aList) {
	return new Promise((resolved) => {
		// Get access token to setup intialization for API requestBody.
		chrome.identity.getAuthToken({ interactive: true }, function (token) {
			// Initialize requestBody.
			let init = {
				method: "POST",
				async: true,
				headers: {
					Authorization: "Bearer " + token,
					"Content-Type": "Canvas To Calendar Extension/createList",
				},
				body: JSON.stringify(aList),
			};

			// Fetched the API request.
			fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists", init)
				.then((response) => response.json()) // Transform the response to JSON.
				.then(function (data) {
					allList.push(data);
					resolved();
				});
		});
	});
}

// Creates an API request to get all of User's current Task List.
async function getAllTaskList() {
	let token = await getAuthToken(); //wait for the token
	let init = {
		method: "GET",
		async: true,
		headers: {
			Authorization: "Bearer " + token,
			"Content-Type": "Canvas To Calendar Extension/getAllTaskList",
		},
	};

	let url = "https://tasks.googleapis.com/tasks/v1/users/@me/lists";
	let response = await fetch(url, init);
	let data = await response.json();

	allList = data.items;

	allList.shift();

	return new Promise((resolved) => {
		// Get access token to setup intialization for API requestBody.
		chrome.identity.getAuthToken({ interactive: true }, function (token) {
			// Initialize requestBody.
			let init = {
				method: "GET",
				async: true,
				headers: {
					Authorization: "Bearer " + token,
					"Content-Type": "Canvas To Calendar Extension/getAllTaskList",
				},
			};

			// Fetch the API request.
			fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists", init)
				.then((response) => response.json()) // Transform the response to JSON.
				.then(function (data) {
					allList = [];
					// Append each Task List to allList array.
					for (let aList = 1; aList < data.items.length; aList++) {
						allList.push(data.items[aList]);
					}
					resolved();
				});
		});
	});
}

// Creates an API request to create a new Task.
async function createTask(aTask, listID) {
	let token = await getAuthToken();
	let init = {
		method: "POST",
		async: true,
		headers: {
			Authorization: "Bearer " + token,
			"Content-Type": "Canvas To Calendar Extension/createTask",
		},
		body: JSON.stringify(aTask),
	};

	let url = "https://tasks.googleapis.com/tasks/v1/lists/" + listID + "/tasks";

	let response = await fetch(url, init);
}

// Creates an API request to get all of User's current Task within the respective Task List.
async function getAllTask(listID) {
	return new Promise((resolved) => {
		// Get access token to setup intialization for API requestBody.
		chrome.identity.getAuthToken({ interactive: true }, function (token) {
			// Initialize requestBody.
			let init = {
				method: "GET",
				async: true,
				headers: {
					Authorization: "Bearer " + token,
					"Content-Type": "Canvas To Calendar Extension/getAllTask",
				},
			};

			// Fetch the API request.
			fetch(
				"https://tasks.googleapis.com/tasks/v1/lists/" + listID + "/tasks",
				init
			)
				.then((response) => response.json()) // Transform the response to JSON.
				.then(function (data) {
					// Append each Task to allTask array.
					for (let aTask = 0; aTask < data.items.length; aTask++) {
						allTask.push(data.items[aTask]);
					}
					resolved();
				});
		});
	});
}

// Converts the UTC time received from API to local time.
function convertTime(date) {
	let offSet = new Date(date).getTimezoneOffset();
	let time = new Date(date).getTime();
	var newDate = new Date(time - offSet * 60 * 1000);
	newDate = newDate.toISOString();
	newDate = newDate.split("T");
	return newDate[0] + "T00:00:00.000Z";
}

// Get intial authorization to access User's private Calendar data.
function getAuthorization() {
	chrome.identity.getAuthToken({ interactive: true }, function (token) {
		console.log("got Google Calendar auth: ", token);
		showToast("Logged in to Google Calendar!");
	});
}

async function getAuthToken() {
	return new Promise((resolve) =>
		chrome.identity.getAuthToken({ interactive: true }, resolve)
	);
}

function generateDropdown(arr) {
	for (var i = 0; i < arr.length; i++) {
		for (var j = 0; j < arr[i].assignments.length; j++) {
			var assign = arr[i].assignments[j].name;
			const id = `${assign}`;
			const label = document.createElement("label");
			label.setAttribute("assignment", id);

			const checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			checkbox.name = "assignment";
			checkbox.value = assign;
			checkbox.id = id;
			checkbox.className = "checkInput";

			label.appendChild(document.createTextNode(assign));
			document.querySelector("#checkboxes").appendChild(label);
			label.appendChild(checkbox);
		}
	}
	check();
	showCheckboxes();
}
var expanded = false;

function showCheckboxes() {
	var checkboxes = document.getElementById("checkboxes");
	if (!expanded) {
		checkboxes.style.display = "flex";
		expanded = true;
	} else {
		checkboxes.style.display = "none";
		expanded = false;
	}
}

function getBlacklistAssignments(arr) {
	//replace arr with assignments array in main.js
	var returnArr = [];
	let checkboxes = document.querySelectorAll(
		'input[name="assignment"]:not(:checked)'
	);
	checkboxes.forEach((checkbox) => {
		returnArr.push(checkbox.id);
	});
	return returnArr;
}

function deleteFromArray(arr, remove) {
	//replace arr with assignments array in main.js
	for (let id = 0; id < remove.length; id++) {
		for (var course = 0; course < arr.length; course++) {
			for (var assign = 0; assign < arr[course].assignments.length; assign++) {
				var rem = arr[course].assignments[assign].name;
				if (rem == remove[id]) {
					arr[course].assignments.splice(assign, 1);
					break;
				}
			}
		}
	}
	return arr;
}

function check(checked = true) {
	const checkboxes = document.querySelectorAll('input[name="assignment"]');
	checkboxes.forEach((checkbox) => {
		checkbox.checked = checked;
	});
}
const btn = document.querySelector("#selUnsel");
btn.onclick = uncheckAll;

function checkAll() {
	check();
	this.onclick = uncheckAll;
}

function uncheckAll() {
	check(false);
	this.onclick = checkAll;
}
