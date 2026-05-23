'use client';

import { useState, useTransition } from 'react';
import { changeAdminPassword, saveIdentitySettings, saveFrontendSettings } from './actions';

interface Props {
  initialPortalName: string;
  initialSubscriptionPopup: boolean;
  initialPopupDelay: number;
  initialFabEnabled: boolean;
}

type Msg = { text: string; ok: boolean } | null;

export default function AdminSettingsClient({
  initialPortalName,
  initialSubscriptionPopup,
  initialPopupDelay,
  initialFabEnabled,
}: Props) {
  // ── Password state ─────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<Msg>(null);
  const [passwordPending, startPasswordTransition] = useTransition();

  // ── Identity state ─────────────────────────────────────────────────────
  const [portalName, setPortalName] = useState(initialPortalName);
  const [identityMsg, setIdentityMsg] = useState<Msg>(null);
  const [identityPending, startIdentityTransition] = useTransition();

  // ── Frontend controls state ────────────────────────────────────────────
  const [subscriptionPopup, setSubscriptionPopup] = useState(initialSubscriptionPopup);
  const [popupDelay, setPopupDelay] = useState(initialPopupDelay);
  const [fabEnabled, setFabEnabled] = useState(initialFabEnabled);
  const [frontendMsg, setFrontendMsg] = useState<Msg>(null);
  const [frontendPending, startFrontendTransition] = useTransition();

  // ── Handlers ───────────────────────────────────────────────────────────

  function handlePasswordUpdate() {
    setPasswordMsg(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ text: 'All password fields are required.', ok: false });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', ok: false });
      return;
    }
    if (newPassword.length < 12) {
      setPasswordMsg({ text: 'New password must be at least 12 characters.', ok: false });
      return;
    }
    startPasswordTransition(async () => {
      const result = await changeAdminPassword(currentPassword, newPassword);
      setPasswordMsg({ text: result.message, ok: result.ok });
      if (result.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    });
  }

  function handleIdentitySave() {
    setIdentityMsg(null);
    startIdentityTransition(async () => {
      const result = await saveIdentitySettings(portalName);
      setIdentityMsg({ text: result.message, ok: result.ok });
    });
  }

  function handleFrontendApply() {
    setFrontendMsg(null);
    startFrontendTransition(async () => {
      const result = await saveFrontendSettings(subscriptionPopup, popupDelay, fabEnabled);
      setFrontendMsg({ text: result.message, ok: result.ok });
    });
  }

  // ── Input class helper ─────────────────────────────────────────────────
  const inputClass =
    'w-full bg-[#f9f9f9] border border-[#c6c5d4] rounded-md px-3 py-2 text-sm text-[#1a1c1c] focus:border-[#000666] focus:ring-1 focus:ring-[#000666] outline-none transition-colors';

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#1a1c1c] tracking-tight">Settings Configuration</h2>
        <p className="text-sm text-[#454652] mt-1">
          Manage parameters, security credentials, and portal interface controls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── Left Column ── */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Account Security */}
          <section className="bg-white border border-[#c6c5d4] rounded-xl p-6">
            <div className="border-b border-[#c6c5d4] pb-3 mb-6">
              <h3 className="text-lg font-semibold text-[#000666] flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">lock</span>
                Account Security
              </h3>
              <p className="text-sm text-[#454652] mt-1">Update administrator authentication credentials.</p>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1" htmlFor="current_password">
                  Current Password
                </label>
                <input
                  id="current_password"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1" htmlFor="new_password">
                  New Password
                </label>
                <input
                  id="new_password"
                  type="password"
                  placeholder="Create new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                />
                <p className="text-[11px] text-[#767683] mt-1">
                  Must be at least 12 characters and include complexity requirements.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1" htmlFor="confirm_password">
                  Confirm New Password
                </label>
                <input
                  id="confirm_password"
                  type="password"
                  placeholder="Verify new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                />
              </div>

              {passwordMsg && (
                <p className={`text-sm font-medium ${passwordMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordMsg.ok ? '✓' : '✗'} {passwordMsg.text}
                </p>
              )}

              <div className="flex justify-end mt-2">
                <button
                  onClick={handlePasswordUpdate}
                  disabled={passwordPending}
                  className="bg-[#000666] text-white text-xs font-bold uppercase tracking-wider rounded-md px-6 py-2.5 hover:bg-[#1a237e] transition-colors shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {passwordPending && (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Update Password
                </button>
              </div>
            </div>
          </section>

          {/* Platform Identity */}
          <section className="bg-white border border-[#c6c5d4] rounded-xl p-6">
            <div className="border-b border-[#c6c5d4] pb-3 mb-6">
              <h3 className="text-lg font-semibold text-[#000666] flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">badge</span>
                Platform Identity
              </h3>
              <p className="text-sm text-[#454652] mt-1">Manage public-facing portal branding and nomenclature.</p>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1" htmlFor="site_name">
                  Official Portal Name
                </label>
                <input
                  id="site_name"
                  type="text"
                  value={portalName}
                  onChange={(e) => setPortalName(e.target.value)}
                  className={inputClass}
                />
              </div>
              {/* <div> For logo change/upload
                <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1">
                  Departmental Logo
                </label>
                <div className="mt-1 border-2 border-dashed border-[#c6c5d4] bg-[#f9f9f9] rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-[#eeeeee] transition-colors">
                  <span className="material-symbols-outlined text-[#767683] text-4xl mb-2">upload_file</span>
                  <span className="text-xs font-semibold text-[#000666] mb-1">Click to upload or drag and drop</span>
                  <span className="text-[11px] text-[#767683]">SVG, PNG, JPG (Max 2MB)</span>
                </div>
              </div> */}

              {identityMsg && (
                <p className={`text-sm font-medium ${identityMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {identityMsg.ok ? '✓' : '✗'} {identityMsg.text}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleIdentitySave}
                  disabled={identityPending}
                  className="bg-[#000666] text-white text-xs font-bold uppercase tracking-wider rounded-md px-6 py-2.5 hover:bg-[#1a237e] transition-colors shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {identityPending && (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Save Identity
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* ── Right Column ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Frontend Controls */}
          <section className="bg-white border border-[#c6c5d4] rounded-xl p-6">
            <div className="border-b border-[#c6c5d4] pb-3 mb-6">
              <h3 className="text-lg font-semibold text-[#000666] flex items-center gap-2">
                Frontend Controls
              </h3>
              <p className="text-sm text-[#454652] mt-1">Adjust user interface behaviors.</p>
            </div>

            <div className="flex flex-col gap-6">
              {/* Email Subscription Toggle */}
              <div className="flex flex-col gap-3 pb-5 border-b border-[#e8e8e8]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-[#1a1c1c]">Email Subscription Pop-up</div>
                    <div className="text-[11px] text-[#767683]">Display newsletter popup to site visitors.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={subscriptionPopup}
                      onChange={(e) => setSubscriptionPopup(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-[#c6c5d4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c5d4] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#000666]"></div>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1" htmlFor="popup_delay">
                    Pop-up Delay (Seconds)
                  </label>
                  <input
                    id="popup_delay"
                    type="number"
                    min={1}
                    max={300}
                    value={popupDelay}
                    onChange={(e) => setPopupDelay(Number(e.target.value))}
                    className="w-full max-w-[120px] bg-[#f9f9f9] border border-[#c6c5d4] rounded-md px-3 py-2 text-sm text-[#1a1c1c] focus:border-[#000666] focus:ring-1 focus:ring-[#000666] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Floating Action Button Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#1a1c1c]">Floating Action Button (FAB)</div>
                  <div className="text-[11px] text-[#767683]">Show global &lsquo;Post a Job&rsquo; button.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={fabEnabled}
                    onChange={(e) => setFabEnabled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-[#c6c5d4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c5d4] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#000666]"></div>
                </label>
              </div>

              {frontendMsg && (
                <p className={`text-sm font-medium ${frontendMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {frontendMsg.ok ? '✓' : '✗'} {frontendMsg.text}
                </p>
              )}

              <div className="flex justify-end pt-2 mt-2 border-t border-[#e8e8e8]">
                <button
                  onClick={handleFrontendApply}
                  disabled={frontendPending}
                  className="border border-[#767683] text-[#1a1c1c] text-xs font-semibold rounded-md px-5 py-2 hover:bg-[#eeeeee] transition-colors active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {frontendPending && (
                    <span className="w-3.5 h-3.5 border-2 border-[#1a1c1c] border-t-transparent rounded-full animate-spin" />
                  )}
                  Apply Changes
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
