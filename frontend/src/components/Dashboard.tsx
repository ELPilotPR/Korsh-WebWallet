import React, { useEffect, useState } from 'react';
import { duffsToKsh } from '../lib/transaction';
import {
  fetchHistory,
  fetchNetworkStats,
  fetchRecentBlocks,
  type BalanceResponse,
  type HistoryTx,
  type NetworkStats,
  type RecentBlock,
} from '../lib/api';
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
  Boxes,
  Search,
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
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentTxs, setRecentTxs] = useState<HistoryTx[]>([]);
  const [recentBlocks, setRecentBlocks] = useState<RecentBlock[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [loadingTxs, setLoadingTxs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadAll = async () => {
    try {
      setLoadingTxs(true);
      const [txs, stats, blocks] = await Promise.all([
        fetchHistory(address).catch(() => []),
        fetchNetworkStats().catch(() => null),
        fetchRecentBlocks().catch(() => []),
      ]);
      setRecentTxs(txs.slice(0, 4));
      if (stats) setNetworkStats(stats);
      if (blocks && blocks.length > 0) setRecentBlocks(blocks);
    } catch {
      // Ignored
    } finally {
      setLoadingTxs(false);
    }
  };

  useEffect(() => {
    onRefresh();
    loadAll();
    const interval = setInterval(() => {
      onRefresh();
      loadAll();
    }, 25000);
    return () => clearInterval(interval);
  }, [address, onRefresh]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    await loadAll();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    // Check if it's block height, hash, txid or address
    if (/^\d+$/.test(q)) {
      window.open(`https://explorer.korsh.org/block/${q}`, '_blank');
    } else if (/^[0-9a-fA-F]{64}$/.test(q)) {
      window.open(`https://explorer.korsh.org/tx/${q}`, '_blank');
    } else if (/^[SR][1-9A-HJ-NP-Za-km-z]{25,34}$/.test(q)) {
      window.open(`https://explorer.korsh.org/address/${q}`, '_blank');
    } else {
      window.open(`https://explorer.korsh.org/?search=${encodeURIComponent(q)}`, '_blank');
    }
  };

  const balanceKsh = balance ? duffsToKsh(balance.balance) : '0.00';
  const receivedKsh = balance && balance.received > 0 ? duffsToKsh(balance.received) : '0.00';
  const sentKsh = balance && balance.sent > 0 ? duffsToKsh(balance.sent) : '0.00';

  // Calculations for Supply KPI
  const supplyNum = networkStats?.supply || 11118;
  const maxSupply = 10000000;
  const supplyPct = Math.min(100, (supplyNum / maxSupply) * 100).toFixed(3);

  // Time format helper
  const formatAgo = (timestamp: number) => {
    if (!timestamp) return 'Just now';
    const now = Math.floor(Date.now() / 1000);
    const diff = Math.max(0, now - timestamp);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* ================= 1. HERO BALANCE CARD ================= */}
      <div className="glass-card relative overflow-hidden p-6 sm:p-8 border border-white/[0.1] bg-gradient-to-br from-[#0B100C]/95 via-[#080C09]/95 to-[#050706]/95">
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
                Decentralized UTXO Set • Mainnet
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
            Yespower CPU Asset • 1 KSH = 100,000,000 duffs
          </p>
        </div>

        {/* Inflow / Outflow Row */}
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

      {/* ================= 3. UNIVERSAL EXPLORER SEARCH BAR ================= */}
      <div className="glass-card p-3 sm:p-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#7B8E84] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Explore block height (#5532), TXID, or address (S...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080C09] border border-white/[0.08] focus:border-[#00CC52] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#7B8E84] font-mono focus:outline-none transition-colors"
            />
          </div>
          <button type="submit" className="btn-primary py-2.5 px-4 text-xs shrink-0">
            <span>Explore</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-white/[0.05] text-[11px] text-[#7B8E84] flex-wrap">
          <span className="font-semibold text-white/80">Direct Lookups:</span>
          <a
            href="https://explorer.korsh.org/richlist"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#00CC52] underline decoration-white/20"
          >
            Rich List
          </a>
          <span>•</span>
          <a
            href="https://explorer.korsh.org/masternodes"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#00CC52] underline decoration-white/20"
          >
            Masternodes
          </a>
          <span>•</span>
          <a
            href="https://pool.korsh.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#00CC52] underline decoration-white/20"
          >
            Mining Pool
          </a>
        </div>
      </div>

      {/* ================= 4. INSTITUTIONAL KPI BENTO GRID (FROM EXPLORER) ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* KPI 1: Yespower CPU Hashrate */}
        <div className="card p-4 space-y-2 bg-[#080C09]/90 border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#7B8E84] font-medium">Yespower Hashrate</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#00CC52]/10 text-[#00CC52] border border-[#00CC52]/30">
              POW
            </span>
          </div>
          <div className="font-heading font-black text-lg sm:text-xl text-white">
            {networkStats?.hashrate ? networkStats.hashrate : '7.87 KH/s'}
          </div>
          <p className="text-[10px] text-[#7B8E84] font-mono">N=256, r=8 (256 KB L2)</p>
        </div>

        {/* KPI 2: Mining Difficulty */}
        <div className="card p-4 space-y-2 bg-[#080C09]/90 border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#7B8E84] font-medium">Difficulty</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#00CC52]/10 text-[#00CC52] border border-[#00CC52]/30">
              LIVE
            </span>
          </div>
          <div className="font-heading font-black text-lg sm:text-xl text-[#00CC52]">
            {networkStats?.difficulty ? parseFloat(networkStats.difficulty).toFixed(4) : '0.1607'}
          </div>
          <p className="text-[10px] text-[#7B8E84] font-mono">Target: 20-block window</p>
        </div>

        {/* KPI 3: Circulating Supply */}
        <div className="card p-4 space-y-2 bg-[#080C09]/90 border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#7B8E84] font-medium">Supply</span>
            <span className="text-[9px] font-bold text-[#00CC52] font-mono">{supplyPct}%</span>
          </div>
          <div className="w-full bg-[#121A14] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#00CC52] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(1, parseFloat(supplyPct))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-[#7B8E84]">
            <span>{supplyNum.toLocaleString()} KSH</span>
            <span>10M Cap</span>
          </div>
        </div>

        {/* KPI 4: Masternodes Architecture */}
        <div className="card p-4 space-y-2 bg-[#080C09]/90 border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#7B8E84] font-medium">Masternodes</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FFB020]/10 text-[#FFB020] border border-[#FFB020]/30">
              30% SHARE
            </span>
          </div>
          <div className="font-heading font-black text-lg sm:text-xl text-white">
            1,500 <span className="text-xs font-normal text-[#7B8E84]">KSH Collateral</span>
          </div>
          <p className="text-[10px] text-[#7B8E84] font-mono">0.60 KSH / block subsidy</p>
        </div>
      </div>

      {/* ================= 5. LATEST MINED BLOCKS STREAM ================= */}
      {recentBlocks.length > 0 && (
        <div className="card space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-[#00CC52]" />
              <h3 className="font-heading font-bold text-sm sm:text-base text-white">
                Live Block Stream
              </h3>
            </div>
            <a
              href="https://explorer.korsh.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#00CC52] hover:underline flex items-center gap-1 font-medium"
            >
              <span>View Full Chain</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {recentBlocks.slice(0, 3).map((b, idx) => {
              const isCopied = copiedHash === b.blockhash;
              return (
                <div
                  key={b.blockindex}
                  className="p-3 rounded-xl bg-[#080C09] border border-white/[0.06] hover:border-[#00CC52]/30 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-xs">
                      #{b.blockindex.toLocaleString()}
                    </span>
                    <span className={idx === 0 ? 'badge-neon text-[9px]' : 'badge-dim text-[9px]'}>
                      {idx === 0 ? 'TIP BLOCK' : 'CONFIRMED'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#7B8E84] font-mono">
                    <span>Reward: <strong className="text-white">2.0 KSH</strong></span>
                    <span>{formatAgo(b.timestamp)}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#7B8E84] pt-1 border-t border-white/[0.04]">
                    <span className="truncate max-w-[130px]">{b.blockhash}</span>
                    <button
                      onClick={() => handleCopyHash(b.blockhash)}
                      className="hover:text-white transition-colors"
                      title="Copy block hash"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-[#00CC52]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= 6. RECENT ACCOUNT TRANSACTIONS ================= */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-[#7B8E84]">
              Latest confirmed transfers on your address
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
