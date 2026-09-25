import { useState } from 'react';
import { buildTransaction, kshToDuffs, duffsToKsh } from '../lib/transaction';
import { broadcastTx } from '../lib/api';
import { COIN } from '../lib/network';
import type { BalanceResponse } from '../lib/api';
import {
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface SendProps {
  address: string;
  privateKey: Uint8Array;
  balance: BalanceResponse | null;
  onDone: () => void;
}

type SendStep = 'form' | 'confirm' | 'sending' | 'success';

export function Send({ address, privateKey, balance, onDone }: SendProps) {
  const [step, setStep] = useState<SendStep>('form');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [feeRate, setFeeRate] = useState<number>(10); // default 10 duffs/byte
  const [error, setError] = useState<string | null>(null);
  const [txResult, setTxResult] = useState<{ txid: string; fee: number } | null>(null);
  const [copiedTxid, setCopiedTxid] = useState(false);

  const availableBalanceCoins = balance ? balance.balance / COIN : 0;
  const ADDRESS_RE = /^[SR][1-9A-HJ-NP-Za-km-z]{25,34}$/;

  const isValidAddress = ADDRESS_RE.test(toAddress.trim());
  const normalizedAmount = amount.replace(',', '.').trim();
  const parsedAmount = parseFloat(normalizedAmount);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= availableBalanceCoins;

  // Send Max handler: deduct estimated fee (~225 bytes * feeRate)
  const handleSendMax = () => {
    if (!balance || balance.balance <= 0) return;
    const estimatedFeeDuffs = 250 * feeRate;
    const maxSendableDuffs = Math.max(0, balance.balance - estimatedFeeDuffs);
    setAmount((maxSendableDuffs / COIN).toFixed(8).replace(/\.?0+$/, ''));
  };

  const handleStartConfirm = () => {
    if (!isValidAddress) {
      setError('Please enter a valid Korsh address (starts with S or R)');
      return;
    }
    if (!isValidAmount) {
      setError(`Amount must be between 0 and ${availableBalanceCoins.toFixed(8)} KSH`);
      return;
    }
    setError(null);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setStep('sending');
    setError(null);

    try {
      const amountDuffs = kshToDuffs(amount);
      const tx = await buildTransaction({
        fromAddress: address,
        toAddress: toAddress.trim(),
        amountDuffs,
        privateKey,
        feeRate,
      });

      const result = await broadcastTx(tx.hex);
      setTxResult({ txid: result.txid, fee: tx.fee });
      setStep('success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      setError(msg);
      setStep('confirm');
    }
  };

  const handleCopyTxid = () => {
    if (!txResult) return;
    navigator.clipboard.writeText(txResult.txid);
    setCopiedTxid(true);
    setTimeout(() => setCopiedTxid(false), 2000);
  };

  // ================= STEP: SUCCESS =================
  if (step === 'success' && txResult) {
    return (
      <div className="glass-card max-w-lg mx-auto p-6 sm:p-8 space-y-6 text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-[#00CC52]/15 text-[#00CC52] border border-[#00CC52]/30 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(0,204,82,0.3)]">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">
            Broadcast Successful!
          </h2>
          <p className="text-xs text-[#7B8E84] mt-1 font-mono">
            Transaction submitted to the Korsh P2P mempool
          </p>
        </div>

        <div className="card text-left space-y-3.5 bg-[#080C09] border-white/[0.08]">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#7B8E84]">Amount Sent</span>
            <span className="font-mono font-bold text-white text-sm">{amount} KSH</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[#7B8E84]">Miner Fee</span>
            <span className="font-mono text-[#00CC52]">{duffsToKsh(txResult.fee)} KSH</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[#7B8E84]">Recipient</span>
            <span className="font-mono text-white text-[11px] truncate max-w-[200px]">{toAddress}</span>
          </div>

          <div className="pt-2 border-t border-white/[0.06]">
            <p className="text-[#7B8E84] text-[11px] mb-1">Transaction Hash (TXID)</p>
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#050706] border border-white/[0.06]">
              <span className="font-mono text-xs text-[#00CC52] break-all select-all">
                {txResult.txid}
              </span>
              <button
                onClick={handleCopyTxid}
                className="p-1.5 rounded hover:bg-white/[0.05] text-[#7B8E84] hover:text-white shrink-0"
                title="Copy TXID"
              >
                {copiedTxid ? <Check className="w-4 h-4 text-[#00CC52]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={`https://explorer.korsh.org/tx/${txResult.txid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex-1 py-3 text-sm justify-center"
          >
            <span>View on Explorer</span>
            <ExternalLink className="w-4 h-4 text-[#00CC52]" />
          </a>
          <button onClick={onDone} className="btn-primary flex-1 py-3 text-sm justify-center">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ================= STEP: CONFIRM OR SENDING =================
  if (step === 'confirm' || step === 'sending') {
    const isSending = step === 'sending';
    return (
      <div className="glass-card max-w-lg mx-auto p-6 sm:p-8 space-y-6 animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#00CC52]/10 text-[#00CC52]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl text-white">
              Confirm Transaction
            </h2>
            <p className="text-xs text-[#7B8E84]">
              Verify destination and parameters before signing
            </p>
          </div>
        </div>

        <div className="card space-y-4 bg-[#080C09] border-white/[0.08]">
          <div>
            <span className="text-[11px] text-[#7B8E84] uppercase tracking-wider font-semibold">
              Sending To
            </span>
            <p className="font-mono text-sm text-white break-all bg-[#050706] p-3 rounded-xl mt-1 border border-white/[0.05]">
              {toAddress}
            </p>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
            <span className="text-xs text-[#7B8E84]">Transfer Amount</span>
            <span className="font-heading font-black text-xl text-white">{amount} <span className="text-[#00CC52] text-sm">KSH</span></span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-[#7B8E84]">Fee Rate</span>
            <span className="font-mono text-xs text-[#00CC52]">{feeRate} duffs/byte</span>
          </div>

          <div className="p-3 rounded-xl bg-[#FFB020]/10 border border-[#FFB020]/20 flex items-start gap-2.5 text-xs text-[#FFB020]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Transactions on the Korsh blockchain are permanent and cannot be reversed once broadcast.
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setStep('form')}
            disabled={isSending}
            className="btn-secondary flex-1 py-3 text-sm justify-center"
          >
            Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSending}
            className="btn-primary flex-1 py-3 text-sm justify-center"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#050706]" />
                <span>Signing & Broadcasting...</span>
              </>
            ) : (
              <>
                <span>Sign & Send</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ================= STEP: FORM =================
  return (
    <div className="glass-card max-w-lg mx-auto p-6 sm:p-8 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#00CC52]/10 text-[#00CC52]">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl text-white">
              Send Korsh
            </h2>
            <p className="text-xs text-[#7B8E84]">
              Transfer coins to any valid Korsh address
            </p>
          </div>
        </div>
        <span className="badge-neon text-[10px]">Client Signing</span>
      </div>

      {/* Recipient Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[#7B8E84] uppercase tracking-wider block">
          Recipient Address
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. SSb6YCCtCtM9EyJGTf48cz5ggqQTCGaypD"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value.trim())}
            className={`input-field pr-10 ${
              toAddress && !isValidAddress ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500' : ''
            }`}
          />
          {toAddress && isValidAddress && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#00CC52]">
              <Check className="w-4 h-4" />
            </div>
          )}
        </div>
        <p className="text-[11px] text-[#7B8E84] font-mono">
          Must begin with 'S' (P2PKH) or 'R' (P2SH)
        </p>
      </div>

      {/* Amount Input with MAX Button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-[#7B8E84] uppercase tracking-wider">
            Amount (KSH)
          </label>
          <div className="flex items-center gap-1.5 text-[#7B8E84]">
            <span>Available:</span>
            <span className="font-mono text-white font-medium">
              {availableBalanceCoins.toFixed(8)} KSH
            </span>
          </div>
        </div>

        <div className="relative">
          <input
            type="number"
            step="any"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field pr-20 text-lg font-mono font-bold"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSendMax}
              className="px-2 py-1 rounded-md text-[11px] font-bold bg-[#00CC52]/15 hover:bg-[#00CC52]/25 text-[#00CC52] transition-colors"
            >
              MAX
            </button>
            <span className="text-xs font-bold text-[#7B8E84] pr-2">KSH</span>
          </div>
        </div>
      </div>

      {/* Fee Rate Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[#7B8E84] uppercase tracking-wider block">
          Network Fee Priority
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFeeRate(5)}
            className={`p-3 rounded-xl border text-left transition-all ${
              feeRate === 5
                ? 'bg-[#00CC52]/10 border-[#00CC52] text-white'
                : 'bg-[#080C09] border-white/[0.08] text-[#7B8E84] hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>Economy</span>
              <span>5 duffs/B</span>
            </div>
            <p className="text-[10px] text-[#7B8E84] mt-0.5">~1-2 blocks</p>
          </button>

          <button
            type="button"
            onClick={() => setFeeRate(10)}
            className={`p-3 rounded-xl border text-left transition-all ${
              feeRate === 10
                ? 'bg-[#00CC52]/10 border-[#00CC52] text-white'
                : 'bg-[#080C09] border-white/[0.08] text-[#7B8E84] hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#00CC52]" />
                Fast
              </span>
              <span>10 duffs/B</span>
            </div>
            <p className="text-[10px] text-[#7B8E84] mt-0.5">Next block (~60s)</p>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handleStartConfirm}
        disabled={!toAddress || !amount || !isValidAddress || !isValidAmount}
        className="btn-primary w-full py-3.5 text-sm"
      >
        <span>Review Transaction</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
