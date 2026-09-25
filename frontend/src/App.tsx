import { Layout } from './components/Layout';
import logoEmblem from './assets/logo-emblem-green.png';
import { CreateWallet } from './components/CreateWallet';
import { BackupMnemonic } from './components/BackupMnemonic';
import { UnlockWallet } from './components/UnlockWallet';
import { ImportWallet } from './components/ImportWallet';
import { Dashboard } from './components/Dashboard';
import { Send } from './components/Send';
import { Receive } from './components/Receive';
import { History } from './components/History';
import { useWallet, type WalletView } from './hooks/useWallet';
import {
  Shield,
  Key,
  Cpu,
  ArrowRight,
  Download,
  ExternalLink,
} from 'lucide-react';

function App() {
  const wallet = useWallet();

  const isLoggedIn = !!wallet.privateKey && !!wallet.walletData;
  const navViews = ['dashboard', 'send', 'receive', 'history'];

  const renderContent = () => {
    switch (wallet.view) {
      case 'landing':
        return (
          <div className="space-y-10 py-6 sm:py-12 animate-fadeIn max-w-2xl mx-auto text-center">
            
            {/* Hero Emblem & Heading */}
            <div className="space-y-4">
              <div className="relative inline-block">
                <img
                  src={logoEmblem}
                  alt="Korsh"
                  className="w-20 h-20 sm:w-24 sm:h-24 mx-auto object-contain drop-shadow-[0_0_30px_rgba(0,204,82,0.5)] animate-pulse"
                />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00CC52]/10 border border-[#00CC52]/30 text-xs font-semibold text-[#00CC52] mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00CC52] animate-ping" />
                  <span>Korsh Mainnet Live Client</span>
                </div>

                <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
                  KORSH WEBWALLET
                </h1>
                
                <p className="text-xs sm:text-sm text-[#7B8E84] mt-3 max-w-md mx-auto leading-relaxed">
                  Decentralized, non-custodial gateway for the Korsh blockchain. Your private keys are derived and encrypted locally in your browser.
                </p>
              </div>
            </div>

            {/* Bento Security Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="p-4 rounded-2xl bg-[#080C09]/90 border border-white/[0.08] hover:border-[#00CC52]/30 transition-colors">
                <div className="p-2 rounded-xl bg-[#00CC52]/10 text-[#00CC52] w-fit mb-2.5">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white font-heading">
                  100% Client-Side
                </h3>
                <p className="text-[11px] text-[#7B8E84] mt-1 leading-relaxed">
                  AES-GCM 256-bit with PBKDF2 (600,000 rounds). Keys never leave memory.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#080C09]/90 border border-white/[0.08] hover:border-[#00CC52]/30 transition-colors">
                <div className="p-2 rounded-xl bg-[#00CC52]/10 text-[#00CC52] w-fit mb-2.5">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white font-heading">
                  Self-Custody BIP44
                </h3>
                <p className="text-[11px] text-[#7B8E84] mt-1 leading-relaxed">
                  Standard 12-word seed (coin_type 5001). Recoverable anywhere.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#080C09]/90 border border-white/[0.08] hover:border-[#00CC52]/30 transition-colors">
                <div className="p-2 rounded-xl bg-[#00CC52]/10 text-[#00CC52] w-fit mb-2.5">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white font-heading">
                  Yespower CPU
                </h3>
                <p className="text-[11px] text-[#7B8E84] mt-1 leading-relaxed">
                  ASIC-resistant CPU blockchain with 60s block target and masternodes.
                </p>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-3 max-w-sm mx-auto pt-2">
              <button
                onClick={() => wallet.setView('create')}
                className="btn-primary w-full py-4 text-sm justify-center group"
              >
                <span>Create New Wallet Vault</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => wallet.setView('import')}
                className="btn-secondary w-full py-3.5 text-sm justify-center"
              >
                <Download className="w-4 h-4 text-[#00CC52]" />
                <span>Restore with 12 Words</span>
              </button>
            </div>

            {/* Network Links Footer */}
            <div className="pt-4 flex items-center justify-center gap-4 text-xs text-[#7B8E84] font-mono">
              <a
                href="https://explorer.korsh.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00CC52] transition-colors flex items-center gap-1"
              >
                <span>Official Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span>•</span>
              <a
                href="https://pool.korsh.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00CC52] transition-colors flex items-center gap-1"
              >
                <span>Mining Pool</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>
        );

      case 'create':
        return (
          <CreateWallet
            onSubmit={wallet.handleCreate}
            onBack={() => wallet.setView('landing')}
            loading={wallet.loading}
            error={wallet.error}
          />
        );

      case 'create-backup':
        return wallet.mnemonic ? (
          <BackupMnemonic
            mnemonic={wallet.mnemonic}
            onConfirm={() => wallet.setView('unlock')}
          />
        ) : null;

      case 'import':
        return (
          <ImportWallet
            onImport={wallet.handleImport}
            onBack={() => wallet.setView('landing')}
            loading={wallet.loading}
            error={wallet.error}
          />
        );

      case 'unlock':
        return wallet.walletData ? (
          <UnlockWallet
            address={wallet.walletData.address}
            onUnlock={wallet.handleUnlock}
            onLogout={wallet.handleLogout}
            loading={wallet.loading}
            error={wallet.error}
          />
        ) : null;

      case 'dashboard':
        return wallet.walletData ? (
          <Dashboard
            address={wallet.walletData.address}
            balance={wallet.balance}
            onRefresh={wallet.refreshBalance}
            onSend={() => wallet.setView('send')}
            onReceive={() => wallet.setView('receive')}
            onViewHistory={() => wallet.setView('history')}
          />
        ) : null;

      case 'send':
        return wallet.walletData && wallet.privateKey ? (
          <Send
            address={wallet.walletData.address}
            privateKey={wallet.privateKey}
            balance={wallet.balance}
            onDone={() => {
              wallet.refreshBalance();
              wallet.setView('dashboard');
            }}
          />
        ) : null;

      case 'receive':
        return wallet.walletData ? (
          <Receive address={wallet.walletData.address} />
        ) : null;

      case 'history':
        return wallet.walletData ? (
          <History address={wallet.walletData.address} />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <Layout
      address={isLoggedIn ? wallet.walletData?.address : null}
      onLock={wallet.handleLock}
      onLogout={wallet.handleLogout}
      showNav={isLoggedIn && navViews.includes(wallet.view)}
      activeView={wallet.view}
      onNavigate={(v) => wallet.setView(v as WalletView)}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
