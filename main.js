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

	const scrapeBtn = document.querySelector("#scrapeBtn");
	scrapeBtn.addEventListener("click", async () => {
		loadAssignments();
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
			for (let i = 0; i < courses.length; i++) {
				courses[i].assignments = [];
				//get grade for each course
				for (let j = 0; j < enrollments.length; j++) {
					if (enrollments[j].course_id == courses[i].id) {
						courses[i].grade = enrollments[j].grades.current_score;
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
