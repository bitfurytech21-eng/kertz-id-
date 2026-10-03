import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ApkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkExportModal: React.FC<ApkExportModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isAndroid, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'instant' | 'capacitor' | 'pwabuilder'>('instant');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const capacitorCommands = `# 1. Build web production bundle
npm run build

# 2. Initialize Capacitor Android project
npx @capacitor/cli init "Kretz Legal" "site.kretz.legal" --web-dir "dist"

# 3. Add Android native platform
npm install @capacitor/core @capacitor/android
npx cap add android

# 4. Sync web assets into Android project
npx cap sync android

# 5. Open in Android Studio or build APK via CLI
npx cap open android
# Or generate debug APK directly:
cd android && ./gradlew assembleDebug`;

  const bubblewrapCommands = `# 1. Install Google Bubblewrap CLI for Trusted Web Activity (TWA)
npm install -g @bubblewrap/cli

# 2. Initialize Android APK from live URL
bubblewrap init --manifest="${window.location.origin}/manifest.webmanifest"

# 3. Build signed APK / AAB
bubblewrap build`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-white tracking-wide flex items-center gap-2">
                Convert & Install Android APK
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-sans font-medium">
                  Mobile Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Install as native standalone Android WebAPK or package to custom .apk
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('instant')}
            className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'instant'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            1. Instant WebAPK (1-Tap)
          </button>
          <button
            onClick={() => setActiveTab('pwabuilder')}
            className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'pwabuilder'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            2. PWABuilder APK Generator
          </button>
          <button
            onClick={() => setActiveTab('capacitor')}
            className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'capacitor'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            3. Native Capacitor / CLI APK
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 space-y-5">
          {activeTab === 'instant' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-200 text-sm flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-300">Native Android WebAPK Generation</div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Android devices automatically mint and compile an official <strong>WebAPK</strong> when you install this app. It runs as a true standalone Android app with full screen view, dedicated launcher icon, secure sandbox, and offline support.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src="/pwa-192x192.png"
                    alt="App Icon"
                    className="w-14 h-14 rounded-2xl shadow-lg border border-amber-500/30"
                  />
                  <div>
                    <div className="font-semibold text-white">Kretz Legal Property Workspace</div>
                    <div className="text-xs text-slate-400">Package: site.kretz.legal • Version 1.0.0</div>
                    <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Secure AES-256 Storage & Offline Capable
                    </div>
                  </div>
                </div>

                {isInstallable ? (
                  <button
                    onClick={() => {
                      install();
                      onClose();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Install WebAPK Now
                  </button>
                ) : isAndroid ? (
                  <div className="text-xs text-slate-300 bg-slate-900 px-3 py-2 rounded-lg border border-slate-700">
                    Tap <span className="text-amber-400 font-semibold">⋮ (Menu)</span> in Chrome → <span className="text-amber-400 font-semibold">"Install App"</span>
                  </div>
                ) : isIOS ? (
                  <div className="text-xs text-slate-300 bg-slate-900 px-3 py-2 rounded-lg border border-slate-700">
                    Tap <span className="text-amber-400 font-semibold">Share</span> in Safari → <span className="text-amber-400 font-semibold">"Add to Home Screen"</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      install();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Install App on Device
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs">
                  <div className="font-semibold text-white mb-1">1. Full Standalone UI</div>
                  <div className="text-slate-400">Runs without browser address bars, just like an APK from Play Store.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs">
                  <div className="font-semibold text-white mb-1">2. Offline Storage</div>
                  <div className="text-slate-400">Assets and transaction shells are cached locally with Service Worker.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs">
                  <div className="font-semibold text-white mb-1">3. Biometric / PIN</div>
                  <div className="text-slate-400">Compatible with Android fingerprint and secure screen locks.</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pwabuilder' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                PWABuilder (by Microsoft & Google) generates ready-to-publish <strong>signed APK / AAB packages</strong> for Google Play Store or direct sideloading from your manifest.
              </p>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-white">Direct URL for APK Packaging:</div>
                  <button
                    onClick={() => copyToClipboard(window.location.origin, 'url')}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    {copiedCode === 'url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode === 'url' ? 'Copied' : 'Copy URL'}
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-xs text-amber-300 break-all border border-slate-800">
                  {typeof window !== 'undefined' ? window.location.origin : 'https://kretz.site'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-200">How to generate .apk with PWABuilder:</div>
                <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 pl-1">
                  <li>Visit <strong>PWABuilder.com</strong> in your browser.</li>
                  <li>Paste this app's URL and click <strong>"Start"</strong>.</li>
                  <li>Select <strong>"Android"</strong> and click <strong>"Generate Package"</strong>.</li>
                  <li>Download the generated <strong>.apk</strong> (for testing) or <strong>.aab</strong> (for Google Play).</li>
                </ol>
              </div>

              <div className="pt-2 flex justify-end">
                <a
                  href={`https://www.pwabuilder.com?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in PWABuilder Generator
                </a>
              </div>
            </div>
          )}

          {activeTab === 'capacitor' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300">
                  Run these CLI commands in your local terminal to compile a standalone Android APK using <strong>Capacitor</strong>:
                </p>
                <button
                  onClick={() => copyToClipboard(capacitorCommands, 'cap')}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 border border-slate-700"
                >
                  {copiedCode === 'cap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode === 'cap' ? 'Copied' : 'Copy Commands'}
                </button>
              </div>

              <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto max-h-56">
                <pre>{capacitorCommands}</pre>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs">
                <div className="text-slate-300">
                  <span className="font-semibold text-white">Bubblewrap CLI Alternative (TWA):</span>
                  <div className="text-slate-400 text-[11px]">Official Google tool to package PWAs into signed Google Play APKs</div>
                </div>
                <button
                  onClick={() => copyToClipboard(bubblewrapCommands, 'bubble')}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700"
                >
                  {copiedCode === 'bubble' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy TWA
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>PWA Manifest & Service Worker Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
