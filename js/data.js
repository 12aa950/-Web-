// 业务数据操作：纯函数，便于单元测试
const Data = (function () {
  function uid() {
    return 'x' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  }

  function nowStr() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // 新建条目（参数对象包含 name/desc/place/contact/type）
  function createItem(input) {
    const { name, desc, place, contact, type } = input;
    if (!name || !name.trim()) throw new Error('物品名称不能为空');
    if (!place || !place.trim()) throw new Error('地点不能为空');
    if (!contact || !contact.trim()) throw new Error('联系方式不能为空');
    if (type !== 'lost' && type !== 'found') throw new Error('type 必须是 lost 或 found');
    return {
      id: uid(),
      name: name.trim(),
      desc: (desc || '').trim(),
      place: place.trim(),
      contact: contact.trim(),
      type,
      status: 'active',     // active / done
      createdAt: nowStr(),
    };
  }

  function markDone(items, id) {
    return items.map(it => it.id === id ? { ...it, status: 'done' } : it);
  }

  function removeDone(items) {
    return items.filter(it => it.status !== 'done');
  }

  // 按类型筛选
  function filterByType(items, type) {
    if (!type || type === 'all') return items.slice();
    return items.filter(it => it.type === type);
  }

  return { uid, nowStr, createItem, markDone, removeDone, filterByType };
})();

if (typeof module !== 'undefined') module.exports = Data;