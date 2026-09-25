import React, { useState, useEffect } from 'react';
import logoEmblem from '../assets/logo-emblem-green.png';
import { ParticleBackground } from './ParticleBackground';
import { fetchNetworkStats, type NetworkStats } from '../lib/api';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Lock,
  LogOut,
  ExternalLink,
  Copy,
  Check,
  Cpu,
  ShieldCheck,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  address?: string | null;
  onLock?: () => void;
  onLogout?: () => void;
  showNav?: boolean;
  activeView?: string;
  onNavigate?: (view: string) => void;
}

export function Layout({
  children,
  address,
  onLock,
  onLogout,
  showNav,
  activeView,
  onNavigate,
}: LayoutProps) {
  const [copied, setCopied] = useState(false);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadStats() {
      try {
        const stats = await fetchNetworkStats();
        if (!cancelled && stats) {
          setNetworkStats(stats);
        }
      } catch {
        // Ignored, graceful fallback
      }
    }
    loadStats();
    const interval = setInterval(loadStats, 20000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleCopyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { id: 'dashboard', label: 'Wallet', icon: Wallet },
    { id: 'send', label: 'Send', icon: ArrowUpRight },
    { id: 'receive', label: 'Receive', icon: ArrowDownLeft },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#050706] text-[#E2ECE5] flex flex-col relative selection:bg-[#00CC52]/30 selection:text-white pb-20 md:pb-8">
      {/* Interactive Cyber Constellation Canvas & Ambient Radial Light */}
      <ParticleBackground />

      {/* ================= 1. INSTITUTIONAL TOP NAVBAR ================= */}
      <header className="sticky top-0 z-50 bg-[#080C09]/90 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand & Emblem Logo */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate && address) onNavigate('dashboard');
              }}
              className="flex items-center gap-2.5 group"
            >
              <div className="relative">
                <img
                  src={logoEmblem}
                  alt="Korsh"
                  className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-[0_0_12px_rgba(0,204,82,0.4)] group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-black tracking-wider text-base sm:text-lg text-white">
                    KORSH
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-widest bg-[#00CC52]/15 text-[#00CC52] border border-[#00CC52]/30">
                    WEBWALLET
                  </span>
                </div>
                <span className="text-[10px] text-[#7B8E84] hidden sm:block font-mono">
                  Non-Custodial • Yespower CPU
                </span>
              </div>
            </a>
          </div>

          {/* Center Links (Desktop only) */}
          <div className="hidden lg:flex items-center gap-5 text-xs text-[#7B8E84]">
            <a
              href="https://explorer.korsh.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00CC52] transition-colors flex items-center gap-1 font-medium"
            >
              <span>Block Explorer</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
            <span className="text-white/10">•</span>
            <a
              href="https://pool.korsh.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00CC52] transition-colors flex items-center gap-1 font-medium"
            >
              <span>Mining Pool</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>

          {/* Right Header Actions: Live Tip & Wallet Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Chain Tip Pill */}
            <div className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-[#0B100C] border border-white/[0.08] text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00CC52] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00CC52]"></span>
              </span>
              <span className="text-[#7B8E84] text-[11px] font-mono hidden sm:inline">TIP</span>
              <span className="font-mono font-bold text-[#00CC52] text-xs">
                #{networkStats?.blockcount ? networkStats.blockcount.toLocaleString() : '5,532'}
              </span>
            </div>

            {/* Address Pill (if unlocked) */}
            {address && (
              <button
                onClick={handleCopyAddress}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F1611] hover:bg-[#17221A] border border-white/[0.08] hover:border-[#00CC52]/30 text-xs font-mono transition-all text-[#E2ECE5]"
                title="Copy your address"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#00CC52]" />
                <span>{address.slice(0, 5)}...{address.slice(-5)}</span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-[#00CC52]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#7B8E84]" />
                )}
              </button>
            )}

            {/* Lock / Logout Buttons */}
            {address && (
              <div className="flex items-center gap-1.5">
                {onLock && (
                  <button
                    onClick={onLock}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#0F1611] hover:bg-[#17221A] border border-white/[0.08] hover:border-white/20 text-[#7B8E84] hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                    title="Lock wallet"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Lock</span>
                  </button>
                )}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-700/50 text-red-400 text-xs font-medium transition-colors flex items-center gap-1.5"
                    title="Logout (Purge keys from browser session)"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </header>

      {/* ================= 2. LIVE BLOCKCHAIN HUD / TICKER RIBBON ================= */}
      <div className="bg-[#080C09]/70 border-b border-white/[0.06] backdrop-blur-sm z-40 overflow-x-auto no-scrollbar py-2 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-6 text-[11px] whitespace-nowrap font-mono text-[#7B8E84]">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#00CC52]" />
              <span>Algorithm: <strong className="text-white font-medium">YespowerKorsh (CPU)</strong></span>
            </span>
            <span className="text-white/10 hidden sm:inline">|</span>
            <span className="hidden sm:inline">
              Block Target: <strong className="text-white font-medium">60s</strong>
            </span>
            <span className="text-white/10 hidden md:inline">|</span>
            <span className="hidden md:inline">
              Reward: <strong className="text-[#00CC52] font-semibold">2.0 KSH</strong> (70/30 Split)
            </span>
            <span className="text-white/10 hidden lg:inline">|</span>
            <span className="hidden lg:inline">
              Max Cap: <strong className="text-white font-medium">10,000,000 KSH</strong>
            </span>
          </div>

          <div className="flex items-center gap-5">
            <span>
              Diff: <strong className="text-[#00CC52]">{networkStats?.difficulty ? parseFloat(networkStats.difficulty).toFixed(4) : '0.1306'}</strong>
            </span>
            <span className="text-white/10">|</span>
            <span>
              Supply: <strong className="text-white">{networkStats?.supply ? networkStats.supply.toLocaleString() : '11,064'} KSH</strong>
            </span>
            <span className="text-white/10 hidden sm:inline">|</span>
            <span className="hidden sm:inline">
              Peers: <strong className="text-[#00CC52]">{networkStats?.connections || 18}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ================= 3. DESKTOP TABS NAVIGATION ================= */}
      {showNav && onNavigate && (
        <div className="border-b border-white/[0.06] bg-[#080C09]/50 backdrop-blur-md z-40 hidden md:block">
          <div className="max-w-4xl mx-auto px-4 flex gap-2">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onNavigate(tab.id)}
                  className={`px-5 py-3.5 text-sm font-semibold transition-all flex items-center gap-2 border-b-2 ${
                    isActive
                      ? 'border-[#00CC52] text-[#00CC52] shadow-[0_2px_12px_rgba(0,204,82,0.25)]'
                      : 'border-transparent text-[#7B8E84] hover:text-white hover:border-white/20'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00CC52]' : 'text-[#7B8E84]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= 4. MAIN WORKSPACE / CONTENT AREA ================= */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 z-10">
        {children}
      </main>

      {/* ================= 5. MOBILE WEBAPP BOTTOM DOCK NAVIGATION ================= */}
      {showNav && onNavigate && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#080C09]/95 backdrop-blur-2xl border-t border-white/[0.08] px-2 py-1.5 safe-area-bottom">
          <div className="flex items-center justify-around">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onNavigate(tab.id)}
                  className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all ${
                    isActive
                      ? 'text-[#00CC52]'
                      : 'text-[#7B8E84] hover:text-[#E2ECE5]'
                  }`}
                >
                  <div className={`p-1 rounded-lg ${isActive ? 'bg-[#00CC52]/15' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium mt-0.5 tracking-tight">
                    {tab.label}
                  </span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-[#00CC52] mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* ================= 6. INSTITUTIONAL FOOTER ================= */}
      <footer className="mt-auto border-t border-white/[0.06] bg-[#080C09]/40 py-6 text-xs text-[#7B8E84] z-10 hidden md:block">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00CC52]" />
            <span>Korsh WebWallet • 100% Client-Side Cryptography</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <a href="https://explorer.korsh.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Live Explorer
            </a>
            <span>•</span>
            <a href="https://github.com/ELPilotPR/Korsh-WebWallet" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              GitHub Repo
            </a>
            <span>•</span>
            <span>Port 9777 P2P</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
