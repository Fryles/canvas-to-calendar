var courses = []; //array of courses and their respective assignments
var token = "";
// Get the current active tab ID

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

getAssignments();
window.onload = function () {
	// This code will run when the popup DOM is ready to query
	const scrapeBtn = document.querySelector("#scrapeBtn");
	// Add an event listener for the button
	//TODO: Get token from user input/stored token
	scrapeBtn.addEventListener("click", async () => {
		console.log(courses);
	}); // end scrapeBtn.addEventListener
}; //end window.onload

function getAssignments() {
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
			//Courses have been fetched and converted to JSON
			for (let i = 0; i < data.length; i++) {
				// filter all courses by concluded and is_favorite to get only active courses
				if (data[i].concluded == false && data[i].is_favorite == true) {
					courses.push(data[i]);
				}
			}
			console.log(courses);
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
