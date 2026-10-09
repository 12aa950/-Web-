// 搜索：纯函数，按关键词模糊匹配物品名称 + 描述 + 地点
const Search = (function () {
  function normalize(s) {
    return String(s || '').toLowerCase().trim();
  }

  function search(items, keyword, opts) {
    const k = normalize(keyword);
    if (!k) return items.slice();
    const fields = (opts && opts.fields) || ['name', 'desc', 'place'];
    return items.filter(it =>
      fields.some(f => normalize(it[f]).includes(k))
    );
  }

  // 排序：已完成的沉底，active 按时间倒序
  function sortForDisplay(items) {
    return items.slice().sort((a, b) => {
      if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
  }

  return { search, sortForDisplay, normalize };
})();

if (typeof module !== 'undefined') module.exports = Search;