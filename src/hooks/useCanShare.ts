import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { store } from "@/lib/store";

// One request for the whole page, however many share buttons it shows.
let allowSharingPromise: Promise<boolean> | null = null;
const loadAllowSharing = () => {
  if (!allowSharingPromise) {
    allowSharingPromise = store.getSiteSettings().then((s) => s?.allowSharing === true).catch(() => false);
  }
  return allowSharingPromise;
};

// Share buttons show to signed-in admins/sub-admins always, and to visitors only when Site Settings > "Visitors can
// share" is on (off until the admin turns it on).
export const useCanShare = (): boolean => {
  const { isAdmin, subAdminProfile } = useAuth();
  const [allowVisitors, setAllowVisitors] = useState(false);

  useEffect(() => {
    let active = true;
    loadAllowSharing().then((allowed) => { if (active) setAllowVisitors(allowed); });
    return () => { active = false; };
  }, []);

  return isAdmin || !!subAdminProfile || allowVisitors;
};
