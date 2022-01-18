/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {

  let newObject = {};

  fields.forEach(function (field) {
    if (field in obj) {
      newObject[field] = obj[field];
    }
  });

  return newObject;


  //Решение с Object.entries и Array.find()

  // let fruitArray = Object.entries(obj);
  // let resultArray = [];
  // let resultObject = {};
  //
  // fields.forEach((field) => {
  //   if (fruitArray.find(item => item[0] === field)) {
  //     resultArray.push(fruitArray.find(item => item[0] === field));
  //   }
  // });
  //
  // resultObject = Object.fromEntries(resultArray);
  //
  // return resultObject;
  //
};
