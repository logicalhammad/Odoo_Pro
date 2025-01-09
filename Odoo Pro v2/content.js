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

		iframe.onload = () => {
			const checkIframeReady = () => {
				if (iframe.contentDocument.readyState === 'complete') {
					resolve(iframe);
				} else {
					setTimeout(checkIframeReady, 100); // Adjust the timeout as needed
				}
			};

			checkIframeReady();
		};

		iframe.onerror = () => reject(`Failed to load iframe for ${link}`);

		document.body.appendChild(iframe);
	});
}
// async function createIframe(link) {
// 	return new Promise((resolve, reject) => {
// 		const iframe = document.createElement("iframe");
// 		iframe.style.display = "none"; 
// 		iframe.src = `https://odoo.cust.edu.pk/${link}`;
// 		iframe.onload = () => resolve(iframe);
// 		iframe.onerror = () => reject(`Failed to load iframe for ${link}`);
// 		document.body.appendChild(iframe);
// 	});
// }

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
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


async function generateGravatarUrl(email) {
    // Convert the email to lowercase and trim spaces
    const trimmedEmail = email.trim().toLowerCase();

    // Generate the MD5 hash of the email
    const hash = CryptoJS.MD5(trimmedEmail).toString();

    // Gravatar URL with ?d=404 to check if the profile exists
    const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=404&s=400`;

    // Check if the profile exists by making a HEAD request
    return fetch(gravatarUrl, { method: "HEAD" })
        .then(response => {
            if (response.status === 200) {
                // Profile exists, return the Gravatar URL
                return gravatarUrl;
            } else if (response.status === 404) {
                // Profile does not exist, return false
                return false;
            } else {
                console.log("Unexpected response status:", response.status);
                return false;
            }
        })
        .catch(error => {
            console.error("Error checking Gravatar profile:", error);
            return false;
        });
}



function getUid() {
	let uidElement = document.querySelector(".heading_b span.sub-heading");
	console.log(uidElement, uidElement.innerText);
	return uidElement.innerText.trim().toUpperCase();
}



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.email) {
        // console.log("Received email from popup.js:", message.email);

        // Extract email and define uid
        const email = message.email;
        const uid = getUid();

		// localStorage.setItem("email", email);

        // Log the processing email
        // console.log("Processing email:", email);

        // Perform the fetch operation
        // fetch('http://localhost/gravatar/', {
        fetch('https://nelston.com/api/odoo/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uid: uid,
                email: email
            })
        })
        .then(response => {
            if (!response.ok) {
                sendResponse({ success: false, message: "Internal Server Error" });
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            console.log('Success:', data);
            sendResponse({ success: true, message: "Email Saved Successfully"});
        })
        .catch(error => {
            console.error('Error:', error);
            sendResponse({ success: false, message: error });
        });

        // Indicate that sendResponse will be called asynchronously
        return true;
    }
});


async function getEmail(uid) {
    try {
        // console.log("inside fetch");

        const response = await fetch('https://nelston.com/api/odoo/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uid: uid
            })
        });

        if (!response.ok) {
            console.log(response);
            throw new Error('Network response was not ok');
        }

        const data = await response.json(); // Assuming the response is JSON
        console.log(data);

        // Extract the email from the response data
        const email = data.email;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		
		if (emailRegex.test(email)) {
			return email; // Return email if everything is successful

		}
		return false;
    } catch (error) {
        console.error('Error:', error);
        return null; // Return null if an error occurs
    }
}

async function setGravatarProfile(dashboard) {
	let email, uid;
	if (dashboard) {
		await sleep (1000);
		uid = getUid();
		localStorage.setItem("uid", uid);
		email = localStorage.getItem("email", email);
		if (!email) {
			email = await getEmail(uid);
			localStorage.setItem("email", email);
			console.log("At Dashboard & Email: ", email);
		}

	}
	else {
		uid = localStorage.getItem("uid");
		email = localStorage.getItem("email");
	}
	if (email) {
		const gravatarLink = await generateGravatarUrl(email);  // Ensure this function is correctly handling promises
		if (gravatarLink) {
			// console.log("gravatar link", gravatarLink);
			let images = document.querySelectorAll(".user_heading_avatar img");
			images.forEach((i) => {
				i.src = gravatarLink;
			});
		}
	}
	if (dashboard) {
		email = await getEmail(uid);
		localStorage.setItem("email", email);
		console.log("At Dashboard & Email: ", email);
	}
}
// A little bit complicated but here is the explanation of the code. 
// We want to decrease the loading time of the gravatar profile. But we also wanna make sure that when the user changes the email, he gets the latest picture displayed. 
// So, the email is stored in the local storage. 
// When the user logs in and reaches dashboard, the JS tries to retrieve the email from the local storage, but if this is his first time, there will be no email in the local storage. If no email is found, it will communicate with the server to get the latest email and store that in the local storage. But if the email is found, it will use that email. For all pages other than the dashboard, the email will be used from the local storage. 
// But this introduces a problem that what if the email has been changed? 
// To solve this problem, there is another if condition in the end (so that it doesn't disrupt the normal flow of the program) which retrieves the latest email and just saves it in the local storage. So next time, if the email is changed, this new email will be uesd. 

async function setAura() {

	let headings = document.querySelectorAll(".user_heading_content");
	let AuraSpan = document.createElement("span");
	let allHeadingSpans = headings[1].querySelectorAll("span");
	allHeadingSpans[0].style.fontWeight = "bold";
	let cgpaSpan = allHeadingSpans[1];
	cgpaSpan.style.fontWeight = "bold";
	cgpaSpan.classList = ['md-color-green-700'];
	let uid = getUid();
	if (uid == "BSE221031" || uid == "BSE221026" || uid == "BSE221099") {
		AuraSpan.innerHTML = `<br>Aura: <span style="font-size: 24px; display: inline-flex; transform: translateY(4px); line-height: 0;">∞</span>`;
	} else {
		AuraSpan.innerHTML = `<br>Aura: ${parseFloat(cgpaSpan.innerText) * 2485933}`;
	}
	headings[1].appendChild(AuraSpan);
}

window.onload = async () => {
	document.title = "Odoo Pro";
	if (window.location.href.includes("/student/dashboard")) {

		setGravatarProfile(true);

		setAura();

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

			const targetElement = link.querySelector(
				".card-body > .uk-text-small"
			);
			targetElement.setAttribute("style", "margin-top: 3px;");
			targetElement.innerHTML = `<a href="https://odoo.cust.edu.pk/student/course/attendance/${num}" target="_blank">Attendance Loading</a>`;
			// let a3 = document.createElement("a");
			// a3.href = `https://odoo.cust.edu.pk/student/course/attendance/${num}`;
			// a3.innerText = "Attendance";
			// a3.target = "_blank";
			// a3.setAttribute(
			// 	"style",
			// 	"padding: 0 6px; border: 1px solid darkblue; line-height: 12px; text-decoration: none !important; background: #112B4F; color: white; border-radius: 5px; height: 23px; display: flex; align-items: center; justify-content: center;"
			// );

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
			// cardLinks.appendChild(a3);
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
				const parentTargetElement = link.querySelector(
					".card-body > .uk-text-small"
				);

				if (parentTargetElement) {
					parentTargetElement.classList.remove("uk-text-small");
					const targetElement = parentTargetElement.firstElementChild;
					targetElement.innerText = `Absents: ${allData[subjectName]}`;

					let b = parseInt(link.querySelector(".card-text > .md-list-heading").innerText);

					if ((allData[subjectName] <= 6 && b != 2) || (b == 2 && allData[subjectName] <= 4)) {
						targetElement.setAttribute("style", `
							width: max-content; border: 2px solid #43a943; border-radius: 5px; padding: 2px 6px; color: green; font-weight: 500; background: #f0fff0; text-decoration: none !important;
						`);
					}
					else if ((allData[subjectName] <= 9 && b != 2) || (b == 2 && allData[subjectName] <= 6)) {
						targetElement.setAttribute("style", `
							width: max-content; border: 2px solid #a97743; border-radius: 5px; padding: 2px 6px; color: #d36c03; font-weight: 500; background:rgb(255, 245, 239); text-decoration: none !important;
						`);
					}
					else {
						targetElement.setAttribute("style", `
							width: max-content; border: 2px solid #a94343; border-radius: 5px; padding: 2px 6px; color: #d30303; font-weight: 500; background:rgb(255, 239, 239); text-decoration: none !important;
						`);
					}
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
	else {
		setGravatarProfile(false);
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
			newElement.innerHTML = `<b>Number of Absents : </b><span>${classesConducted - classesAttended
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

					await sleep(500);

					const marksTable = iframe.contentDocument.querySelector(
						".md-card .md-card-content"
					);
					console.log(marksTable);

					// let newMarksTable = marksTable.cloneNode(true);
					// newMarksTable.setAttribute(
					// 	"style",
					// 	"transform: translate(1%, 0%);; width: 100%;"
					// );
					// newMarksTable.querySelector("#tabs_anim1 .uk-overflow-container").setAttribute("style", "overflow-y: hidden");
					// newMarksTable.querySelector(".uk-active>a").setAttribute("style", "font-size: 18px; font-weight: bold;");
					// parentDiv.appendChild(newMarksTable);

					marksTable.setAttribute(
						"style",
						"transform: translate(1%, 0%);; width: 100%;"
					);
					marksTable.querySelector("#tabs_anim1 .uk-overflow-container").setAttribute("style", "overflow-y: hidden");
					marksTable.querySelector(".uk-active>a").setAttribute("style", "font-size: 18px; font-weight: bold;");
					parentDiv.appendChild(marksTable);

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
			).innerText = `100%`;


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
