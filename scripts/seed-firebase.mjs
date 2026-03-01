import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAILawBPFIiaU_2Wr0A31S9znG1AM_vBgU",
  authDomain: "refan-website-4c168.firebaseapp.com",
  projectId: "refan-website-4c168",
  storageBucket: "refan-website-4c168.firebasestorage.app",
  messagingSenderId: "66156777366",
  appId: "1:66156777366:web:e822d4e46c88c0d53e97b7",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const announcements = [
  {
    title: "ReFAN Annual General Meeting 2026",
    content: "We are pleased to invite all ReFAN members and supporters to our Annual General Meeting on March 15, 2026 at the Dzaleka Community Center. The meeting will cover our achievements in 2025, financial reports, and plans for the new year. Refreshments will be provided. Please confirm your attendance by contacting us.",
    image: "/gallery-community.jpg",
    donationCount: 12,
    created_at: "2026-02-25T10:00:00Z",
  },
  {
    title: "New Education Sponsorship Program Launched",
    content: "ReFAN is proud to announce the launch of our new Education Sponsorship Program! Starting this month, we will be sponsoring 50 additional orphaned children in Dzaleka Refugee Camp to attend school. Each sponsorship covers school fees, uniforms, books, and school supplies.",
    image: "/gallery-classroom.jpg",
    donationCount: 35,
    created_at: "2026-02-20T10:00:00Z",
  },
  {
    title: "Emergency Food Distribution Drive",
    content: "Due to the ongoing food shortages in Dzaleka Refugee Camp, ReFAN is organizing an emergency food distribution drive on February 28, 2026. We aim to reach 200 vulnerable families including widows and orphan-headed households. Donations of maize flour, beans, cooking oil, and salt are welcome.",
    image: "/IMG-20260217-WA0046.jpg",
    donationCount: 58,
    created_at: "2026-02-15T10:00:00Z",
  },
  {
    title: "Women Empowerment Workshop - Registration Open",
    content: "ReFAN is hosting a 3-day Women Empowerment Workshop from March 20-22, 2026. The workshop will cover entrepreneurship skills, financial literacy, and mental health support for widows and single mothers in the camp. Limited spots available - register now through our office.",
    image: "/IMG-20260217-WA0055.jpg",
    donationCount: 8,
    created_at: "2026-02-10T10:00:00Z",
  },
];

const stories = [
  {
    title: "How Education Changed My Life - Emmanuel's Story",
    excerpt: "From an orphan with no hope to a top student dreaming of becoming a doctor, Emmanuel shares his journey with ReFAN.",
    content: "My name is Emmanuel, and I am 16 years old. When my parents passed away, I thought my life was over. I had no one to pay my school fees, no one to buy me books, and no one to encourage me. Then ReFAN came into my life.\n\nThey enrolled me in school, provided all my supplies, and connected me with a mentor. For the first time in years, I felt like someone believed in me. Today, I am one of the top students in my class, and I dream of becoming a doctor so I can help others in my community.\n\nReFAN didn't just give me an education — they gave me hope.",
    image: "/gallery-children-smiling.jpg",
    category: "story",
    date: "2026-02-10",
    created_at: "2026-02-10T10:00:00Z",
  },
  {
    title: "A Widow's Journey to Self-Reliance - Marie's Testimony",
    excerpt: "After losing her husband, Marie found strength through ReFAN's community programs and now leads a small business.",
    content: "When my husband died, I was left alone with three children and no income. Life in the refugee camp was already difficult, but without my husband, it became unbearable.\n\nReFAN's community resilience program changed everything. They taught me skills in tailoring and small business management. With a small grant, I started a tailoring business in the camp. Today, I earn enough to feed my family and pay school fees for all three of my children.\n\nThe other widows in the program became my sisters. We support each other, share our struggles, and celebrate our victories together.",
    image: "/IMG-20260217-WA0040.jpg",
    category: "story",
    date: "2026-01-25",
    created_at: "2026-01-25T10:00:00Z",
  },
  {
    title: "From Grief to Growth - The Bereavement Support Program",
    excerpt: "How ReFAN's bereavement support helped families heal and find strength after losing loved ones.",
    content: "Losing a loved one is painful anywhere in the world, but in a refugee camp, the grief can feel overwhelming. There is no familiar home to return to, no extended family to lean on.\n\nReFAN's Bereavement Support Program provides counseling sessions, support groups, and practical assistance to families who have lost a breadwinner. Our trained community counselors walk alongside grieving families.\n\nSince the program started, we have supported over 30 families. Many say that the support group sessions are the most meaningful — knowing that you are not alone in your grief makes all the difference.",
    image: "/IMG-20260217-WA0044.jpg",
    category: "story",
    date: "2026-01-15",
    created_at: "2026-01-15T10:00:00Z",
  },
  {
    title: "Children's Day Celebration at Dzaleka",
    excerpt: "ReFAN organized a special Children's Day event with games, food, and gifts for over 100 orphaned children.",
    content: "On January 5, 2026, ReFAN organized a Children's Day celebration for orphaned children in Dzaleka Refugee Camp. Over 100 children attended the event, which featured games, singing, dancing, and a special meal.\n\nFor many of these children, it was the first time they had celebrated anything in a long time. The smiles on their faces reminded us why we do this work.\n\nWe also distributed school supplies and clothing to all the children. Together, we are building a brighter future.",
    image: "/gallery-children-playing.jpg",
    category: "announcement",
    date: "2026-01-05",
    created_at: "2026-01-05T10:00:00Z",
  },
];

const blogPosts = [
  {
    title: "Understanding the Challenges Facing Refugee Orphans in Malawi",
    excerpt: "An in-depth look at the unique challenges orphaned children face in Dzaleka Refugee Camp.",
    content: "Dzaleka Refugee Camp in Malawi is home to over 50,000 refugees from DRC, Burundi, Rwanda, and Somalia. Among them are hundreds of orphaned children who face challenges that most of us cannot imagine.\n\nThese children have lost their parents to war, disease, or displacement. Without parents, they lack access to education, nutrition, and emotional support.\n\nAt ReFAN, we believe every orphaned child deserves a chance at a better life. Our education sponsorship program covers school fees, uniforms, books, and provides mentorship.\n\nWe cannot do it alone. We need partners, sponsors, and volunteers who share our vision.",
    image: "/gallery-boys-running.jpg",
    author: "Goreth Niyigena",
    tags: ["education", "orphans", "refugees"],
    date: "2026-02-20",
    created_at: "2026-02-20T10:00:00Z",
  },
  {
    title: "The Power of Community-Led Solutions in Refugee Camps",
    excerpt: "Why refugee-led organizations like ReFAN are uniquely positioned to create lasting change.",
    content: "There is a growing recognition that the most effective solutions come from within affected communities. Refugee-led organizations understand the needs, culture, and dynamics in ways that external organizations cannot.\n\nReFAN was founded in 2022 by refugees in Dzaleka. Being refugee-led gives us trust, context understanding, and long-term commitment.\n\nHowever, challenges remain: limited funding, overwhelming admin requirements, and the emotional toll of serving your own community.\n\nWe call on donors and partners to invest in organizations like ReFAN — with money, capacity building, mentorship, and genuine partnership.",
    image: "/team-refan.jpg",
    author: "Wagstan Muhire",
    tags: ["community", "refugee-led", "empowerment"],
    date: "2026-02-05",
    created_at: "2026-02-05T10:00:00Z",
  },
  {
    title: "Mental Health in Refugee Settings: Breaking the Silence",
    excerpt: "Addressing the often-overlooked mental health crisis among refugees, especially widows and orphans.",
    content: "Mental health is one of the most critical yet overlooked issues in refugee camps. Trauma of war, displacement, and loss can have devastating effects.\n\nFor widows, grief is compounded by sudden responsibility. For orphans, loss at a young age leads to behavioral issues and deep emotional wounds.\n\nAt ReFAN, our bereavement support program provides safe spaces for families to share experiences and receive support. We train community members as peer counselors.\n\nParticipants report feeling less isolated, more hopeful, and better equipped to cope. Mental health is not a luxury — it is a fundamental human need.",
    image: "/IMG-20260217-WA0048.jpg",
    author: "Goreth Niyigena",
    tags: ["mental-health", "widows", "support"],
    date: "2026-01-18",
    created_at: "2026-01-18T10:00:00Z",
  },
];

async function seed() {
  console.log("Seeding announcements...");
  for (const item of announcements) {
    await addDoc(collection(db, "announcements"), item);
  }
  console.log(`  ✓ ${announcements.length} announcements`);

  console.log("Seeding stories...");
  for (const item of stories) {
    await addDoc(collection(db, "stories"), item);
  }
  console.log(`  ✓ ${stories.length} stories`);

  console.log("Seeding blog posts...");
  for (const item of blogPosts) {
    await addDoc(collection(db, "blog_posts"), item);
  }
  console.log(`  ✓ ${blogPosts.length} blog posts`);

  console.log("\nDone! All example data seeded to Firestore.");
  process.exit(0);
}

seed();
