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
	chrome.runtime.sendMessage({
		action: "loadSettings",
	});
}

function createOverlay() {
	var overlay = document.createElement("div");
	overlay.id = "overlay";

	var closeBtn = document.createElement("button");
	closeBtn.id = "closeBtn";
	closeBtn.innerHTML = "X";

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
