const style = document.createElement("style");
style.innerHTML = `
  #modal_idle {
    display: none !important;
  }
`;
document.head.appendChild(style);
window.onload = () => {
	const modalObserver = new MutationObserver(() => {
		const stayButton = document.querySelector("#staySigned");
		if (stayButton) {
			stayButton.click();
			console.log("Stay Logged In button clicked.");
		}
	});

	const modal = document.querySelector("#modal_idle");
	if (modal) {
		modalObserver.observe(modal, {childList: true, subtree: true});
        console.info("Obserer Started lol");
	} else {
		console.error("#modal_idle not found.");
	}
};
