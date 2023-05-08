function collectDates() {
	var dates = [];
	var assignmentElems = document.querySelectorAll(".item-group-condensed"); //list of upcoming assignments, undated assignments, and past assignments
	var upcomingAssignments = document.querySelector(
		"#assignment_group_upcoming_assignments"
	).children[0].children;
	for (let i = 0; i < upcomingAssignments.length; i++) {
		let ass = upcomingAssignments[i];
		let d = ass.getElementsByClassName(
			"ig-details__item assignment-date-due"
		)[0].innerText;
		d = d.split(" ");
		let month = d[1];
		let day = d[2];
		let time = d[7];
		d = new Date(month + " " + day + " at " + time);
		dates.push(d);
	}

	console.log(dates);
}
collectDates();
