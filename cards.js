// ===== 基本定義 =====
const suits = [
  { symbol: "♠", name: "spades", red: false },
  { symbol: "♥", name: "hearts", red: true },
  { symbol: "♦", name: "diamonds", red: true },
  { symbol: "♣", name: "clubs", red: false }
];

const ranks = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];

const rankOrder = {
  "2": 2, "3": 3, "4": 4, "5": 5, "6": 6,
  "7": 7, "8": 8, "9": 9, "T": 10,
  "J": 11, "Q": 12, "K": 13, "A": 14
};

// ===== ダミーレンジデータ（6-max）=====
const rangeData = {
  UTG: {
    AJs: { call: 0, raise: 60, fold: 40 },
    AJo: { call: 0, raise: 30, fold: 70 },
    "98s": { call: 0, raise: 20, fold: 80 },
    KK:  { call: 0, raise: 95, fold: 5 }
  },
  HJ: {
    AJs: { call: 10, raise: 65, fold: 25 },
    AJo: { call: 0,  raise: 50, fold: 50 },
    "98s": { call: 10, raise: 40, fold: 50 },
    KK:  { call: 0,  raise: 95, fold: 5 }
  },
  CO: {
    AJs: { call: 10, raise: 70, fold: 20 },
    AJo: { call: 0,  raise: 60, fold: 40 },
    "98s": { call: 20, raise: 55, fold: 25 },
    KK:  { call: 0,  raise: 95, fold: 5 }
  },
  BTN: {
    AJs: { call: 10, raise: 80, fold: 10 },
    AJo: { call: 0,  raise: 70, fold: 30 },
    "98s": { call: 20, raise: 60, fold: 20 },
    KK:  { call: 0,  raise: 95, fold: 5 }
  },
  SB: {
    AJs: { call: 20, raise: 65, fold: 15 },
    AJo: { call: 40, raise: 10, fold: 50 },
    "98s": { call: 55, raise: 30, fold: 15 },
    KK:  { call: 0,  raise: 90, fold: 10 }
  },
  BB: {
    AJs: { call: 70, raise: 10, fold: 20 },
    AJo: { call: 60, raise: 0,  fold: 40 },
    "98s": { call: 65, raise: 0,  fold: 35 },
    KK:  { call: 10, raise: 80, fold: 10 }
  }
};

// ===== 状態 =====
const selectedCards = [];

// ===== DOM =====
const grid = document.getElementById("cardGrid");
const selectedDiv = document.getElementById("selected");
const normalizedDiv = document.getElementById("normalized");
const positionSelect = document.getElementById("positionSelect");
const resultDiv = document.getElementById("result");

// ===== カード生成 =====
suits.forEach(suit => {
  ranks.forEach(rank => {
    const card = document.createElement("div");
    card.className = "card";
    if (suit.red) card.classList.add("red");
    card.textContent = rank + suit.symbol;

    card.addEventListener("click", () => {
      if (selectedCards.length >= 2) return;

      selectedCards.push({ rank, suit: suit.name });
      card.classList.add("selected");

      updateSelected();
      disableIfNeeded();
    });

    grid.appendChild(card);
  });
});

// ===== 表示更新 =====
function updateSelected() {
  if (selectedCards.length === 0) {
    selectedDiv.textContent = "未選択";
    normalizedDiv.textContent = "-";
  } else {
    selectedDiv.textContent = selectedCards
      .map(c => c.rank + suitSymbol(c.suit))
      .join(" ");

    const normalized = normalizeHand(selectedCards);
    normalizedDiv.textContent = normalized ?? "-";
  }

  updateResult();
}

function updateResult() {
  const hand = normalizeHand(selectedCards);
  const position = positionSelect.value;

  if (!hand || !position) return;

  const data = rangeData[position]?.[hand];

  if (!data) {
    resultDiv.innerHTML = `
      コール：0%<br>
      レイズ：0%<br>
      フォールド：100%
    `;
    return;
  }

  resultDiv.innerHTML = `
    コール：${data.call}%<br>
    レイズ：${data.raise}%<br>
    フォールド：${data.fold}%
  `;
}

positionSelect.addEventListener("change", updateResult);

// ===== ユーティリティ =====
function suitSymbol(name) {
  return suits.find(s => s.name === name).symbol;
}

function disableIfNeeded() {
  if (selectedCards.length === 2) {
    document.querySelectorAll(".card:not(.selected)")
      .forEach(c => c.classList.add("disabled"));
  }
}

function normalizeHand(cards) {
  if (cards.length !== 2) return null;

  const [c1, c2] = cards;

  // ペア
  if (c1.rank === c2.rank) {
    return c1.rank + c2.rank;
  }

  // 強い方を前
  const high = rankOrder[c1.rank] > rankOrder[c2.rank] ? c1 : c2;
  const low  = high === c1 ? c2 : c1;

  const suited = high.suit === low.suit ? "s" : "o";

  return high.rank + low.rank + suited;
}
