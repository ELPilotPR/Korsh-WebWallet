import { useEffect, useState } from 'react';
import { fetchHistory, type HistoryTx } from '../lib/api';
import {
  History as HistoryIcon,
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Search,
} from 'lucide-react';

interface HistoryProps {
  address: string;
}

function formatTime(timestamp: number): string {
  if (!timestamp) return 'Just now (Pending)';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function History({ address }: HistoryProps) {
  const [txs, setTxs] = useState<HistoryTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedTxid, setCopiedTxid] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'received' | 'sent'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await fetchHistory(address);
      setTxs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transaction history');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [address]);

  const handleCopyTxid = (txid: string) => {
    navigator.clipboard.writeText(txid);
    setCopiedTxid(txid);
    setTimeout(() => setCopiedTxid(null), 2000);
  };

  // eIquidus per-tx fields: `sent` = coins credited TO this address in the tx,
  // `received` = coins debited FROM it. The net balance movement is
  // (sent − received) — it matches the running `balance` chain.
  const netDelta = (tx: HistoryTx): number => (Number(tx.sent) || 0) - (Number(tx.received) || 0);

  // Filter transactions
  const filteredTxs = txs.filter((tx) => {
    const delta = netDelta(tx);
    if (filter === 'received' && delta <= 0) return false;
    if (filter === 'sent' && delta >= 0) return false;
    if (searchQuery.trim()) {
      return tx.txid.toLowerCase().includes(searchQuery.toLowerCase().trim());
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header Card */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#00CC52]/10 text-[#00CC52]">
            <HistoryIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl text-white">
              Transaction History
            </h2>
            <p className="text-xs text-[#7B8E84]">
              Complete ledger of incoming and outgoing Korsh transfers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0F1611] hover:bg-[#17221A] border border-white/[0.08] hover:border-white/20 text-[#7B8E84] hover:text-white text-xs font-mono transition-all"
            title="Refresh history"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00CC52]' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
          </button>

          <a
            href={`https://explorer.korsh.org/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-xs py-2 px-3"
          >
            <span>Live Explorer</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0B100C] border border-white/[0.08]">
          {[
            { id: 'all', label: `All (${txs.length})` },
            { id: 'received', label: 'Received' },
            { id: 'sent', label: 'Sent' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as 'all' | 'received' | 'sent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === item.id
                  ? 'bg-[#00CC52] text-[#050706] shadow-[0_0_12px_rgba(0,204,82,0.3)]'
                  : 'text-[#7B8E84] hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-[#7B8E84] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search TXID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#080C09] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#7B8E84]/70 font-mono focus:outline-none focus:border-[#00CC52]"
          />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="glass-card py-16 text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-[#00CC52] animate-spin mx-auto" />
          <p className="text-xs font-mono text-[#7B8E84]">
            Querying blockchain indexer...
          </p>
        </div>
      ) : filteredTxs.length === 0 ? (
        <div className="glass-card py-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto text-[#7B8E84]">
            <HistoryIcon className="w-6 h-6 opacity-40" />
          </div>
          <p className="text-sm font-semibold text-white">No transactions found</p>
          <p className="text-xs text-[#7B8E84] max-w-sm mx-auto">
            {txs.length === 0
              ? 'This address has not participated in any blockchain transfers yet.'
              : 'No transactions match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTxs.map((tx) => {
            const delta = netDelta(tx);
            const isReceived = delta > 0;
            const amountVal = Math.abs(delta).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
            const isCopied = copiedTxid === tx.txid;

            return (
              <div
                key={tx.txid}
                className="glass-card-interactive p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                {/* Left: Direction Icon & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isReceived
                        ? 'bg-[#00CC52]/10 text-[#00CC52] border border-[#00CC52]/20 shadow-[0_0_12px_rgba(0,204,82,0.15)]'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {isReceived ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">
                        {isReceived ? 'Received Korsh' : 'Sent Korsh'}
                      </span>
                      <span className={isReceived ? 'badge-neon text-[10px]' : 'badge-amber text-[10px]'}>
                        Confirmed
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#7B8E84] mt-0.5">
                      <span>{formatTime(tx.timestamp)}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1 font-mono">
                        <span>{tx.txid.slice(0, 8)}...{tx.txid.slice(-6)}</span>
                        <button
                          onClick={() => handleCopyTxid(tx.txid)}
                          className="hover:text-white transition-colors"
                          title="Copy TXID"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-[#00CC52]" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Explorer Link */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.05]">
                  <span
                    className={`font-heading font-black text-sm sm:text-base ${
                      isReceived ? 'text-[#00CC52]' : 'text-red-400'
                    }`}
                  >
                    {isReceived ? '+' : '-'}{amountVal} KSH
                  </span>

                  <a
                    href={`https://explorer.korsh.org/tx/${tx.txid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#7B8E84] hover:text-[#00CC52] transition-colors inline-flex items-center gap-1 font-medium mt-0.5"
                  >
                    <span>View in Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
