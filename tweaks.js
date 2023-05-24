// Holds all tweak settings
var options = {
	zenMode: false,
	darkMode: false,
	removeWatermark: false,
	showGrades: false,
};

// MAIN
createOverlay();
loadSettings();
var courses = getCourses();

// FUNCTIONS
async function storeSettings() {
	await chrome.storage.local.set({ tweakOptions: options });
	console.log("saved settings: ", options);
	return;
}

async function loadSettings() {
	let settings = await chrome.storage.local.get("tweakOptions");
	if (settings.tweakOptions == null || settings.tweakOptions == undefined) {
		await storeSettings();
		// we dont need to send, because we just stored the default settings
		// (everything is disabled)
	} else {
		options = settings.tweakOptions;
		sendSettings();
	}
	return;
}

// stores settings in chrome storage, then sends message to content script to apply settings
async function sendSettings() {
	await storeSettings();
	await chrome.runtime.sendMessage({
		action: "loadSettings",
	});
}

function createOverlay() {
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
}
