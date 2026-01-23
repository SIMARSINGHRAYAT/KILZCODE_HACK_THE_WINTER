export interface TransactionPayload {
    transactionId: string;
    merchantId: string;
    customerId: string;
    amount: number;
    currency: string;
    timestamp: string;
    isRecurring: boolean;
    planId: string;
    status: string;
    wasCustomerCancelled: boolean;
}

export interface FirewallResponse {
    decision: "ALLOW" | "REVIEW" | "BLOCK";
    trustScore: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    triggeredRules: string[];
    latencyMs: number;
}

export interface MerchantProfile {
    id: string;
    name: string;
    description: string;
    defaultPlanId: string;
    defaultPrice?: number;
}

export interface HistoryItem {
    timestamp: string;
    transactionId: string;
    merchantName: string;
    amount: number;
    currency: string;
    decision?: string;
    trustScore?: number;
}

export interface InvestigationResponse {
    ok: boolean;
    merchant_id: string;
    merchant_name: string;
    investigation: {
        risk_summary: string;
        key_reasons: string[];
        recommended_bank_action: string[];
        customer_guidance: string[];
        cancellation_instructions: string[];
        confidence: string;
    };
}
