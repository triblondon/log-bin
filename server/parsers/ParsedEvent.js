const httpSHparser = require('./http-sh');
const colorForString = require('string-to-color');
const ContrastChecker = require("color-contrast-calc").ContrastChecker;

class ParsedEvent {
  
  constructor(inputString) {
    this.inputString = inputString;    
    this.parser = undefined;
    this.fields = {};
    this.time = Date.now();
  }
  
  parse() {
    let fieldData;
    
    for (const [parserName, fn] of Object.entries(parsers)) {
      const data = fn(this.inputString);
      if (data) {
        this.parser = parserName;
        fieldData = data;
        break;
      }
    }
        
    // Parse out the meta fields (TODO: small vs large)
    this.fields = fieldData ? Object.keys(fieldData).reduce((obj, k) => ({...obj, [k]: {
      value: fieldData[k],
      color: colorForString(k),
      contrast: ContrastChecker.contrastRatio(colorForString(k), '#000000')
    }}), {}) : {};
    
  }
  
  getTime() {
    return this.time;
  }
  
  getFields() {
    return this.fields;
  }
  
  getParserName() {
    return this.parser;
  }
}

const parsers = {
  json: input => {
    try {
      return JSON.parse(input);
    } catch (e) {}
  },
  structuredHeaders: input => {
    try {
      return httpSHparser.parse(input);
    } catch (e) {}
  },
  apache: input => {
  }
};

module.exports = ParsedEvent;