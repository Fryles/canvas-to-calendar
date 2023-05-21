var courses = []; //array of courses and their respective assignments
var token = "";

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
		loadAssignments();
		console.log(courses);
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

	//redirect user to github repo 
	const aboutBtn = document.querySelector('#aboutBtn');
	aboutBtn.addEventListener('click', redirectAbout);
	
	//hide container and show directions in place
	const helpBtn = document.querySelector('#helpBtn');
	helpBtn.addEventListener('click', hideContainers)

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

//creates new chrome tab and redirects user to specified link
function redirectAbout() {
	chrome.tabs.create({ url: 'https://github.com/Fryles/canvas-to-calendar#readme' });
}

//toggles display css property on all containers
function hideContainers(){
	const container = document.querySelector('.container');
	const footer = document.querySelector('.footer');
	const instruction = document.querySelector('.instruction');

	container.classList.toggle('invisible');
	footer.classList.toggle('invisible');

	if (container.classList.contains('invisible') && footer.classList.contains('invisible')){
		console.log("containers invisible");
		instruction.classList.remove('invisible'); // Show the instruction element
		var closeBtn = document.createElement("button");
		closeBtn.id = "closeBtn";
		closeBtn.innerHTML = "X";
		closeBtn.style.width = "30px";
		closeBtn.style.height = "30px";
		closeBtn.style.position = "absolute";
		closeBtn.style.top = "6px";
		closeBtn.style.right = "6px";
		closeBtn.style.borderRadius = "50%";
		closeBtn.style.backgroundColor = "rgba(0,0,0,0.5)";
		closeBtn.style.color = "white";
		closeBtn.style.fontSize = "20px";
		closeBtn.style.borderStyle = "solid";
		closeBtn.style.borderColor = "white";
		closeBtn.style.fontFamily = "sans-serif";
		closeBtn.style.cursor = "pointer";
	
		closeBtn.addEventListener("click", () => {
			container.classList.toggle('invisible');
			footer.classList.toggle('invisible');
			instruction.classList.toggle('invisible');
		});
		
		instruction.appendChild(closeBtn);
	} else {
		instruction.classList.add('invisible'); // Hide the instruction element
	}
}
