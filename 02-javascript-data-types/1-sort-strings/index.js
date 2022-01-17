/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {

  let sortedArr = [...arr];

  sortedArr.sort((a, b) => a.localeCompare(b, ['ru', 'en'], {caseFirst: 'upper'}));

  if (param === 'asc') {
    return sortedArr
  }
  else return sortedArr.reverse()


}
