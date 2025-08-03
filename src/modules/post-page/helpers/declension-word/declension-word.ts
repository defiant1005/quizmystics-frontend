export default function declensionWord(
  num: number,
  word0: string,
  word1: string,
  word2: string
) {
  const count = num % 10;
  if (count === 0) {
    return word0;
  } else if (count === 1) {
    return word1;
  } else if (count > 1 && count < 5) {
    return word2;
  } else {
    return word0;
  }
}
//протестировано
