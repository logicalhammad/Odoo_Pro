let lineBreak = document.createElement("hr");

const targetDiv = document.getElementById("hierarchical-show");
const newMarksDiv = document.createElement("div");
const iframe = document.createElement("iframe");
const iframe2 = document.createElement("iframe");
const iframeContainer = document.createElement("div");
const mdCard = document.getElementById("hierarchical-show");
// const grid = document.querySelector(".uk-grid.uk-grid-width-small-1-12.uk-grid-width-medium-1-12.uk-grid-width-medium-1-12.uk-grid-width-large-1-4.uk-margin-medium-bottom");
const grid = document.getElementById("hierarchical-show");
iframeContainer.id = "marks-container";

function revert(string) {
	let tempstr = "";
	for (let i = string.length -1; i >= 0; i--) {
		tempstr += string[i];
	}
	return tempstr;
}

window.onload = () => {
	console.log(mdCard);
	let subjects = Array.from(grid.childNodes);
	subjects = subjects.filter(ab => ab.nodeName == "DIV");

	let subjectLinks = Array();
	subjects.forEach(s => {
		if (s.childNodes.length > 0) {
			let link = s.querySelector("a").href;
			let num = revert(link);
			num = num.slice(0, num.indexOf("/"));
			num = revert(num);
			subjectLinks.push(num);
		}
	});

	console.log(subjectLinks);

	let HammadDiv = document.createElement("div");
	HammadDiv.classList.add("hammad-mustafa");
	let firstChild = mdCard.firstElementChild;
	mdCard.insertBefore(HammadDiv, firstChild);
	HammadDiv.innerHTML = `
		<div style="min-height: 400px; width: 100%; border: 0.5px solid black;"> <h1>This div was Added by Hammad Mustafa</h1></div>
	`;


}


















// (function () {
// 	// Create a new div element to hold the iframe

// 	// Append the iframe container to the target div on the university website
// 	if (targetDiv) {
// 		iframeContainer.setAttribute("style", "border: 3px solid black; padding: 10px;");
// 		targetDiv.appendChild(iframeContainer);
// 		targetDiv.appendChild(newMarksDiv);
// 		// Create the iframe element
// 		iframe.src = "https://odoo.cust.edu.pk/student/course/gradebook/992055";
// 		iframe2.src = "https://odoo.cust.edu.pk/student/course/gradebook/992054";

// 		// Set some attributes for the iframe (optional)
// 		//   iframe.frameBorder = 0; // remove border
// 		iframe.width = "100%"; // set width to 100% of container
// 		iframe2.width = "100%"; // set width to 100% of container
// 		iframe.height = "100vh"; // set height (adjust as needed)
// 		iframe.setAttribute("style", "height: 100vh; border: 2px solid green; display: none;")
// 		iframe2.setAttribute("style", "height: 100vh; border: 2px solid green; display: none;")
// 		// Append the iframe to the container div
// 		iframeContainer.appendChild(iframe);
// 		iframeContainer.appendChild(lineBreak);
// 		iframeContainer.appendChild(iframe2);
// 	} else {
// 		console.error("Target div with ID 'page_content_inner' not found.");
// 	}
// })();

// iframe.onload = function () {
// 	console.log("function run lol!");
// 	let Documentt = iframe.contentDocument;
// 	let table = Documentt.querySelector(".md-card-content.uk-row-first");
// 	if (table) {
// 		console.log("table found!");
// 	}
// 	console.log(table);
	
// 	newMarksDiv.appendChild(table);
// 	newMarksDiv.appendChild(lineBreak);

// }
// iframe2.onload = function () {
// 	console.log("function 2 run lol!");
// 	let Documentt = iframe2.contentDocument;
// 	let table = Documentt.querySelector(".md-card-content.uk-row-first");
// 	if (table) {
// 		console.log("table found!");
// 	}
// 	console.log(table);
	
// 	newMarksDiv.appendChild(table);
// 	newMarksDiv.appendChild(lineBreak);

// }