// load assignments on run
console.log("autoLoad is... loaded");

async function loadCourses() {
	console.log("loading courses...");
	var courses = [];
	var token = await loadToken();

	if (token == "" || token == null || token == undefined) {
		return;
	}
	var user = await fetch("https://canvas.ucsc.edu/api/v1/users/self", {
		headers: {
			//headers for authorization (token)
			Accept: "application/json",
			Authorization: "Bearer " + token,
		},
	}).then((response) => response.json());
	var enrollments = await fetch(
		"https://canvas.ucsc.edu/api/v1/users/" + user.id + "/enrollments",
		{
			headers: {
				//headers for authorization (token)
				Accept: "application/json",
				Authorization: "Bearer " + token,
			},
		}
	).then((response) => response.json());
	var base = "https://canvas.ucsc.edu/api/v1/"; //base url for canvas api
	fetch(
		base + "courses" + "?per_page=100&include[]=concluded&include[]=favorites", //fetch all courses
		{
			headers: {
				Accept: "application/json",
				Authorization: "Bearer " + token,
			},
		}
	)
		.then((response) => response.json())
		.then((data) => {
			if (data.errors && data.errors.length > 0) {
				toast("Error loading courses. Probably a bad token...");
				return;
			}
			for (let i = 0; i < data.length; i++) {
				if (data[i].concluded == false && data[i].is_favorite == true) {
					courses.push(data[i]);
				}
			}
			//courses now contains all active courses
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
			//save courses to storage
			chrome.storage.sync.set({ courses: courses }, function () {
				console.log("saved courses: ", courses);
			});
			// save user to storage
			chrome.storage.sync.set({ user: user }, function () {
				console.log("saved user: ", user);
			});
		});
	return courses;
}

async function loadToken() {
	let token = await chrome.storage.sync.get("token");
	if (token.token == "" || token.token == null || token.token == undefined) {
		toast("Please set your Canvas token in the extension menu.");
		return;
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

loadCourses();
