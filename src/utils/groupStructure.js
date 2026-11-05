// Lógica do maxSet
export const getGroupStructure = (group) => {
const maxVal = group.maxSet || 1;
const lastSetId = Math.floor(maxVal);
const lastRarity = maxVal % 1 === 0 ? 5 : Math.round((maxVal % 1) * 10);
const sets = [];
for (let s = 1; s <= lastSetId; s++) {
    const rarities = s < lastSetId ? [1, 2, 3, 4, 5] : Array.from({ length: lastRarity }, (_, i) => i + 1);
    sets.push({ id: s, rarities });
}
return sets;
};
