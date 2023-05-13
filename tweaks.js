// Holds all tweak settings
var options = {
	zenMode: false,
	darkMode: false,
	removeWatermark: false,
	showGrades: false,
};
loadSettings();
var courseGrades;
getCourseGrades();

var overlay = document.createElement("div");
overlay.id = "overlay";
overlay.style.position = "fixed";
overlay.style.bottom = "0";
overlay.style.left = "0";
overlay.style.width = "100%";
overlay.style.height = "15%";
overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
overlay.style.zIndex = "1000";
overlay.style.borderTopRightRadius = "10px";
overlay.style.borderTopLeftRadius = "10px";
overlay.style.display = "flex";
overlay.style.justifyContent = "center";
overlay.style.alignItems = "center";
overlay.style.color = "white";
overlay.style.fontSize = "20px";
overlay.style.fontFamily = "sans-serif";
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
	document.getElementById("overlay").remove();
});
overlay.appendChild(closeBtn);

var zenModeBtn = document.createElement("button");
zenModeBtn.id = "zenModeBtn";
var darkModeBtn = document.createElement("button");
darkModeBtn.id = "darkModeBtn";
var removeWatermarkBtn = document.createElement("button");
removeWatermarkBtn.id = "removeWatermarkBtn";
var showGradesBtn = document.createElement("button");
showGradesBtn.id = "showGradesBtn";

zenModeBtn.innerHTML = "Zen Mode";
darkModeBtn.innerHTML = "Dark Mode";
removeWatermarkBtn.innerHTML = "KILL SLUG";
showGradesBtn.innerHTML = "Show Grades On Dash";

zenModeBtn.addEventListener("click", () => {
	options.zenMode = !options.zenMode;
	zenMode(options.zenMode);
	storeSettings();
});
darkModeBtn.addEventListener("click", () => {
	options.darkMode = !options.darkMode;
	darkMode(options.darkMode);
	storeSettings();
});
removeWatermarkBtn.addEventListener("click", () => {
	options.removeWatermark = !options.removeWatermark;
	watermark(options.removeWatermark);
	storeSettings();
});
showGradesBtn.addEventListener("click", () => {
	options.showGrades = !options.showGrades;
	setGradesOnDash(options.showGrades);
	storeSettings();
});

overlay.appendChild(zenModeBtn);
overlay.appendChild(darkModeBtn);
overlay.appendChild(removeWatermarkBtn);
overlay.appendChild(showGradesBtn);
if (document.getElementById("overlay") != null) {
	document.getElementById("overlay").remove();
} else {
	document.body.appendChild(overlay);
}

function storeSettings() {
	chrome.storage.sync.set({ tweakOptions: options }, function () {
		console.log("Tweak options saved: ", options);
	});
}

function loadSettings() {
	chrome.storage.sync.get("tweakOptions", function (data) {
		if (data.tweakOptions != undefined) {
			console.log("Tweak options loaded: ", data.tweakOptions);
			options = data.tweakOptions;
		} else {
			console.log("Tweak options not found, using default");
			storeSettings();
		}
	});
}

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

function darkMode(on) {
	if (on && !document.getElementById("darkModeStylesheet")) {
		var xhttp = new XMLHttpRequest();
		xhttp.open(
			"GET",
			"https://raw.githubusercontent.com/DeGrandis/canvas-dark-mode/master/plugin/css/styles.css",
			true
		);
		xhttp.onreadystatechange = function () {
			if (xhttp.readyState === 4) {
				if (xhttp.status === 200) {
					var link = document.createElement("style");
					link.innerHTML = xhttp.responseText;
					link.id = "darkModeStylesheet";
					document.getElementsByTagName("head")[0].appendChild(link);
				}
			}
		};
		xhttp.send(null);
	} else {
		if (document.getElementById("darkModeStylesheet")) {
			document.getElementById("darkModeStylesheet").remove();
		}
	}
}

function applySettings() {
	watermark(options.removeWatermark);
	zenMode(options.zenMode);
	darkMode(options.darkMode);
	setGradesOnDash(options.showGrades);
}

function setGradesOnDash(on) {
	if (on) {
		let courses = document.getElementsByClassName(
			"ic-DashboardCard__header_content"
		);
		for (let i = 0; i < courses.length; i++) {
			let course = courses[i];
			let courseName = course.getElementsByClassName(
				"ic-DashboardCard__header-title"
			)[0].innerText;
			let courseCode = course.getElementsByClassName(
				"ic-DashboardCard__header-subtitle"
			)[0].innerText;
			for (let j = 0; j < courseGrades.length; j++) {
				let courseGrade = courseGrades[j];
				if (
					(courseGrade.courseName == courseName ||
						courseGrade.courseCode == courseCode) &&
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
}

function getCourseGrades() {
	chrome.storage.sync.get("courseGrades", function (data) {
		if (data.courseGrades != undefined) {
			console.log("grades loaded: ", data.courseGrades);
			courseGrades = data.courseGrades;
		} else {
			console.log("grades not found");
		}
	});
}
