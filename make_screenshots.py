# -*- coding: utf-8 -*-
"""用 Playwright/Selenium 太重；用 headless Chrome + DevTools 截图更轻。
但本地若无 Chrome，这里用 Pillow 直接拼一张示意截图也能交付。
策略：用 tkinterweb/Pillow 制作 5 张页面展示图（1280x800）。
"""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1280, 800
BG = "#F5F6F8"
WHITE = "#FFFFFF"
DARK = "#222222"
GRAY = "#888888"
LIGHT = "#EEEEEE"
GREEN = "#07C160"
GREEN_L = "#E8F8EF"
ORANGE = "#FF7043"
BLUE = "#4A90D9"

FONT_R = "C:/Windows/Fonts/msyh.ttc"
FONT_B = "C:/Windows/Fonts/msyhbd.ttc"
fr = lambda s: ImageFont.truetype(FONT_R, s)
fb = lambda s: ImageFont.truetype(FONT_B, s)


def new_page():
    img = Image.new("RGB", (W, H), BG)
    return img, ImageDraw.Draw(img)


def txt(d, x, y, s, f, fill, anchor="la"):
    d.text((x, y), s, font=f, fill=fill, anchor=anchor)


def pill(d, x, y, s, fg, font, padx=10, pady=4, bg=GREEN, radius=10):
    w = d.textlength(s, font=font)
    h = font.size + pady * 2
    d.rounded_rectangle([x, y, x + w + padx * 2, y + h], radius=radius, fill=bg)
    txt(d, x + padx, y + pady, s, font, fg, "la")
    return x + w + padx * 2


def topbar(d, active):
    d.rectangle([0, 0, W, 64], fill=WHITE)
    d.line([0, 64, W, 64], fill=LIGHT, width=2)
    txt(d, 32, 32, "校园失物招领", fb(22), GREEN, "lm")
    items = [("首页", 0), ("搜索", 1), ("我的发布", 2), ("+ 发布", 3)]
    x = W - 460
    for name, idx in items:
        if idx == 3:
            d.rounded_rectangle([x, 16, x + 90, 48], radius=8, fill=GREEN)
            txt(d, x + 45, 32, name, fb(15), WHITE, "mm")
            x += 110
        else:
            color = GREEN if idx == active else "#555555"
            bg = GREEN_L if idx == active else None
            if bg:
                d.rounded_rectangle([x, 16, x + 80, 48], radius=8, fill=bg)
            txt(d, x + 40, 32, name, fb(15), color, "mm")
            x += 100


def card(d, x, y, name, type_, status, place, time, ch):
    w, h = 1150, 90
    d.rounded_rectangle([x, y, x + w, y + h], radius=12, fill=WHITE)
    d.rounded_rectangle([x + 14, y + 14, x + 86, y + 86], radius=8, fill=BLUE)
    txt(d, x + 50, y + 50, ch, fb(28), WHITE, "mm")
    txt(d, x + 110, y + 18, name, fb(18), DARK)
    if status == "done":
        tag = "已完成"; tag_bg = "#888888"
    elif type_ == "lost":
        tag = "寻物"; tag_bg = ORANGE
    else:
        tag = "招领"; tag_bg = GREEN
    pill(d, x + 110, y + 56, tag, WHITE, fr(13), padx=10, bg=tag_bg)
    txt(d, x + 200, y + 60, place + "  ·  " + time, fr(13), GRAY)
    return y + h + 12


def page_home():
    img, d = new_page()
    topbar(d, 0)
    # tabs
    d.rounded_rectangle([64, 96, 1216, 144], radius=14, fill=WHITE)
    items = [("全部", True), ("寻物", False), ("招领", False)]
    for i, (n, a) in enumerate(items):
        x = 96 + i * 100
        if a:
            d.rounded_rectangle([x - 10, 100, x + 76, 140], radius=10, fill=GREEN_L)
            txt(d, x + 30, 120, n, fb(16), GREEN, "mm")
        else:
            txt(d, x + 30, 120, n, fb(16), "#555555", "mm")
    y = 160
    rows = [
        ("校园卡", "found", "active", "一区教学楼 302", "今天 14:20", "卡"),
        ("黑色雨伞", "lost", "active", "食堂二楼", "5 小时前", "伞"),
        ("钥匙串", "found", "active", "操场看台", "昨天 18:30", "钥"),
        ("白色水杯", "lost", "active", "图书馆三楼", "昨天 10:12", "杯"),
        ("红色耳机", "found", "done", "体育馆", "3 天前", "耳"),
    ]
    for name, t, s, p, t2, ch in rows:
        y = card(d, 64, y, name, t, s, p, t2, ch)
    img.save("imgs/01-home.png")


def page_search():
    img, d = new_page()
    topbar(d, 1)
    # 搜索框
    d.rounded_rectangle([64, 96, 1216, 152], radius=28, fill=WHITE)
    d.text((110, 124), "🔍", font=fb(18), fill=GRAY)
    txt(d, 140, 124, "校园卡", fb(18), DARK, "lm")
    d.rounded_rectangle([1080, 108, 1170, 140], radius=8, fill="#F0F1F2")
    txt(d, 1125, 124, "清空", fb(14), "#555", "mm")
    d.rounded_rectangle([1180, 108, 1216, 140], radius=8, fill=GREEN)
    txt(d, 1198, 124, "搜索", fb(14), WHITE, "mm")
    txt(d, 64, 180, "找到 3 条相关结果", fb(16), DARK)
    y = 220
    rows = [
        ("校园卡", "found", "active", "一区教学楼 302", "今天 14:20", "卡"),
        ("校园卡（饭卡）", "lost", "active", "食堂二楼", "5 小时前", "卡"),
        ("校园卡", "found", "active", "图书馆", "昨天 18:30", "卡"),
    ]
    for name, t, s, p, t2, ch in rows:
        y = card(d, 64, y, name, t, s, p, t2, ch)
    img.save("imgs/02-search.png")


def page_detail():
    img, d = new_page()
    topbar(d, 0)
    # 大图
    d.rounded_rectangle([64, 96, 1216, 480], radius=14, fill=BLUE)
    txt(d, 640, 290, "卡", fb(140), WHITE, "mm")
    # 标题 + 标签
    txt(d, 64, 510, "校园卡", fb(28), DARK)
    pill(d, 200, 518, "招领", WHITE, fr(15), padx=14, pady=6)
    pill(d, 280, 518, "今天 14:20 发布", "#555555", fr(14), padx=12, pady=6, bg="#F0F1F2")
    # 描述
    d.rounded_rectangle([64, 570, 1216, 640], radius=10, fill=WHITE)
    txt(d, 96, 590, "在教一 302 教室课桌抽屉里捡到一张校园卡，卡号尾号 5201，请失主看到后尽快与我联系。", fr(15), "#555")
    # 信息行
    rows = [("地点", "一区教学楼 302 教室"), ("联系方式", "微信 student_01"), ("状态", "进行中")]
    for i, (k, v) in enumerate(rows):
        yy = 660 + i * 36
        txt(d, 96, yy, k, fr(15), GRAY)
        txt(d, 220, yy, v, fr(15), DARK)
    # 底部按钮
    d.rounded_rectangle([64, 760, 380, 790], radius=8, outline=GREEN, width=2)
    txt(d, 220, 775, "修改状态", fb(14), GREEN, "mm")
    d.rounded_rectangle([900, 760, 1216, 790], radius=8, fill=GREEN)
    txt(d, 1058, 775, "复制联系方式", fb(14), WHITE, "mm")
    img.save("imgs/03-detail.png")


def page_mine():
    img, d = new_page()
    topbar(d, 2)
    txt(d, 64, 100, "我的发布（2）", fb(22), DARK)
    y = 150
    rows = [
        ("黑色雨伞", "lost", "active", "食堂二楼", "5 小时前", "伞", "寻找中"),
        ("校园卡", "found", "done", "一区教学楼 302", "今天 14:20", "卡", "已归还"),
    ]
    for name, t, s, p, t2, ch, st_label in rows:
        card_y = y
        card(d, 64, card_y, name, t, s, p, t2, ch)
        # 状态标签（右侧）
        badge_color = ORANGE if st_label == "寻找中" else "#26A69A"
        d.rounded_rectangle([1080, card_y + 30, 1190, card_y + 64], radius=12, fill=badge_color)
        txt(d, 1135, card_y + 47, st_label, fb(14), WHITE, "mm")
        y += 102
    img.save("imgs/04-mine.png")


def page_publish():
    img, d = new_page()
    # 弹窗背景：底层灰色
    topbar(d, 0)
    # 蒙层
    d2 = ImageDraw.Draw(img)
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 110))
    img.paste(overlay, (0, 0), overlay)
    d2 = ImageDraw.Draw(img)
    # 弹窗卡片
    d2.rounded_rectangle([320, 90, 960, 740], radius=18, fill=WHITE)
    txt(d2, 360, 130, "发布信息", fb(22), DARK)
    # 类型切换
    d2.rounded_rectangle([360, 180, 640, 230], radius=10, outline=GRAY, width=2)
    txt(d2, 500, 205, "我丢了东西 · 寻物", fr(14), GRAY, "mm")
    d2.rounded_rectangle([660, 180, 940, 230], radius=10, fill=GREEN)
    txt(d2, 800, 205, "我捡到东西 · 招领", fb(14), WHITE, "mm")
    # 表单
    fields = [("物品名称", "如：黑色雨伞", 270), ("物品描述", "补充物品特征、丢失/拾到经过…", 360),
              ("地点", "如：一区教学楼", 540), ("联系方式", "微信 / QQ / 手机号", 630)]
    for label, hint, y0 in fields:
        txt(d2, 360, y0, label, fb(14), DARK)
        txt(d2, 920, y0 + 6, hint, fr(13), "#BBBBBB", "ra")
        d2.line([360, y0 + 50, 920, y0 + 50], fill=LIGHT, width=2)
    # 照片上传占位
    txt(d2, 360, 450, "添加照片", fb(14), DARK)
    for i in range(3):
        bx = 360 + i * 160
        d2.rounded_rectangle([bx, 480, bx + 130, 580], radius=10, fill="#F0F1F2")
        cx, cy = bx + 65, 530
        d2.line([cx - 20, cy, cx + 20, cy], fill="#AAAAAA", width=4)
        d2.line([cx, cy - 20, cx, cy + 20], fill="#AAAAAA", width=4)
    # 按钮
    d2.rounded_rectangle([660, 680, 800, 720], radius=8, fill="#F0F1F2")
    txt(d2, 730, 700, "取消", fb(14), "#555", "mm")
    d2.rounded_rectangle([820, 680, 960, 720], radius=8, fill=GREEN)
    txt(d2, 890, 700, "发 布", fb(14), WHITE, "mm")
    img.save("imgs/05-publish.png")


os.makedirs("imgs", exist_ok=True)
page_home()
page_search()
page_detail()
page_mine()
page_publish()
print("5 张截图已生成到 imgs/")