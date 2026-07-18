export const UNITS = [
  {
    id: 1,
    eyebrow: "第一站",
    title: "你好，世界！",
    description: "认识你的第一批中文朋友",
    color: "coral",
    lessons: [
      { id: "hello-1", title: "打招呼", subtitle: "你好 · 再见", icon: "👋", xp: 20 },
      { id: "identity-1", title: "介绍自己", subtitle: "我是 · 你呢", icon: "🪪", xp: 20 },
      { id: "numbers-1", title: "一二三", subtitle: "数字 1–5", icon: "🖐️", xp: 20 },
      { id: "review-1", title: "小试身手", subtitle: "复习第一站", icon: "🏮", xp: 30, review: true }
    ]
  },
  {
    id: 2,
    eyebrow: "第二站",
    title: "今天吃什么？",
    description: "学会点一顿简单的饭",
    color: "teal",
    lessons: [
      { id: "food-1", title: "好吃！", subtitle: "米饭 · 面条", icon: "🍜", xp: 20 },
      { id: "order-1", title: "我要这个", subtitle: "点餐表达", icon: "🥟", xp: 20 },
      { id: "drink-1", title: "喝点什么", subtitle: "茶 · 水", icon: "🍵", xp: 20 },
      { id: "review-2", title: "茶馆挑战", subtitle: "复习第二站", icon: "🏆", xp: 30, review: true }
    ]
  }
];

export const EXERCISES = {
  "hello-1": [
    {
      type: "choice",
      prompt: "选出「你好」的意思",
      hint: "nǐ hǎo",
      options: ["Hello", "Thank you", "Goodbye"],
      answer: "Hello",
      explain: "「你好」是最常见的中文问候语。"
    },
    {
      type: "listen",
      prompt: "你听到了什么？",
      speak: "你好",
      options: ["你好吗", "你好", "再见"],
      answer: "你好",
      explain: "「你好」读作 nǐ hǎo。"
    },
    {
      type: "arrange",
      prompt: "拼出「Goodbye」",
      tokens: ["见", "再", "好"],
      answer: ["再", "见"],
      explain: "「再见」字面上有“再次见面”的意思。"
    },
    {
      type: "choice",
      prompt: "「你好吗？」是在问什么？",
      hint: "nǐ hǎo ma?",
      options: ["How are you?", "What is your name?", "Where are you?"],
      answer: "How are you?",
      explain: "句末加「吗」可以把陈述句变成一般疑问句。"
    },
    {
      type: "type",
      prompt: "输入「谢谢」",
      clue: "Thank you · xiè xie",
      answers: ["谢谢", "謝謝"],
      explain: "做得好！「谢谢」是表达感谢。"
    }
  ],
  "identity-1": [
    {
      type: "choice", prompt: "「我是小林」是什么意思？", hint: "wǒ shì Xiǎolín", options: ["I am Xiaolin", "You are Xiaolin", "She is Xiaolin"], answer: "I am Xiaolin", explain: "「我」是 I，「是」是 am/is/are。"
    },
    {
      type: "listen", prompt: "选出你听到的句子", speak: "我叫安娜", options: ["我叫安娜", "你叫安娜", "我是老师"], answer: "我叫安娜", explain: "「我叫……」可以用来介绍自己的名字。"
    },
    {
      type: "arrange", prompt: "拼出「What is your name?」", tokens: ["叫", "什么", "你", "名字"], answer: ["你", "叫", "什么", "名字"], explain: "「你叫什么名字？」是询问姓名的完整表达。"
    },
    {
      type: "choice", prompt: "选出最自然的回答", hint: "你叫什么名字？", options: ["我叫安娜。", "我很好。", "再见。"], answer: "我叫安娜。", explain: "问名字时，可以用「我叫……」回答。"
    },
    {
      type: "type", prompt: "输入「我是学生」", clue: "I am a student · wǒ shì xuésheng", answers: ["我是学生"], explain: "漂亮！中文的「是」不随人称变化。"
    }
  ],
  "numbers-1": [
    { type: "choice", prompt: "哪个是数字 3？", hint: "sān", options: ["二", "三", "五"], answer: "三", explain: "一、二、三：yī、èr、sān。" },
    { type: "listen", prompt: "你听到了哪个数字？", speak: "五", options: ["二", "四", "五"], answer: "五", explain: "「五」读作 wǔ。" },
    { type: "arrange", prompt: "从小到大排列", tokens: ["四", "一", "三", "二"], answer: ["一", "二", "三", "四"], explain: "一、二、三、四，就是 1、2、3、4。" },
    { type: "choice", prompt: "「两个朋友」里「两」的意思是？", options: ["Two", "Three", "Many"], answer: "Two", explain: "在量词前，2 经常说「两」。" },
    { type: "type", prompt: "输入中文数字 5", clue: "five · wǔ", answers: ["五"], explain: "答对了，「五」就是 five。" }
  ],
  "food-1": [
    { type: "choice", prompt: "🍜 是什么？", options: ["面条", "米饭", "茶"], answer: "面条", explain: "「面条」读作 miàntiáo。" },
    { type: "listen", prompt: "选出你听到的食物", speak: "米饭", options: ["米饭", "面条", "饺子"], answer: "米饭", explain: "「米饭」是 cooked rice。" },
    { type: "arrange", prompt: "拼出「The dumplings are delicious」", tokens: ["好吃", "饺子", "很", "我"], answer: ["饺子", "很", "好吃"], explain: "「很」常放在形容词前面。" },
    { type: "choice", prompt: "「好吃」表示……", options: ["Delicious", "Expensive", "Hot"], answer: "Delicious", explain: "夸食物时说「好吃！」。" },
    { type: "type", prompt: "输入「面条」", clue: "noodles · miàntiáo", answers: ["面条", "麵條"], explain: "太棒了，面条准备好了！" }
  ],
  "order-1": [
    { type: "choice", prompt: "「我要这个」适合在什么时候说？", hint: "wǒ yào zhège", options: ["点餐时", "道别时", "问名字时"], answer: "点餐时", explain: "「我要这个」就是 I want this。" },
    { type: "listen", prompt: "客人想要什么？", speak: "我要饺子", options: ["我要饺子", "我要米饭", "我要茶"], answer: "我要饺子", explain: "「我要饺子」可以直接表达点餐需求。" },
    { type: "arrange", prompt: "拼出「I want one bowl of noodles」", tokens: ["一碗", "面条", "我要", "好吃"], answer: ["我要", "一碗", "面条"], explain: "点餐结构：我要 + 数量 + 食物。" },
    { type: "choice", prompt: "服务员说「好的」，表示……", options: ["Okay", "No", "Expensive"], answer: "Okay", explain: "「好的」表示理解并同意。" },
    { type: "type", prompt: "输入「我要米饭」", clue: "I want rice · wǒ yào mǐfàn", answers: ["我要米饭"], explain: "点餐成功！" }
  ],
  "drink-1": [
    { type: "choice", prompt: "🍵 对应哪个词？", options: ["茶", "水", "咖啡"], answer: "茶", explain: "「茶」读作 chá。" },
    { type: "listen", prompt: "选出你听到的饮品", speak: "一杯水", options: ["一杯茶", "一杯水", "一碗饭"], answer: "一杯水", explain: "饮品常用量词「杯」。" },
    { type: "arrange", prompt: "拼出「Please give me a cup of tea」", tokens: ["请", "我", "给", "一杯茶"], answer: ["请", "给", "我", "一杯茶"], explain: "加上「请」会让表达更礼貌。" },
    { type: "choice", prompt: "「你喝什么？」是在问……", options: ["What would you like to drink?", "What did you eat?", "Where are you going?"], answer: "What would you like to drink?", explain: "「喝」表示 to drink。" },
    { type: "type", prompt: "输入「我要茶」", clue: "I want tea · wǒ yào chá", answers: ["我要茶"], explain: "很好，一杯茶来啦！" }
  ]
};

const REVIEW = [
  { type: "choice", prompt: "见面时可以说什么？", options: ["你好", "米饭", "五"], answer: "你好", explain: "「你好」是打招呼。" },
  { type: "arrange", prompt: "拼出「I am a student」", tokens: ["学生", "是", "我", "你"], answer: ["我", "是", "学生"], explain: "我 + 是 + 学生。" },
  { type: "listen", prompt: "选出你听到的词", speak: "谢谢", options: ["再见", "谢谢", "你好"], answer: "谢谢", explain: "「谢谢」表示感谢。" },
  { type: "choice", prompt: "哪个数字最大？", options: ["一", "三", "五"], answer: "五", explain: "5 比 1 和 3 大。" },
  { type: "type", prompt: "输入「再见」", clue: "Goodbye · zàijiàn", answers: ["再见", "再見"], explain: "完成啦，下次再见！" }
];

export function exercisesFor(lessonId) {
  if (EXERCISES[lessonId]) return EXERCISES[lessonId];
  if (lessonId.startsWith("review")) return REVIEW;
  return EXERCISES["food-1"];
}
