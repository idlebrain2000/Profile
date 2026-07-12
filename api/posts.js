// /api/posts.js — Substack → JSON for srinimullapudi.com
// Fetches the Ground Truth RSS feed server-side, parses it with zero dependencies,
// and returns clean post objects. Cached at Vercel's edge for 1 hour.
//
// Live:         https://srinimullapudi.com/api/posts
// Force fresh:  https://srinimullapudi.com/api/posts?refresh=1

const FEED_URL = 'https://vasumullapudi.substack.com/feed';

// ── Editorial overrides ───────────────────────────────────────────────────────
// RSS gives title / subtitle / date / link / body. It does NOT give your
// hand-written summary, pull-quote or tags. Any post keyed here (by URL slug)
// uses your copy; every other post falls back to an auto-excerpt from the body.
// To upgrade a new post later: add its slug below and redeploy. Optional.
const EDITORIAL = {
  'schrodingers-ai-agent-simultaneously': {
    tags: ['Enterprise AI', 'Agentic Systems', 'ROI', 'Failure Modes'],
    summary: "88% of enterprise AI agents never reach production. Five failure autopsies: orphaned data pipelines, compliance ambushes, the edge case that walked in on a Tuesday, token bills that shock CFOs, and the accountability void nobody budgeted for. Uber burned its entire annual AI budget in 4 months. Microsoft revoked developer licenses. One company ran a $500M Claude bill. An entire VC-funded category now exists just to solve failure mode #5.",
    quote: "We are living through the most overfunded, overhyped, and underdelivered moment in enterprise software history. Every boardroom has a pilot. Almost nobody has a production system."
  },
  'you-didnt-build-a-product-you-built': {
    tags: ['AI Product Design', 'Trust', 'Failure Modes', 'AI PM Gita'],
    summary: "The Chakravyuha — the inescapable battle formation from the Mahabharata — as a frame for why most AI features are traps: brilliantly designed for entry, no exit built in. Introduces the Three Rings framework (Signal, Threshold, Exit) and a forensic breakdown of AI sycophancy — the most dangerous failure mode nobody reports because it looks like success.",
    quote: "The model learned to please, not to help. Nobody files a bug report that says 'the AI was too agreeable.' That is what makes sycophancy the most dangerous failure of all."
  },
  'shift-right': {
    tags: ['Product Management', 'AI & PM Role', 'Strategy', 'Customer Understanding'],
    summary: "4 founders at Cursor beat Microsoft's 26M-user GitHub Copilot without better technology — they out-understood the developer. When building collapses to near-zero cost, the constraint shifts entirely to customer understanding. Maps how discovery, strategy, roadmaps, metrics, and GTM all need to shift right — toward the customer, continuously, not quarterly.",
    quote: "When anyone can copy your features in a week, a feature advantage lasts a week. A human insight — genuinely held, operationalized across the product — lasts years."
  },
  'the-900m-gambit': {
    tags: ['India Tech', 'Meta · CRED', 'Fintech', 'Follow the Money'],
    summary: "Six dots connecting Meta's $900M CRED investment and Kunal Shah's appointment to lead WhatsApp globally. The central contradiction: the man who built his empire by excluding 99% of India (CIBIL 750+ gate) now has to serve three billion. The data wall, the Jio precedent, the LeCun departure as a cautionary parallel.",
    quote: "Robin has the batarang. Batman can't open it."
  }
};

// ── Tiny XML helpers (no deps) ────────────────────────────────────────────────
const unwrap = (s = '') =>
  s.replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '').trim();

const tag = (xml, name) => {
  const m = xml.match(new RegExp('<' + name + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + name + '>', 'i'));
  return m ? unwrap(m[1]) : '';
};

const decode = (s = '') =>
  s.replace(/&nbsp;/g, ' ')
   .replace(/&amp;/g, '&')
   .replace(/&lt;/g, '<')
   .replace(/&gt;/g, '>')
   .replace(/&quot;/g, '"')
   .replace(/&#39;|&apos;/g, "'")
   .replace(/&#8217;/g, '’')
   .replace(/&#8216;/g, '‘')
   .replace(/&#8220;/g, '“')
   .replace(/&#8221;/g, '”')
   .replace(/&#8212;/g, '—')
   .replace(/&#8230;/g, '…')
   .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

const tidy = (s = '') =>
  s.replace(/\s+/g, ' ').replace(/\s+([.,!?;:’”"])/g, '$1').trim();

const stripTags = (html = '') =>
  tidy(
    decode(
      html
        .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
        // Substack image blocks / captions add noise — drop them
        .replace(/<figure[\s\S]*?<\/figure>/gi, '')
        .replace(/<div class="subscription-widget[\s\S]*?<\/div>/gi, '')
        .replace(/<[^>]+>/g, ' ')
    )
  );

// Substack chrome that must never end up in a card.
const NOISE = /(swipe|scroll through|min read|subscribe|share this|thanks for reading|read time|tap to|second version|listen to this|cross-post)/i;

// Real paragraphs only — skips headers, captions, carousel instructions, CTAs.
const paragraphs = (html) => {
  const out = [];
  const re = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(html))) {
    const t = stripTags(m[1]);
    if (t.length >= 80 && !NOISE.test(t)) out.push(t);
  }
  return out;
};

// First N words of the real body, cut on a sentence boundary where possible.
const autoSummary = (html, words = 55) => {
  let text = paragraphs(html).join(' ');
  if (!text) text = stripTags(html);
  const w = text.split(' ');
  if (w.length <= words) return text;
  let cut = w.slice(0, words).join(' ');
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
  if (lastStop > cut.length * 0.45) cut = cut.slice(0, lastStop + 1);
  else cut = cut.replace(/[,;:—-]$/, '') + '…';
  return cut;
};

// First blockquote in the post → pull-quote. Ignore anything too short/long.
const autoQuote = (html) => {
  const blocks = html.match(/<blockquote[\s\S]*?<\/blockquote>/gi) || [];
  for (const b of blocks) {
    let t = stripTags(b)
      .replace(/^["“”'\s]+|["“”'\s]+$/g, '')
      .replace(/\s*\.\s*$/, '.');
    if (t.length >= 40 && t.length <= 320 && !NOISE.test(t)) return t;
  }
  return '';
};

const slugOf = (link = '') => (link.split('/p/')[1] || '').split(/[?#]/)[0];

const fmtDate = (pubDate) => {
  const d = new Date(pubDate);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
};

// ── Handler ───────────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  const fresh = 'refresh' in (req.query || {});

  try {
    const r = await fetch(FEED_URL, {
      headers: { 'user-agent': 'srinimullapudi.com/1.0 (+https://srinimullapudi.com)' },
      cache: fresh ? 'no-store' : 'default'
    });
    if (!r.ok) throw new Error('Substack responded ' + r.status);
    const xml = await r.text();

    const posts = xml
      .split(/<item>/i)
      .slice(1)
      .map((chunk) => {
        const item = chunk.split(/<\/item>/i)[0];
        const link = tag(item, 'link');
        const body = tag(item, 'content:encoded') || tag(item, 'description');
        const slug = slugOf(link);
        const ed = EDITORIAL[slug] || {};
        const pubDate = tag(item, 'pubDate');

        return {
          slug,
          title: decode(tag(item, 'title')),
          subtitle: stripTags(tag(item, 'description')).slice(0, 200),
          link,
          date: fmtDate(pubDate),
          timestamp: new Date(pubDate).getTime() || 0,
          image: (item.match(/<enclosure[^>]*url="([^"]+)"/i) || [])[1] || '',
          summary: ed.summary || autoSummary(body),
          quote: ed.quote || autoQuote(body),
          tags: ed.tags || [],
          curated: Boolean(ed.summary)
        };
      })
      .filter((p) => p.title && p.link)
      .sort((a, b) => b.timestamp - a.timestamp); // newest first

    // Edge cache: serve instantly, refresh in the background every hour.
    res.setHeader(
      'Cache-Control',
      fresh ? 'no-store' : 'public, s-maxage=3600, stale-while-revalidate=86400'
    );
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({ ok: true, count: posts.length, fetchedAt: new Date().toISOString(), posts });
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ ok: false, error: String(err.message || err), posts: [] });
  }
};
