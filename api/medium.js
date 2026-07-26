// /api/medium.js — Medium RSS → JSON for the "On Medium" section on srinimullapudi.com
// Fetches the author's Medium feed server-side and parses it with zero dependencies.
// Note: Medium's public RSS returns roughly the 10 most recent stories.
//
// Live:        https://srinimullapudi.com/api/medium
// Force fresh: https://srinimullapudi.com/api/medium?refresh=1

const FEED_URL = 'https://vasumullapudi.medium.com/feed';

const unwrap = (s = '') =>
  s.replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '').trim();

const tag = (xml, name) => {
  const m = xml.match(new RegExp('<' + name + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + name + '>', 'i'));
  return m ? unwrap(m[1]) : '';
};

const decode = (s = '') =>
  s.replace(/&nbsp;/g, ' ')
   .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
   .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
   .replace(/&#8217;/g, '’').replace(/&#8216;/g, '‘')
   .replace(/&#8220;/g, '“').replace(/&#8221;/g, '”')
   .replace(/&#8212;/g, '—').replace(/&#8230;/g, '…')
   .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

const tidy = (s = '') =>
  s.replace(/\s+/g, ' ').replace(/\s+([.,!?;:’”"])/g, '$1').trim();

const stripTags = (html = '') =>
  tidy(decode(
    html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
        .replace(/<figure[\s\S]*?<\/figure>/gi, '')
        .replace(/<[^>]+>/g, ' ')
  ));

// First meaningful paragraph → subtitle.
const firstParagraph = (html) => {
  const re = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(html))) {
    const t = stripTags(m[1]);
    if (t.length >= 60) return t;
  }
  return stripTags(html);
};

const firstImage = (html = '') => {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : '';
};

const clip = (s = '', n = 140) =>
  s.length <= n ? s : s.slice(0, n).replace(/[,;:\s]+\S*$/, '') + '…';

const fmtDate = (pubDate) => {
  const d = new Date(pubDate);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
};

module.exports = async (req, res) => {
  const fresh = 'refresh' in (req.query || {});
  try {
    const r = await fetch(FEED_URL, {
      headers: {
        'user-agent': 'srinimullapudi.com/1.0 (+https://srinimullapudi.com)',
        'accept': 'application/rss+xml, application/xml, text/xml, */*'
      },
      cache: fresh ? 'no-store' : 'default'
    });
    if (!r.ok) throw new Error('Medium responded ' + r.status);
    const xml = await r.text();

    const posts = xml
      .split(/<item>/i)
      .slice(1)
      .map((chunk) => {
        const item = chunk.split(/<\/item>/i)[0];
        const body = tag(item, 'content:encoded') || tag(item, 'description');
        const pubDate = tag(item, 'pubDate');
        return {
          title: decode(tag(item, 'title')),
          link: (tag(item, 'link') || '').split('?')[0],
          date: fmtDate(pubDate),
          timestamp: new Date(pubDate).getTime() || 0,
          subtitle: clip(firstParagraph(body), 140),
          image: firstImage(body)
        };
      })
      .filter((p) => p.title && p.link)
      .sort((a, b) => b.timestamp - a.timestamp);

    res.setHeader('Cache-Control', fresh ? 'no-store' : 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({ ok: true, count: posts.length, fetchedAt: new Date().toISOString(), posts });
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ ok: false, error: String(err.message || err), posts: [] });
  }
};
