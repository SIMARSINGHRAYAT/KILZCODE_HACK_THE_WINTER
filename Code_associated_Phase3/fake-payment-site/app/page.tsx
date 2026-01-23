"use client";

import { useState, useEffect } from "react";
import MerchantSelector from "@/components/MerchantSelector";
import CheckoutForm from "@/components/CheckoutForm";
import ResultDisplay from "@/components/ResultDisplay";
import HistoryTable from "@/components/HistoryTable";
import { MerchantProfile, TransactionPayload, FirewallResponse, HistoryItem } from "@/types";
import { fetchMerchants, callFirewall } from "@/lib/api"; // Updated import
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [merchants, setMerchants] = useState<MerchantProfile[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantProfile | null>(null);

  // existing state...
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FirewallResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Lifted State for Split Layout
  const [amount, setAmount] = useState<number>(49.99);
  const [currency, setCurrency] = useState<string>("USD");
  const [customerId, setCustomerId] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState<boolean>(true);
  const [wasCustomerCancelled, setWasCustomerCancelled] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("STANDARD");

  const RATES: Record<string, number> = { "USD": 1, "INR": 91.00, "EUR": 0.85 };

  useEffect(() => {
    setCustomerId(`CUST-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`);

    // Fetch merchants from backend
    fetchMerchants().then(data => {
      setMerchants(data);
      if (data.length > 0) {
        // Optional: Select first one or leave null
      }
    });
  }, []);

  // Update logic based on "Product" selection
  useEffect(() => {
    const rate = RATES[currency];
    if (selectedProduct === "STANDARD") {
      setAmount(parseFloat((49.99 * rate).toFixed(2)));
      setIsRecurring(true);
      setWasCustomerCancelled(false);
    } else if (selectedProduct === "TRIAL") {
      setAmount(parseFloat((99.99 * rate).toFixed(2)));
      setIsRecurring(true);
      setWasCustomerCancelled(true);
    } else if (selectedProduct === "CHEAP") {
      setAmount(parseFloat((1.00 * rate).toFixed(2)));
      setIsRecurring(false);
      setWasCustomerCancelled(false);
    }
    if (selectedMerchant) {
      document.title = `${selectedMerchant.name} | Secure Checkout`;
    } else {
      document.title = "Fraud Firewall | Merchant Portal";
    }
  }, [selectedMerchant, selectedProduct, currency]);

  const handleMerchantSelect = (merchant: MerchantProfile) => {
    setSelectedMerchant(merchant);
    if (merchant.defaultPrice) {
      setAmount(merchant.defaultPrice);
    }
    setResult(null);
    setError(null);
  };

  const handleTransactionSubmit = async () => {
    if (!selectedMerchant) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const txId = uuidv4();
    const payload: TransactionPayload = {
      transactionId: txId,
      merchantId: selectedMerchant.id,
      customerId,
      amount,
      currency,
      timestamp: new Date().toISOString(),
      isRecurring,
      planId: selectedMerchant.defaultPlanId,
      status: "SUCCESS",
      wasCustomerCancelled,
    };

    const historyItem: HistoryItem = {
      timestamp: payload.timestamp,
      transactionId: payload.transactionId,
      merchantName: selectedMerchant.name,
      amount: payload.amount,
      currency: payload.currency,
    };

    try {
      const response = await callFirewall(payload);
      setResult(response);
      setHistory(prev => [{
        ...historyItem,
        decision: response.decision,
        trustScore: response.trustScore
      }, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setResult(null);
      setHistory(prev => [{ ...historyItem, decision: "ERROR" }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-900 font-sans pb-20">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              F
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">
              {selectedMerchant ? selectedMerchant.name : "FraudFirewall"}
            </span>
          </div>
          <div className="flex items-center gap-4">

          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <MerchantSelector
          merchants={merchants}
          selectedId={selectedMerchant?.id || ""}
          onSelect={handleMerchantSelect}
        />

        {selectedMerchant && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Left Column: Payment Details (Form) */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <CheckoutForm
                loading={loading}
                onSubmit={handleTransactionSubmit}
                currency={currency}
              />
            </div>

            {/* Right Column: Order Summary (Receipt/Cart) */}
            <div className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-24">
              <ResultDisplay
                result={result}
                loading={loading}
                error={error}
                // Cart Props
                amount={amount}
                currency={currency}
                selectedProduct={selectedProduct}
                onProductChange={setSelectedProduct}
                onCurrencyChange={setCurrency}
                merchantName={selectedMerchant.name}
              />
            </div>

          </div>
        )}

        {selectedMerchant && <HistoryTable history={history} />}
      </div>
    </main>
  );
}
