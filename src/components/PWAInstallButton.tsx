import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ApkExportModal } from './ApkExportModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'pill' | 'header' | 'footer' | 'prominent';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showApkModal, setShowApkModal] = useState(false);

  // If already running as installed APK / standalone, we can still show the "App Active" or mobile options
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={() => {
            if (isInstallable) {
              install();
            } else {
              setShowApkModal(true);
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500/15 to-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 hover:border-amber-400 transition shadow-sm ${className}`}
          title="Install App / Convert to APK"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Install APK / App</span>
        </button>
      )}

      {variant === 'prominent' && (
        <div className={`p-4 rounded-xl bg-slate-900 border border-amber-500/30 text-white shadow-xl ${className}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-100">Install Kretz Mobile APK</h4>
                <p className="text-xs text-slate-400">Run standalone with biometric lock & offline storage.</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (isInstallable) {
                  install();
                } else {
                  setShowApkModal(true);
                }
              }}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              {isInstallable ? 'Install Now' : 'APK Options'}
            </button>
          </div>
        </div>
      )}

      {/* APK Export & Install Modal */}
      <ApkExportModal isOpen={showApkModal} onClose={() => setShowApkModal(false)} />
    </>
  );
};
