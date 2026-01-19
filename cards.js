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

let rangeData = {};

// JSON読み込み
fetch("ranges/preflop_6max.json")
  .then(response => response.json())
  .then(data => {
    rangeData = data;
    console.log("Range data loaded", rangeData);
  })
  .catch(error => {
    console.error("Failed to load range data:", error);
  });


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
