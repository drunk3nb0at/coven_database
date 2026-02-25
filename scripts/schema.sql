-- ═══════════════════════════════════════════
-- COVENS 数据库 Schema
-- 在 Supabase Dashboard → SQL Editor 中运行
-- ═══════════════════════════════════════════

-- 议题域
CREATE TABLE domains (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL DEFAULT '◐',
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#8B7EC8',
  sort_order INT NOT NULL DEFAULT 0
);

-- 资源
CREATE TABLE resources (
  id SERIAL PRIMARY KEY,
  domain_slug TEXT NOT NULL REFERENCES domains(slug),
  media_type TEXT NOT NULL,
  title TEXT NOT NULL,
  title_original TEXT,
  authors TEXT[] DEFAULT '{}',
  year INT,
  tags TEXT[] DEFAULT '{}',
  summary TEXT,
  external_links JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX idx_resources_domain ON resources(domain_slug);
CREATE INDEX idx_resources_media ON resources(media_type);
CREATE INDEX idx_resources_status ON resources(status);

-- Row Level Security
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read domains" ON domains FOR SELECT USING (true);
CREATE POLICY "Public read published resources" ON resources FOR SELECT USING (status = 'published');

-- ═══════════════════════════════════════════
-- 初始数据：8个议题域
-- ═══════════════════════════════════════════

INSERT INTO domains (slug, icon, name_zh, name_en, color, sort_order) VALUES
  ('gender',     '◐', '性别 · 性 · 身份',      'Gender, Sexuality & Identity',    '#8B7EC8', 1),
  ('intimacy',   '◎', '关系 · 亲密 · 情感',    'Intimacy, Relations & Affect',    '#D4726A', 2),
  ('labor',      '⟁', '劳动 · 资本 · 再生产',  'Labor, Capital & Reproduction',   '#C4964A', 3),
  ('body',       '◉', '身体 · 健康 · 残障',    'Body, Health & Disability',       '#5A9E8F', 4),
  ('colonial',   '◈', '殖民 · 种族 · 离散',    'Race, Colonialism & Diaspora',    '#9B6FB0', 5),
  ('screen',     '▷', '银幕 · 舞台 · 声音',    'Screen, Stage & Sound',           '#B85C8A', 6),
  ('subculture', '◇', '亚文化 · 舆论 · 日常',  'Subculture, Discourse & Everyday','#6A8FB8', 7),
  ('theory',     '◬', '理论 · 方法 · 谱系',    'Theory, Method & Genealogy',      '#7A8B9A', 8);

-- ═══════════════════════════════════════════
-- 初始数据：示例资源
-- ═══════════════════════════════════════════

INSERT INTO resources (domain_slug, media_type, title, title_original, authors, year, tags, summary, external_links) VALUES

-- gender
('gender', 'monograph', '性别麻烦', 'Gender Trouble', ARRAY['Judith Butler'], 1990,
 ARRAY['酷儿理论','表演性','性别废除'],
 '性别是通过反复的表演性行为建构的，而非自然事实。开启酷儿理论核心议程的奠基之作。',
 '{"豆瓣":"https://book.douban.com/subject/3673877/","Goodreads":"https://www.goodreads.com/book/show/85767","WorldCat":"https://search.worldcat.org/title/21073358","Z-Library":"https://z-library.se"}'::jsonb),

('gender', 'anthology', '跨性别研究读本', 'The Transgender Studies Reader', ARRAY['Susan Stryker'], 2006,
 ARRAY['跨性别女权','酷儿理论'],
 '汇集跨性别研究核心文本的开创性文集，涵盖历史、理论、文化和政治维度。',
 '{"Goodreads":"https://www.goodreads.com/book/show/303595","WorldCat":"https://search.worldcat.org/title/62890853"}'::jsonb),

('gender', 'monograph', '酷儿时间与地点', 'In a Queer Time and Place', ARRAY['Jack Halberstam'], 2005,
 ARRAY['酷儿理论','酷儿时间性'],
 '拒绝以生殖和异性恋家庭为中心的时间逻辑，探索另一种生活节奏。',
 '{"Goodreads":"https://www.goodreads.com/book/show/130734"}'::jsonb),

('gender', 'monograph', '解除性别', 'Undoing Gender', ARRAY['Judith Butler'], 2004,
 ARRAY['酷儿理论','性别废除','非二元'],
 '性别规范如何使某些生命不可居住，以及「解除」性别的政治可能。',
 '{"豆瓣":"https://book.douban.com/subject/26892561/","Goodreads":"https://www.goodreads.com/book/show/85770"}'::jsonb),

-- intimacy
('intimacy', 'zine', '关系无政府主义宣言', 'The Short Instructional Manifesto for Relationship Anarchy', ARRAY['Andie Nordgren'], 2006,
 ARRAY['关系无政府主义','浪漫爱规范'],
 '不按社会预设等级组织关系，拒绝将浪漫/性关系自动置于友谊之上。一页纸的宣言，影响了整个亲密关系政治讨论。',
 '{"原文":"https://theanarchistlibrary.org/library/andie-nordgren-the-short-instructional-manifesto-for-relationship-anarchy"}'::jsonb),

('intimacy', 'monograph', '最小化的婚姻', 'Minimizing Marriage', ARRAY['Elizabeth Brake'], 2012,
 ARRAY['浪漫爱规范','单偶制批判'],
 '提出 amatonormativity 概念——社会对浪漫爱和单偶制的强制性规范。',
 '{"Goodreads":"https://www.goodreads.com/book/show/13588553","WorldCat":"https://search.worldcat.org/title/768989122"}'::jsonb),

('intimacy', 'anthology', '强制异性恋与女同性恋存在', 'Compulsory Heterosexuality and Lesbian Existence', ARRAY['Adrienne Rich'], 1980,
 ARRAY['强制异性恋','酷儿理论'],
 '「强制异性恋」是一种政治制度而非自然倾向，系统性地抹除了女性之间的亲密联结。',
 '{"Google Scholar":"https://scholar.google.com/scholar?q=compulsory+heterosexuality+adrienne+rich","Sci-Hub":"https://sci-hub.se"}'::jsonb),

-- labor
('labor', 'monograph', '卡利班与女巫', 'Caliban and the Witch', ARRAY['Silvia Federici'], 2004,
 ARRAY['马克思主义女权','社会再生产'],
 '猎巫运动不是中世纪残余，而是资本主义原始积累的必要条件。',
 '{"豆瓣":"https://book.douban.com/subject/35621erta/","Goodreads":"https://www.goodreads.com/book/show/403846","WorldCat":"https://search.worldcat.org/title/56386572","Z-Library":"https://z-library.se"}'::jsonb),

('labor', 'zine', '家务劳动工资', 'Wages Against Housework', ARRAY['Silvia Federici'], 1975,
 ARRAY['马克思主义女权','情感劳动'],
 '家务劳动无偿化是资本主义剥削女性的核心机制。要求工资是让剥削可见的策略。',
 '{"原文":"https://caringlabor.wordpress.com/2010/09/15/silvia-federici-wages-against-housework/"}'::jsonb),

('labor', 'anthology', '社会再生产理论', 'Social Reproduction Theory', ARRAY['Tithi Bhattacharya'], 2017,
 ARRAY['社会再生产','马克思主义女权'],
 '将阶级、种族和性别的交叉性纳入马克思主义分析框架的重要文集。',
 '{"Goodreads":"https://www.goodreads.com/book/show/34636182","WorldCat":"https://search.worldcat.org/title/992757832"}'::jsonb),

('labor', 'monograph', '父权制与资本主义', '家父長制と資本制', ARRAY['上野千鹤子'], 1990,
 ARRAY['马克思主义女权','社会再生产'],
 '从马克思主义女权视角分析父权制与资本主义的共谋关系。',
 '{"豆瓣":"https://book.douban.com/subject/34884erta/"}'::jsonb),

-- body
('body', 'anthology', '赛博格宣言', 'A Cyborg Manifesto', ARRAY['Donna Haraway'], 1985,
 ARRAY['赛博格','物质女权主义'],
 '用赛博格形象打破自然/文化、人类/机器的二元对立。',
 '{"Google Scholar":"https://scholar.google.com/scholar?q=cyborg+manifesto+haraway","Sci-Hub":"https://sci-hub.se"}'::jsonb),

('body', 'monograph', '残障之傲', 'Brilliant Imperfection', ARRAY['Eli Clare'], 2017,
 ARRAY['残障正义','身体政治'],
 '拒绝将残障身体视为「待修复」对象，探索残障与酷儿身份的交叉。',
 '{"Goodreads":"https://www.goodreads.com/book/show/29358979"}'::jsonb),

-- colonial
('colonial', 'anthology', '底层人能说话吗？', 'Can the Subaltern Speak?', ARRAY['Gayatri Spivak'], 1988,
 ARRAY['后殖民女权','认识论暴力'],
 '在帝国主义知识生产结构中，被殖民的底层女性是否可能「说话」？',
 '{"Google Scholar":"https://scholar.google.com/scholar?q=can+the+subaltern+speak+spivak","Sci-Hub":"https://sci-hub.se"}'::jsonb),

('colonial', 'anthology', '在西方的眼睛下', 'Under Western Eyes', ARRAY['Chandra Mohanty'], 1984,
 ARRAY['后殖民女权','跨国女权'],
 '批判西方女权将「第三世界女性」构建为单一受压迫主体。',
 '{"Google Scholar":"https://scholar.google.com/scholar?q=under+western+eyes+mohanty"}'::jsonb),

('colonial', 'monograph', '东方主义', 'Orientalism', ARRAY['Edward Said'], 1978,
 ARRAY['后殖民','东方主义'],
 '西方如何通过知识/权力建构「东方」。为后殖民女权奠定了理论基础。',
 '{"豆瓣":"https://book.douban.com/subject/1Mo119/","Goodreads":"https://www.goodreads.com/book/show/355190"}'::jsonb),

-- screen
('screen', 'standup', 'Nanette', 'Nanette', ARRAY['Hannah Gadsby'], 2018,
 ARRAY['酷儿理论','创伤叙事'],
 '解构喜剧结构——自我贬低的笑话如何服务于压迫者？关于「不再自嘲」的政治宣言。',
 '{"豆瓣":"https://movie.douban.com/subject/30235February/","Letterboxd":"https://letterboxd.com/film/hannah-gadsby-nanette/"}'::jsonb),

('screen', 'film', '燃烧女子的肖像', 'Portrait de la jeune fille en feu', ARRAY['Céline Sciamma'], 2019,
 ARRAY['酷儿电影','女性凝视'],
 '看与被看不再是权力关系，而是平等的相互确认。',
 '{"豆瓣":"https://movie.douban.com/subject/30257175/","Letterboxd":"https://letterboxd.com/film/portrait-of-a-lady-on-fire/","IMDB":"https://www.imdb.com/title/tt8613070/"}'::jsonb),

('screen', 'standup', '女人世界', '女人世界', ARRAY['颜怡颜悦'], 2024,
 ARRAY['女权脱口秀','中国语境'],
 '在幽默中拆解中国社会的性别规范和女性身体的被凝视。',
 '{"豆瓣":"https://movie.douban.com/subject/36873055/","Bilibili":"https://www.bilibili.com"}'::jsonb),

('screen', 'documentary', '日常对话', '日常對話', ARRAY['黄惠侦'], 2016,
 ARRAY['酷儿电影','台湾'],
 '拍摄做法事的女同母亲。出柜、沉默和日常对话如何成为政治行为。',
 '{"豆瓣":"https://movie.douban.com/subject/26784Mo/","Letterboxd":"https://letterboxd.com/film/small-talk-2016/"}'::jsonb),

('screen', 'film', '骨及所有', 'Bones and All', ARRAY['Luca Guadagnino'], 2022,
 ARRAY['酷儿电影','身体政治'],
 '「吃人」是酷儿欲望和无法被社会容纳的身体的隐喻。',
 '{"豆瓣":"https://movie.douban.com/subject/35381918/","Letterboxd":"https://letterboxd.com/film/bones-and-all/"}'::jsonb),

('screen', 'documentary', 'Paris Is Burning', 'Paris Is Burning', ARRAY['Jennie Livingston'], 1990,
 ARRAY['酷儿亚文化','跨性别','种族'],
 '记录纽约黑人和拉丁裔酷儿社群的 ball culture，酷儿纪录片里程碑。',
 '{"Letterboxd":"https://letterboxd.com/film/paris-is-burning/","IMDB":"https://www.imdb.com/title/tt0100332/"}'::jsonb),

('screen', 'theater', '阴道独白', 'The Vagina Monologues', ARRAY['Eve Ensler'], 1996,
 ARRAY['身体政治','女权戏剧'],
 '基于200多位女性访谈的系列独白，探讨身体、性、暴力和女性经验。',
 '{"豆瓣":"https://book.douban.com/subject/1Mo786/"}'::jsonb),

-- subculture
('subculture', 'topic', '中国 #MeToo 运动档案', NULL, ARRAY['多位作者'], 2018,
 ARRAY['网络女权','中国语境'],
 '一份不断被删除又不断被重建的档案。',
 '{}'::jsonb),

('subculture', 'podcast', '随机波动', 'Stochastic Volatility', ARRAY['冷建国','张之琪','傅适野'], 2020,
 ARRAY['女权文化评论','中国语境'],
 '华语女权播客标杆，从女权/酷儿视角介入电影、文学和社会新闻。',
 '{"小宇宙":"https://www.xiaoyuzhoufm.com/podcast/6005f67a7bdea9eb5aeb1e28","Spotify":"https://open.spotify.com/show/0K8GXKH4CB9BPSR2mUF0ER"}'::jsonb),

('subculture', 'topic', '6B4T 运动与韩国激进女权', NULL, NULL, 2019,
 ARRAY['韩国女权','单偶制批判'],
 '六个不做和四个拒绝。引发东亚女权内部关于分离主义的激烈辩论。',
 '{}'::jsonb),

('subculture', 'media', '「女权主义」在中国互联网的消亡与重生', NULL, ARRAY['端传媒'], 2023,
 ARRAY['网络女权','审查','中国语境'],
 '追踪中国互联网女权话语如何在审查压力下不断变形、转移和重生。',
 '{"原文":"https://theinitium.com"}'::jsonb),

('subculture', 'zine', '酷儿华人 zine 合集', 'Queer Chinese Zine Collective', ARRAY['匿名集体'], 2023,
 ARRAY['华语离散','酷儿亚文化'],
 '北美和欧洲酷儿华人的 zine。移民经验、身份协商和酷儿日常。',
 '{}'::jsonb),

-- theory
('theory', 'monograph', '女权主义理论：从边缘到中心', 'Feminist Theory: From Margin to Center', ARRAY['bell hooks'], 1984,
 ARRAY['黑人女权主义','交叉性女权'],
 '真正的女权理论必须从边缘出发，而非从特权位置向外推。',
 '{"Goodreads":"https://www.goodreads.com/book/show/247886","WorldCat":"https://search.worldcat.org/title/10925248"}'::jsonb),

('theory', 'anthology', '这座桥叫我的背', 'This Bridge Called My Back', ARRAY['Cherríe Moraga','Gloria Anzaldúa'], 1981,
 ARRAY['交叉性女权','有色人种女权'],
 '边缘女性的身体被当作他人通行的桥梁。',
 '{"Goodreads":"https://www.goodreads.com/book/show/313110"}'::jsonb),

('theory', 'monograph', '交叉性', 'Intersectionality', ARRAY['Patricia Hill Collins','Sirma Bilge'], 2016,
 ARRAY['交叉性女权','方法论'],
 '对交叉性概念的系统梳理。入门首选。',
 '{"Goodreads":"https://www.goodreads.com/book/show/27305187","WorldCat":"https://search.worldcat.org/title/934628858"}'::jsonb),

('theory', 'syllabus', '酷儿理论入门阅读清单', NULL, ARRAY['多位学者整理'], 2023,
 ARRAY['酷儿理论','入门'],
 '从 Butler 到 Muñoz，覆盖酷儿理论核心文本的阅读路线图。',
 '{}'::jsonb);
