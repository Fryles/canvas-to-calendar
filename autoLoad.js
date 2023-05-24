//Runs automatically on canvas page load

console.log("autoLoad is... loaded");
//courses is global so it can be accessed by setGradesOnDash()
var courses;

//we wait to load courses, then wait to load settings, then apply them
window.onload = async function () {
	await loadCourses();
	var options = await loadSettings();
	applySettings(options);
};

//Stores courses and user in chrome storage
async function loadCourses() {
	courses = [];

	const token = await loadToken();

	if (!token) return false;

	console.log("loading courses with token: " + token);

	let user = await fetch("https://canvas.ucsc.edu/api/v1/users/self", {
		headers: {
			//headers for authorization (token)
			Accept: "application/json",
			Authorization: "Bearer " + token,
		},
	}).then((response) => response.json());

	if (user.errors && user.errors.length > 0) {
		//toast("Error accessing Canvas LMS API. Probably a bad token...");
		console.log("ERROR IN FETCH: " + user.errors[0].message);
		return false;
	}

	let enrollments = await fetch(
		"https://canvas.ucsc.edu/api/v1/users/" + user.id + "/enrollments",
		{
			headers: {
				//headers for authorization (token)
				Accept: "application/json",
				Authorization: "Bearer " + token,
			},
		}
	).then((response) => response.json());

	const base = "https://canvas.ucsc.edu/api/v1";

	let courseList = await fetch(
		`${base}/courses?per_page=100&include[]=concluded&include[]=favorites`,
		{
			headers: {
				Accept: "application/json",
				Authorization: "Bearer " + token,
			},
		}
	).then((response) => response.json())

	if (courseList.errors && courseList.errors.length > 0) {
		toast("Error loading courses. Probably a bad token...");
		return false;
	}

	courses = courseList.filter(course => course.concluded == false);

	for (let course of courses) {
		course.assignments = [];

		let currentCourseEnrollment = enrollments.find(enrollment => enrollment.course_id == course.id);

		course.grade = currentCourseEnrollment.grades.current_score;

		let currCourseAssignments = await fetch(`${base}/courses/${course.id}/assignments`, {
			headers: {
				//headers for authorization (token)
				Accept: "application/json",
				Authorization: "Bearer " + token,
			},

		}).then((response) => response.json())

		course.assignments = currCourseAssignments;
	}

	await chrome.storage.sync.set({ courses: courses }, () => {
		console.log("saved courses: ", courses)
	});
	// save user to storage
	await chrome.storage.sync.set({ user: user }, ()=> {
		console.log("saved user: ", user);
	});
	

	console.log("courses set in autoload: ", courses);
	return courses;
}

// checks if token is stored in chrome storage, if found, returns token
async function loadToken() {
	let token = await chrome.storage.sync.get("token");
	if (token.token == "" || token.token == null || token.token == undefined) {
		toast("Please set your Canvas token in the extension menu.");
		return false;
	}
	return token.token;
}

function toast(message) {
	// shows a toast message
	let x = document.createElement("div");
	x.className = "toast";
	x.innerHTML = message;
	document.body.appendChild(x);
	x.className = "show";
	// After 3 seconds, remove the show class from DIV
	setTimeout(function () {
		x.className = x.className.replace("show", "");
		x.remove();
	}, 3000);
}

// applies settings using options object to page
function applySettings(options) {
	console.log("applied settings: ", options);
	watermark(options.removeWatermark);
	zenMode(options.zenMode);
	darkMode(options.darkMode);
	setGradesOnDash(options.showGrades);
}

// loads courses from chrome storage
async function getCourses() {
	return await chrome.storage.sync.get("courses").courses;
}

// loads settings from chrome storage, or sets default settings if none are found
async function loadSettings() {
	let retrievedSettings = await chrome.storage.sync.get("tweakOptions");
	if (
		retrievedSettings.tweakOptions == null ||
		retrievedSettings.tweakOptions == undefined
	) {
		chrome.storage.sync.set({ tweakOptions: options });
		return options;
	} else {
		return retrievedSettings.tweakOptions;
	}
}

//listen for message from extension popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "loadCourses") {
		refreshResponseHelper(sendResponse);
	}
	return true;
});

async function refreshResponseHelper(sendResponse) {
	let c =  await loadCourses();
	console.log("SENDING: ", c);
	sendResponse({ courses: c });
}

//listen for message from tweaks menu
chrome.runtime.onMessage.addListener(async function (
	request,
	sender,
	sendResponse
) {
	if (request.action === "loadSettings") {
		let options = await loadSettings();
		applySettings(options);
		sendResponse({ response: "success" });
		return true;
	}
});

function watermark(on) {
	document.getElementsByClassName("ic-Layout-watermark")[0].style.display = on
		? "none"
		: "block";
}

function zenMode(on) {
	document.getElementById("right-side-wrapper").style.display = on
		? "none"
		: "block";
	if (document.getElementById("footer")) {
		document.getElementById("footer").style.display = on ? "none" : "block";
	}
	if (document.getElementsByClassName("ic-DashboardCard__action-badge")) {
		let badges = document.getElementsByClassName(
			"ic-DashboardCard__action-badge"
		);
		for (let i = 0; i < badges.length; i++) {
			badges[i].style.display = on ? "none" : "block";
		}
	}
}

async function darkMode(on) {
	if (!on && document.getElementById("darkModeStylesheet")){
		return document.head.removeChild(document.getElementById("darkModeStylesheet"));
	}

	let response = await fetch("https://raw.githubusercontent.com/DeGrandis/canvas-dark-mode/master/plugin/css/styles.css");
	let css  = await response.text();

	const link = document.createElement("style");
	link.innerHTML = css;
	link.id = "darkModeStylesheet";
	document.head.appendChild(link);
}

async function setGradesOnDash(on) {
	courses = await getCourses();
	console.log("Courses used in setting gradesOnDash", courses);
	if (courses == null || courses == undefined) {
		return;
	}
	if (on) {
		let courseTitles = document.getElementsByClassName(
			"ic-DashboardCard__header_content"
		);
		for (let i = 0; i < courseTitles.length; i++) {
			let course = courseTitles[i];
			let courseName = course.getElementsByClassName(
				"ic-DashboardCard__header-title"
			)[0].innerText;
			let courseCode = course.getElementsByClassName(
				"ic-DashboardCard__header-subtitle"
			)[0].innerText;
			for (let j = 0; j < courses.length; j++) {
				let courseGrade = courses[j];
				if (
					(courseGrade.name == courseName ||
						courseGrade.course_code == courseCode) &&
					courseGrade.grade != null
				) {
					let grade = courseGrade.grade + "%";
					let gradeDiv = document.createElement("span");
					gradeDiv.className =
						"ic-DashboardCard__header-title c2cGrade ellipsis";
					gradeDiv.style = "float: right; font-size: 1em;";
					gradeDiv.innerText = grade;
					course
						.getElementsByClassName("ic-DashboardCard__header-title")[0]
						.appendChild(gradeDiv);
				}
			}
		}
	} else {
		let grades = document.getElementsByClassName("c2cGrade");
		for (let i = 0; i < grades.length; i++) {
			grades[i].remove();
		}
	}
	return;
}
