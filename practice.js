const fs = require("fs");
const sampleText = fs.readFileSync("./im-blue.txt").toString();

// Break up a line into words and strip punctuation
function getWords(textLine) {
  return `_start_ ${textLine}`
    .trim()
    .replace(/[,;]/g, " _pause_")
    .match(/[^\s]+/g)
    .map(el => el.replace(/[^\w\s]/g, "").toLowerCase());
}

// Break up a text into lines of words
function getLines(text) {
  const lines = [];

  const textByLine = text.split("\n").filter(el => el);
  textByLine.forEach(el => lines.push(getWords(el)));

  return lines;
}

const sampleLines = getLines(sampleText);
// console.log(sampleLines)

// Count ngrams of a line
function countNgrams(tokens, n) {
  const ngrams = {};

  if (tokens.length < n) {
    return ngrams;
  }

  for (let i = 0; i < tokens.length - n + 1; ++i) {
    const ngram = tokens.slice(i, i + n).join(" ");

    if (ngrams.hasOwnProperty(ngram)) {
      ngrams[ngram]++;
    } else {
      ngrams[ngram] = 1;
    }
  }
  return ngrams;
}

// Create Markov dictionary of a line
function createMarkov(tokens, n) { //2
  const ngrams = {};

  if (tokens.length < n) {
    return ngrams;
  }

  // [0, 1, 2]
  
  ngrams['_start_'] = [tokens[1]]

  for (let i = 0; i < tokens.length - n + 1; ++i) {
    const ngram = tokens.slice(i, i + n).join(" ");

    if (!ngrams.hasOwnProperty(ngram)) {
      ngrams[ngram] = [];
    }

    ngrams[ngram].push(tokens[i + n]);
  }
  return ngrams;
}

// console.log(createMarkov(sampleLines[0], 2))

// Create Markovs for each line of a text
function textMarkovs(textLines, n) {
  const markovs = [];

  textLines.forEach(line => markovs.push(createMarkov(line, n)));

  return markovs;
}

const sampleMarkovs = textMarkovs(sampleLines, 2);
// console.log(sampleMarkovs)

// Merge Markovs of a multiple line text
function mergeMarkovs(markovsArr) {
  const mergedMarkov = {};

  for (let markov of markovsArr) {
    for (let ngram of Object.keys(markov)) {
      if (!mergedMarkov.hasOwnProperty(ngram)) {
        mergedMarkov[ngram] = [];
      }

      markov[ngram].forEach(nextNgram => mergedMarkov[ngram].push(nextNgram));
    }
  }
  return mergedMarkov;
}

const sampleMergedMarkov = mergeMarkovs(sampleMarkovs);
// console.log(sampleMergedMarkov)

// Randomly choose one element from list
function choice(list) {
  const i = Math.floor(Math.random() * list.length);
  return list[i];
}

function generateMarkovChain(markovObj, len) {
  const start = `_start_ ${choice(markovObj['_start_'])}`;
  let current = start;
  let output = start.split(' ');

  for (let i = 0; i < len; ++i) {
    if (markovObj.hasOwnProperty(current)) {
      const next = choice(markovObj[current]);

      output.push(next); // [_start_, and, god]
      current = output.slice(-2).join(' ');
    }
  }

  let joinedOutput = output
    .join(" ")
    .replace(/_start_ /gi, '')
    .replace(/ _pause_/gi, ',');

  return joinedOutput.charAt(0).toUpperCase() + joinedOutput.slice(1)
}


function textToMarkovChain(textLines, n, length, linesNum) {
    const markovs = textMarkovs(textLines, n)
    const mergedMarkov = mergeMarkovs(markovs)
    
    let markovText = ''
    for (let i = 0; i < linesNum; ++i) {
        let generatedChain = generateMarkovChain(mergedMarkov, length)
        markovText += generatedChain
        if (i < linesNum - 1) {
            markovText += '\n'
        }
    }
    return markovText
}

const newPoem = textToMarkovChain(sampleLines, 2, 10, 20);
console.log(newPoem);
