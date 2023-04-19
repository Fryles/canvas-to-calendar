function collectDates() {
	var dates = [];
	for (var i = 0; i < 10; i++) {
		dates.push(new Date());
	}
	console.log(dates);
	return dates;
}

window.onload = function () {
	// This code will run when the page/DOM is ready to query
	const scrapeBtn = document.querySelector("#scrapeBtn");
	console.log("found btn:" + scrapeBtn);
	scrapeBtn.addEventListener("click", async () => {
		console.log("clicked");
		const dates = await collectDates();
	});
}; //end window.onload
