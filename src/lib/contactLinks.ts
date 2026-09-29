import {
  Link2, CreditCard, Wallet, MessageCircle, Facebook, Instagram, Linkedin, Twitter,
  Youtube, Globe, HeartHandshake, Phone, Mail, MapPin, Smartphone, type LucideIcon,
} from "lucide-react";

// Icons the admin can pick for extra contact cards. Keys are stored in page settings.
export const CONTACT_ICONS: Record<string, { label: string; icon: LucideIcon }> = {
  link: { label: "Link", icon: Link2 },
  payment: { label: "Payment / Card", icon: CreditCard },
  wallet: { label: "Wallet / Mobile Money", icon: Wallet },
  mobile: { label: "Mobile", icon: Smartphone },
  donate: { label: "Donate / Support", icon: HeartHandshake },
  whatsapp: { label: "WhatsApp", icon: MessageCircle },
  facebook: { label: "Facebook", icon: Facebook },
  instagram: { label: "Instagram", icon: Instagram },
  linkedin: { label: "LinkedIn", icon: Linkedin },
  twitter: { label: "Twitter / X", icon: Twitter },
  youtube: { label: "YouTube", icon: Youtube },
  website: { label: "Website", icon: Globe },
  phone: { label: "Phone", icon: Phone },
  email: { label: "Email", icon: Mail },
  location: { label: "Location", icon: MapPin },
};

export const getContactIcon = (key: string): LucideIcon => CONTACT_ICONS[key]?.icon ?? Link2;

// Turns what the admin typed into a usable href: adds https://, mailto: or tel: when missing.
export const toHref = (raw: string): string => {
  const value = (raw || "").trim();
  if (!value) return "";
  if (/^javascript:/i.test(value)) return "";
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "mailto:" + value;
  if (/^\+?[\d\s()-]{7,}$/.test(value)) return "tel:" + value.replace(/[\s()-]/g, "");
  return "https://" + value;
};
