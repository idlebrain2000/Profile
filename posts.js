/* posts.js — hydrates the Write tab with live Substack posts from /api/posts.
   Progressive enhancement: if the API is slow, down, or blocked, the hard-coded
   cards already in index.html stay exactly as they are. Nothing ever looks broken. */
(function () {
  var list = document.querySelector('#write .articles');
  if (!list) return;

  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  var card = function (p, i, open) {
    var num = String(i + 1).padStart(2, '0');
    var tags = (p.tags || []).map(function (t) {
      return '<span class="atag">' + esc(t) + '</span>';
    }).join('');

    return '' +
      '<div class="acard' + (open ? ' on' : '') + '" onclick="toggleArticle(this)">' +
        '<div class="acard-top">' +
          '<span class="anum">' + num + '</span>' +
          '<div class="atitle" style="flex:1;">' + esc(p.title) + '</div>' +
          '<span class="adate">' + esc(p.date) + '</span>' +
        '</div>' +
        (p.subtitle ? '<div class="asub">' + esc(p.subtitle) + '</div>' : '') +
        '<div class="abody">' +
          (tags ? '<div class="atags">' + tags + '</div>' : '') +
          (p.summary ? '<div class="adesc">' + esc(p.summary) + '</div>' : '') +
          (p.quote ? '<div class="apq">"' + esc(p.quote) + '"</div>' : '') +
          '<a class="alink" href="' + esc(p.link) + '" target="_blank" rel="noopener" onclick="event.stopPropagation()">' +
            '<i class="ti ti-external-link"></i> Read on Substack</a>' +
        '</div>' +
      '</div>';
  };

  fetch('/api/posts')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data || !data.ok || !data.posts || !data.posts.length) return;
      var posts = data.posts;

      list.innerHTML = posts.map(function (p, i) { return card(p, i, i === 0); }).join('');

      // Keep the intro copy honest about how many essays are actually live.
      var lbl = document.querySelector('#write .ibox .ibox-lbl');
      if (lbl && /thread connecting/i.test(lbl.textContent)) {
        lbl.textContent = 'The thread connecting all ' + posts.length;
      }

      // Live badge next to the section header.
      var secLink = document.querySelector('#write .sec-hd .sec-link');
      if (secLink && !document.getElementById('gt-count')) {
        var span = document.createElement('span');
        span.id = 'gt-count';
        span.className = 'sec-lbl';
        span.style.color = 'var(--green-dark)';
        span.textContent = posts.length + ' essays · synced';
        secLink.parentNode.insertBefore(span, secLink);
      }
    })
    .catch(function () { /* keep the static cards */ });
})();
