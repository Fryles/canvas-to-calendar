function collectDates() {
	var dates = [];
	var assElems = document.querySelectorAll(".item-group-condensed"); //list of upcoming assignments, undated assignments, and past assignments
	var upcomingAss = document.querySelector(
		"#assignment_group_upcoming_assignments"
	).children[0].children;
	upcomingAss.forEach((ass) => {
		let d = ass.getElementsByClassName(
			"ig-details__item assignment-date-due"
		)[0].innerText;
		dates.push(d);
	});
	console.log(dates);
}
