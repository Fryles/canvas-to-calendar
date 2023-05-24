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
		await refreshCourses();
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

	//redirect user to github repo 
	const aboutBtn = document.querySelector('#aboutBtn');
	aboutBtn.addEventListener('click', redirectAbout);
	
	//hide container and show directions in place
	const helpBtn = document.querySelector('#helpBtn');
	helpBtn.addEventListener('click', hideContainers)

	//toast for api storage
	document.getElementById('floatingInput').addEventListener('keyup', function(event) {
		if (event.key === 'Enter') {
		  event.preventDefault();
		  showToast();
		}
	  });
}; //end window.onload

// FUNCTIONS

//send message to autoLoad to load courses
//This function is ASYNC so courses wont be loaded immediately
async function refreshCourses() {
	await chrome.tabs.sendMessage(
		tabId,
		{
			action: "loadCourses",
		},
		function (response) {
			console.log("RESPONSE: ", response);
			courses = response.courses;
		}
	);
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

//creates new chrome tab and redirects user to specified link
function redirectAbout() {
	chrome.tabs.create({ url: 'https://github.com/Fryles/canvas-to-calendar#readme' });
}

//toggles display css property on all containers
function hideContainers(){
	const container = document.querySelector('.container');
	const footer = document.querySelector('.footer');
	const instruction = document.querySelector('.instruction');
	const heading = document.getElementById('c2cHeading');

	container.classList.toggle('invisible');
	footer.classList.toggle('invisible');
	heading.classList.add('invisible');
	//heading.classList.toggle('invisible');
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
		closeBtn.style.backgroundColor = "rgba(#6485c4,0.5)";
		closeBtn.style.color = "White";
		closeBtn.style.fontSize = "20px";
		closeBtn.style.borderStyle = "solid";
		closeBtn.style.borderColor = "#6485c4";
		closeBtn.style.fontFamily = "sans-serif";
		closeBtn.style.cursor = "pointer";
	
		closeBtn.addEventListener("click", () => {
			container.classList.toggle('invisible');
			footer.classList.toggle('invisible');
			instruction.classList.toggle('invisible');
			heading.classList.remove('invisible');
		});
		instruction.appendChild(closeBtn);
	} else {
		instruction.classList.add('invisible'); // Hide the instruction element
	}
}

function showToast() {
	const toastContainer = document.createElement('div');
	toastContainer.className = 'toast-container';
  
	var toast = document.createElement('div');
	toast.className = 'toast';
	toast.innerHTML = 'User API key saved!';
	
	toastContainer.appendChild(toast);
	document.body.appendChild(toastContainer);
	
	setTimeout(function() {
	  toastContainer.remove();
	}, 3000);
}

function getHelp() {
	chrome.tabs.create({
		url: "https://github.com/Fryles/canvas-to-calendar#readme",
	});
}

async function getCourses() {
	return await chrome.storage.sync.get("courses").courses;
}
