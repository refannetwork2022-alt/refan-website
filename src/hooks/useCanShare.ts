import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { store } from "@/lib/store";

// One request for the whole page, however many share buttons it shows.
let allowSharingPromise: Promise<boolean> | null = null;
const loadAllowSharing = () => {
  if (!allowSharingPromise) {
    allowSharingPromise = store.getSiteSettings().then((s) => s?.allowSharing !== false).catch(() => true);
  }
  return allowSharingPromise;
};

// Share buttons show to signed-in admins/sub-admins always, and to visitors unless the admin has turned
// Site Settings > "Visitors can share" off (on until then).
export const useCanShare = (): boolean => {
  const { isAdmin, subAdminProfile } = useAuth();
  const [allowVisitors, setAllowVisitors] = useState(true);

  useEffect(() => {
    let active = true;
    loadAllowSharing().then((allowed) => { if (active) setAllowVisitors(allowed); });
    return () => { active = false; };
  }, []);

  return isAdmin || !!subAdminProfile || allowVisitors;
};
