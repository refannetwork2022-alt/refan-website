import type { VercelRequest, VercelResponse } from '@vercel/node';

// Link previews for shared items: /?voice=3, /?story=ID, /?announcement=ID, /?program=1 (and /share?...).
// WhatsApp, Facebook, LinkedIn... don't run the site's JavaScript, so they only see index.html's generic
// title and no picture. vercel.json sends those URLs here; we serve the normal site page (index.html) with the
// item's own title, text and photo in its Open Graph tags, so previews are right and visitors see the site as usual.

type Fields = Record<string, any>;

const projectId = () => process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || '';
const apiKey = () => process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || '';

// Firestore REST values -> plain JS
const plain = (v: any): any => {
  if (!v || typeof v !== 'object') return v;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(plain);
  if ('mapValue' in v) return fieldsToObject(v.mapValue.fields || {});
  return null;
};
const fieldsToObject = (fields: Fields) => Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, plain(v)]));

async function getDoc(path: string): Promise<Record<string, any> | null> {
  const id = projectId();
  if (!id) return null;
  const key = apiKey();
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${id}/databases/(default)/documents/${path}${key ? `?key=${encodeURIComponent(key)}` : ''}`);
  if (!res.ok) return null;
  const json = await res.json();
  return json?.fields ? fieldsToObject(json.fields) : null;
}

const stripHtml = (html: string) =>
  String(html || '')
    .replace(/<(br|\/p|\/div|\/li)[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

const shorten = (text: string, max = 200) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

const esc = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const DEFAULT_TITLE = 'ReFAN - From Loss to Legacy in Dzaleka Refugee Camp';
const DEFAULT_DESCRIPTION = 'Self-funded by refugees, powered by hope. Join us in turning grief into resilience for orphaned children and widows in Dzaleka Refugee Camp.';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'refan-website.vercel.app');
  const site = `https://${host}`;
  const q = req.query;
  const one = (v: unknown) => (Array.isArray(v) ? v[0] : v) as string | undefined;

  let title = DEFAULT_TITLE;
  let description = DEFAULT_DESCRIPTION;
  let image = '';
  let target = '/';

  try {
    const voice = one(q.voice);
    const story = one(q.story);
    const announcement = one(q.announcement);
    const program = one(q.program);

    if (voice !== undefined && /^\d+$/.test(voice)) {
      target = `/?voice=${voice}#/`;
      const home = await getDoc('settings/home');
      const t = home?.testimonials?.[Number(voice)];
      if (t) {
        title = `${stripHtml(t.name) || 'A voice'} — Voices from ReFAN`;
        description = shorten(stripHtml(t.quote)) || description;
        image = t.image || '';
      }
    } else if (story && /^[\w-]{1,100}$/.test(story)) {
      target = `/?story=${encodeURIComponent(story)}#/stories`;
      const s = await getDoc(`stories/${story}`);
      if (s) {
        title = stripHtml(s.title) || title;
        description = shorten(stripHtml(s.subtitle || s.excerpt || s.content)) || description;
        image = s.image || '';
      }
    } else if (announcement && /^[\w-]{1,100}$/.test(announcement)) {
      target = `/?announcement=${encodeURIComponent(announcement)}#/stories`;
      const a = await getDoc(`announcements/${announcement}`);
      if (a) {
        title = stripHtml(a.title) || title;
        description = shorten(stripHtml(a.subtitle || a.content)) || description;
        image = a.image || '';
      }
    } else if (program !== undefined && /^\d+$/.test(program)) {
      target = `/?program=${program}#/programs`;
      const settings = await getDoc('settings/programs');
      const p = settings?.programs?.[Number(program)];
      if (p) {
        title = `${stripHtml(p.title)} — ReFAN Programs`;
        description = shorten(stripHtml(p.description)) || description;
        image = p.image || '';
      }
    }
  } catch (error) {
    console.error('share preview:', error);
  }

  // Link previews need a full URL; site-relative images ("/photo.jpg") get the site address in front.
  if (image && image.startsWith('/')) image = site + encodeURI(image);
  if (!/^https?:\/\//i.test(image)) image = `${site}/logo.png`;
  const url = `${site}${target}`;

  const meta = `<title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="ReFAN" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${esc(image)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${esc(image)}" />`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // index.html points at this deployment's script files, so it must not be cached across deployments.
  res.setHeader('Cache-Control', 'no-cache');

  try {
    const page = await fetch(`${site}/index.html`);
    if (!page.ok) throw new Error(`index.html ${page.status}`);
    const html = (await page.text())
      .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
      .replace(/<meta\s+(name|property)="(description|og:[^"]+|twitter:[^"]+)"[^>]*>\s*/gi, '')
      .replace(/<\/head>/i, `    ${meta}
  </head>`);
    res.status(200).send(html);
    return;
  } catch (error) {
    console.error('share page: could not load index.html', error);
  }

  // Fallback: a small page with the preview tags that forwards to the site home.
  res.status(200).send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
${meta}
<meta http-equiv="refresh" content="0; url=${esc(site)}/#/" />
</head>
<body><p><a href="${esc(site)}/#/">Continue to ReFAN</a></p></body>
</html>`);
}
