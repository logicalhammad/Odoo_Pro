document.querySelector(".emailInput button").addEventListener("click", () => {
    const responseBox = document.querySelector(".emailInput p");
    const emailInput = document.querySelector(".emailInput input");
    const email = emailInput.value;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(email);

    if (isValidEmail) {
        // Send the email to the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { email: email }, (response) => {
                    console.log("Response from content.js:", response);
                    if (response.success) {
                        responseBox.innerText = response.message;
                        responseBox.classList.add("success");
                        responseBox.classList.remove("error");
                    }
                    else {
                        responseBox.innerText = response.message;
                        responseBox.classList.add("error");
                        responseBox.classList.remove("success");
                    }
                });
            } else {
                responseBox.innerText = "No active tab found.";
                responseBox.classList.add("error");
                responseBox.classList.remove("success");
            }
        });
        console.log("Email Sent");
    } else {
        // Display error message
        responseBox.innerText = "Please enter a valid email address.";
        responseBox.classList.add("error");
        responseBox.classList.remove("success");
    }
});