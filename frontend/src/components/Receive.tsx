import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowDownLeft,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Info,
} from 'lucide-react';

interface ReceiveProps {
  address: string;
}

export function Receive({ address }: ReceiveProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Korsh Address',
          text: address,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="glass-card max-w-lg mx-auto p-6 sm:p-8 space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#00CC52]/10 text-[#00CC52]">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl text-white">
              Receive KSH
            </h2>
            <p className="text-xs text-[#7B8E84]">
              Share your public address or QR code
            </p>
          </div>
        </div>
        <span className="badge-neon text-[10px]">Instant Inflow</span>
      </div>

      {/* QR Code Container */}
      <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#080C09] border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
        <div className="p-4 bg-white rounded-2xl shadow-[0_0_25px_rgba(0,204,82,0.15)]">
          <QRCodeSVG
            value={address}
            size={210}
            bgColor="#ffffff"
            fgColor="#050706"
            level="H"
            includeMargin={false}
          />
        </div>

        <p className="text-[11px] font-mono text-[#7B8E84] mt-4">
          Scan with mobile wallet or webapp camera
        </p>
      </div>

      {/* Address Details & Action Buttons */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-[#7B8E84] uppercase tracking-wider block">
          Your Public Korsh Address
        </label>

        <div className="p-3.5 rounded-xl bg-[#080C09] border border-white/[0.08] flex items-center justify-between gap-3">
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

        {/* Buttons Row */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button onClick={handleCopy} className="btn-primary py-3 text-sm justify-center">
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Address</span>
              </>
            )}
          </button>

          <button onClick={handleShare} className="btn-secondary py-3 text-sm justify-center">
            <Share2 className="w-4 h-4 text-[#00CC52]" />
            <span>{shared ? 'Shared!' : 'Share Address'}</span>
          </button>
        </div>
      </div>

      {/* Explorer Verification Link */}
      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#7B8E84]">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#00CC52]" />
          <span>Verify balance on public explorer</span>
        </div>
        <a
          href={`https://explorer.korsh.org/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00CC52] hover:text-[#00e65c] font-medium flex items-center gap-1 transition-colors"
        >
          <span>Open Explorer</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

    </div>
  );
}
