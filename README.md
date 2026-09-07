# srinimullapudi.com — book launch update

Files to add to your repo. `index.html` replaces the one you have.

```
index.html                  ← replaces yours (all edits already applied)
assets/gallery.css          ← new
assets/gallery.js           ← new
assets/media.js             ← new — THE ONLY FILE YOU EDIT
tools/optimize-media.sh     ← new — run before committing photos/videos
```

Everything is verified: JS parses clean, the carousel builds in both light and dark
mode, and there's no horizontal overflow at 390px.

---

## Before you push — three things

### 1. Fill in `assets/media.js`

It currently lists placeholder filenames. Replace them with what's actually in your
`/Videos` and `/Photos` folders. Filenames are **case-sensitive** on Vercel —
`Photo.JPG` and `photo.jpg` are different files.

Each self-hosted video needs a poster JPG, or the slide is a black rectangle until
someone presses play. `tools/optimize-media.sh` generates them.

The YouTube video `jvv_0czkVD0` is already wired in as the first slide, captioned
"Full talk — The AI Product Manager Gita launch, RCM Bangalore." **Check that caption
is accurate** — I couldn't open the video to confirm what it is.

### 2. Compress media before `git add`

```bash
chmod +x tools/optimize-media.sh
./tools/optimize-media.sh ~/Desktop/launch-originals
```

This matters more than it sounds. GitHub hard-rejects files over 100 MB, and every
version you ever push stays in history permanently — the repo never shrinks again.
Vercel then serves those files on your bandwidth with no adaptive bitrate, so a phone
on 4G downloads the full-resolution file.

Rule: **under ~15 MB self-host, anything longer goes on YouTube.** The script flags
files that cross the line.

### 3. Make `og-card.jpg`

`index.html` points `og:image` at `/og-card.jpg`, which doesn't exist yet. Until it
does, sharing your site on LinkedIn shows no image.

It needs to be **1200×630** — landscape. Don't just rename the book cover: a tall
cover gets letterboxed into grey bars. Make a card with the cover on the left, and
the title plus "Out now on Amazon" on the right.

---

## What changed in `index.html`

**Head**

- Title and description now lead with the book and the full title
- Open Graph and Twitter card tags added (there were almost none)
- `Book` structured data with the Amazon offer, so Google can show it as a book
- Links `/assets/gallery.css`

**Hero**

- New hook: "I write about AI products, then go build them."
- New `.creds` line: Highspot / Innovapptive / e2open / ISB MBA
- "Now" line leads with the book being out
- **Buy the book** is now the primary button; résumé and call moved to ghost style
- Role line now reads "AI product leader · Author · Career coach and mentor"
- Dropped "I still open the editor myself" (you're sending this to an exec recruiter)
  and "Coaching and building careers" (the Coaching section already covers it)

**Book section**

- Kicker: "in progress" → "Out now on Amazon"
- Retitled to **The AI Product Manager Gita** — the published title, per RCMB's post.
  Your site called it "The AI PM Gita" throughout, which is a nickname, not what's on
  the cover. That split your SEO and made the site look like it described a draft.
- Cover image now links to Amazon rather than the brochure
- Subtitle line added: "18 Timeless Lessons from the Mahabharata…"
- "Know more about the book →" replaced with **Buy on Amazon** + **See the 18 parvas**

**New: The Launch section** (`#gallery`)

- Sits between the book and Ground Truth
- Carousel of launch photos and videos, native scroll-snap, no library
- Swipes on mobile, arrow keys on desktop, dot indicators
- Videos are `preload="none"` with poster frames; only one plays at a time
- If `media.js` is empty the whole section hides itself rather than showing an empty box

**News**

- Both entries were labelled "Upcoming" with August dates — three weeks past
- The RCMB entry said **"Orientation Session."** It wasn't. Per RCMB's own post it was
  a **Book Launch & Signing Ceremony** with Dr. S. R. Mandal (IIT Roorkee, IIT Dhanbad)
  as Chief Guest. You were under-selling your own launch on your own site.
- Both now carry `past` tags with corrected copy

**Nav**

- Added "Launch" between News and Build

---

## Still to do, outside these files

1. **`aipm-gita-brochure.html` — the buy button is dead.** Both "Get the Book" CTAs
   point at `href="#BOOK_LINK"`, a placeholder anchor. Anyone who read your launch post,
   clicked through, and decided to buy hit nothing. Replace with:
   `href="https://amzn.in/d/05wK97dp" target="_blank" rel="noopener"`
   Send me that file and I'll do it properly.

2. **Substack mismatch in the brochure.** It links `smcsrini.substack.com`; the homepage
   uses `vasumullapudi.substack.com`. Make them match.

3. **Consider a `.com` Amazon link.** `amzn.in` sends US readers — including exec
   recruiters — to Amazon India, where they may not be able to buy. If the book is also
   on amazon.com, use that in the hero and offer both in the book section.

4. **Testimonials.** Three LinkedIn recommendations were drafted for you in July and
   still aren't on the site. Amazon reviews would sit in the same section.

---

## Deploy

```bash
git add index.html assets tools Photos Videos
git commit -m "Book launch: The AI Product Manager Gita is live"
git push
```

Then check the LinkedIn preview at
[linkedin.com/post-inspector](https://www.linkedin.com/post-inspector/) — it caches
aggressively, and the inspector forces a re-scrape.
