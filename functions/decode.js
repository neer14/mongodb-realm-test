exports = function(encodedText){
    let paddedString = encodedText;
    if (encodedText.length % 4 !== 0) {
      paddedString += '==='.slice(0, 4 - (encodedText.length % 4));
    }
    // Create a buffer from the string
    const bufferObj = Buffer.from(paddedString, 'base64');

    // Encode the Buffer as a utf8 string
    const decodedString = bufferObj.toString('utf8');

    return decodedString;
};