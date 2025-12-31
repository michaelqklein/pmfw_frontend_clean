const pickRandOfList = (list, lastElement = null, favoredElements = []) => {
    // console.log("favoredelements: ", favoredElements);
    // Ensure the input list is a non-empty array
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error('The input should be a non-empty array of elements.');
    }
  
    function pick(){
      let selectedElement = null;
      let maxRandomValue = -1;
  
      list.forEach(element => {
        // Generate a random number between 0 and 1
        let randomValue = Math.random();
  
        // Double the random value if the element is in the favoredElements list
        if (favoredElements.map(el => String(el)).includes(String(element))) {
          // console.log("new: ")
          randomValue *= 2;
        }
  
        // console.log("element: ", element, ", value: ", randomValue);
        // Select the element with the highest random value
        if (randomValue > maxRandomValue) {
          maxRandomValue = randomValue;
          selectedElement = element;
        }
  
      });
      return selectedElement;
    }
  
    let selectedElement;
    if (lastElement === null)
      selectedElement = pick();
    else do
    {
      selectedElement = pick();
    } while (selectedElement === lastElement)
  
    return selectedElement;
  }
  
  export default pickRandOfList;