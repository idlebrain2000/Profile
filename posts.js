/* posts.js — fills the Ground Truth section with live Substack essays from /api/posts.
   Renders each essay with its cover image, title, date and subtitle.
   Progressive enhancement: if the API is unreachable, the fallback essays hard-coded
   in index.html stay put. The page never looks broken. */
(function () {
  var list = document.querySelector('#write .essays');
  if (!list) return;

  var LIMIT = 6; // newest N on the homepage; the rest live on Substack

  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  // Substack's CDN honours Cloudinary transforms without breaking the URL signature —
  // ask for a 200px square crop instead of pulling the full 2816px original. Verified.
  var thumb = function (url) {
    if (!url) return '';
    return url.replace('f_auto,q_auto:good', 'w_200,h_200,c_fill,f_auto,q_auto:good');
  };

  var row = function (p) {
    var img = p.image
      ? '<img class="essay-img" src="' + esc(thumb(p.image)) + '" alt="" loading="lazy" ' +
        'onerror="this.style.display=\'none\'">'
      : '';

    return '' +
      '<a class="essay" href="' + esc(p.link) + '" target="_blank" rel="noopener">' +
        img +
        '<div class="essay-body">' +
          '<div class="essay-top">' +
            '<div class="essay-t">' + esc(p.title) + '</div>' +
            '<div class="essay-d">' + esc(p.date) + '</div>' +
          '</div>' +
          (p.subtitle ? '<div class="essay-s">' + esc(p.subtitle) + '</div>' : '') +
        '</div>' +
      '</a>';
  };

  fetch('/api/posts')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data || !data.ok || !data.posts || !data.posts.length) return;

      list.innerHTML = data.posts.slice(0, LIMIT).map(row).join('');

      var more = document.querySelector('#write .more');
      if (more) more.textContent = 'All ' + data.posts.length + ' essays on Substack →';
    })
    .catch(function () { /* keep the fallback essays */ });
})();
