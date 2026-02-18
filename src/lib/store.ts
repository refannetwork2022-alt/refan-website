// Simple in-memory store for Phase 1 (will be replaced by Cloud DB later)

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
  type: 'volunteer' | 'sponsor';
  message: string;
  date: string;
}

export interface DonationSubmission {
  id: string;
  name: string;
  email: string;
  amount: number;
  message: string;
  date: string;
}

const STORAGE_KEYS = {
  stories: 'refan_stories',
  blogs: 'refan_blogs',
  gallery: 'refan_gallery',
  volunteers: 'refan_volunteers',
  donations: 'refan_donations',
};

function getItems<T>(key: string, defaults: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaults;
  } catch {
    return defaults;
  }
}

function setItems<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

// Default seed data
const defaultStories: Story[] = [
  {
    id: '1', title: 'Clean Water Reaches Okudu Village', excerpt: 'After months of effort, clean water now flows freely for 2,000 residents.',
    content: 'Our clean water project in Okudu village has been completed successfully, providing access to clean water for over 2,000 residents. The borehole was drilled and fitted with a solar-powered pump system.',
    date: '2026-01-15', category: 'story',
  },
  {
    id: '2', title: 'Back-to-School Drive 2026', excerpt: 'ReFAN distributes school supplies to 500 children across 3 communities.',
    content: 'Our annual back-to-school drive was a tremendous success. We distributed books, uniforms, and stationery to 500 children in underserved communities.',
    date: '2026-02-01', category: 'announcement',
  },
];

const defaultBlogs: BlogPost[] = [
  {
    id: '1', title: 'Why Community-Led Development Works', excerpt: 'When communities lead their own development, outcomes are sustainable and impactful.',
    content: 'Community-led development has been at the heart of ReFAN\'s approach since our founding. Research consistently shows that projects designed and owned by local communities are more sustainable.',
    author: 'ReFAN Team', date: '2026-01-20', tags: ['community', 'development'],
  },
  {
    id: '2', title: '5 Ways You Can Support Rural Education', excerpt: 'Simple actions that create lasting change in rural classrooms.',
    content: 'Education is the cornerstone of community development. Here are five practical ways you can support rural education initiatives and create lasting impact.',
    author: 'ReFAN Team', date: '2026-02-05', tags: ['education', 'volunteering'],
  },
];

const defaultGallery: GalleryItem[] = [
  { id: '1', title: 'Community Health Outreach', url: '', type: 'photo', date: '2026-01-10' },
  { id: '2', title: 'Education Workshop', url: '', type: 'photo', date: '2026-01-20' },
  { id: '3', title: 'Tree Planting Drive', url: '', type: 'photo', date: '2026-02-01' },
];

export const store = {
  getStories: () => getItems(STORAGE_KEYS.stories, defaultStories),
  setStories: (items: Story[]) => setItems(STORAGE_KEYS.stories, items),
  addStory: (item: Omit<Story, 'id'>) => {
    const items = store.getStories();
    const newItem = { ...item, id: Date.now().toString() };
    items.unshift(newItem);
    store.setStories(items);
    return newItem;
  },
  deleteStory: (id: string) => {
    store.setStories(store.getStories().filter(s => s.id !== id));
  },

  getBlogs: () => getItems(STORAGE_KEYS.blogs, defaultBlogs),
  setBlogs: (items: BlogPost[]) => setItems(STORAGE_KEYS.blogs, items),
  addBlog: (item: Omit<BlogPost, 'id'>) => {
    const items = store.getBlogs();
    const newItem = { ...item, id: Date.now().toString() };
    items.unshift(newItem);
    store.setBlogs(items);
    return newItem;
  },
  deleteBlog: (id: string) => {
    store.setBlogs(store.getBlogs().filter(b => b.id !== id));
  },

  getGallery: () => getItems(STORAGE_KEYS.gallery, defaultGallery),
  setGallery: (items: GalleryItem[]) => setItems(STORAGE_KEYS.gallery, items),
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => {
    const items = store.getGallery();
    const newItem = { ...item, id: Date.now().toString() };
    items.unshift(newItem);
    store.setGallery(items);
    return newItem;
  },
  deleteGalleryItem: (id: string) => {
    store.setGallery(store.getGallery().filter(g => g.id !== id));
  },

  getVolunteers: () => getItems<VolunteerSubmission>(STORAGE_KEYS.volunteers, []),
  addVolunteer: (item: Omit<VolunteerSubmission, 'id'>) => {
    const items = store.getVolunteers();
    const newItem = { ...item, id: Date.now().toString() };
    items.unshift(newItem);
    setItems(STORAGE_KEYS.volunteers, items);
    return newItem;
  },

  getDonations: () => getItems<DonationSubmission>(STORAGE_KEYS.donations, []),
  addDonation: (item: Omit<DonationSubmission, 'id'>) => {
    const items = store.getDonations();
    const newItem = { ...item, id: Date.now().toString() };
    items.unshift(newItem);
    setItems(STORAGE_KEYS.donations, items);
    return newItem;
  },
};
