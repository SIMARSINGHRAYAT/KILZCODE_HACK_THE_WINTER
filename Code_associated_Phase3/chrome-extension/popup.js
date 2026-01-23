// Defaults
const DEFAULT_URL = 'http://localhost:8000';
let firewallBaseUrl = DEFAULT_URL;

// State for history
let history = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Load config
    const data = await chrome.storage.sync.get({ firewallBaseUrl: DEFAULT_URL });
    firewallBaseUrl = data.firewallBaseUrl;
    document.getElementById('apiUrlDisplay').textContent = firewallBaseUrl;

    // Load history (if persisted, but prompt said in-memory for popup session is fine, but extending it to session storage is nice)
    // We'll stick to in-memory for this session as requested.

    // Listeners
    document.getElementById('evaluateBtn').addEventListener('click', evaluateTransaction);
    document.getElementById('investigateBtn').addEventListener('click', investigateTransaction);
    document.getElementById('openOptions').addEventListener('click', () => chrome.runtime.openOptionsPage());

    // Preset listeners
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
    });

    // Auto-scrape on load
    scrapePageDetails();

    // Fetch History & Check Status
    fetchHistory();
});

async function checkStatus() {
    const statusEl = document.getElementById('apiUrlDisplay');
    try {
        const url = `${firewallBaseUrl.replace(/\/$/, '')}/mongo-status`; // Simple ping
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        statusEl.textContent = "CONNECTED";
        statusEl.style.color = "#00ff00"; // Terminal Green
    } catch (e) {
        statusEl.textContent = "API OFFLINE";
        statusEl.style.color = "#ff3333";
    }
}

async function fetchHistory() {
    await checkStatus(); // Check connectivity first

    try {
        const url = `${firewallBaseUrl.replace(/\/$/, '')}/recent-transactions?limit=10`;
        const res = await fetch(url);
        if (!res.ok) return;

        const data = await res.json();
        if (data.ok && data.history) {
            const tbody = document.querySelector('#historyTable tbody');
            tbody.innerHTML = ''; // Clear local only history

            data.history.forEach(tx => {
                // Determine color
                let color = '#ffffff'; // default
                if (tx.decision === 'ALLOW') color = 'var(--success-color)';
                else if (tx.decision === 'REVIEW') color = 'var(--warning-color)';
                else if (tx.decision === 'BLOCK') color = 'var(--danger-color)';

                // Format Score
                // The API stores it in 'scores.merchant_trust_score' or 'merchant_trust_score' depending on version
                const score = tx.scores?.merchant_trust_score || tx.merchant_trust_score || 0;

                // Format Time
                const date = new Date(tx.timestamp);
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${timeStr}</td>
                    <td style="color:${color}; font-weight:bold">${tx.decision}</td>
                    <td>${Math.round(score)}</td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (e) {
        console.log("History fetch failed", e);
    }
}

async function scrapePageDetails() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.id) return;

        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                // Heuristic Parsing inside the page context

                // 1. Merchant Name
                let merchantName = null;

                // Priority 1: JSON-LD Structured Data
                // looks for schema.org 'Organization' or 'WebSite'
                try {
                    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
                    for (const script of scripts) {
                        try {
                            const json = JSON.parse(script.textContent);
                            const entities = Array.isArray(json) ? json : [json];
                            for (const entity of entities) {
                                if (['Organization', 'WebSite', 'Store', 'Corporation'].includes(entity['@type']) && entity.name) {
                                    merchantName = entity.name;
                                    break;
                                }
                            }
                        } catch (e) { continue; }
                        if (merchantName) break;
                    }
                } catch (e) { }

                // Priority 2: Copyright Footer Text
                if (!merchantName) {
                    const bodyText = document.body.innerText;
                    // Regex: Match © or (c), followed by optional year/range, followed by name
                    // Avoids long phrases by limiting length
                    const copyrightRegex = /(?:©|\(c\)|copyright)\s*(?:20\d{2})?(?:\s*[-–]\s*20\d{2})?,?\s*([A-Za-z0-9\s\.\,\'\-]{2,30})/i;
                    const match = bodyText.match(copyrightRegex);

                    if (match && match[1]) {
                        let potentialName = match[1].trim();
                        // Filter out common generic words
                        const generics = ['all rights', 'reserved', 'copyright', '202', 'inc', 'ltd', 'llc'];
                        let isGeneric = false;
                        if (potentialName.length < 3) isGeneric = true;
                        if (generics.some(g => potentialName.toLowerCase().startsWith(g))) isGeneric = true;

                        if (!isGeneric) {
                            // Clean trailing punctuation
                            potentialName = potentialName.replace(/[\.\,]+$/, '');
                            merchantName = potentialName;
                        }
                    }
                }

                // Priority 3: OG Tag > App Name > Smart Title > Hostname
                if (!merchantName) {
                    merchantName = document.querySelector('meta[property="og:site_name"]')?.content;
                }

                if (!merchantName) {
                    merchantName = document.querySelector('meta[name="application-name"]')?.content;
                }

                if (!merchantName) {
                    merchantName = document.querySelector('meta[name="apple-mobile-web-app-title"]')?.content;
                }

                if (!merchantName) {
                    const title = document.title;
                    if (title) {
                        // Heuristic: Split by common separators
                        const separators = ['|', '-', ':', '•'];
                        let bestPart = title;

                        for (const sep of separators) {
                            if (title.indexOf(sep) !== -1) {
                                const parts = title.split(sep);
                                if (parts.length > 0) {
                                    const first = parts[0].trim();
                                    // If first part is generic, try second
                                    const generics = ['Home', 'Welcome', 'Login', 'Sign In', 'Dashboard', 'Index', 'Open', 'App', 'Web Player', 'Portal'];
                                    if (generics.includes(first) && parts.length > 1) {
                                        bestPart = parts[1].trim();
                                    } else {
                                        bestPart = first;
                                    }
                                }
                                break;
                            }
                        }
                        merchantName = bestPart;
                    }
                }

                if (!merchantName) {
                    merchantName = extractRootDomain(window.location.hostname);
                    merchantName = merchantName.charAt(0).toUpperCase() + merchantName.slice(1);
                }

                // 2. Amount & Currency Extraction
                let amount = '0.00';
                let currency = 'USD';

                // Currency Map
                const symbolToCode = {
                    '$': 'USD', '€': 'EUR', '£': 'GBP', '₹': 'INR', '¥': 'JPY', 'USD': 'USD', 'EUR': 'EUR', 'INR': 'INR'
                };

                // Priority 1: Exact ID (Added for Fake Site)
                const totalEl = document.getElementById('checkout-total-amount');

                function parseText(txt, datasetCurr) {
                    if (!txt) return {};

                    // Detect Currency
                    let foundCurr = 'USD';

                    if (datasetCurr) {
                        foundCurr = datasetCurr;
                    } else {
                        for (const [sym, code] of Object.entries(symbolToCode)) {
                            if (txt.includes(sym)) {
                                foundCurr = code;
                                break;
                            }
                        }
                    }

                    // Extract Amount
                    // Improved Regex: greedy capture of digits/commas/dots, then cleanup
                    const numMatch = txt.match(/([0-9,]+(?:\.[0-9]{2})?)/);

                    let foundAmt = null;
                    if (numMatch) {
                        foundAmt = numMatch[1].replace(/,/g, '');
                        // Sanity check
                        if (isNaN(parseFloat(foundAmt))) foundAmt = null;
                    }

                    return { foundAmt, foundCurr };
                }

                if (totalEl) {
                    const { foundAmt, foundCurr } = parseText(totalEl.innerText, totalEl.dataset.currency);
                    if (foundAmt) amount = foundAmt;
                    if (foundCurr) currency = foundCurr;
                } else {
                    // Priority 2: Simplistic Body Search
                    const text = document.body.innerText;
                    const matches = text.match(/([$€£₹]|USD|EUR|INR)\s?((?:\d{1,3}(?:,\d{3})*|\d+)(?:\.\d{2})?)/g);

                    if (matches && matches.length > 0) {
                        const val = matches[0];
                        const { foundAmt, foundCurr } = parseText(val);
                        if (foundAmt) amount = foundAmt;
                        if (foundCurr) currency = foundCurr;
                    }
                }

                return { merchantName, amount, currency, hostname: window.location.hostname };

                // Helper for Domain Parsing (Must be inside injected script)
                function extractRootDomain(hostname) {
                    let domain = hostname.toLowerCase();
                    domain = domain.replace(/(https?:\/\/)?(www\.)?/, '');
                    const parts = domain.split('.');
                    if (parts.length === 1) return parts[0];

                    const last = parts[parts.length - 1];
                    const secondLast = parts[parts.length - 2];
                    let tldParts = 1;

                    if (last.length === 2 && secondLast) {
                        const compoundSLDs = ['co', 'com', 'net', 'org', 'gov', 'edu', 'ac', 'mil', 'in', 'us', 'au', 'uk', 'sg', 'jp', 'br'];
                        if (compoundSLDs.includes(secondLast) || secondLast.length <= 2) {
                            tldParts = 2;
                        }
                    }

                    if (parts.length > tldParts) {
                        return parts[parts.length - tldParts - 1];
                    }
                    return parts[0];
                }
            }
        });

        if (results && results[0] && results[0].result) {
            const data = results[0].result;

            // Populate Fields
            const merchantIdField = document.getElementById('merchantId');
            const amountField = document.getElementById('amount');
            const currencyField = document.getElementById('currency');

            // Generate ID from Merchant Name (Priority)
            if (merchantIdField) {
                let core = "";
                if (data.merchantName && data.merchantName.toLowerCase() !== 'localhost') {
                    core = data.merchantName.toLowerCase().replace(/[^a-z0-9]/g, '');
                } else if (data.hostname) {
                    core = data.hostname.replace(/^www\./, '').split('.')[0].replace(/[^a-zA-Z0-9]/g, '');
                }
                if (core) merchantIdField.value = core;
            }

            // Update Currency
            if (currencyField && data.currency) {
                currencyField.value = data.currency;
            }

            // Update Amount and Detected Label
            if (amountField && data.amount) {
                amountField.value = data.amount;

                // Update Badge / Label
                const detectedLabel = document.getElementById('detectedAmountDisplay');
                const detectedValue = document.getElementById('detectedAmountValue');
                if (detectedLabel && detectedValue) {
                    const symbol = data.currency === 'EUR' ? '€' : data.currency === 'INR' ? '₹' : '$';
                    detectedValue.textContent = `${symbol}${data.amount}`;
                    detectedLabel.style.display = 'block';
                }
            }

            // Store the scraped name
            document.getElementById('merchantId').dataset.scrapedName = data.merchantName;
        }
    } catch (err) {
        console.error("Scraping failed", err);
    }
}

let currentResult = null; // Store last result for investigation

function applyPreset(type) {
    const fields = {
        merchantId: document.getElementById('merchantId'),
        customerId: document.getElementById('customerId'),
        amount: document.getElementById('amount'),
        currency: document.getElementById('currency'),
        planId: document.getElementById('planId'),
        isRecurring: document.getElementById('isRecurring'),
        wasCustomerCancelled: document.getElementById('wasCustomerCancelled')
    };

    // Common Randoms
    const randomSuffix = Math.floor(Math.random() * 1000);

    switch (type) {
        case 'good':
            fields.merchantId.value = 'mer_netflix';
            fields.customerId.value = `cus_good_${randomSuffix}`;
            fields.amount.value = '15.99';
            fields.planId.value = 'standard_monthly';
            fields.isRecurring.checked = true;
            fields.wasCustomerCancelled.checked = false;
            break;
        case 'trial':
            fields.merchantId.value = 'mer_vpn_service';
            fields.customerId.value = `cus_abuser_${randomSuffix}`;
            fields.amount.value = '99.00'; // High amount charge attempt
            fields.planId.value = 'free_trial_to_paid';
            fields.isRecurring.checked = true;
            fields.wasCustomerCancelled.checked = false;
            break;
        case 'cancel':
            fields.merchantId.value = 'mer_gym';
            fields.customerId.value = `cus_sad_${randomSuffix}`;
            fields.amount.value = '49.99';
            fields.planId.value = 'gym_membership';
            fields.isRecurring.checked = true;
            fields.wasCustomerCancelled.checked = true;
            break;
        case 'micro':
            fields.merchantId.value = 'mer_gamer';
            fields.customerId.value = `cus_tester_${randomSuffix}`;
            fields.amount.value = '1.00';
            fields.planId.value = 'verification_charge';
            fields.isRecurring.checked = false;
            fields.wasCustomerCancelled.checked = false;
            break;
    }

    // Auto-evaluate after setting preset
    evaluateTransaction();
}

async function evaluateTransaction() {
    const btn = document.getElementById('evaluateBtn');
    const resultPanel = document.getElementById('resultPanel');
    const decisionLabel = document.getElementById('decisionLabel');
    const scoreLabel = document.getElementById('trustScoreLabel');
    const riskLabel = document.getElementById('riskLabel');
    const latencyLabel = document.getElementById('latencyLabel');
    const rulesLabel = document.getElementById('rulesLabel');

    // UI Loading State
    btn.disabled = true;
    btn.textContent = 'Evaluating...';
    resultPanel.classList.remove('hidden');
    resultPanel.className = 'result-panel'; // Reset colors
    decisionLabel.textContent = '...';

    // Construct Payload (Snake Case for Python API)
    // "merchant_id": "NEW_M_777","merchant_name": "Netfl1x Officia1 Ltd","amount": 0.99

    // Use scraped name if available, otherwise fallback to "Unknown" or preset logic
    let scrapedName = document.getElementById('merchantId').dataset.scrapedName;

    // Preset Overrides (Manual check for quick demos alongside robust scraping)
    let merchantIdVal = document.getElementById('merchantId').value;
    let merchantNameVal = scrapedName || "Unknown Merchant";

    if (merchantIdVal === 'mer_netflix') merchantNameVal = 'Netflix Inc';
    if (merchantIdVal === 'mer_vpn_service') merchantNameVal = 'Super Fast VPN';
    if (merchantIdVal === 'mer_gym') merchantNameVal = 'Iron Gym Global';
    if (merchantIdVal === 'mer_gamer') merchantNameVal = 'Ubisoft Store';

    const payload = {
        merchant_id: merchantIdVal,
        merchant_name: merchantNameVal,
        amount: parseFloat(document.getElementById('amount').value) || 0,
        // The ML backend currently ignores customerId, planId, etc. but we keep them in UI for realism
    };

    try {
        // Updated endpoint: /score-transaction
        const url = `${firewallBaseUrl.replace(/\/$/, '')}/score-transaction`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const result = await response.json();
        currentResult = result; // Save for investigation

        // Render Result
        decisionLabel.textContent = result.decision;
        scoreLabel.textContent = `Score: ${result.merchant_trust_score}`; // Updated key
        riskLabel.textContent = result.user_guidance ? result.user_guidance.substring(0, 60) + '...' : 'N/A';
        latencyLabel.textContent = '120'; // Mock latency for now

        // Patterns
        rulesLabel.textContent = result.patterns_detected && result.patterns_detected.length
            ? result.patterns_detected.join(', ')
            : 'None';

        // Apply Styling
        resultPanel.classList.remove('bg-allow', 'bg-review', 'bg-block');
        if (result.decision === 'ALLOW') resultPanel.classList.add('bg-allow');
        else if (result.decision === 'REVIEW') resultPanel.classList.add('bg-review');
        else resultPanel.classList.add('bg-block');

        // Show Investigate Button
        document.getElementById('investigateBtn').classList.remove('hidden');
        document.getElementById('investigationPanel').classList.add('hidden'); // Hide old investigation

        // Add to History
        addToHistory(result.decision, result.merchant_trust_score);

        // Optional: Update Badge
        chrome.runtime.sendMessage({
            type: 'UPDATE_BADGE',
            decision: result.decision
        }).catch(() => { }); // If background script not ready/present, ignore

    } catch (error) {
        console.error(error);
        decisionLabel.textContent = 'ERROR';
        scoreLabel.textContent = '';
        riskLabel.textContent = error.message;
        resultPanel.className = 'result-panel bg-block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Evaluate Transaction';
    }
}

function addToHistory(decision, score) {
    const tbody = document.querySelector('#historyTable tbody');
    const row = document.createElement('tr');

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let color = '#000';
    if (decision === 'ALLOW') color = 'green';
    else if (decision === 'REVIEW') color = '#b08d00'; // Dark yellow
    else color = 'red';

    row.innerHTML = `
        <td>${time}</td>
        <td style="color:${color}; font-weight:bold">${decision}</td>
        <td>${score}</td>
    `;

    // Prepend
    tbody.insertBefore(row, tbody.firstChild);

    // Limit to 10
    if (tbody.children.length > 10) {
        tbody.removeChild(tbody.lastChild);
    }
}

async function investigateTransaction() {
    if (!currentResult) return;

    const btn = document.getElementById('investigateBtn');
    const panel = document.getElementById('investigationPanel');
    const content = document.getElementById('investigationContent');

    btn.disabled = true;
    btn.textContent = 'Consulting Gemini...';
    panel.classList.remove('hidden');
    content.textContent = 'Analyzing transaction patterns and merchant history...';

    // Prepare payload for investigation
    const invPayload = {
        merchant_id: currentResult.merchant_id,
        merchant_name: currentResult.merchant_name,
        amount: 0.99, // default
        decision: currentResult.decision,
        merchant_trust_score: currentResult.merchant_trust_score,
        rename_similarity_score: currentResult.rename_similarity_score,
        closest_company_match: currentResult.closest_company_match,
        patterns_detected: currentResult.patterns_detected
    };

    try {
        const url = `${firewallBaseUrl.replace(/\/$/, '')}/investigate-transaction`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invPayload)
        });

        if (!response.ok) throw new Error(`RAG Error: ${response.status}`);
        const data = await response.json();
        const info = data.investigation;

        // Format the output
        let html = `<strong>Risk Summary:</strong> ${info.risk_summary || 'N/A'}\n\n`;
        if (info.key_reasons) html += `<strong>Reasons:</strong>\n- ${info.key_reasons.join('\n- ')}\n\n`;
        if (info.cancellation_instructions) html += `<strong>How to Cancel:</strong>\n${info.cancellation_instructions.join('\n')}`;

        content.innerHTML = html.replace(/\n/g, '<br>');

    } catch (e) {
        content.textContent = "Error: " + e.message;
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> Investigate`;
    }
}

// Universal Helper for Domain Parsing
function extractRootDomain(hostname) {
    let domain = hostname.toLowerCase();

    // Remove protocol if present
    domain = domain.replace(/(https?:\/\/)?(www\.)?/, '');

    const parts = domain.split('.');

    // If simple (localhost, or single word)
    if (parts.length === 1) return parts[0];

    // Handle Compound TLDs (e.g., .co.uk, .com.au, .gov.in)
    // Heuristic: If last part is 2 chars (ccTLD), check if 2nd last is short generic
    const last = parts[parts.length - 1];
    const secondLast = parts[parts.length - 2];

    let tldParts = 1;
    if (last.length === 2 && secondLast) {
        // List of common SLDs in compound TLDs
        const compoundSLDs = ['co', 'com', 'net', 'org', 'gov', 'edu', 'ac', 'mil', 'in', 'us', 'au', 'uk', 'sg', 'jp', 'br'];
        if (compoundSLDs.includes(secondLast) || secondLast.length <= 2) {
            tldParts = 2;
        }
    }

    // The root is the part immediately before the TLD parts
    // e.g. [open, spotify, com] -> tldParts=1 -> root index = 3-1-1 = 1 -> spotify
    if (parts.length > tldParts) {
        return parts[parts.length - tldParts - 1];
    }

    return parts[0];
}
