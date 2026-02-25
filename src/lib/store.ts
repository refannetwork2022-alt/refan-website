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

const STORAGE_KEYS = {
  stories: 'refan_stories',
  blogs: 'refan_blogs',
  gallery: 'refan_gallery',
  volunteers: 'refan_volunteers',
  donations: 'refan_donations',
  subscribers: 'refan_subscribers',
  messages: 'refan_messages',
  announcements: 'refan_announcements',
  members: 'refan_members',
  securityQuestion: 'refan_security_question',
  securityAnswer: 'refan_security_answer',
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

const defaultStories: Story[] = [
  {
    id: '1', title: 'Education Support Reaches 100 Orphans in Dzaleka', excerpt: 'ReFAN provides school fees, learning materials, and mentorship to orphaned children in the camp.',
    content: 'Through our Education Support program, we have now reached over 100 orphaned children in Dzaleka Refugee Camp with school fees, uniforms, books, and after-school mentorship. Every child deserves a chance to learn and dream of a brighter future.',
    date: '2026-01-15', category: 'story',
  },
  {
    id: '2', title: 'Widows Empowerment Workshop Launched', excerpt: 'New skills training program helps widows in Dzaleka build sustainable livelihoods.',
    content: 'ReFAN has launched a new Community Resilience workshop for widows in Dzaleka Refugee Camp. The program includes peer support groups, skills training, and income-generating activities to help them rebuild their lives with dignity.',
    date: '2026-02-01', category: 'announcement',
  },
];

const defaultBlogs: BlogPost[] = [
  {
    id: '1', title: 'From Grief to Growth: The Power of Holistic Care', excerpt: 'How ReFAN\'s approach transforms lives of orphans and widows in Dzaleka Refugee Camp.',
    content: 'At ReFAN, we believe that true care goes beyond material support. Our Holistic Continuity of Care model addresses education, community resilience, and bereavement support — ensuring that orphaned children and widows are never left to face their grief alone.',
    author: 'ReFAN Team', date: '2026-01-20', tags: ['holistic care', 'Dzaleka'],
  },
  {
    id: '2', title: 'Why Refugee-Led Organizations Matter', excerpt: 'When refugees lead their own solutions, outcomes are more sustainable and impactful.',
    content: 'ReFAN was founded in 2022 by refugees inside Dzaleka Refugee Camp. As a refugee-led, women-led organization, we understand the challenges firsthand. Self-funded and community-driven, we prove that those closest to the problems are best positioned to create lasting solutions.',
    author: 'ReFAN Team', date: '2026-02-05', tags: ['refugee-led', 'community'],
  },
];

const defaultGallery: GalleryItem[] = [
  { id: '1', title: 'Community Gathering', url: '/gallery-community.jpg', type: 'photo', date: '2026-01-10' },
  { id: '2', title: 'Children in Classroom', url: '/gallery-classroom.jpg', type: 'photo', date: '2026-01-15' },
  { id: '3', title: 'Children Playing', url: '/gallery-children-playing.jpg', type: 'photo', date: '2026-01-20' },
  { id: '4', title: 'Children Smiling', url: '/gallery-children-smiling.jpg', type: 'photo', date: '2026-01-25' },
  { id: '5', title: 'Girls Walking to School', url: '/gallery-girls-walking.jpg', type: 'photo', date: '2026-02-01' },
  { id: '6', title: 'Boys Running', url: '/gallery-boys-running.jpg', type: 'photo', date: '2026-02-05' },
  { id: '7', title: 'Refugees Walking', url: '/IMG-20260217-WA0039.jpg', type: 'photo', date: '2026-02-10' },
  { id: '8', title: 'Water Pump Project', url: '/IMG-20260217-WA0041.jpg', type: 'photo', date: '2026-02-12' },
  { id: '9', title: 'Displaced Families', url: '/IMG-20260217-WA0042.jpg', type: 'photo', date: '2026-02-14' },
  { id: '10', title: 'Child Carrying Bricks', url: '/IMG-20260217-WA0043.jpg', type: 'photo', date: '2026-02-15' },
  { id: '11', title: 'Family Walking', url: '/IMG-20260217-WA0044.jpg', type: 'photo', date: '2026-02-16' },
  { id: '12', title: 'Boys Playing', url: '/IMG-20260217-WA0047.jpg', type: 'photo', date: '2026-02-17' },
];

const defaultAnnouncements: Announcement[] = [
  {
    id: '1', title: 'ReFAN Offers education assistance to girls who may have had to leave school due to financial constraints',
    content: 'ReFAN exposes the girls facing challenges due to lack of support in education. Through our programs, we ensure every girl gets a chance to continue her studies and build a better future.',
    image: '/gallery-girls-walking.jpg', donationCount: 0,
  },
  {
    id: '2', title: 'Mr. Felix would like to ask for your support to the believed families within refugee Camp',
    content: 'Despite the difficulties of overcoming grief and moving forward, Felix believes that ReFAN can provide a sense of hope and resilience for the families in need.',
    image: '/IMG-20260217-WA0039.jpg', donationCount: 0,
  },
  {
    id: '3', title: 'Community Resilience Workshop for Widows in Dzaleka',
    content: 'ReFAN has launched a new Community Resilience workshop for widows in Dzaleka Refugee Camp. The program includes peer support groups, skills training, and income-generating activities.',
    image: '/gallery-community.jpg', donationCount: 0,
  },
  {
    id: '4', title: 'Education Support Reaches 100 Orphans in Dzaleka Camp',
    content: 'Through our Education Support program, we have now reached over 100 orphaned children in Dzaleka Refugee Camp with school fees, uniforms, books, and after-school mentorship.',
    image: '/gallery-classroom.jpg', donationCount: 0,
  },
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

  getSubscribers: () => getItems<NewsletterSubscriber>(STORAGE_KEYS.subscribers, []),
  addSubscriber: (email: string) => {
    const items = store.getSubscribers();
    if (items.some(s => s.email === email)) return null;
    const newItem: NewsletterSubscriber = { id: Date.now().toString(), email, date: new Date().toISOString() };
    items.unshift(newItem);
    setItems(STORAGE_KEYS.subscribers, items);
    return newItem;
  },
  deleteSubscriber: (id: string) => {
    setItems(STORAGE_KEYS.subscribers, store.getSubscribers().filter(s => s.id !== id));
  },

  getMessages: () => getItems<ContactMessage>(STORAGE_KEYS.messages, []),
  addMessage: (item: Omit<ContactMessage, 'id'>) => {
    const items = store.getMessages();
    const newItem = { ...item, id: Date.now().toString() };
    items.unshift(newItem);
    setItems(STORAGE_KEYS.messages, items);
    return newItem;
  },
  deleteMessage: (id: string) => {
    setItems(STORAGE_KEYS.messages, store.getMessages().filter(m => m.id !== id));
  },

  getAnnouncements: () => getItems(STORAGE_KEYS.announcements, defaultAnnouncements),
  setAnnouncements: (items: Announcement[]) => setItems(STORAGE_KEYS.announcements, items),
  addAnnouncement: (item: Omit<Announcement, 'id'>) => {
    const items = store.getAnnouncements();
    const newItem = { ...item, id: Date.now().toString() };
    items.unshift(newItem);
    store.setAnnouncements(items);
    return newItem;
  },
  deleteAnnouncement: (id: string) => {
    store.setAnnouncements(store.getAnnouncements().filter(a => a.id !== id));
  },
  incrementDonationCount: (id: string) => {
    const items = store.getAnnouncements();
    const item = items.find(a => a.id === id);
    if (item) {
      item.donationCount += 1;
      store.setAnnouncements(items);
    }
  },

  getMembers: () => getItems<Member>(STORAGE_KEYS.members, []),
  setMembers: (items: Member[]) => setItems(STORAGE_KEYS.members, items),
  getNextRegNumber: () => {
    const members = store.getMembers();
    const year = new Date().getFullYear();
    const count = members.length + 1;
    return `R${String(count).padStart(4, '0')}${year}`;
  },
  addMember: (item: Omit<Member, 'id' | 'regNumber'>) => {
    const items = store.getMembers();
    const regNumber = store.getNextRegNumber();
    const newItem: Member = { ...item, id: Date.now().toString(), regNumber };
    items.unshift(newItem);
    store.setMembers(items);
    return newItem;
  },
  deleteMember: (id: string) => {
    store.setMembers(store.getMembers().filter(m => m.id !== id));
  },

  getSecurityQuestion: () => localStorage.getItem(STORAGE_KEYS.securityQuestion) || '',
  getSecurityAnswer: () => localStorage.getItem(STORAGE_KEYS.securityAnswer) || '',
  setSecurityQuestion: (question: string, answer: string) => {
    localStorage.setItem(STORAGE_KEYS.securityQuestion, question);
    localStorage.setItem(STORAGE_KEYS.securityAnswer, answer.toLowerCase().trim());
  },
  hasSecurityQuestion: () => !!localStorage.getItem(STORAGE_KEYS.securityQuestion),
  validateSecurityAnswer: (answer: string) => {
    const stored = localStorage.getItem(STORAGE_KEYS.securityAnswer) || '';
    return answer.toLowerCase().trim() === stored;
  },
};
