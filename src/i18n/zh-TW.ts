export const zhTW = {
  // General
  appTitle: '數學大師五年級',
  mainMenu: '主選單',
  submitAnswer: '送出答案',

  // Header
  quit: '放棄',
  questionProgress: '第 {current}/{total} 題',

  // Menu Component
  questionsPerRound: '⚙️ 每回合題數',
  default: '預設',
  selectMode: '請選擇練習模式',
  addition: '加法',
  subtraction: '減法',
  division: '估商',
  multiplication: '乘法',
  mixed: '綜合',
  viewLeaderboard: '🏆 查看排行榜',
  appDescription: '適用五年級 • 範圍 21-70',

  // Divisor Select Component
  selectDivisor: '選擇估商數字',
  cancelAndReturn: '取消返回',

  // Game Component
  aiTeacher: 'AI老師',
  thinking: '思考中...',
  stopSpeaking: '停止',

  // Summary Component
  quizComplete: '測驗結束！',
  yourScore: '你的總分',
  timeSpent: '花費時間',
  enterName: '輸入名字:',
  namePlaceholder: '例如: 小明',
  viewRankings: '查看排名 🏆',

  // Leaderboard Component
  leaderboardTitle: '🏆 排行榜',
  rank: '#',
  name: '姓名',
  mode: '模式',
  time: '時間',
  score: '分數',
  noRecords: '目前還沒有紀錄，快去挑戰吧！',

  // Mode Titles
  addPractice: '加法練習',
  subPractice: '減法練習',
  divPractice: '估商練習',
  divPracticeWithNum: '估商練習 ({divisor})',
  mulPractice: '乘法練習',
  mixedChallenge: '綜合挑戰',

  // Feedback Messages
  correct: '答對了！太棒了！ 🎉',
  tryAgain: '再試一次喔！',
  guessTooHigh: '太大囉！試著數字小一點 👇',
  guessTooLow: '太小囉！試著數字大一點 👆',
  divGuessTooHigh: '太大囉！ {divisor} × {guess} = {result}，比 {dividend} 還大！',
  divGuessTooLow: '太小囉！ {divisor} × {guess} = {result}，剩下的 {remainder} 夠再分喔！',
  
  // AI Service
  aiSystemInstruction: '你是一位親切、充滿鼓勵的台灣國小數學老師。請用繁體中文（台灣用語）回答。解釋要非常簡短（最多3句話），簡單易懂且有趣。',
  aiHintError: '抱歉，我現在想不出提示！',
  aiGenericError: '哎呀！我現在腦袋在休息，你自己試試看吧！',

  // Math Service Prompts
  addHintPrompt: '請用繁體中文，簡單地向小學五年級學生解釋如何計算 {a} 加 {b}。',
  subHintPrompt: '請用繁體中文，簡單地向小學五年級學生解釋如何計算 {a} 減 {b}。',
  divHintPrompt: '請用繁體中文，簡單解釋如何估算 {dividend} 除以 {divisor} 的商數。只要教學生找出整數部分的商即可。',
  mulHintPrompt: '請用繁體中文，簡單地向小學五年級學生解釋如何計算 {a} 乘以 {b}。',
};