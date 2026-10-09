// 应用入口：渲染、事件、串起 Data/Search/Storage
(function () {
  const view = document.getElementById('view');
  const nav = document.getElementById('nav');

  const state = {
    page: 'home',     // home / search / mine
    type: 'all',      // all / lost / found
    keyword: '',
    selectedId: null,
    currentUser: '我',  // 单人开发：固定为一个虚拟发布者，方便“我的发布”演示
  };

  function getItems() { return Storage.load(); }
  function setItems(arr) { Storage.save(arr); }

  function render() {
    renderNav();
    if (state.page === 'home') renderHome();
    if (state.page === 'search') renderSearch();
    if (state.page === 'mine') renderMine();
  }

  function renderNav() {
    const items = [
      { k: 'home', label: '首页' },
      { k: 'search', label: '搜索' },
      { k: 'mine', label: '我的发布' },
    ];
    nav.innerHTML = items.map(it =>
      `<button data-page="${it.k}" class="${state.page === it.k ? 'active' : ''}">${it.label}</button>`
    ).join('') + `<button id="nav-publish" style="background:#07C160;color:#FFF;border-radius:8px;padding:8px 16px;border:0;cursor:pointer;font-size:15px;">+ 发布</button>`;
    nav.querySelectorAll('button[data-page]').forEach(b =>
      b.addEventListener('click', () => { state.page = b.dataset.page; render(); })
    );
    document.getElementById('nav-publish').addEventListener('click', openPublish);
  }

  function cardHTML(it) {
    const tagClass = it.status === 'done' ? 'done' : (it.type === 'lost' ? 'lost' : 'found');
    const tagText = it.status === 'done' ? '已完成' : (it.type === 'lost' ? '寻物' : '招领');
    const thumbChar = (it.name || '?')[0];
    return `
      <div class="card" data-id="${it.id}">
        <div class="thumb">${thumbChar}</div>
        <div class="body">
          <div class="title">${escapeHTML(it.name)}</div>
          <div class="meta-row">
            <span class="tag ${tagClass}">${tagText}</span>
            <span class="sub">${escapeHTML(it.place)} · ${escapeHTML(it.createdAt)}</span>
          </div>
        </div>
      </div>`;
  }

  function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function typeTabsHTML() {
    const tabs = [
      { k: 'all', label: '全部' },
      { k: 'lost', label: '寻物' },
      { k: 'found', label: '招领' },
    ];
    return '<div class="tabs">' + tabs.map(t =>
      `<button data-type="${t.k}" class="${state.type === t.k ? 'active' : ''}">${t.label}</button>`
    ).join('') + '</div>';
  }

  function bindTypeTabs() {
    document.querySelectorAll('.tabs button').forEach(b =>
      b.addEventListener('click', () => { state.type = b.dataset.type; render(); })
    );
  }

  function renderHome() {
    const items = Search.sortForDisplay(
      Data.filterByType(getItems(), state.type)
    );
    view.innerHTML = `
      ${typeTabsHTML()}
      <div class="list">${items.length ? items.map(cardHTML).join('') : '<div class="empty">暂无信息，快去发布一条吧~</div>'}</div>`;
    bindTypeTabs();
    bindCards();
  }

  function renderSearch() {
    view.innerHTML = `
      <div class="searchbar">
        <input id="kw" placeholder="搜索物品名称 / 描述 / 地点" value="${escapeHTML(state.keyword)}">
        <button class="secondary" id="kw-clear">清空</button>
        <button id="kw-go">搜索</button>
      </div>
      <div class="list" id="slist"></div>`;
    const kwInput = document.getElementById('kw');
    kwInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
    document.getElementById('kw-go').addEventListener('click', doSearch);
    document.getElementById('kw-clear').addEventListener('click', () => {
      state.keyword = ''; kwInput.value = ''; doSearch();
    });
    doSearch();
  }

  function doSearch() {
    state.keyword = document.getElementById('kw').value || '';
    const items = Search.sortForDisplay(Search.search(getItems(), state.keyword));
    document.getElementById('slist').innerHTML =
      items.length ? items.map(cardHTML).join('') : '<div class="empty">没有匹配的信息</div>';
    bindCards();
  }

  function renderMine() {
    const all = getItems();
    const mine = all.filter(it => it.publisher === state.currentUser);
    const items = Search.sortForDisplay(mine);
    view.innerHTML = `
      <h2 style="margin-bottom:12px;">我的发布（${mine.length}）</h2>
      <div class="list">${items.length ? items.map(cardHTML).join('') : '<div class="empty">你还没有发布过信息</div>'}</div>`;
    bindCards();
  }

  function bindCards() {
    document.querySelectorAll('.card').forEach(c =>
      c.addEventListener('click', () => openDetail(c.dataset.id))
    );
  }

  // 发布弹窗
  function openPublish() {
    state.publishType = 'lost';
    document.getElementById('publishModal').hidden = false;
    document.querySelectorAll('#publishModal .tab').forEach(t =>
      t.classList.toggle('active', t.dataset.type === state.publishType));
    document.querySelectorAll('#publishModal .tab').forEach(t =>
      t.onclick = () => {
        state.publishType = t.dataset.type;
        document.querySelectorAll('#publishModal .tab').forEach(x =>
          x.classList.toggle('active', x.dataset.type === state.publishType));
      });
    document.getElementById('i-name').value = '';
    document.getElementById('i-desc').value = '';
    document.getElementById('i-place').value = '';
    document.getElementById('i-contact').value = '';
  }
  document.getElementById('i-cancel').onclick = () =>
    document.getElementById('publishModal').hidden = true;
  document.getElementById('i-submit').onclick = () => {
    try {
      const item = Data.createItem({
        name: document.getElementById('i-name').value,
        desc: document.getElementById('i-desc').value,
        place: document.getElementById('i-place').value,
        contact: document.getElementById('i-contact').value,
        type: state.publishType,
      });
      item.publisher = state.currentUser;
      const arr = getItems();
      arr.push(item);
      setItems(arr);
      document.getElementById('publishModal').hidden = true;
      alert('发布成功！');
      render();
    } catch (e) {
      alert(e.message);
    }
  };

  // 详情弹窗
  function openDetail(id) {
    const it = getItems().find(x => x.id === id);
    if (!it) return;
    state.selectedId = id;
    document.getElementById('d-title').textContent = it.name;
    document.getElementById('d-type').textContent = it.status === 'done' ? '已完成' : (it.type === 'lost' ? '寻物' : '招领');
    document.getElementById('d-time').textContent = it.createdAt;
    document.getElementById('d-desc').textContent = it.desc || '(无描述)';
    document.getElementById('d-place').textContent = it.place;
    document.getElementById('d-contact').textContent = it.contact;
    document.getElementById('d-status').textContent = it.status === 'done' ? '已完成' : '进行中';
    document.getElementById('d-status-btn').textContent =
      it.status === 'done' ? '已完成' : '标记为已完成';
    document.getElementById('d-status-btn').disabled = it.status === 'done';
    document.getElementById('detailModal').hidden = false;
  }
  document.getElementById('d-close').onclick = () =>
    document.getElementById('detailModal').hidden = true;
  document.getElementById('d-copy').onclick = () => {
    const it = getItems().find(x => x.id === state.selectedId);
    if (!it) return;
    navigator.clipboard?.writeText(it.contact).then(
      () => alert('联系方式已复制'),
      () => alert('复制失败，请手动复制')
    );
  };
  document.getElementById('d-status-btn').onclick = () => {
    const arr = Data.markDone(getItems(), state.selectedId);
    setItems(arr);
    document.getElementById('detailModal').hidden = true;
    render();
  };

  // 种子数据：首次进入若为空，写入若干示例
  function seedIfEmpty() {
    if (getItems().length) return;
    const samples = [
      ['校园卡', '尾号5201', '一区教学楼302', 'wx_01', 'found'],
      ['黑色雨伞', '天堂牌，三折', '食堂二楼', 'wx_02', 'lost'],
      ['钥匙串', '三个钥匙一个挂件', '操场看台', 'wx_03', 'found'],
      ['水杯', '白色保温杯，贴皮卡丘', '图书馆三楼', 'wx_04', 'lost'],
    ];
    const arr = [];
    for (const [n, d, p, c, t] of samples) {
      const it = Data.createItem({ name: n, desc: d, place: p, contact: c, type: t });
      it.publisher = t === 'lost' ? '王同学' : '李同学';
      arr.push(it);
    }
    setItems(arr);
  }

  seedIfEmpty();
  render();
})();