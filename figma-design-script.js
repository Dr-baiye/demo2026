// ============================================================
// AI 对话工作台 — Figma 完整绘制脚本
// 包含 3 个画板：聊天页、设置页（含智能体选择器）、暗色模式
// 使用方法：Figma 顶部菜单 → 插件 → 开发 → 新建插件
// 将此文件内容复制到插件中执行
// ============================================================

const GRAY_50 = { r: 0.976, g: 0.98, b: 0.984 };
const GRAY_100 = { r: 0.953, g: 0.953, b: 0.961 };
const GRAY_200 = { r: 0.898, g: 0.906, b: 0.922 };
const GRAY_300 = { r: 0.82, g: 0.831, b: 0.847 };
const GRAY_400 = { r: 0.612, g: 0.639, b: 0.686 };
const GRAY_500 = { r: 0.42, g: 0.447, b: 0.502 };
const GRAY_600 = { r: 0.294, g: 0.333, b: 0.388 };
const GRAY_700 = { r: 0.435, g: 0.435, b: 0.435 };
const GRAY_800 = { r: 0.324, g: 0.324, b: 0.364 };
const GRAY_900 = { r: 0.067, g: 0.094, b: 0.122 };
const WHITE = { r: 1, g: 1, b: 1 };
const PRIMARY = { r: 0.063, g: 0.725, b: 0.506 };
const PRIMARY_PLACEHOLDER = { r: 0.063, g: 0.725, b: 0.506, a: 0.2 };
// 暗色模式颜色
const DARK_BG = { r: 0.196, g: 0.212, b: 0.235 };
const DARK_SIDEBAR = { r: 0.196, g: 0.212, b: 0.235 };
const DARK_BUBBLE_USER = { r: 0.216, g: 0.235, b: 0.263 };
const DARK_BUBBLE_AI = { r: 0.196, g: 0.212, b: 0.235 };
const DARK_TEXT = { r: 0.976, g: 0.98, b: 0.984 };
const DARK_TEXT_SUB = { r: 0.612, g: 0.639, b: 0.686 };
const DARK_BORDER = { r: 0.294, g: 0.333, b: 0.388 };
const DARK_INPUT_BG = { r: 0.294, g: 0.333, b: 0.388 };

// =============================================
// 辅助函数
// =============================================
function solid(c, opacity = 1) {
  return [{ type: 'SOLID', color: c, opacity }];
}

function stroke(c, weight = 1) {
  return [{ type: 'SOLID', color: c, opacity: 1 }];
}

function makeText(parent, chars, opts = {}) {
  const t = figma.createText();
  t.characters = chars;
  t.fontSize = opts.fontSize || 14;
  t.fontName = { family: "Inter", style: opts.style || "Regular" };
  t.fills = solid(opts.color || GRAY_900);
  if (opts.lineHeight) t.lineHeight = { unit: 'PIXELS', value: opts.lineHeight };
  if (opts.letterSpacing) t.letterSpacing = { unit: 'PIXELS', value: opts.letterSpacing };
  if (parent) parent.appendChild(t);
  return t;
}

function makeFrame(parent, opts = {}) {
  const f = figma.createFrame();
  f.name = opts.name || "Frame";
  f.resize(opts.w || 100, opts.h || 100);
  if (opts.fills !== undefined) f.fills = opts.fills;
  else f.fills = [];
  if (opts.cornerRadius) f.cornerRadius = opts.cornerRadius;
  if (opts.strokes) { f.strokes = opts.strokes; f.strokeWeight = opts.strokeWeight || 1; }
  if (opts.x !== undefined) f.x = opts.x;
  if (opts.y !== undefined) f.y = opts.y;
  if (parent) parent.appendChild(f);
  return f;
}

function makeAutoLayout(parent, opts = {}) {
  const f = makeFrame(parent, opts);
  f.layoutMode = opts.direction || 'VERTICAL';
  f.primaryAxisSizingMode = opts.primarySizing || 'AUTO';
  f.counterAxisSizingMode = opts.counterSizing || 'FIXED';
  f.layoutSizingHorizontal = opts.hSizing || 'FIXED';
  f.layoutSizingVertical = opts.vSizing || 'HUG';
  f.primaryAxisAlignItems = opts.primaryAlign || 'MIN';
  f.counterAxisAlignItems = opts.counterAlign || 'MIN';
  if (opts.paddingTop) f.paddingTop = opts.paddingTop;
  if (opts.paddingBottom) f.paddingBottom = opts.paddingBottom;
  if (opts.paddingLeft) f.paddingLeft = opts.paddingLeft;
  if (opts.paddingRight) f.paddingRight = opts.paddingRight;
  if (opts.itemSpacing !== undefined) f.itemSpacing = opts.itemSpacing;
  return f;
}

// =============================================
// 主流程
// =============================================
async function main() {
  // 加载字体
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

  // 创建新页面
  let page = figma.root.children.find(p => p.name === "AI 对话工作台");
  if (!page) {
    page = figma.createPage();
    page.name = "AI 对话工作台";
  }
  await figma.setCurrentPageAsync(page);

  // ==========================================
  // 主画板 1440×900
  // ==========================================
  const canvas = makeFrame(page, {
    name: "设计稿",
    w: 1440, h: 900,
    fills: solid(WHITE),
    x: 0, y: 0,
    cornerRadius: 0,
  });

  // ==========================================
  // 左侧侧边栏 240×900
  // ==========================================
  const sidebar = makeAutoLayout(canvas, {
    name: "侧边栏",
    w: 240, h: 900,
    direction: 'VERTICAL',
    x: 0, y: 0,
    fills: solid(WHITE),
    strokes: stroke(GRAY_100),
    strokeWeight: 1,
    strokeAlign: 'RIGHT',
  });

  // --- 新对话按钮 ---
  const btnWrap = makeAutoLayout(sidebar, {
    name: "按钮区域",
    w: 240,
    paddingTop: 16,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
  });

  const btn = makeAutoLayout(btnWrap, {
    name: "新对话",
    w: 208,
    direction: 'HORIZONTAL',
    primaryAlign: 'CENTER',
    counterAlign: 'CENTER',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 16,
    paddingRight: 16,
    itemSpacing: 8,
    cornerRadius: 8,
    strokes: stroke(GRAY_200),
    strokeWeight: 1,
  });

  makeText(btn, "＋", { fontSize: 16, color: GRAY_700, style: "Medium" });
  makeText(btn, "新对话", { fontSize: 14, color: GRAY_700, style: "Medium" });

  // --- 会话列表容器 ---
  const chatList = makeAutoLayout(sidebar, {
    name: "会话列表",
    w: 240,
    paddingLeft: 8, paddingRight: 8,
    paddingTop: 0, paddingBottom: 0,
    itemSpacing: 16,
  });
  chatList.layoutSizingVertical = 'FILL';

  // --- 分组标题 + 会话项 ---
  function addGroup(parent, label, items, activeIndex = -1) {
    const group = makeAutoLayout(parent, {
      name: label,
      w: 224,
      itemSpacing: 2,
    });

    const header = makeAutoLayout(group, {
      name: "分组标题",
      w: 224,
      paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 12,
    });
    makeText(header, label, {
      fontSize: 12,
      style: "Medium",
      color: GRAY_400,
      letterSpacing: 0.5,
    });

    items.forEach((title, i) => {
      const itemFrame = makeFrame(group, {
        name: "会话项",
        w: 224, h: 36,
        cornerRadius: 8,
        fills: i === activeIndex ? solid(GRAY_50) : [],
        strokes: i === activeIndex ? [] : undefined,
      });

      // 选中项的绿色竖条
      if (i === activeIndex) {
        const bar = makeFrame(itemFrame, {
          name: "选中指示条",
          w: 2, h: 24,
          x: 0, y: 6,
          fills: solid(PRIMARY),
          cornerRadius: 2,
        });
      }

      const itemText = makeText(itemFrame, title, {
        fontSize: 14,
        style: i === activeIndex ? "Medium" : "Regular",
        color: i === activeIndex ? GRAY_900 : GRAY_600,
      });
      itemText.x = 12;
      itemText.y = 8;
      itemText.textAutoResize = 'WIDTH_AND_HEIGHT';
      itemFrame.clipsContent = true;
    });
  }

  addGroup(chatList, "今天", [
    "产品文案优化方案讨论",
    "React 组件设计思路",
    "用户访谈问题梳理",
  ], 0);

  addGroup(chatList, "昨天", [
    "竞品分析报告撰写",
    "数据可视化图表选择",
    "API 接口文档重构",
    "前端性能优化调研",
  ]);

  addGroup(chatList, "更早", [
    "设计系统主题定制",
  ]);

  // --- 底部设置 ---
  const settingsBottom = makeAutoLayout(sidebar, {
    name: "底部设置",
    w: 240,
    paddingTop: 12, paddingBottom: 12, paddingLeft: 16, paddingRight: 16,
    itemSpacing: 8,
    direction: 'HORIZONTAL',
    counterAlign: 'CENTER',
    primaryAlign: 'MIN',
    strokes: stroke(GRAY_100),
    strokeWeight: 1,
    strokeAlign: 'INSIDE',
  });

  // 设置图标用 ⚙ 文字代替 SVG（Figma API 不支持内联 SVG 作为图标）
  makeText(settingsBottom, "⚙", { fontSize: 18, color: GRAY_600 });
  makeText(settingsBottom, "设置", { fontSize: 14, color: GRAY_600 });

  // ==========================================
  // 右侧主区域 1200×900
  // ==========================================
  const mainArea = makeAutoLayout(canvas, {
    name: "主区域",
    w: 1200, h: 900,
    direction: 'VERTICAL',
    x: 240, y: 0,
    fills: solid(WHITE),
    primarySizing: 'AUTO',
  });

  // --- 对话内容区（可滚动） ---
  const chatContent = makeAutoLayout(mainArea, {
    name: "对话内容",
    w: 1200,
    paddingTop: 128, paddingBottom: 48,
    paddingLeft: 24, paddingRight: 24,
    counterAlign: 'CENTER',
    itemSpacing: 24,
  });
  chatContent.layoutSizingVertical = 'FILL';

  // 欢迎语
  const welcome = makeAutoLayout(chatContent, {
    name: "欢迎语",
    w: 672,
    counterAlign: 'CENTER',
    itemSpacing: 12,
  });
  makeText(welcome, "今天想一起探索什么？", {
    fontSize: 30,
    style: "Semi Bold",
    color: GRAY_800,
    letterSpacing: -0.5,
  });

  // --- 消息气泡 ---
  function addBubble(parent, type, text) {
    const row = makeAutoLayout(parent, {
      name: type === 'user' ? "用户气泡行" : "AI气泡行",
      w: 672,
      direction: 'HORIZONTAL',
      primaryAlign: type === 'user' ? 'MAX' : 'MIN',
    });

    const bubble = makeFrame(row, {
      name: type === 'user' ? "用户气泡" : "AI气泡",
      w: 480,
    });
    bubble.layoutSizingHorizontal = 'HUG';
    bubble.layoutSizingVertical = 'HUG';
    bubble.fills = type === 'user' ? solid({ r: 0.953, g: 0.957, b: 0.965 }) : solid(WHITE);
    if (type === 'user') {
      bubble.cornerRadius = 16;
      bubble.set({ topLeftRadius: 16, topRightRadius: 16, bottomLeftRadius: 16, bottomRightRadius: 4 });
    } else {
      bubble.cornerRadius = 16;
      bubble.strokes = stroke({ r: 0.898, g: 0.906, b: 0.922 });
      bubble.strokeWeight = 1;
    }

    const bubbleText = makeText(bubble, text, {
      fontSize: 14,
      style: "Regular",
      color: GRAY_900,
      lineHeight: 22.4,
    });
    bubbleText.x = 16;
    bubbleText.y = 12;
    bubbleText.layoutSizingHorizontal = 'FIXED';
    bubbleText.layoutSizingVertical = 'HUG';
    bubbleText.resize(448, bubbleText.height);

    bubble.resize(480, bubbleText.height + 24);
  }

  addBubble(chatContent, 'user', "帮我分析一下这个产品的目标用户画像，我有一份上个月的调研数据。");
  addBubble(chatContent, 'ai', "好的！根据你提供的调研数据，我可以从以下几个维度帮你构建用户画像：人口统计特征、行为模式、痛点和需求优先级。你可以先把数据发给我，或者描述一下核心发现。");
  addBubble(chatContent, 'user', "核心发现是 25-35 岁一二线城市的职场人群占比最高，他们对效率工具有强烈付费意愿。");

  // --- 底部输入区 ---
  const inputArea = makeAutoLayout(mainArea, {
    name: "输入区",
    w: 1200,
    paddingTop: 16, paddingBottom: 16,
    paddingLeft: 16, paddingRight: 16,
    counterAlign: 'CENTER',
    itemSpacing: 12,
    strokes: stroke(GRAY_200),
    strokeWeight: 1,
    strokeAlign: 'INSIDE',
  });

  const inputRow = makeAutoLayout(inputArea, {
    name: "输入行",
    w: 672,
    direction: 'HORIZONTAL',
    primaryAlign: 'MIN',
    counterAlign: 'MAX',
    itemSpacing: 12,
    paddingTop: 12, paddingBottom: 12,
    paddingLeft: 16, paddingRight: 16,
    cornerRadius: 16,
    fills: solid(GRAY_50),
    strokes: stroke(GRAY_200),
    strokeWeight: 1,
  });

  // 左侧圆形+按钮
  const circleBtn = makeFrame(inputRow, {
    name: "快捷按钮",
    w: 36, h: 36,
    cornerRadius: 999,
    strokes: stroke(GRAY_300),
    strokeWeight: 1,
  });
  const circleBtnLayout = makeAutoLayout(circleBtn, {
    name: "inner",
    w: 36, h: 36,
    direction: 'HORIZONTAL',
    primaryAlign: 'CENTER',
    counterAlign: 'CENTER',
  });
  makeText(circleBtnLayout, "＋", { fontSize: 18, color: GRAY_500, style: "Medium" });

  // 输入占位符
  const inputPlaceholder = makeText(inputRow, "输入消息，Enter 发送，Shift+Enter 换行", {
    fontSize: 14,
    color: GRAY_400,
    lineHeight: 22.4,
  });
  inputPlaceholder.layoutSizingHorizontal = 'FILL';
  inputPlaceholder.layoutSizingVertical = 'HUG';

  // 发送按钮
  const sendBtn = makeFrame(inputRow, {
    name: "发送按钮",
    w: 36, h: 36,
    cornerRadius: 8,
    fills: solid(PRIMARY),
  });
  const sendBtnLayout = makeAutoLayout(sendBtn, {
    name: "inner",
    w: 36, h: 36,
    direction: 'HORIZONTAL',
    primaryAlign: 'CENTER',
    counterAlign: 'CENTER',
  });
  makeText(sendBtnLayout, "➤", { fontSize: 16, color: WHITE, style: "Medium" });

  // 底部提示
  makeText(inputArea, "AI 助手可能会产生不准确的信息，请注意甄别", {
    fontSize: 12,
    color: GRAY_400,
  });

  // ==========================================
  // 页面2：设置页 1440×900
  // ==========================================
  const settingsCanvas = makeFrame(page, {
    name: "设置页",
    w: 1440, h: 900,
    fills: solid(WHITE),
    x: 1480, y: 0,
    cornerRadius: 0,
  });

  // 左侧导航栏（复用聊天页侧边栏结构）
  const settingsSidebar = makeAutoLayout(settingsCanvas, {
    name: "设置页-侧边栏",
    w: 240, h: 900,
    direction: 'VERTICAL',
    x: 0, y: 0,
    fills: solid(WHITE),
    strokes: stroke(GRAY_100),
    strokeWeight: 1,
    strokeAlign: 'RIGHT',
  });

  const sBtnWrap = makeAutoLayout(settingsSidebar, {
    name: "按钮区域",
    w: 240,
    paddingTop: 16, paddingBottom: 12,
    paddingLeft: 16, paddingRight: 16,
  });
  const sBtn = makeAutoLayout(sBtnWrap, {
    name: "新对话",
    w: 208,
    direction: 'HORIZONTAL',
    primaryAlign: 'CENTER', counterAlign: 'CENTER',
    paddingTop: 10, paddingBottom: 10,
    paddingLeft: 16, paddingRight: 16,
    itemSpacing: 8,
    cornerRadius: 8,
    strokes: stroke(GRAY_200),
    strokeWeight: 1,
  });
  makeText(sBtn, "＋", { fontSize: 16, color: GRAY_700, style: "Medium" });
  makeText(sBtn, "新对话", { fontSize: 14, color: GRAY_700, style: "Medium" });

  // 侧边栏会话列表（复用聊天页的）
  const sChatList = makeAutoLayout(settingsSidebar, {
    name: "会话列表",
    w: 240,
    paddingLeft: 8, paddingRight: 8,
    itemSpacing: 16,
  });
  sChatList.layoutSizingVertical = 'FILL';
  addGroup(sChatList, "今天", ["产品文案优化方案讨论", "React 组件设计思路", "用户访谈问题梳理"], 0);
  addGroup(sChatList, "昨天", ["竞品分析报告撰写", "数据可视化图表选择", "API 接口文档重构", "前端性能优化调研"]);
  addGroup(sChatList, "更早", ["设计系统主题定制"]);

  // 底部设置按钮（高亮）
  const sBottom = makeAutoLayout(settingsSidebar, {
    name: "底部设置",
    w: 240,
    paddingTop: 12, paddingBottom: 12, paddingLeft: 16, paddingRight: 16,
    itemSpacing: 8,
    direction: 'HORIZONTAL',
    counterAlign: 'CENTER',
    strokes: stroke(GRAY_100),
    strokeWeight: 1, strokeAlign: 'INSIDE',
    fills: solid(GRAY_50),
  });
  makeText(sBottom, "⚙", { fontSize: 18, color: GRAY_900, style: "Medium" });
  makeText(sBottom, "设置", { fontSize: 14, color: GRAY_900, style: "Medium" });

  // --- 设置主体区域 ---
  const settingsMain = makeAutoLayout(settingsCanvas, {
    name: "设置主体",
    w: 1200, h: 900,
    direction: 'HORIZONTAL',
    x: 240, y: 0,
    fills: solid(WHITE),
  });

  // 设置左侧菜单
  const settingsMenu = makeAutoLayout(settingsMain, {
    name: "设置菜单",
    w: 192,
    paddingTop: 20, paddingBottom: 20,
    paddingLeft: 8, paddingRight: 8,
    itemSpacing: 2,
    strokes: stroke(GRAY_100),
    strokeWeight: 1, strokeAlign: 'INSIDE',
  });
  settingsMenu.layoutSizingVertical = 'FILL';

  makeText(makeAutoLayout(settingsMenu, { name: "标题区", w: 176, paddingLeft: 8, paddingTop: 8, paddingBottom: 12 }), "设置", {
    fontSize: 12, style: "Medium", color: GRAY_400,
    letterSpacing: 0.5,
  });

  function addMenuBtn(parent, label, active) {
    const btn = makeAutoLayout(parent, {
      name: label,
      w: 176,
      paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 12,
      cornerRadius: 8,
      fills: active ? solid(GRAY_50) : [],
    });
    makeText(btn, label, {
      fontSize: 14,
      style: active ? "Medium" : "Regular",
      color: active ? GRAY_900 : GRAY_600,
    });
  }
  addMenuBtn(settingsMenu, "通用", false);
  addMenuBtn(settingsMenu, "模型", true);
  addMenuBtn(settingsMenu, "关于", false);

  // 设置右侧内容
  const settingsContent = makeAutoLayout(settingsMain, {
    name: "设置内容",
    w: 1008,
    paddingTop: 0, paddingBottom: 0,
  });
  settingsContent.layoutSizingVertical = 'FILL';

  // 顶部栏（返回按钮 + 暗色模式切换）
  const sTopBar = makeAutoLayout(settingsContent, {
    name: "顶部操作栏",
    w: 1008,
    direction: 'HORIZONTAL',
    primaryAlign: 'SPACE_BETWEEN',
    counterAlign: 'CENTER',
    paddingTop: 16, paddingBottom: 16,
    paddingLeft: 24, paddingRight: 24,
    strokes: stroke(GRAY_100),
    strokeWeight: 1, strokeAlign: 'INSIDE',
  });
  const backBtn = makeAutoLayout(sTopBar, {
    name: "返回",
    w: 80,
    direction: 'HORIZONTAL',
    itemSpacing: 8, counterAlign: 'CENTER',
  });
  makeText(backBtn, "←", { fontSize: 18, color: GRAY_500 });
  makeText(backBtn, "返回", { fontSize: 14, color: GRAY_500 });

  // 模型选择区
  const modelSection = makeAutoLayout(settingsContent, {
    name: "模型选择区",
    w: 1008,
    paddingTop: 24, paddingBottom: 24,
    paddingLeft: 24, paddingRight: 24,
    itemSpacing: 16,
  });

  makeText(modelSection, "模型选择", { fontSize: 14, style: "Medium", color: GRAY_900 });
  makeText(modelSection, "选择预设主流模型或添加自定义 API / 本地模型", { fontSize: 12, color: GRAY_400 });

  // 模型下拉框
  const dropdown = makeAutoLayout(modelSection, {
    name: "模型下拉框",
    w: 448,
    direction: 'HORIZONTAL',
    primaryAlign: 'SPACE_BETWEEN',
    counterAlign: 'CENTER',
    paddingTop: 10, paddingBottom: 10,
    paddingLeft: 16, paddingRight: 16,
    cornerRadius: 8,
    strokes: stroke(GRAY_200),
    strokeWeight: 1,
  });
  makeText(dropdown, "GPT-5.5", { fontSize: 14, color: GRAY_900 });
  makeText(dropdown, "▾", { fontSize: 14, color: GRAY_400, style: "Medium" });

  // 参数区
  const paramSection = makeAutoLayout(settingsContent, {
    name: "推理参数",
    w: 1008,
    paddingTop: 0, paddingBottom: 24,
    paddingLeft: 24, paddingRight: 24,
    itemSpacing: 12,
  });
  makeText(paramSection, "推理参数", { fontSize: 14, style: "Medium", color: GRAY_900 });
  makeText(paramSection, "调整参数控制模型输出风格，不同模型支持的参数可能不同", { fontSize: 12, color: GRAY_400 });

  function addParamRow(parent, label, value, leftLbl, rightLbl) {
    const row = makeAutoLayout(parent, {
      name: label,
      w: 448,
      itemSpacing: 4,
    });
    const header = makeAutoLayout(row, {
      name: "参数标签",
      w: 448,
      direction: 'HORIZONTAL',
      itemSpacing: 4, counterAlign: 'CENTER',
    });
    makeText(header, label, { fontSize: 12, style: "Medium", color: GRAY_700 });
    makeText(header, "(控制随机性)", { fontSize: 10, color: GRAY_400 });

    const sliderRow = makeAutoLayout(row, {
      name: "滑块行",
      w: 448,
      direction: 'HORIZONTAL',
      itemSpacing: 12, counterAlign: 'CENTER',
    });
    makeText(sliderRow, leftLbl, { fontSize: 11, color: GRAY_400 });
    const track = makeFrame(sliderRow, { name: "滑动轨道", w: 340, h: 6, cornerRadius: 3, fills: solid(PRIMARY) });
    makeText(sliderRow, rightLbl, { fontSize: 11, color: GRAY_400 });

    makeText(row, value, { fontSize: 12, color: GRAY_500 });
  }

  addParamRow(paramSection, "温度 (Temperature)", "0.7", "精确", "创意");
  addParamRow(paramSection, "Top P（核采样）", "0.90", "窄", "宽");

  // ==========================================
  // 智能体选择器抽屉（附加在聊天页画板右侧）
  // ==========================================
  const agentDrawer = makeFrame(settingsCanvas, {
    name: "智能体选择器（抽屉）",
    w: 384, h: 900,
    x: 1056, y: 0,
    fills: solid(WHITE),
    cornerRadius: 0,
  });

  // 抽屉头部
  const drawerHeader = makeAutoLayout(agentDrawer, {
    name: "抽屉头部",
    w: 384,
    direction: 'HORIZONTAL',
    primaryAlign: 'SPACE_BETWEEN',
    counterAlign: 'CENTER',
    paddingTop: 16, paddingBottom: 16,
    paddingLeft: 24, paddingRight: 24,
    strokes: stroke(GRAY_200),
    strokeWeight: 1, strokeAlign: 'INSIDE',
  });
  makeText(drawerHeader, "选择智能体", { fontSize: 16, style: "Semi Bold", color: GRAY_900 });

  // 智能体列表
  const agentList = makeAutoLayout(agentDrawer, {
    name: "智能体列表",
    w: 384,
    paddingTop: 24, paddingBottom: 24,
    paddingLeft: 24, paddingRight: 24,
    itemSpacing: 8,
  });

  const agentData = [
    { name: "通用助手", desc: "全能 AI 助手，回答各类问题", active: true },
    { name: "代码专家", desc: "擅长编程、代码审查与技术方案", active: false },
    { name: "产品顾问", desc: "产品分析、竞品调研与策略建议", active: false },
    { name: "文案创作", desc: "营销文案、品牌话术与内容润色", active: false },
    { name: "数据分析", desc: "数据洞察、可视化方案与报表解读", active: false },
    { name: "翻译专家", desc: "多语言翻译与本地化建议", active: false },
  ];

  agentData.forEach(item => {
    const card = makeAutoLayout(agentList, {
      name: item.name,
      w: 336,
      direction: 'HORIZONTAL',
      itemSpacing: 12, counterAlign: 'CENTER',
      paddingTop: 12, paddingBottom: 12,
      paddingLeft: 12, paddingRight: 12,
      cornerRadius: 12,
      fills: item.active ? solid(PRIMARY_PLACEHOLDER) : [],
      strokes: item.active ? stroke(PRIMARY, 1) : [],
    });

    // 图标圆
    const iconCircle = makeFrame(card, {
      name: "图标",
      w: 36, h: 36,
      cornerRadius: 8,
      fills: item.active ? solid(PRIMARY) : solid(GRAY_200),
    });

    // 文字区
    const agentText = makeAutoLayout(card, {
      name: "文字区",
      w: 220,
      itemSpacing: 2,
    });
    makeText(agentText, item.name, {
      fontSize: 14, style: "Medium",
      color: item.active ? PRIMARY : GRAY_900,
    });
    makeText(agentText, item.desc, { fontSize: 12, color: GRAY_500 });

    // 选中指示点
    if (item.active) {
      makeFrame(card, {
        name: "选中点",
        w: 10, h: 10,
        fills: solid(PRIMARY),
        cornerRadius: 999,
      });
    }
  });

  // ==========================================
  // 页面3：暗色模式 1440×900
  // ==========================================
  const darkCanvas = makeFrame(page, {
    name: "暗色模式",
    w: 1440, h: 900,
    fills: solid(DARK_BG),
    x: 2960, y: 0,
    cornerRadius: 0,
  });

  // 暗色侧边栏
  const darkSidebar = makeAutoLayout(darkCanvas, {
    name: "暗色-侧边栏",
    w: 240, h: 900,
    direction: 'VERTICAL',
    x: 0, y: 0,
    fills: solid(DARK_SIDEBAR),
    strokes: stroke(DARK_BORDER),
    strokeWeight: 1,
    strokeAlign: 'RIGHT',
  });

  const dBtnWrap = makeAutoLayout(darkSidebar, {
    name: "按钮区域",
    w: 240,
    paddingTop: 16, paddingBottom: 12,
    paddingLeft: 16, paddingRight: 16,
  });
  const dBtn = makeAutoLayout(dBtnWrap, {
    name: "新对话",
    w: 208,
    direction: 'HORIZONTAL',
    primaryAlign: 'CENTER', counterAlign: 'CENTER',
    paddingTop: 10, paddingBottom: 10,
    paddingLeft: 16, paddingRight: 16,
    itemSpacing: 8,
    cornerRadius: 8,
    strokes: stroke(DARK_BORDER),
    strokeWeight: 1,
  });
  makeText(dBtn, "＋", { fontSize: 16, color: DARK_TEXT, style: "Medium" });
  makeText(dBtn, "新对话", { fontSize: 14, color: DARK_TEXT, style: "Medium" });

  // 暗色会话列表
  const dChatList = makeAutoLayout(darkSidebar, {
    name: "会话列表",
    w: 240,
    paddingLeft: 8, paddingRight: 8,
    itemSpacing: 16,
  });
  dChatList.layoutSizingVertical = 'FILL';

  function addDarkGroup(parent, label, items, activeIndex = -1) {
    const group = makeAutoLayout(parent, { name: label, w: 224, itemSpacing: 2 });
    const header = makeAutoLayout(group, {
      name: "分组标题", w: 224,
      paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 12,
    });
    makeText(header, label, { fontSize: 12, style: "Medium", color: DARK_TEXT_SUB, letterSpacing: 0.5 });

    items.forEach((title, i) => {
      const itemFrame = makeFrame(group, {
        name: "会话项",
        w: 224, h: 36,
        cornerRadius: 8,
        fills: i === activeIndex ? solid(DARK_BORDER) : [],
      });
      if (i === activeIndex) {
        makeFrame(itemFrame, { name: "选中指示条", w: 2, h: 24, x: 0, y: 6, fills: solid(PRIMARY), cornerRadius: 2 });
      }
      const itemText = makeText(itemFrame, title, {
        fontSize: 14,
        style: i === activeIndex ? "Medium" : "Regular",
        color: i === activeIndex ? DARK_TEXT : DARK_TEXT_SUB,
      });
      itemText.x = 12; itemText.y = 8;
      itemText.textAutoResize = 'WIDTH_AND_HEIGHT';
      itemFrame.clipsContent = true;
    });
  }

  addDarkGroup(dChatList, "今天", ["产品文案优化方案讨论", "React 组件设计思路", "用户访谈问题梳理"], 0);
  addDarkGroup(dChatList, "昨天", ["竞品分析报告撰写", "数据可视化图表选择", "API 接口文档重构"]);
  addDarkGroup(dChatList, "更早", ["设计系统主题定制"]);

  // 暗色底部设置
  const dBottom = makeAutoLayout(darkSidebar, {
    name: "底部设置",
    w: 240,
    paddingTop: 12, paddingBottom: 12, paddingLeft: 16, paddingRight: 16,
    itemSpacing: 8, direction: 'HORIZONTAL', counterAlign: 'CENTER',
    strokes: stroke(DARK_BORDER), strokeWeight: 1, strokeAlign: 'INSIDE',
  });
  makeText(dBottom, "⚙", { fontSize: 18, color: DARK_TEXT_SUB });
  makeText(dBottom, "设置", { fontSize: 14, color: DARK_TEXT_SUB });

  // 暗色主区域
  const darkMain = makeAutoLayout(darkCanvas, {
    name: "暗色-主区域",
    w: 1200, h: 900,
    direction: 'VERTICAL',
    x: 240, y: 0,
    fills: solid(DARK_BG),
  });

  const darkChatContent = makeAutoLayout(darkMain, {
    name: "对话内容",
    w: 1200,
    paddingTop: 128, paddingBottom: 48,
    paddingLeft: 24, paddingRight: 24,
    counterAlign: 'CENTER',
    itemSpacing: 24,
  });
  darkChatContent.layoutSizingVertical = 'FILL';

  const dWelcome = makeAutoLayout(darkChatContent, {
    name: "欢迎语",
    w: 672, counterAlign: 'CENTER', itemSpacing: 12,
  });
  makeText(dWelcome, "今天想一起探索什么？", {
    fontSize: 30, style: "Semi Bold", color: DARK_TEXT, letterSpacing: -0.5,
  });

  // 暗色消息气泡
  function addDarkBubble(parent, type, text) {
    const row = makeAutoLayout(parent, {
      name: type === 'user' ? "用户气泡行" : "AI气泡行",
      w: 672, direction: 'HORIZONTAL',
      primaryAlign: type === 'user' ? 'MAX' : 'MIN',
    });
    const bubble = makeFrame(row, { name: type === 'user' ? "用户气泡" : "AI气泡", w: 480 });
    bubble.layoutSizingHorizontal = 'HUG';
    bubble.layoutSizingVertical = 'HUG';
    bubble.fills = type === 'user' ? solid(DARK_BUBBLE_USER) : solid(DARK_BUBBLE_AI);
    if (type === 'user') {
      bubble.cornerRadius = 16;
      bubble.set({ topLeftRadius: 16, topRightRadius: 16, bottomLeftRadius: 16, bottomRightRadius: 4 });
    } else {
      bubble.cornerRadius = 16;
      bubble.strokes = stroke(DARK_BORDER);
      bubble.strokeWeight = 1;
    }
    const bubbleText = makeText(bubble, text, { fontSize: 14, color: DARK_TEXT, lineHeight: 22.4 });
    bubbleText.x = 16; bubbleText.y = 12;
    bubbleText.layoutSizingHorizontal = 'FIXED';
    bubbleText.layoutSizingVertical = 'HUG';
    bubbleText.resize(448, bubbleText.height);
    bubble.resize(480, bubbleText.height + 24);
  }

  addDarkBubble(darkChatContent, 'user', "帮我分析一下这个产品的目标用户画像，我有一份上个月的调研数据。");
  addDarkBubble(darkChatContent, 'ai', "好的！根据你提供的调研数据，我可以从以下几个维度帮你构建用户画像：人口统计特征、行为模式、痛点和需求优先级。");
  addDarkBubble(darkChatContent, 'user', "核心发现是 25-35 岁一二线城市的职场人群占比最高，他们对效率工具有强烈付费意愿。");

  // 暗色输入区
  const dInputArea = makeAutoLayout(darkMain, {
    name: "输入区",
    w: 1200,
    paddingTop: 16, paddingBottom: 16,
    paddingLeft: 16, paddingRight: 16,
    counterAlign: 'CENTER',
    itemSpacing: 12,
    strokes: stroke(DARK_BORDER),
    strokeWeight: 1, strokeAlign: 'INSIDE',
  });

  const dInputRow = makeAutoLayout(dInputArea, {
    name: "输入行",
    w: 672, direction: 'HORIZONTAL',
    primaryAlign: 'MIN', counterAlign: 'MAX',
    itemSpacing: 12,
    paddingTop: 12, paddingBottom: 12,
    paddingLeft: 16, paddingRight: 16,
    cornerRadius: 16,
    fills: solid(DARK_INPUT_BG),
    strokes: stroke(DARK_BORDER),
    strokeWeight: 1,
  });

  const dCircleBtn = makeFrame(dInputRow, { name: "快捷按钮", w: 36, h: 36, cornerRadius: 999, strokes: stroke(DARK_BORDER), strokeWeight: 1 });
  const dCircleInner = makeAutoLayout(dCircleBtn, { name: "inner", w: 36, h: 36, direction: 'HORIZONTAL', primaryAlign: 'CENTER', counterAlign: 'CENTER' });
  makeText(dCircleInner, "＋", { fontSize: 18, color: DARK_TEXT_SUB, style: "Medium" });

  makeText(dInputRow, "输入消息，Enter 发送，Shift+Enter 换行", { fontSize: 14, color: DARK_TEXT_SUB, lineHeight: 22.4 });

  const dSendBtn = makeFrame(dInputRow, { name: "发送按钮", w: 36, h: 36, cornerRadius: 8, fills: solid(PRIMARY) });
  const dSendInner = makeAutoLayout(dSendBtn, { name: "inner", w: 36, h: 36, direction: 'HORIZONTAL', primaryAlign: 'CENTER', counterAlign: 'CENTER' });
  makeText(dSendInner, "➤", { fontSize: 16, color: WHITE, style: "Medium" });

  makeText(dInputArea, "AI 助手可能会产生不准确的信息，请注意甄别", { fontSize: 12, color: DARK_TEXT_SUB });

  // 关闭插件
  figma.closePlugin("✅ 设计稿绘制完成");
}

main();
