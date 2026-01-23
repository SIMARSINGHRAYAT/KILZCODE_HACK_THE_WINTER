import { FirewallResponse } from "@/types";
import { useState } from "react";

interface Props {
    result: FirewallResponse | null;
    loading: boolean;
    error: string | null;
    // Cart Props
    amount: number;
    currency: string;
    selectedProduct: string;
    onProductChange: (val: string) => void;
    onCurrencyChange: (val: string) => void;
    merchantName: string;
}

export default function ResultDisplay({
    result,
    loading,
    error,
    amount,
    currency,
    selectedProduct,
    onProductChange,
    onCurrencyChange,
    merchantName
}: Props) {
    const [showDebug, setShowDebug] = useState(false);

    // Render "Order Summary" if no result yet
    if (!result && !error) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Your Order</h3>
                    <div className="text-sm">
                        <select
                            value={currency}
                            onChange={(e) => onCurrencyChange(e.target.value)}
                            className="bg-transparent border-none text-slate-500 font-medium focus:ring-0 cursor-pointer"
                        >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="INR">INR</option>
                        </select>
                    </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                    <div className="space-y-4 mb-8">
                        {/* Fake Items */}
                        <div
                            onClick={() => onProductChange("STANDARD")}
                            className={`flex gap-4 p-3 rounded-xl border cursor-pointer transition-all ${selectedProduct === "STANDARD" ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:bg-slate-50'}`}
                        >
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0 ${selectedProduct === "STANDARD" ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                ⭐
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <h4 className="font-bold text-sm text-slate-900">Premium Plan</h4>
                                    <span className="font-bold text-sm text-slate-900">{currency === "INR" ? "₹" : currency === "EUR" ? "€" : "$"}{currency === "INR" ? (49.99 * 91).toFixed(0) : 49.99}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Monthly subscription. Recurring billing.</p>
                            </div>
                        </div>

                        <div
                            onClick={() => onProductChange("TRIAL")}
                            className={`flex gap-4 p-3 rounded-xl border cursor-pointer transition-all ${selectedProduct === "TRIAL" ? 'border-orange-500 bg-orange-50/50' : 'border-slate-100 hover:bg-slate-50'}`}
                        >
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0 ${selectedProduct === "TRIAL" ? 'bg-orange-100' : 'bg-slate-100'}`}>
                                🎁
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <h4 className="font-bold text-sm text-slate-900">14-Day Free Trial</h4>
                                    <span className="font-bold text-sm text-slate-900">{currency === "INR" ? "₹" : currency === "EUR" ? "€" : "$"}0.00</span>
                                </div>
                                <p className="text-xs text-orange-600 mt-1 font-medium">Billed {(currency === "INR" ? "₹" : currency === "EUR" ? "€" : "$")}{currency === "INR" ? (99.99 * 91).toFixed(0) : 99.99} after trial ends.</p>
                            </div>
                        </div>

                        <div
                            onClick={() => onProductChange("CHEAP")}
                            className={`flex gap-4 p-3 rounded-xl border cursor-pointer transition-all ${selectedProduct === "CHEAP" ? 'border-purple-500 bg-purple-50/50' : 'border-slate-100 hover:bg-slate-50'}`}
                        >
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0 ${selectedProduct === "CHEAP" ? 'bg-purple-100' : 'bg-slate-100'}`}>
                                ⚡
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <h4 className="font-bold text-sm text-slate-900">Test Charge</h4>
                                    <span className="font-bold text-sm text-slate-900">{currency === "INR" ? "₹" : currency === "EUR" ? "€" : "$"}{currency === "INR" ? (1.00 * 91).toFixed(0) : 1.00}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">One-time micro-transaction.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto border-t border-slate-100 pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Subtotal</span>
                            <span>{currency === "INR" ? "₹" : currency === "EUR" ? "€" : "$"}{amount}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Tax (0%)</span>
                            <span>0.00</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-slate-900 pt-2">
                            <span>Total Due</span>
                            <span id="checkout-total-amount" data-currency={currency}>{currency === "INR" ? "₹" : currency === "EUR" ? "€" : "$"}{amount}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render "Receipt" or "Error"
    const isAllow = result?.decision === "ALLOW";

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative">
            {/* Receipt Header */}
            <div className={`h-2 ${isAllow ? "bg-emerald-500" : "bg-red-500"}`} />

            <div className="p-8 text-center">
                {error ? (
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">❌</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Connection Error</h3>
                        <p className="text-sm text-slate-500 mt-2">{error}</p>
                    </div>
                ) : isAllow ? (
                    <div className="mb-8">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in">
                            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Payment Successful</h3>
                        <p className="text-sm text-slate-500 mt-2">Receipt #{Math.floor(Math.random() * 1000000)}</p>
                    </div>
                ) : (
                    <div className="mb-8">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in">
                            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Transaction Declined</h3>
                        <p className="text-sm text-slate-500 mt-2">Action needed for account</p>
                    </div>
                )}

                {/* Receipt Details */}
                {result && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm space-y-3 mb-6">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Merchant</span>
                            <span className="font-semibold text-slate-900">{merchantName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Amount</span>
                            <span className="font-semibold text-slate-900">{currency === "INR" ? "₹" : currency === "EUR" ? "€" : "$"}{amount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Date</span>
                            <span className="font-semibold text-slate-900">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => window.location.reload()}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                    Start New Transaction
                </button>
            </div>

            {/* RAG Analysis Section */}
            {result && (
                <div className="border-t border-slate-100 p-4">
                    <RAGAnalysis
                        payload={{
                            transactionId: "TX-" + Math.random(),
                            merchantId: merchantName.toLowerCase().replace(/\s/g, "_"),
                            customerId: "CUST-DEMO",
                            amount: amount,
                            currency: currency,
                            timestamp: new Date().toISOString(),
                            isRecurring: true,
                            planId: "demo_plan",
                            status: "PENDING",
                            wasCustomerCancelled: false
                        }}
                        merchantName={merchantName}
                    />
                </div>
            )}

            {/* Technical Footer (Expandable) */}
            {result && (
                <div className="border-t border-slate-100">
                    <button
                        onClick={() => setShowDebug(!showDebug)}
                        className="w-full flex items-center justify-between p-3 bg-slate-50 text-slate-400 text-[10px] font-mono hover:bg-slate-100 transition-colors"
                    >
                        <span>[DEBUG] LATENCY: {result.latencyMs}ms</span>
                        <span>{showDebug ? "HIDE" : "SHOW"} LOGS</span>
                    </button>

                    {showDebug && (
                        <div className="p-4 bg-slate-900 text-slate-300 text-xs font-mono text-left space-y-2 animate-in slide-in-from-top-1">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-slate-500 block">RISK_LEVEL</span>
                                    <span className={result.riskLevel === "HIGH" ? "text-red-400" : "text-emerald-400"}>{result.riskLevel}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">TRUST_SCORE</span>
                                    <span>{result.trustScore}/100</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-500 block">RULES_TRIGGERED</span>
                                <div className="text-red-300">
                                    {result.triggeredRules.length ? result.triggeredRules.join(", ") : "None"}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

import { investigateTransaction } from "@/lib/api";
import { InvestigationResponse, TransactionPayload } from "@/types";

function RAGAnalysis({ payload, merchantName }: { payload: Partial<TransactionPayload>, merchantName: string }) {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<InvestigationResponse | null>(null);

    const handleAnalyze = async () => {
        setLoading(true);
        // Ensure merchant_name is passed correctly
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const enrichedPayload = { ...payload, merchant_name: merchantName } as any;
        const res = await investigateTransaction(enrichedPayload);
        setAnalysis(res);
        setLoading(false);
    };

    if (!analysis) {
        return (
            <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Analyzing with Fraud Agent...</span>
                    </>
                ) : (
                    <>
                        <span>🕵️ Analyze with Fraud Agent</span>
                    </>
                )}
            </button>
        );
    }

    const { investigation } = analysis;

    return (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2">
            <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                🤖 Agent Investigation
                <span className="text-xs font-normal bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full">{investigation.confidence} CONFIDENCE</span>
            </h4>

            <p className="text-sm text-indigo-800 mb-4 italic">
                &quot;{investigation.risk_summary}&quot;
            </p>

            {investigation.cancellation_instructions && investigation.cancellation_instructions.length > 0 && (
                <div className="bg-white rounded-lg p-3 border border-indigo-100">
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">How to Cancel</h5>
                    <ul className="list-decimal list-inside text-sm text-slate-700 space-y-1">
                        {investigation.cancellation_instructions.map((step, i) => (
                            <li key={i}>{step}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
