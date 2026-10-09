// 存储管理：使用 localStorage 持久化
// 为方便测试，所有 IO 函数都不直接操作 DOM、不引入全局副作用
const Storage = (function () {
  const KEY = 'lfz_items_v1';
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }
  return { KEY, load, save };
})();

if (typeof module !== 'undefined') module.exports = Storage;