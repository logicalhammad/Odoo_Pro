// ~ Program by Hammad Mustafa

let lineBreak = document.createElement("hr");

function revert(string) {
	let tempstr = "";
	for (let i = string.length - 1; i >= 0; i--) {
		tempstr += string[i];
	}
	return tempstr;
}

function getEndNum(string, i) {
	let num = revert(string);
	num = num.slice(0, num.indexOf(i));
	num = revert(num);
	return num;
}

function cleanString(str) {
	return str.replace(/\s+/g, " ").trim();
}

async function createIframe(link) {
	return new Promise((resolve, reject) => {
		const iframe = document.createElement("iframe");
		iframe.style.display = "none"; 
		iframe.src = `https://odoo.cust.edu.pk/${link}`;
		iframe.onload = () => resolve(iframe);
		iframe.onerror = () => reject(`Failed to load iframe for ${link}`);
		document.body.appendChild(iframe);
	});
}

async function processAttendance(subjectLinks) {
	const allData = {}; 

	for (let i = 0; i < subjectLinks.length; i++) {
		try {
			document.getElementById(
				"attLoading"
			).innerText = `(Loading: ${Math.round(
				((i + 0.9) / subjectLinks.length) * 100
			)}%)`;
			const iframe = await createIframe(
				`student/course/attendance/${subjectLinks[i]}`
			);

			const iframeDoc =
				iframe.contentDocument || iframe.contentWindow.document;

			const breadcrumbs = iframeDoc.querySelectorAll(
				"#top_bar>#breadcrumbs li"
			);
			const subjectName = breadcrumbs[1]
				? cleanString(breadcrumbs[1].innerText)
				: "Unknown";

			const elements = iframeDoc.querySelectorAll(
				".md-color-blue-grey-900"
			);
			let classesConducted = 0,
				classesAttended = 0;

			elements.forEach((e) => {
				if (e.innerText.includes("Number")) {
					if (e.innerText.includes("Conducted")) {
						classesConducted = getEndNum(
							cleanString(e.innerText),
							" : "
						);
					} else if (e.innerText.includes("Attended")) {
						classesAttended = getEndNum(
							cleanString(e.innerText),
							" : "
						);
					}
				}
			});

			const numAbsents = classesConducted - classesAttended;

			allData[subjectName] = numAbsents;
			// Clean up by removing the iframe
			document.body.removeChild(iframe);
		} catch (error) {
			console.error(error);
		}
	}

	return allData;
}

const script = document.createElement("script");
script.src = chrome.runtime.getURL("injected.js");
script.onload = function () {
	this.remove(); 
};
document.documentElement.appendChild(script);

window.onload = async () => {
	if (window.location.href.includes("/student/dashboard")) {
		const links = document.querySelectorAll(
			".uk-grid.uk-grid-width-small-1-12.uk-grid-width-medium-1-12.uk-grid-width-medium-1-12.uk-grid-width-large-1-4.uk-margin-medium-bottom>div>a"
		);

		let mainHeading = document.querySelectorAll(".heading_a.uk-tab")[1];
		mainHeading.innerHTML = `
			<a
				style="padding: 12px 6px; border: 1px solid darkblue; line-height: 12px; text-decoration: none !important; background: #112B4F; color: white; border-radius: 5px; height: 23px; display: inline-flex; align-items: center; justify-content: center; width: max-content; margin-bottom: 6px;"
			href="https://odoo.cust.edu.pk/student/class/schedule">Classes</a>

			<a
				style="padding: 12px 6px; border: 1px solid darkblue; line-height: 12px; text-decoration: none !important; background: #112B4F; color: white; border-radius: 5px; height: 23px; display: inline-flex; align-items: center; justify-content: center; width: max-content;"
			href="https://odoo.cust.edu.pk/student/results">Results</a>

			and
			<span>Attendance <span id="attLoading">(Loading: 10%)</span>
		`;

		let subjectLinks = Array();
		let firstStupidDiv = document.querySelector(".uk-row-first");
		firstStupidDiv.classList.add("uk-grid-margin");
		firstStupidDiv.classList.remove("uk-row-first");

		links.forEach((link) => {
			let num = getEndNum(link.href, "/");
			subjectLinks.push(num);

			let cardBody = link.querySelector(".card-body");

			let cardLinks = document.createElement("div");
			cardLinks.setAttribute(
				"style",
				"margin-top: 6px; display: flex; align-items: center; justify-content: flex-start; flex-wrap: wrap; gap: 6px;"
			);

			let a1 = document.createElement("a");
			a1.href = `https://odoo.cust.edu.pk/student/course/gradebook/${num}`;
			a1.innerText = "Gradebook";
			a1.target = "_blank";
			a1.setAttribute(
				"style",
				"padding: 0 6px; border: 1px solid darkblue; line-height: 12px; text-decoration: none !important; background: #112B4F; color: white; border-radius: 5px; height: 23px; display: flex; align-items: center; justify-content: center;"
			);

			let a2 = document.createElement("a");
			a2.href = `https://odoo.cust.edu.pk/student/course/submission/${num}`;
			a2.innerText = "Submission";
			a2.target = "_blank";
			a2.setAttribute(
				"style",
				"padding: 0 6px; border: 1px solid darkblue; line-height: 12px; text-decoration: none !important; background: #112B4F; color: white; border-radius: 5px; height: 23px; display: flex; align-items: center; justify-content: center;"
			);

			let a3 = document.createElement("a");
			a3.href = `https://odoo.cust.edu.pk/student/course/attendance/${num}`;
			a3.innerText = "Attendance";
			a3.target = "_blank";
			a3.setAttribute(
				"style",
				"padding: 0 6px; border: 1px solid darkblue; line-height: 12px; text-decoration: none !important; background: #112B4F; color: white; border-radius: 5px; height: 23px; display: flex; align-items: center; justify-content: center;"
			);

			let a4 = document.createElement("a");
			a4.href = `https://odoo.cust.edu.pk/student/course/material/${num}`;
			a4.innerText = "Material";
			a4.target = "_blank";
			a4.setAttribute(
				"style",
				"padding: 0 6px; border: 1px solid darkblue; line-height: 12px; text-decoration: none !important; background: #112B4F; color: white; border-radius: 5px; height: 23px; display: flex; align-items: center; justify-content: center;"
			);

			cardLinks.appendChild(a1);
			cardLinks.appendChild(a2);
			cardLinks.appendChild(a3);
			cardLinks.appendChild(a4);
			cardBody.appendChild(cardLinks);
		});
		let allData = await processAttendance(subjectLinks);
		document.getElementById("attLoading").innerText = `(Loaded: 100%)`;

		links.forEach((link) => {
			const subjectName = link
				.querySelector(".card-header.bg-primary > span")
				?.innerText.trim();

			if (subjectName && allData[subjectName] !== undefined) {
				const targetElement = link.querySelector(
					".card-body > .uk-text-small"
				);

				if (targetElement) {
					targetElement.innerText = `Absentees: ${allData[subjectName]}`;
					targetElement.classList.remove("uk-text-small");
				} else {
					console.warn(
						`Target element not found for subject: ${subjectName}`
					);
				}
			} else {
				console.warn(
					`Subject name not found or not in allData: ${subjectName}`
				);
			}
		});
	}

	if (window.location.href.includes("/course/attendance")) {
		const elements = document.querySelectorAll(".md-color-blue-grey-900");
		let classesConducted = 0,
			classesAttended = 0,
			a = null;

		elements.forEach((e) => {
			if (e.innerText.includes("Number")) {
				if (e.innerText.includes("Conducted")) {
					classesConducted = getEndNum(e.innerText, " : ");
				} else if (e.innerText.includes("Attended")) {
					classesAttended = getEndNum(e.innerText, " : ");
					a = e;
				}
			}
		});

		// Proceed only if both numbers are found and referenceElement exists
		if (classesConducted && classesAttended && a) {
			const newElement = a.cloneNode(true);
			newElement.innerHTML = `<b>Number of Absents : </b><span>${
				classesConducted - classesAttended
			}</span>`;
			a.parentNode.appendChild(newElement);
		} else {
			console.error("Required elements or data not found.");
		}
	}

	if (window.location.href.includes("/student/results")) {
		let links = document.querySelectorAll(
			"div#hierarchical-show.uk-grid.uk-grid-width-small-1-12.uk-grid-width-medium-1-3.uk-grid-width-large-1-4.uk-margin-medium-top.uk-margin-medium-bottom a#lms_enable"
		);

		let subjectLinks = Array();
		links.forEach((link) => {
			let num = getEndNum(link.href, "/");
			subjectLinks.push(num);
		});

		(async function () {
			const parentDiv = document.querySelector(
				"div#hierarchical-show.uk-grid.uk-grid-width-small-1-12.uk-grid-width-medium-1-3.uk-grid-width-large-1-4.uk-margin-medium-top.uk-margin-medium-bottom"
			);
			parentDiv.classList.add("hammad-mustafa-debugged-this");
			parentDiv.innerHTML = "";
			document
				.querySelector(
					".md-card-content.uk-row-first #tabs_anim1.uk-switcher"
				)
				.setAttribute("style", "overflow: visible;");

			let loadingProgress = document.createElement("div");
			loadingProgress.style.width = "100%";
			loadingProgress.innerHTML = `
				<h2>Loading Marks: <label id="marks-loading">0%</label>
			`;
			parentDiv.appendChild(loadingProgress);

			for (let i = 0; i < subjectLinks.length; i++) {
				try {
					const iframe = await createIframe(
						`student/course/gradebook/${subjectLinks[i]}`
					);

					const marksTable = iframe.contentDocument.querySelector(
						".md-card-content.uk-row-first"
					);
					let newMarksTable = marksTable.cloneNode(true);
					newMarksTable.setAttribute(
						"style",
						"transform: translate(1%, 0%);; width: 100%;"
					);
					newMarksTable.querySelector("#tabs_anim1 .uk-overflow-container").setAttribute("style", "overflow-y: hidden");
					newMarksTable.querySelector(".uk-active>a").setAttribute("style", "font-size: 18px; font-weight: bold;");
					parentDiv.appendChild(newMarksTable);

					document.getElementById(
						"marks-loading"
					).innerText = `${Math.round(
						((i + 0.9) / subjectLinks.length) * 100
					)}%`;

					iframe.remove();
				} catch (error) {
					console.error(error);
				}
			}
			document.getElementById(
				"marks-loading"
			).innerText = `(Loaded: 100%)`;


			// Now run the jQuery code
			$table_tree = $(".hammad-mustafa-debugged-this .table_tree"); 

			$table_tree.each(function () {
				var e = $(this),
					i = e.find(".check_childrens"), 
					a = e.find(".check_row"),
					t = e.find(".js-toggle-children-row"); 

				e.find(".show_child_row").nextUntil(".table-parent-row").hide();

				i.on("ifChecked", function () {
					$(this)
						.closest("tr")
						.addClass("row_checked")
						.nextUntil(".table-parent-row")
						.find(".check_row")
						.iCheck("check"); 
				});

				i.on("ifUnchecked", function () {
					$(this)
						.closest("tr")
						.removeClass("row_checked")
						.nextUntil(".table-parent-row")
						.find(".check_row")
						.iCheck("uncheck"); 
				});

				a.on("ifChecked", function (e) {
					$(e.currentTarget).closest("tr").addClass("row_checked");
				});

				a.on("ifUnchecked", function (e) {
					$(e.currentTarget).closest("tr").removeClass("row_checked");
				});

				t.on("click", function (e) {
					e.preventDefault();
					$(this)
						.closest("tr")
						.toggleClass("show_child_row")
						.nextUntil(".table-parent-row")
						.toggle(); 
				});
			});
		})();
	}
};
