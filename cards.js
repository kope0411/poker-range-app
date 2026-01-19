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

const selectedCards = [];
const grid = document.getElementById("cardGrid");
const selectedDiv = document.getElementById("selected");
const normalizedDiv = document.getElementById("normalized");

// 52枚生成
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

function updateSelected() {
  selectedDiv.textContent = selectedCards
    .map(c => c.rank + suitSymbol(c.suit))
    .join(" ");

  const normalized = normalizeHand(selectedCards);
  normalizedDiv.textContent = normalized ? normalized : "";
}

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

  if (c1.rank === c2.rank) {
    return c1.rank + c2.rank;
  }

  const high = rankOrder[c1.rank] > rankOrder[c2.rank] ? c1 : c2;
  const low  = high === c1 ? c2 : c1;

  const suited = high.suit === low.suit ? "s" : "o";

  return high.rank + low.rank + suited;
}
