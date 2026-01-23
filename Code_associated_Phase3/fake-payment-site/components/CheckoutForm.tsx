import { FormEvent } from "react";

interface Props {
    loading: boolean;
    onSubmit: () => void;
    currency: string;
}

export default function CheckoutForm({ loading, onSubmit, currency }: Props) {
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 sm:p-8 space-y-8">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Payment Details</h3>
                    <p className="text-sm text-slate-500">Complete your purchase securely.</p>
                </div>

                <div className="space-y-6">
                    {/* Email Input */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            defaultValue="simar@gmail.com"
                            className="input-base"
                            placeholder="you@example.com"
                        />
                    </div>

                    {/* Card Details */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                            Card Information
                        </label>
                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="0000 xxxx xxxx xxxx"
                                    className="input-base pl-14 pr-20 font-mono tracking-wider transition-all hover:border-slate-300"
                                    style={{ paddingLeft: '3.5rem' }}
                                    defaultValue="4242 4242 4242 4242"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                </div>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {/* Visa */}
                                    <div className="w-8 h-5 bg-white border border-slate-100 rounded flex items-center justify-center p-0.5">
                                        <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
                                            <path d="M19.1 16.5H23L20.4 34H16.5L19.1 16.5Z" fill="#2566AF" />
                                            <path d="M29.5 16.5H35.4L34.3 22H31L29.5 16.5Z" fill="#2566AF" />
                                            <path d="M34.6 34L37.1 22.3L37.7 19.3L34.6 34ZM47 16.8L43.8 34H40L43.5 18.2C43.5 18 43.5 17.8 43.4 17.7C43.3 17.5 43.1 17.4 42.8 17.4H38.9L38.8 16.5H46.9C47 16.5 47 16.6 47 16.8Z" fill="#2566AF" />
                                            <path d="M14.4 16.5L9.9 28.6L9.4 25.9C8.9 23.3 5.7 21.8 3.3 20.6L4.1 19.4C6.5 19.4 11.2 20.1 13.5 22.8L15.6 34H19.6L23.4 16.5H14.4Z" fill="#2566AF" />
                                        </svg>
                                    </div>
                                    {/* Mastercard */}
                                    <div className="w-8 h-5 bg-white border border-slate-100 rounded flex items-center justify-center p-0.5">
                                        <svg viewBox="0 0 32 20" className="w-full h-full">
                                            <rect width="32" height="20" rx="2" fill="none" />
                                            <circle cx="11.5" cy="10" r="6" fill="#EB001B" />
                                            <circle cx="20.5" cy="10" r="6" fill="#F79E1B" fillOpacity="0.8" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                        Expiry Date
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="MM / YY"
                                        className="input-base text-center font-mono"
                                        defaultValue="12 / 28"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                        CVC / CVV
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="123"
                                        className="input-base text-center font-mono"
                                        defaultValue="123"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Name on Card */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                            Cardholder Name
                        </label>
                        <input
                            type="text"
                            className="input-base"
                            placeholder="Card Holder Name"
                            defaultValue="Simar singh rayat"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white transition-all transform active:scale-[0.98] ${loading ? "bg-slate-400 cursor-not-allowed shadow-none" : "bg-slate-900 hover:bg-black hover:shadow-xl"
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            `Pay Securely`
                        )}
                    </button>
                    <div className="text-center mt-6 flex items-center justify-center text-xs text-slate-400 gap-2">
                        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" /></svg>
                        <span className="font-medium">256-bit SSL Encrypted Payment</span>
                    </div>
                </div>
            </div>
        </form>
    );
}
