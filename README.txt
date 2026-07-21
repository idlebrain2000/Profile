srinimullapudi.com — site update bundle
========================================

These 9 files go into the root of your GitHub repo: idlebrain2000/Profile

  index.html                     -> REPLACES the existing index.html
  Srinivas_Mullapudi_Resume.pdf  -> NEW (2-column résumé with your photo; the "Download résumé" button links to it)
  favicon.svg, favicon.ico,
  favicon-16.png, favicon-32.png,
  apple-touch-icon.png,
  icon-192.png, icon-512.png      -> NEW (browser-tab / bookmark icons)

HOW TO MERGE (one commit, no terminal)
--------------------------------------
1. Go to github.com/idlebrain2000/Profile  (main branch)
2. Add file -> Upload files
3. Drag in all 9 files above (drop at the repo root)
4. Commit message: "Add résumé, CTAs, testimonials, analytics, favicons, Praise nav"
5. Commit directly to main  ->  Commit changes
6. Vercel auto-deploys in ~30-60s. Hard-refresh srinimullapudi.com.

(Optional preview: choose "Create a new branch and start a pull request"
instead at step 5; open the Vercel Preview link on the PR, then Merge.)

WHAT CHANGED IN index.html
--------------------------
- Favicon links + Google Analytics 4 tag (G-CRP3GRYDDY) in <head>
- "Download résumé" + "Book a call" (Calendly) buttons in hero and Contact
- New "What people say" testimonials section (3 LinkedIn recommendations)
- "Praise" link added to the top nav
- Embedded Substack signup in the Writing section
- "Demo" badges on Sway, Aria, SugaPal, LuxeHome
- Footer availability line clarified (US-remote, overlaps US hours)
