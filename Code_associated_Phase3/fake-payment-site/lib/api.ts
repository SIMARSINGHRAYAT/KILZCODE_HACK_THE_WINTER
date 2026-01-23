import { FirewallResponse, TransactionPayload } from "@/types";

export async function callFirewall(payload: TransactionPayload): Promise<FirewallResponse> {
    const FIREWALL_URL = process.env.NEXT_PUBLIC_FIREWALL_URL;

    if (!FIREWALL_URL) {
        throw new Error("NEXT_PUBLIC_FIREWALL_URL is not set");
    }

    // The env var is expected to be the base URL (e.g. http://localhost:3000)
    const endpoint = `${FIREWALL_URL}/score-transaction`;

    const startTime = performance.now();

    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const endTime = performance.now();
        const latencyForFetch = Math.round(endTime - startTime);

        if (!res.ok) {
            const errorText = await res.text().catch(() => "Unknown error");
            throw new Error(`Firewall returned ${res.status}: ${errorText}`);
        }

        const data = await res.json();

        // Supplement latency if not provided by backend
        return {
            ...data,
            latencyMs: data.latencyMs || latencyForFetch,
        };
    } catch (error) {
        console.error("Firewall API connection error:", error);
        throw error;
    }
}

export async function fetchMerchants(): Promise<import("@/types").MerchantProfile[]> {
    const BASE_URL = process.env.NEXT_PUBLIC_FIREWALL_URL || "http://localhost:8000";
    try {
        const res = await fetch(`${BASE_URL}/payment-site/merchants`);
        if (!res.ok) throw new Error("Failed to load merchants");
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch merchants:", e);
        return [];
    }
}

export async function investigateTransaction(payload: import("@/types").TransactionPayload): Promise<import("@/types").InvestigationResponse | null> {
    const BASE_URL = process.env.NEXT_PUBLIC_FIREWALL_URL || "http://localhost:8000";
    try {
        const res = await fetch(`${BASE_URL}/investigate-transaction`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Investigation failed");
        return await res.json();
    } catch (e) {
        console.error("Failed to investigate:", e);
        return null;
    }
}
