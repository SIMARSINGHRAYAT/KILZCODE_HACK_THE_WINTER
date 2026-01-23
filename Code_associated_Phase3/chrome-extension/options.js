// Save options to chrome.storage
const saveOptions = () => {
    const firewallBaseUrl = document.getElementById('firewallBaseUrl').value;

    chrome.storage.sync.set(
        { firewallBaseUrl: firewallBaseUrl },
        () => {
            // Update status to let user know options were saved.
            const status = document.getElementById('status');
            status.textContent = 'Options saved.';
            status.style.opacity = '1';
            setTimeout(() => {
                status.style.opacity = '0';
            }, 2000); // 2 seconds delay
        }
    );
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
    chrome.storage.sync.get(
        { firewallBaseUrl: 'http://localhost:8000' }, // Default value
        (items) => {
            document.getElementById('firewallBaseUrl').value = items.firewallBaseUrl;
        }
    );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);

