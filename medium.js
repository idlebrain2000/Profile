/* medium.js — fills the "On Medium" section with essays from /api/medium.
   The section starts hidden and is revealed only when essays load, so it never
   shows up empty if Medium is unreachable. */
(function () {
  var section = document.getElementById('medium');
  if (!section) return;
  var list = section.querySelector('.essays');
  if (!list) return;

  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  var row = function (p) {
    var img = p.image
      ? '<img class="essay-img" src="' + esc(p.image) + '" alt="" loading="lazy" ' +
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

  fetch('/api/medium')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data || !data.ok || !data.posts || !data.posts.length) return; // stay hidden
      list.innerHTML = data.posts.map(row).join('');
      section.style.display = '';
      var more = section.querySelector('.more');
      if (more) more.textContent = 'All ' + data.posts.length + ' essays on Medium →';
    })
    .catch(function () { /* stay hidden */ });
})();
