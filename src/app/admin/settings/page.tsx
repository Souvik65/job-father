import { getSiteSettings } from './actions';
import AdminSettingsClient from './AdminSettingsClient';

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <AdminSettingsClient
      initialPortalName={settings.portalName ?? 'Jobfather'}
      initialSubscriptionPopup={settings.subscriptionPopup ? settings.subscriptionPopup === 'true' : true}
      initialPopupDelay={Number(settings.popupDelay ?? 5)} // Default to 5 seconds if not set
      initialFabEnabled={settings.fabEnabled ? settings.fabEnabled === 'true' : false}
    />
  );
}
