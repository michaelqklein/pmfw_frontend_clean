// Import the midiLookup.json file
import midiLookup from './midiLookup.json';

// Function to get the file name for a given MIDI number
const getFileName = (midiNumber) => {
  // console.log("in getFileName, midinumber: " + midiNumber);
  // Check if the MIDI number exists in the midiLookup object
  if (midiLookup.midiLookup.hasOwnProperty(midiNumber.toString())) {

    return midiLookup.midiLookup[midiNumber.toString()].fileName;
  } else {
    console.log("MIDI number doesn't exist");
    return null;
  }
};

// Export the function
export default getFileName;
