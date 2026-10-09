// 单元测试：用 Jest 覆盖 Data / Search / Storage 三个纯模块
const Data = require('../js/data');
const Search = require('../js/search');

describe('Data.createItem', () => {
  test('正常输入返回合法条目', () => {
    const it = Data.createItem({
      name: '黑色雨伞', desc: '三折', place: '食堂', contact: 'wx_01', type: 'lost'
    });
    expect(it.id).toMatch(/^x/);
    expect(it.name).toBe('黑色雨伞');
    expect(it.type).toBe('lost');
    expect(it.status).toBe('active');
    expect(it.createdAt).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });

  test('缺失必填项抛出明确错误', () => {
    expect(() => Data.createItem({ name: '', place: 'p', contact: 'c', type: 'lost' }))
      .toThrow('物品名称不能为空');
    expect(() => Data.createItem({ name: 'n', place: '', contact: 'c', type: 'lost' }))
      .toThrow('地点不能为空');
    expect(() => Data.createItem({ name: 'n', place: 'p', contact: '', type: 'lost' }))
      .toThrow('联系方式不能为空');
  });

  test('type 非法时拒绝创建', () => {
    expect(() => Data.createItem({ name: 'n', place: 'p', contact: 'c', type: 'xxx' }))
      .toThrow('type 必须是 lost 或 found');
  });
});

describe('Data.markDone / removeDone', () => {
  const arr = [
    { id: 'a', name: 'A', type: 'lost', status: 'active' },
    { id: 'b', name: 'B', type: 'found', status: 'active' },
    { id: 'c', name: 'C', type: 'lost', status: 'done' },
  ];

  test('markDone 仅改指定 id', () => {
    const out = Data.markDone(arr, 'a');
    expect(out.find(x => x.id === 'a').status).toBe('done');
    expect(out.find(x => x.id === 'b').status).toBe('active');
  });

  test('removeDone 移除已完成项', () => {
    const out = Data.removeDone(arr);
    expect(out.length).toBe(2);
    expect(out.every(x => x.status !== 'done')).toBe(true);
  });
});

describe('Data.filterByType', () => {
  const arr = [
    { id: '1', type: 'lost' },
    { id: '2', type: 'found' },
    { id: '3', type: 'lost' },
  ];
  test('all 返回全部（不修改原数组）', () => {
    const out = Data.filterByType(arr, 'all');
    expect(out.length).toBe(3);
    expect(out).not.toBe(arr);   // 不应是同一个引用
  });
  test('lost / found 各自筛选正确', () => {
    expect(Data.filterByType(arr, 'lost').length).toBe(2);
    expect(Data.filterByType(arr, 'found').length).toBe(1);
  });
});

describe('Search.search', () => {
  const arr = [
    { id: '1', name: '校园卡', desc: '尾号5201', place: '一区教学楼' },
    { id: '2', name: '黑色雨伞', desc: '三折', place: '食堂二楼' },
    { id: '3', name: '钥匙串', desc: '三个钥匙', place: '操场' },
  ];

  test('空关键词返回全部', () => {
    expect(Search.search(arr, '').length).toBe(3);
    expect(Search.search(arr, null).length).toBe(3);
  });

  test('匹配名称（中文）', () => {
    const out = Search.search(arr, '校园卡');
    expect(out.map(x => x.id)).toEqual(['1']);
  });

  test('匹配描述', () => {
    expect(Search.search(arr, '5201').map(x => x.id)).toEqual(['1']);
    expect(Search.search(arr, '三个').map(x => x.id)).toEqual(['3']);
  });

  test('匹配地点', () => {
    expect(Search.search(arr, '食堂').map(x => x.id)).toEqual(['2']);
    expect(Search.search(arr, '操场').map(x => x.id)).toEqual(['3']);
  });

  test('不区分大小写', () => {
    expect(Search.search(arr, 'Campus').length).toBe(0);  // 数据里无英文
  });

  test('匹配不到返回空数组', () => {
    expect(Search.search(arr, '不存在的物品xyz').length).toBe(0);
  });
});

describe('Search.sortForDisplay', () => {
  const arr = [
    { id: '1', status: 'active', createdAt: '2026-09-30 10:00' },
    { id: '2', status: 'done',   createdAt: '2026-09-30 11:00' },
    { id: '3', status: 'active', createdAt: '2026-09-30 12:00' },
  ];
  test('active 在前；active 内部按时间倒序', () => {
    const out = Search.sortForDisplay(arr);
    expect(out.map(x => x.id)).toEqual(['3', '1', '2']);
  });
  test('不修改原数组顺序', () => {
    const before = arr.map(x => x.id).join(',');
    Search.sortForDisplay(arr);
    expect(arr.map(x => x.id).join(',')).toBe(before);
  });
});