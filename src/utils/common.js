export function getWordCount(str) {
  const matchWords = str.match(/[\u00ff-\uffff]|\S+/g)
  return matchWords ? matchWords.length : 0
}
