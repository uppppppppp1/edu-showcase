document.addEventListener('DOMContentLoaded', function () {
  var filterBar = document.getElementById('yearFilter');
  var list = document.getElementById('itemList');
  if (!filterBar || !list) return;

  filterBar.addEventListener('click', function (e) {
    var btn = e.target.closest('.year-btn');
    if (!btn) return;

    filterBar.querySelectorAll('.year-btn').forEach(function (b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');

    var year = btn.dataset.year;
    list.querySelectorAll('.item-row').forEach(function (row) {
      if (year === 'all' || row.dataset.year === year) {
        row.classList.remove('hidden');
      } else {
        row.classList.add('hidden');
      }
    });
  });
});
