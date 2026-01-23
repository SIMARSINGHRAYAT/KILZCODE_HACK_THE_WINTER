import { MerchantProfile } from "@/types";


interface Props {
    merchants: MerchantProfile[];
    selectedId: string;
    onSelect: (merchant: MerchantProfile) => void;
}

export default function MerchantSelector({ merchants, selectedId, onSelect }: Props) {
    return (
        <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Select Storefront</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-1.5 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm">
                {merchants.map((merchant) => {
                    const isSelected = selectedId === merchant.id;

                    // Determine "Store" branding based on ID
                    // const storeName = merchant.id.includes("clean") ? "StreamFlow" : ... // Removed, using merchant.name
                    const storeName = merchant.name;

                    const icon = merchant.id.includes("clean") ? "🌊" :
                        merchant.id.includes("dark") ? "💪" :
                            merchant.id.includes("post") ? "🎬" :
                                "📱";

                    return (
                        <button
                            key={merchant.id}
                            onClick={() => onSelect(merchant)}
                            className={`relative group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${isSelected
                                ? "bg-white shadow-md ring-1 ring-slate-200"
                                : "hover:bg-white/60 hover:shadow-sm"
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-sm transition-colors ${isSelected
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-slate-900"
                                }`}>
                                {icon}
                            </div>

                            <div className="text-left">
                                <div className={`text-sm font-bold leading-tight ${isSelected ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"}`}>
                                    {storeName}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                    {merchant.name.split(" ")[0]}...
                                </div>
                            </div>

                            {isSelected && (
                                <div className="absolute right-3 w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/30 animate-pulse" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
