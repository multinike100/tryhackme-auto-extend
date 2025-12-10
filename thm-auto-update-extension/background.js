// background.js

// Define the target URL pattern to check against (e.g., any Google search page)
const TARGET_URL_PATTERN = "https://tryhackme.com/room/";
const CONTENT_SCRIPT_FILE = "content-script.js";
let lastTabUrl = null
// --- Function to check and inject the script ---
function injectScriptIfMatching(tab) {
	// Check if the tab object and its URL exist
	if (!tab || !tab.url) {
		return;
	}
	if (lastTabUrl === tab.url) return
	// Use a simple string check or the more powerful URL API
	const url = tab.url;
	// Convert the manifest pattern to a RegExp for robust checking
	// This is a simplified example; for complex manifest matching, 
	// you might use the 'webRequest' API or a dedicated library.

	if (url.includes(TARGET_URL_PATTERN)) {
		console.log(`Injecting script into matching URL: ${url}`);
    
		// Inject the content script into the specified tab
		browser.scripting.executeScript({
			target: { tabId: tab.id },
			files: [CONTENT_SCRIPT_FILE]
		})
			.catch(error => console.error("Script injection failed:", error));
		lastTabUrl = tab.url
	}
}

// ====================================================================



// ** 2. Logic for "Every time on switching to a tab with certain url" **
browser.tabs.onActivated.addListener((activeInfo) => {
	// Get the full tab object details from its ID
	browser.tabs.get(activeInfo.tabId).then(injectScriptIfMatching);
});

// Optional: Also run the check when a tab finishes loading a new URL
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	// Only execute when the tab has finished loading
	if (changeInfo.status === 'complete') {
		injectScriptIfMatching(tab);
	}
});