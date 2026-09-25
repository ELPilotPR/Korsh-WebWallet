import { useEffect, useState } from 'react';
import { duffsToKsh } from '../lib/transaction';
import { fetchHistory, type BalanceResponse, type HistoryTx } from '../lib/api';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Shield,
  Clock,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface DashboardProps {
  address: string;
  balance: BalanceResponse | null;
  onRefresh: () => void;
  onSend: () => void;
  onReceive: () => void;
  onViewHistory?: () => void;
}

export function Dashboard({
  address,
  balance,
  onRefresh,
  onSend,
  onReceive,
  onViewHistory,
}: DashboardProps) {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentTxs, setRecentTxs] = useState<HistoryTx[]>([]);
  const [loadingTxs, setLoadingTxs] = useState(false);

  useEffect(() => {
    onRefresh();
    const interval = setInterval(onRefresh, 25000);
    return () => clearInterval(interval);
  }, [onRefresh]);

  useEffect(() => {
    let cancelled = false;
    async function loadRecent() {
      try {
        setLoadingTxs(true);
        const data = await fetchHistory(address);
        if (!cancelled) {
          setRecentTxs(data.slice(0, 4));
        }
      } catch {
        // Ignored
      } finally {
        if (!cancelled) setLoadingTxs(false);
      }
    }
    if (address) loadRecent();
    return () => {
      cancelled = true;
    };
  }, [address]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    try {
      const data = await fetchHistory(address);
      setRecentTxs(data.slice(0, 4));
    } catch {
      // Ignored
    }
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const balanceKsh = balance ? duffsToKsh(balance.balance) : '0.00';
  const receivedKsh = balance && balance.received > 0 ? duffsToKsh(balance.received) : '0.00';
  const sentKsh = balance && balance.sent > 0 ? duffsToKsh(balance.sent) : '0.00';

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* ================= 1. HERO BALANCE CARD ================= */}
      <div className="glass-card relative overflow-hidden p-6 sm:p-8 border border-white/[0.1] bg-gradient-to-br from-[#0B100C]/95 via-[#080C09]/95 to-[#050706]/95">
        {/* Ambient Top Glow in Card */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00CC52]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#00CC52]/10 text-[#00CC52] border border-[#00CC52]/20">
              <Shield className="w-4 h-4" />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-[#7B8E84]">
                Total Available Balance
              </p>
              <p className="text-[11px] text-[#7B8E84]/70 font-mono">
                Decentralized UTXO Set
              </p>
            </div>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F1611] hover:bg-[#17221A] border border-white/[0.08] hover:border-white/20 text-[#7B8E84] hover:text-white text-xs font-mono transition-all self-end sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00CC52]' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>

        {/* Big Balance Number */}
        <div className="my-4">
          <div className="flex items-baseline flex-wrap gap-2 sm:gap-3">
            <span className="font-heading font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-tight drop-shadow-[0_2px_15px_rgba(0,204,82,0.25)]">
              {balanceKsh}
            </span>
            <span className="font-heading font-bold text-xl sm:text-2xl text-[#00CC52]">
              KSH
            </span>
          </div>
          <p className="text-xs font-mono text-[#7B8E84] mt-1.5">
            PoW/Yespower Asset • 1 KSH = 100,000,000 duffs
          </p>
        </div>

        {/* Stats Row: Inflow / Outflow */}
        <div className="grid grid-cols-2 gap-3 pt-6 mt-6 border-t border-white/[0.08]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#080C09]/80 border border-white/[0.05]">
            <div className="p-2 rounded-lg bg-[#00CC52]/10 text-[#00CC52]">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-[#7B8E84]">Total Received</p>
              <p className="font-mono text-xs sm:text-sm font-semibold text-white">
                +{receivedKsh} <span className="text-[#00CC52] text-[11px]">KSH</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#080C09]/80 border border-white/[0.05]">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-[#7B8E84]">Total Sent</p>
              <p className="font-mono text-xs sm:text-sm font-semibold text-white">
                -{sentKsh} <span className="text-red-400 text-[11px]">KSH</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. QUICK ACTIONS BENTO GRID ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={onSend}
          className="btn-primary flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl h-auto group text-center"
        >
          <div className="p-2.5 rounded-xl bg-[#050706] text-[#00CC52] group-hover:scale-110 transition-transform mb-2">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm tracking-wide text-[#050706]">Send KSH</span>
          <span className="text-[10px] text-[#050706]/70 mt-0.5">Transfer funds</span>
        </button>

        <button
          onClick={onReceive}
          className="btn-secondary flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl h-auto group text-center"
        >
          <div className="p-2.5 rounded-xl bg-[#00CC52]/10 text-[#00CC52] group-hover:scale-110 transition-transform mb-2">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm tracking-wide text-white">Receive KSH</span>
          <span className="text-[10px] text-[#7B8E84] mt-0.5">Show QR & Address</span>
        </button>

        <button
          onClick={handleCopy}
          className="btn-secondary flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl h-auto group text-center"
        >
          <div className="p-2.5 rounded-xl bg-white/[0.05] text-[#E2ECE5] group-hover:scale-110 transition-transform mb-2">
            {copied ? <Check className="w-5 h-5 text-[#00CC52]" /> : <Copy className="w-5 h-5" />}
          </div>
          <span className="font-bold text-sm tracking-wide text-white">
            {copied ? 'Copied!' : 'Copy Address'}
          </span>
          <span className="text-[10px] text-[#7B8E84] mt-0.5 font-mono">
            {address.slice(0, 4)}...{address.slice(-4)}
          </span>
        </button>

        <a
          href={`https://explorer.korsh.org/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl h-auto group text-center"
        >
          <div className="p-2.5 rounded-xl bg-white/[0.05] text-[#E2ECE5] group-hover:scale-110 transition-transform mb-2">
            <ExternalLink className="w-5 h-5 group-hover:text-[#00CC52]" />
          </div>
          <span className="font-bold text-sm tracking-wide text-white group-hover:text-[#00CC52]">
            Explorer
          </span>
          <span className="text-[10px] text-[#7B8E84] mt-0.5">Verify on-chain</span>
        </a>
      </div>

      {/* ================= 3. YOUR ADDRESS DETAILS CARD ================= */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-[#7B8E84] uppercase tracking-wider">
            Your Korsh Address (P2PKH)
          </p>
          <span className="badge-neon text-[10px]">Verified Network Key</span>
        </div>

        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#080C09] border border-white/[0.08]">
          <span className="font-mono text-xs sm:text-sm text-white break-all select-all">
            {address}
          </span>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-[#0F1611] hover:bg-[#17221A] text-[#7B8E84] hover:text-[#00CC52] transition-colors shrink-0"
            title="Copy address"
          >
            {copied ? <Check className="w-4 h-4 text-[#00CC52]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ================= 4. RECENT ACTIVITY PREVIEW ================= */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-[#7B8E84]">
              Latest confirmed transfers on this address
            </p>
          </div>
          {onViewHistory && (
            <button
              onClick={onViewHistory}
              className="text-xs font-semibold text-[#00CC52] hover:text-[#00e65c] transition-colors"
            >
              View All History →
            </button>
          )}
        </div>

        {loadingTxs ? (
          <div className="py-8 text-center text-xs text-[#7B8E84] font-mono">
            Loading recent on-chain transactions...
          </div>
        ) : recentTxs.length === 0 ? (
          <div className="py-8 text-center rounded-xl bg-[#080C09]/50 border border-white/[0.05] space-y-2">
            <Clock className="w-6 h-6 text-[#7B8E84]/50 mx-auto" />
            <p className="text-sm font-medium text-white">No transactions recorded yet</p>
            <p className="text-xs text-[#7B8E84] max-w-sm mx-auto">
              Your address is ready to receive Korsh coins. Send coins to this address or share your QR code to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTxs.map((tx) => {
              // Net balance movement: `sent` is the credit, `received` the debit.
              const delta = (Number(tx.sent) || 0) - (Number(tx.received) || 0);
              const isReceived = delta > 0;
              const amountVal = Math.abs(delta).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });

              return (
                <div
                  key={tx.txid}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#080C09]/80 border border-white/[0.05] hover:border-white/[0.12] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isReceived
                          ? 'bg-[#00CC52]/10 text-[#00CC52] border border-[#00CC52]/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {isReceived ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-white">
                        {isReceived ? 'Received KSH' : 'Sent KSH'}
                      </p>
                      <p className="text-[11px] font-mono text-[#7B8E84]">
                        {tx.txid.slice(0, 10)}...{tx.txid.slice(-8)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-xs sm:text-sm font-mono font-bold ${
                        isReceived ? 'text-[#00CC52]' : 'text-red-400'
                      }`}
                    >
                      {isReceived ? '+' : '-'}{amountVal} KSH
                    </p>
                    <a
                      href={`https://explorer.korsh.org/tx/${tx.txid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#7B8E84] hover:text-white inline-flex items-center gap-0.5"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
