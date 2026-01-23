import { HistoryItem } from "@/types";

interface Props {
    history: HistoryItem[];
}

export default function HistoryTable({ history }: Props) {
    if (history.length === 0) return null;

    return (
        <div className="card-base mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-semibold text-slate-800">Recent Activity</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Transaction</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Trust Score</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-50">
                        {history.map((item, idx) => {
                            const isAllow = item.decision === "ALLOW";
                            return (
                                <tr key={item.transactionId} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">{item.amount.toFixed(2)} {item.currency}</div>
                                                <div className="text-xs text-slate-500">{item.merchantName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.decision ? (
                                            <span
                                                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${isAllow
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                        : item.decision === "REVIEW"
                                                            ? "bg-amber-50 text-amber-700 border-amber-100"
                                                            : "bg-rose-50 text-rose-700 border-rose-100"
                                                    }`}
                                            >
                                                {item.decision}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-xs">Pending...</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-slate-600">
                                        {item.trustScore ?? "-"}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
