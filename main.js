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
		refreshCourses();
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
}; //end window.onload

// FUNCTIONS

//send message to content script to load courses
function refreshCourses() {
	(async () => {
		const [tab] = await chrome.tabs.query({
			active: true,
			lastFocusedWindow: true,
		});
		const response = await chrome.tabs.sendMessage(tab.id, {
			action: "loadCourses",
		});
		// do something with response here, not outside the function
		console.log("refreshed courses: ");
		console.log(response);
		if (response.courses) {
			courses = response.courses;
		}
	})();
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
