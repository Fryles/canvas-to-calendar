var tabId;
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	var tab = tabs[0];
	console.log(tab.id);
	tabId = tab.id;
});

window.onload = function () {
	// This code will run when the popup DOM is ready to query
	const scrapeBtn = document.querySelector("#scrapeBtn");
	console.log("found btn:" + scrapeBtn);
	scrapeBtn.addEventListener("click", async () => {
		console.log("clicked");
		chrome.scripting
			.executeScript({
				target: { tabId: tabId },
				files: ["scraping.js"],
			})
			.then(() => console.log("script injected"));
	});
}; //end window.onload
