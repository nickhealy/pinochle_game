export default {
  ...jest.requireActual("../Deck.ts"),
  getNewHands: () => [
    ["QH", "KS", "9C", "JH", "KD", "AC", "JC", "10C", "QS", "JD", "AS", "10S"],
    ["QS", "AS", "QD", "10D", "AH", "10C", "10S", "KC", "9H", "QC", "9D", "KC"],
    ["QH", "JD", "9S", "10H", "QC", "JC", "QD", "AH", "KH", "9D", "AC", "10D"],
    ["KH", "9H", "KS", "JH", "JS", "AD", "AD", "9S", "JS", "9C", "10H", "KD"],
  ],
};
