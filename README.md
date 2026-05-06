# أبطال البيانات | Data Heroes

> An interactive, bilingual educational game about Data Classification, Privacy, AI Ethics, and Cybersecurity — built for UAE university students.

![Data Heroes Banner](https://img.shields.io/badge/UAE-National%20Data%20Academy-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Language](https://img.shields.io/badge/Language-Arabic%20%2B%20English-gold?style=for-the-badge)

---

## 🎮 Live Demo

Open `index.html` directly in any modern browser — no server or build step required.

---

## 📁 Project Structure

```
data-heroes/
├── index.html        ← Main HTML (all screens)
├── css/
│   └── style.css     ← All styles (light theme, responsive, RTL)
├── js/
│   ├── data.js       ← All game data (questions, scenarios, heroes)
│   └── game.js       ← All game logic (state, timers, scoring)
└── README.md
```

---

## 🕹️ Game Modes

| Mode | Description | Difficulty |
|---|---|---|
| 🗂️ Data Classification | Classify UAE data items into Public / Internal / Confidential / Restricted | Beginner |
| ⚔️ Real-Life Scenarios | Make governance decisions on realistic UAE university data requests | Intermediate |
| 🤖 AI Awareness | Answer questions on responsible AI, hallucinations, prompt injection, UAE AI ethics | Intermediate |
| 🔧 Data Quality Fix | Find and fix errors in a broken student records database | Intermediate |
| 💀 Boss Battle | Respond to critical incidents (data breach, deepfake) under a 15-second timer | Critical |
| 🏆 Leaderboard | See your score ranked against UAE universities | — |

---

## 🦸 Heroes

| Hero | Ability | Bonus |
|---|---|---|
| 🛡️ Data Guardian | Classification Master | +15% Score |
| 🔒 Privacy Defender | Privacy Expert | +20% Privacy XP |
| 🤖 AI Detective | AI Awareness Pro | +25% AI XP |
| ⭐ Quality Master | Data Quality Expert | +20% Quality XP |
| ⚡ Integration Hero | Data Sharing Pro | +15% Sharing XP |

---

## 🌍 Features

- ✅ Fully bilingual — Arabic 🇦🇪 + English
- ✅ RTL / LTR dynamic switching
- ✅ Mobile-first responsive design
- ✅ No frameworks, no build tools — pure HTML / CSS / JS
- ✅ Gamification: XP, levels, coins, streaks, achievements, leaderboard
- ✅ Countdown timers per question
- ✅ Animated particle background
- ✅ Reward popups on mission completion
- ✅ UAE-themed content (PDPL, Emirates ID, TDRA, etc.)

---

## 🚀 Deploy to GitHub Pages

1. Fork or clone this repo
2. Go to **Settings → Pages**
3. Set source to **main branch / root**
4. Your game will be live at `https://yourusername.github.io/data-heroes/`

---

## 🛠️ Adding Questions

Open `js/data.js` and add items to the relevant array:

```js
// Add a classification question
CLASSIFY_DATA.push({
  valueEn: 'Your data example here',
  valueAr: 'مثال بياناتك هنا',
  contextEn: 'Where this data lives',
  contextAr: 'أين توجد هذه البيانات',
  correct: 'confidential',   // public | internal | confidential | restricted
  risk: 70,                  // 0–100
  explanationEn: 'Why this classification is correct.',
  explanationAr: 'لماذا هذا التصنيف صحيح.'
});
```

---

## 📚 Educational Topics Covered

- UAE Personal Data Protection Law (PDPL)
- Data classification frameworks
- Responsible AI & UAE AI Ethics principles
- AI hallucinations and prompt injection
- Data breach incident response
- Data quality and governance
- Cybersecurity awareness
- Deepfakes and digital misinformation

---

## 📄 License

MIT — free to use, adapt, and deploy for educational purposes.

---

*Built for UAE university students. Protecting the UAE's digital future, one decision at a time.*
