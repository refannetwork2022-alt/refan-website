import { supabase } from "@/integrations/supabase/client";

// ── Interfaces (kept for compatibility) ──────────────────────

export interface Announcement {
  id: string;
  title: string;
  content: string;
  image?: string;
  donationCount: number;
}

export interface Story {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image?: string;
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

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
}

// ── Row ↔ Interface mappers ──────────────────────────────────

function rowToStory(r: any): Story {
  return { id: r.id, title: r.title, excerpt: r.excerpt, content: r.content, image: r.image_url || undefined, date: r.date, category: r.category };
}

function rowToBlog(r: any): BlogPost {
  return { id: r.id, title: r.title, excerpt: r.excerpt, content: r.content, image: r.image_url || undefined, author: r.author, date: r.date, tags: r.tags || [] };
}

function rowToGallery(r: any): GalleryItem {
  return { id: r.id, title: r.title, url: r.url, type: r.type, date: r.date };
}

function rowToVolunteer(r: any): VolunteerSubmission {
  return { id: r.id, name: r.name, email: r.email, phone: r.phone, country: r.country || '', type: r.type, message: r.message, date: r.date || r.created_at };
}

function rowToDonation(r: any): DonationSubmission {
  return { id: r.id, name: r.name, email: r.email, amount: Number(r.amount), currency: r.currency || '', message: r.message, date: r.date || r.created_at };
}

function rowToSubscriber(r: any): NewsletterSubscriber {
  return { id: r.id, email: r.email, date: r.created_at };
}

function rowToMessage(r: any): ContactMessage {
  return { id: r.id, name: r.name, email: r.email, subject: r.subject, message: r.message, date: r.created_at };
}

function rowToAnnouncement(r: any): Announcement {
  return { id: r.id, title: r.title, content: r.content, image: r.image_url || undefined, donationCount: r.donation_count ?? 0 };
}

function rowToMember(r: any): Member {
  return {
    id: r.id, regNumber: r.reg_number, surname: r.surname, firstName: r.first_name,
    otherName: r.other_name, countryOfOrigin: r.country_of_origin, countryOfResidence: r.country_of_residence,
    unhcrId: r.unhcr_id, phone: r.phone, phoneCode: r.phone_code, gender: r.gender,
    maritalStatus: r.marital_status, dateOfBirth: r.date_of_birth, familySize: r.family_size,
    photo: r.photo, document: r.document, paymentCurrency: r.payment_currency,
    paymentAmount: Number(r.payment_amount), registrationDate: r.registration_date,
    expiryDate: r.expiry_date, branchName: r.branch_name, username: r.username,
  };
}

// ── Async store (Supabase) ───────────────────────────────────

export const store = {
  // ─── Stories ────────────────────────────────
  getStories: async (): Promise<Story[]> => {
    const { data, error } = await supabase.from('stories').select('*').order('date', { ascending: false });
    if (error) { console.error('getStories:', error); return []; }
    return (data || []).map(rowToStory);
  },
  addStory: async (item: Omit<Story, 'id'>): Promise<Story | null> => {
    const { data, error } = await supabase.from('stories').insert({
      title: item.title, excerpt: item.excerpt, content: item.content,
      image_url: item.image || null, category: item.category, date: item.date,
    }).select().single();
    if (error) { console.error('addStory:', error); return null; }
    return rowToStory(data);
  },
  updateStory: async (id: string, item: Partial<Story>): Promise<boolean> => {
    const updates: any = {};
    if (item.title !== undefined) updates.title = item.title;
    if (item.excerpt !== undefined) updates.excerpt = item.excerpt;
    if (item.content !== undefined) updates.content = item.content;
    if (item.image !== undefined) updates.image_url = item.image;
    if (item.category !== undefined) updates.category = item.category;
    if (item.date !== undefined) updates.date = item.date;
    const { error } = await supabase.from('stories').update(updates).eq('id', id);
    if (error) { console.error('updateStory:', error); return false; }
    return true;
  },
  deleteStory: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('stories').delete().eq('id', id);
    if (error) { console.error('deleteStory:', error); return false; }
    return true;
  },

  // ─── Blog Posts ─────────────────────────────
  getBlogs: async (): Promise<BlogPost[]> => {
    const { data, error } = await supabase.from('blog_posts').select('*').order('date', { ascending: false });
    if (error) { console.error('getBlogs:', error); return []; }
    return (data || []).map(rowToBlog);
  },
  addBlog: async (item: Omit<BlogPost, 'id'>): Promise<BlogPost | null> => {
    const { data, error } = await supabase.from('blog_posts').insert({
      title: item.title, excerpt: item.excerpt, content: item.content,
      image_url: item.image || null, author: item.author, tags: item.tags, date: item.date,
    }).select().single();
    if (error) { console.error('addBlog:', error); return null; }
    return rowToBlog(data);
  },
  updateBlog: async (id: string, item: Partial<BlogPost>): Promise<boolean> => {
    const updates: any = {};
    if (item.title !== undefined) updates.title = item.title;
    if (item.excerpt !== undefined) updates.excerpt = item.excerpt;
    if (item.content !== undefined) updates.content = item.content;
    if (item.image !== undefined) updates.image_url = item.image;
    if (item.author !== undefined) updates.author = item.author;
    if (item.tags !== undefined) updates.tags = item.tags;
    if (item.date !== undefined) updates.date = item.date;
    const { error } = await supabase.from('blog_posts').update(updates).eq('id', id);
    if (error) { console.error('updateBlog:', error); return false; }
    return true;
  },
  deleteBlog: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) { console.error('deleteBlog:', error); return false; }
    return true;
  },

  // ─── Gallery ────────────────────────────────
  getGallery: async (): Promise<GalleryItem[]> => {
    const { data, error } = await supabase.from('gallery_items').select('*').order('date', { ascending: false });
    if (error) { console.error('getGallery:', error); return []; }
    return (data || []).map(rowToGallery);
  },
  addGalleryItem: async (item: Omit<GalleryItem, 'id'>): Promise<GalleryItem | null> => {
    const { data, error } = await supabase.from('gallery_items').insert({
      title: item.title, url: item.url, type: item.type, date: item.date,
    }).select().single();
    if (error) { console.error('addGalleryItem:', error); return null; }
    return rowToGallery(data);
  },
  deleteGalleryItem: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('gallery_items').delete().eq('id', id);
    if (error) { console.error('deleteGalleryItem:', error); return false; }
    return true;
  },

  // ─── Volunteers ─────────────────────────────
  getVolunteers: async (): Promise<VolunteerSubmission[]> => {
    const { data, error } = await supabase.from('volunteer_submissions').select('*').order('created_at', { ascending: false });
    if (error) { console.error('getVolunteers:', error); return []; }
    return (data || []).map(rowToVolunteer);
  },
  addVolunteer: async (item: Omit<VolunteerSubmission, 'id'>): Promise<VolunteerSubmission | null> => {
    const { data, error } = await supabase.from('volunteer_submissions').insert({
      name: item.name, email: item.email, phone: item.phone, country: item.country,
      type: item.type, message: item.message, date: item.date,
    }).select().single();
    if (error) { console.error('addVolunteer:', error); return null; }
    return rowToVolunteer(data);
  },

  // ─── Donations ──────────────────────────────
  getDonations: async (): Promise<DonationSubmission[]> => {
    const { data, error } = await supabase.from('donation_submissions').select('*').order('created_at', { ascending: false });
    if (error) { console.error('getDonations:', error); return []; }
    return (data || []).map(rowToDonation);
  },
  addDonation: async (item: Omit<DonationSubmission, 'id'>): Promise<DonationSubmission | null> => {
    const { data, error } = await supabase.from('donation_submissions').insert({
      name: item.name, email: item.email, amount: item.amount, currency: item.currency,
      message: item.message, date: item.date,
    }).select().single();
    if (error) { console.error('addDonation:', error); return null; }
    return rowToDonation(data);
  },

  // ─── Newsletter Subscribers ─────────────────
  getSubscribers: async (): Promise<NewsletterSubscriber[]> => {
    const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
    if (error) { console.error('getSubscribers:', error); return []; }
    return (data || []).map(rowToSubscriber);
  },
  addSubscriber: async (email: string): Promise<NewsletterSubscriber | null> => {
    const { data, error } = await supabase.from('newsletter_subscribers').insert({
      email, opt_in: true,
    }).select().single();
    if (error) {
      if (error.code === '23505') return null; // duplicate email
      console.error('addSubscriber:', error); return null;
    }
    return rowToSubscriber(data);
  },
  deleteSubscriber: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
    if (error) { console.error('deleteSubscriber:', error); return false; }
    return true;
  },

  // ─── Contact Messages ──────────────────────
  getMessages: async (): Promise<ContactMessage[]> => {
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) { console.error('getMessages:', error); return []; }
    return (data || []).map(rowToMessage);
  },
  addMessage: async (item: Omit<ContactMessage, 'id'>): Promise<ContactMessage | null> => {
    const { data, error } = await supabase.from('contact_messages').insert({
      name: item.name, email: item.email, subject: item.subject, message: item.message,
    }).select().single();
    if (error) { console.error('addMessage:', error); return null; }
    return rowToMessage(data);
  },
  deleteMessage: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) { console.error('deleteMessage:', error); return false; }
    return true;
  },

  // ─── Announcements ─────────────────────────
  getAnnouncements: async (): Promise<Announcement[]> => {
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (error) { console.error('getAnnouncements:', error); return []; }
    return (data || []).map(rowToAnnouncement);
  },
  addAnnouncement: async (item: Omit<Announcement, 'id'>): Promise<Announcement | null> => {
    const { data, error } = await supabase.from('announcements').insert({
      title: item.title, content: item.content, image_url: item.image || null, donation_count: item.donationCount ?? 0,
    }).select().single();
    if (error) { console.error('addAnnouncement:', error); return null; }
    return rowToAnnouncement(data);
  },
  updateAnnouncement: async (id: string, item: Partial<Announcement>): Promise<boolean> => {
    const updates: any = {};
    if (item.title !== undefined) updates.title = item.title;
    if (item.content !== undefined) updates.content = item.content;
    if (item.image !== undefined) updates.image_url = item.image;
    if (item.donationCount !== undefined) updates.donation_count = item.donationCount;
    const { error } = await supabase.from('announcements').update(updates).eq('id', id);
    if (error) { console.error('updateAnnouncement:', error); return false; }
    return true;
  },
  deleteAnnouncement: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) { console.error('deleteAnnouncement:', error); return false; }
    return true;
  },
  incrementDonationCount: async (id: string): Promise<boolean> => {
    const { data } = await supabase.from('announcements').select('donation_count').eq('id', id).single();
    if (!data) return false;
    const { error } = await supabase.from('announcements').update({ donation_count: (data.donation_count ?? 0) + 1 }).eq('id', id);
    if (error) { console.error('incrementDonationCount:', error); return false; }
    return true;
  },

  // ─── Members ────────────────────────────────
  getMembers: async (): Promise<Member[]> => {
    const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: false });
    if (error) { console.error('getMembers:', error); return []; }
    return (data || []).map(rowToMember);
  },
  getNextRegNumber: async (): Promise<string> => {
    const { count, error } = await supabase.from('members').select('*', { count: 'exact', head: true });
    const total = error ? 0 : (count ?? 0);
    const year = new Date().getFullYear();
    return `R${String(total + 1).padStart(4, '0')}${year}`;
  },
  addMember: async (item: Omit<Member, 'id' | 'regNumber'>): Promise<Member | null> => {
    const regNumber = await store.getNextRegNumber();
    const { data, error } = await supabase.from('members').insert({
      reg_number: regNumber, surname: item.surname, first_name: item.firstName,
      other_name: item.otherName, country_of_origin: item.countryOfOrigin,
      country_of_residence: item.countryOfResidence, unhcr_id: item.unhcrId,
      phone: item.phone, phone_code: item.phoneCode, gender: item.gender,
      marital_status: item.maritalStatus, date_of_birth: item.dateOfBirth,
      family_size: item.familySize, photo: item.photo, document: item.document,
      payment_currency: item.paymentCurrency, payment_amount: item.paymentAmount,
      registration_date: item.registrationDate, expiry_date: item.expiryDate,
      branch_name: item.branchName, username: item.username,
    }).select().single();
    if (error) { console.error('addMember:', error); return null; }
    return rowToMember(data);
  },
  deleteMember: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) { console.error('deleteMember:', error); return false; }
    return true;
  },

  // ─── Security Q&A (stays in localStorage – admin only, per-browser) ──
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
};
