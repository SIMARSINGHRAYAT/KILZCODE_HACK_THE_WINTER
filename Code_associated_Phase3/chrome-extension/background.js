// Background service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'UPDATE_BADGE') {
        const decision = message.decision;
        let text = '';
        let color = [100, 100, 100, 255]; // Gray

        if (decision === 'ALLOW') {
            text = 'A';
            color = [25, 135, 84, 255]; // Green
        } else if (decision === 'REVIEW') {
            text = 'R';
            color = [255, 193, 7, 255]; // Yellow
        } else if (decision === 'BLOCK') {
            text = 'B';
            color = [220, 53, 69, 255]; // Red
        }

        chrome.action.setBadgeText({ text: text });
        chrome.action.setBadgeBackgroundColor({ color: color });
    }
});

// Context Menu
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "evaluate-txn",
        title: "Evaluate transaction with Recurring Firewall",
        contexts: ["page"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "evaluate-txn") {
        // We can't easily open the popup programmatically in MV3 without user action,
        // but we can inject a script or just notify the user.
        // Actually, "open popup" is hard. We'll just set a badge or something?
        // Or we can just let this be a placeholder.
        // The prompt says "On click, open popup or pre-fill merchantId".
        // Pre-filling would require saving to storage and then reading it when popup opens.

        // Let's try to set a hint in storage
        const url = new URL(tab.url);
        const domain = url.hostname;

        // Save domain as likely merchant
        chrome.storage.local.set({ hintMerchant: domain });

        // Alert user
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => alert("Merchant hint saved! Open the extension popup to evaluate.")
        });
    }
});
