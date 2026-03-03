import { db } from "@/integrations/firebase/client";
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, setDoc,
  query, orderBy, getCountFromServer, increment,
  where, limit,
} from "firebase/firestore";

// ── Interfaces (unchanged) ──────────────────────────────────

export interface Announcement {
  id: string;
  title: string;
  content: string;
  image?: string;
  video?: string;
  donationCount: number;
}

export interface Story {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image?: string;
  video?: string;
  date: string;
  category: 'story' | 'announcement';
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image?: string;
  author: string;
  date: string;
  tags: string[];
}

export interface GalleryItem {
  id: string;
  title: string;
  url: string;
  type: 'photo' | 'video';
  date: string;
}

export interface VolunteerSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  type: 'volunteer' | 'sponsor';
  message: string;
  date: string;
}

export interface DonationSubmission {
  id: string;
  name: string;
  email: string;
  amount: number;
  currency: string;
  message: string;
  date: string;
}

export interface Member {
  id: string;
  regNumber: string;
  surname: string;
  firstName: string;
  otherName: string;
  email: string;
  countryOfOrigin: string;
  countryOfResidence: string;
  unhcrId: string;
  phone: string;
  phoneCode: string;
  gender: string;
  maritalStatus: string;
  dateOfBirth: string;
  familySize: number;
  photo: string;
  document: string;
  paymentCurrency: string;
  paymentAmount: number;
  registrationDate: string;
  expiryDate: string;
  branchName: string;
  username: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  date: string;
}

export interface FooterSettings {
  email: string;
  phone: string;
  address: string;
  whatsapp: string;
  linkedin: string;
  description: string;
}

export interface HeroSettings {
  heroImage: string;
  tagline: string;
  title: string;
  subtitle: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
}

// ── Helpers ─────────────────────────────────────────────────

function ts(d?: any): string {
  if (!d) return new Date().toISOString();
  if (d.toDate) return d.toDate().toISOString();
  return String(d);
}

async function getAll<T>(col: string, orderField: string): Promise<T[]> {
  try {
    const q = query(collection(db, col), orderBy(orderField, "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as T);
  } catch (e) { console.error(`get ${col}:`, e); return []; }
}

// ── Async store (Firestore) ─────────────────────────────────

export const store = {
  // ─── Stories ────────────────────────────────
  getStories: async (): Promise<Story[]> => {
    try {
      const q = query(collection(db, "stories"), orderBy("date", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const r = d.data();
        return { id: d.id, title: r.title, excerpt: r.excerpt, content: r.content, image: r.image || undefined, video: r.video || undefined, date: ts(r.date), category: r.category };
      });
    } catch (e) { console.error("getStories:", e); return []; }
  },
  addStory: async (item: Omit<Story, 'id'>): Promise<Story | null> => {
    try {
      const ref = await addDoc(collection(db, "stories"), {
        title: item.title, excerpt: item.excerpt, content: item.content,
        image: item.image || null, video: item.video || null, category: item.category, date: item.date, created_at: new Date().toISOString(),
      });
      return { id: ref.id, ...item };
    } catch (e) { console.error("addStory:", e); return null; }
  },
  updateStory: async (id: string, item: Partial<Story>): Promise<boolean> => {
    try {
      const updates: any = {};
      if (item.title !== undefined) updates.title = item.title;
      if (item.excerpt !== undefined) updates.excerpt = item.excerpt;
      if (item.content !== undefined) updates.content = item.content;
      if (item.image !== undefined) updates.image = item.image;
      if (item.video !== undefined) updates.video = item.video;
      if (item.category !== undefined) updates.category = item.category;
      if (item.date !== undefined) updates.date = item.date;
      await updateDoc(doc(db, "stories", id), updates);
      return true;
    } catch (e) { console.error("updateStory:", e); return false; }
  },
  deleteStory: async (id: string): Promise<boolean> => {
    try { await deleteDoc(doc(db, "stories", id)); return true; }
    catch (e) { console.error("deleteStory:", e); return false; }
  },

  // ─── Blog Posts ─────────────────────────────
  getBlogs: async (): Promise<BlogPost[]> => {
    try {
      const q = query(collection(db, "blog_posts"), orderBy("date", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const r = d.data();
        return { id: d.id, title: r.title, excerpt: r.excerpt, content: r.content, image: r.image || undefined, author: r.author, date: ts(r.date), tags: r.tags || [] };
      });
    } catch (e) { console.error("getBlogs:", e); return []; }
  },
  addBlog: async (item: Omit<BlogPost, 'id'>): Promise<BlogPost | null> => {
    try {
      const ref = await addDoc(collection(db, "blog_posts"), {
        title: item.title, excerpt: item.excerpt, content: item.content,
        image: item.image || null, author: item.author, tags: item.tags, date: item.date, created_at: new Date().toISOString(),
      });
      return { id: ref.id, ...item };
    } catch (e) { console.error("addBlog:", e); return null; }
  },
  updateBlog: async (id: string, item: Partial<BlogPost>): Promise<boolean> => {
    try {
      const updates: any = {};
      if (item.title !== undefined) updates.title = item.title;
      if (item.excerpt !== undefined) updates.excerpt = item.excerpt;
      if (item.content !== undefined) updates.content = item.content;
      if (item.image !== undefined) updates.image = item.image;
      if (item.author !== undefined) updates.author = item.author;
      if (item.tags !== undefined) updates.tags = item.tags;
      if (item.date !== undefined) updates.date = item.date;
      await updateDoc(doc(db, "blog_posts", id), updates);
      return true;
    } catch (e) { console.error("updateBlog:", e); return false; }
  },
  deleteBlog: async (id: string): Promise<boolean> => {
    try { await deleteDoc(doc(db, "blog_posts", id)); return true; }
    catch (e) { console.error("deleteBlog:", e); return false; }
  },

  // ─── Gallery ────────────────────────────────
  getGallery: async (): Promise<GalleryItem[]> => {
    try {
      const q = query(collection(db, "gallery_items"), orderBy("date", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const r = d.data();
        return { id: d.id, title: r.title, url: r.url, type: r.type, date: ts(r.date) };
      });
    } catch (e) { console.error("getGallery:", e); return []; }
  },
  addGalleryItem: async (item: Omit<GalleryItem, 'id'>): Promise<GalleryItem | null> => {
    try {
      const ref = await addDoc(collection(db, "gallery_items"), {
        title: item.title, url: item.url, type: item.type, date: item.date, created_at: new Date().toISOString(),
      });
      return { id: ref.id, ...item };
    } catch (e) { console.error("addGalleryItem:", e); return null; }
  },
  deleteGalleryItem: async (id: string): Promise<boolean> => {
    try { await deleteDoc(doc(db, "gallery_items", id)); return true; }
    catch (e) { console.error("deleteGalleryItem:", e); return false; }
  },

  // ─── Volunteers ─────────────────────────────
  getVolunteers: async (): Promise<VolunteerSubmission[]> => {
    try {
      const q = query(collection(db, "volunteer_submissions"), orderBy("created_at", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const r = d.data();
        return { id: d.id, name: r.name, email: r.email, phone: r.phone, country: r.country || '', type: r.type, message: r.message, date: r.date || ts(r.created_at) };
      });
    } catch (e) { console.error("getVolunteers:", e); return []; }
  },
  addVolunteer: async (item: Omit<VolunteerSubmission, 'id'>): Promise<VolunteerSubmission | null> => {
    try {
      const ref = await addDoc(collection(db, "volunteer_submissions"), {
        name: item.name, email: item.email, phone: item.phone, country: item.country,
        type: item.type, message: item.message, date: item.date, created_at: new Date().toISOString(),
      });
      return { id: ref.id, ...item };
    } catch (e) { console.error("addVolunteer:", e); return null; }
  },
  deleteVolunteer: async (id: string): Promise<boolean> => {
    try { await deleteDoc(doc(db, "volunteer_submissions", id)); return true; }
    catch (e) { console.error("deleteVolunteer:", e); return false; }
  },

  // ─── Donations ──────────────────────────────
  getDonations: async (): Promise<DonationSubmission[]> => {
    try {
      const q = query(collection(db, "donation_submissions"), orderBy("created_at", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const r = d.data();
        return { id: d.id, name: r.name, email: r.email, amount: Number(r.amount), currency: r.currency || '', message: r.message, date: r.date || ts(r.created_at) };
      });
    } catch (e) { console.error("getDonations:", e); return []; }
  },
  addDonation: async (item: Omit<DonationSubmission, 'id'>): Promise<DonationSubmission | null> => {
    try {
      const ref = await addDoc(collection(db, "donation_submissions"), {
        name: item.name, email: item.email, amount: item.amount, currency: item.currency,
        message: item.message, date: item.date, created_at: new Date().toISOString(),
      });
      return { id: ref.id, ...item };
    } catch (e) { console.error("addDonation:", e); return null; }
  },
  deleteDonation: async (id: string): Promise<boolean> => {
    try { await deleteDoc(doc(db, "donation_submissions", id)); return true; }
    catch (e) { console.error("deleteDonation:", e); return false; }
  },

  // ─── Newsletter Subscribers ─────────────────
  getSubscribers: async (): Promise<NewsletterSubscriber[]> => {
    try {
      const q = query(collection(db, "newsletter_subscribers"), orderBy("created_at", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const r = d.data();
        return { id: d.id, email: r.email, date: ts(r.created_at) };
      });
    } catch (e) { console.error("getSubscribers:", e); return []; }
  },
  addSubscriber: async (email: string): Promise<NewsletterSubscriber | null> => {
    try {
      // Check for duplicate
      const q = query(collection(db, "newsletter_subscribers"), where("email", "==", email), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) return null;
      const now = new Date().toISOString();
      const ref = await addDoc(collection(db, "newsletter_subscribers"), { email, opt_in: true, created_at: now });
      return { id: ref.id, email, date: now };
    } catch (e) { console.error("addSubscriber:", e); return null; }
  },
  deleteSubscriber: async (id: string): Promise<boolean> => {
    try { await deleteDoc(doc(db, "newsletter_subscribers", id)); return true; }
    catch (e) { console.error("deleteSubscriber:", e); return false; }
  },

  // ─── Contact Messages ──────────────────────
  getMessages: async (): Promise<ContactMessage[]> => {
    try {
      const q = query(collection(db, "contact_messages"), orderBy("created_at", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const r = d.data();
        return { id: d.id, name: r.name, email: r.email, subject: r.subject, message: r.message, date: ts(r.created_at) };
      });
    } catch (e) { console.error("getMessages:", e); return []; }
  },
  addMessage: async (item: Omit<ContactMessage, 'id'>): Promise<ContactMessage | null> => {
    try {
      const now = new Date().toISOString();
      const ref = await addDoc(collection(db, "contact_messages"), {
        name: item.name, email: item.email, subject: item.subject, message: item.message, created_at: now,
      });
      return { id: ref.id, ...item, date: now };
    } catch (e) { console.error("addMessage:", e); return null; }
  },
  deleteMessage: async (id: string): Promise<boolean> => {
    try { await deleteDoc(doc(db, "contact_messages", id)); return true; }
    catch (e) { console.error("deleteMessage:", e); return false; }
  },

  // ─── Announcements ─────────────────────────
  getAnnouncements: async (): Promise<Announcement[]> => {
    try {
      const q = query(collection(db, "announcements"), orderBy("created_at", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const r = d.data();
        return { id: d.id, title: r.title, content: r.content, image: r.image || undefined, video: r.video || undefined, donationCount: r.donationCount ?? 0 };
      });
    } catch (e) { console.error("getAnnouncements:", e); return []; }
  },
  addAnnouncement: async (item: Omit<Announcement, 'id'>): Promise<Announcement | null> => {
    try {
      const ref = await addDoc(collection(db, "announcements"), {
        title: item.title, content: item.content, image: item.image || null, video: item.video || null, donationCount: item.donationCount ?? 0, created_at: new Date().toISOString(),
      });
      return { id: ref.id, ...item };
    } catch (e) { console.error("addAnnouncement:", e); return null; }
  },
  updateAnnouncement: async (id: string, item: Partial<Announcement>): Promise<boolean> => {
    try {
      const updates: any = {};
      if (item.title !== undefined) updates.title = item.title;
      if (item.content !== undefined) updates.content = item.content;
      if (item.image !== undefined) updates.image = item.image;
      if (item.video !== undefined) updates.video = item.video;
      if (item.donationCount !== undefined) updates.donationCount = item.donationCount;
      await updateDoc(doc(db, "announcements", id), updates);
      return true;
    } catch (e) { console.error("updateAnnouncement:", e); return false; }
  },
  deleteAnnouncement: async (id: string): Promise<boolean> => {
    try { await deleteDoc(doc(db, "announcements", id)); return true; }
    catch (e) { console.error("deleteAnnouncement:", e); return false; }
  },
  incrementDonationCount: async (id: string): Promise<boolean> => {
    try {
      await updateDoc(doc(db, "announcements", id), { donationCount: increment(1) });
      return true;
    } catch (e) { console.error("incrementDonationCount:", e); return false; }
  },

  // ─── Members ────────────────────────────────
  getMembers: async (): Promise<Member[]> => {
    try {
      const q = query(collection(db, "members"), orderBy("created_at", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const r = d.data();
        return {
          id: d.id, regNumber: r.regNumber, surname: r.surname, firstName: r.firstName,
          otherName: r.otherName, email: r.email || '', countryOfOrigin: r.countryOfOrigin, countryOfResidence: r.countryOfResidence,
          unhcrId: r.unhcrId, phone: r.phone, phoneCode: r.phoneCode, gender: r.gender,
          maritalStatus: r.maritalStatus, dateOfBirth: r.dateOfBirth, familySize: r.familySize,
          photo: r.photo, document: r.document, paymentCurrency: r.paymentCurrency,
          paymentAmount: Number(r.paymentAmount), registrationDate: r.registrationDate,
          expiryDate: r.expiryDate, branchName: r.branchName, username: r.username,
        };
      });
    } catch (e) { console.error("getMembers:", e); return []; }
  },
  getNextRegNumber: async (): Promise<string> => {
    try {
      const snap = await getCountFromServer(collection(db, "members"));
      const total = snap.data().count;
      const year = new Date().getFullYear();
      return `R${String(total + 1).padStart(4, '0')}${year}`;
    } catch (e) { console.error("getNextRegNumber:", e); return `R0001${new Date().getFullYear()}`; }
  },
  addMember: async (item: Omit<Member, 'id' | 'regNumber'>): Promise<Member | null> => {
    try {
      const regNumber = await store.getNextRegNumber();
      const ref = await addDoc(collection(db, "members"), {
        regNumber, surname: item.surname, firstName: item.firstName,
        otherName: item.otherName, email: item.email || '', countryOfOrigin: item.countryOfOrigin,
        countryOfResidence: item.countryOfResidence, unhcrId: item.unhcrId,
        phone: item.phone, phoneCode: item.phoneCode, gender: item.gender,
        maritalStatus: item.maritalStatus, dateOfBirth: item.dateOfBirth,
        familySize: item.familySize, photo: item.photo, document: item.document,
        paymentCurrency: item.paymentCurrency, paymentAmount: item.paymentAmount,
        registrationDate: item.registrationDate, expiryDate: item.expiryDate,
        branchName: item.branchName, username: item.username, created_at: new Date().toISOString(),
      });
      return { id: ref.id, regNumber, ...item };
    } catch (e) { console.error("addMember:", e); return null; }
  },
  deleteMember: async (id: string): Promise<boolean> => {
    try { await deleteDoc(doc(db, "members", id)); return true; }
    catch (e) { console.error("deleteMember:", e); return false; }
  },

  // ─── Security Q&A (stays in localStorage) ──
  getSecurityQuestion: () => localStorage.getItem('refan_security_question') || '',
  getSecurityAnswer: () => localStorage.getItem('refan_security_answer') || '',
  setSecurityQuestion: (question: string, answer: string) => {
    localStorage.setItem('refan_security_question', question);
    localStorage.setItem('refan_security_answer', answer.toLowerCase().trim());
  },
  hasSecurityQuestion: () => !!localStorage.getItem('refan_security_question'),
  validateSecurityAnswer: (answer: string) => {
    const stored = localStorage.getItem('refan_security_answer') || '';
    return answer.toLowerCase().trim() === stored;
  },

  // ─── Footer Settings ──────────────────────────
  getFooterSettings: async (): Promise<FooterSettings | null> => {
    try {
      const snap = await getDoc(doc(db, "settings", "footer"));
      if (snap.exists()) return snap.data() as FooterSettings;
      return null;
    } catch (e) { console.error("getFooterSettings:", e); return null; }
  },
  saveFooterSettings: async (settings: FooterSettings): Promise<boolean> => {
    try {
      await setDoc(doc(db, "settings", "footer"), settings);
      return true;
    } catch (e) { console.error("saveFooterSettings:", e); return false; }
  },

  // ─── Hero Settings ──────────────────────────
  getHeroSettings: async (): Promise<HeroSettings | null> => {
    try {
      const snap = await getDoc(doc(db, "settings", "hero"));
      if (snap.exists()) return snap.data() as HeroSettings;
      return null;
    } catch (e) { console.error("getHeroSettings:", e); return null; }
  },
  saveHeroSettings: async (settings: HeroSettings): Promise<boolean> => {
    try {
      await setDoc(doc(db, "settings", "hero"), settings);
      return true;
    } catch (e) { console.error("saveHeroSettings:", e); return false; }
  },
};
