const fs = require("fs")
const sampleText = fs.readFileSync('./text.txt').toString()

// Break up a line into words and strip punctuation
function getWords(textLine) {
    return textLine.trim().match(/[^\s]+/g).map((el) => el.replace(/[^\w\s]/g, "").toLowerCase())
}

// Break up a text into lines of words
function getLines(text) {
    const lines = []

    const textByLine = text.split('\n').filter((el) => el)
    textByLine.forEach(el => lines.push(getWords(el)))

    return lines
}

const sampleLines = getLines(sampleText)

// Count ngrams of a line
function countNgrams(tokens, n) {

    const ngrams = {}

    if (tokens.length < n) {
        return ngrams
    }

    for (let i = 0; i < tokens.length - n + 1; ++i) {

        const ngram = tokens.slice(i,i+n).join(' ')

        if (ngrams.hasOwnProperty(ngram)) {
            ngrams[ngram]++
        } else {
            ngrams[ngram] = 1
        }
    }
    return ngrams
}

// Create Markov dictionary of a line
function createMarkov(tokens, n) {
    const ngrams = {}

    if (tokens.length < n) {
        return ngrams
    }

    for (let i = 0; i < tokens.length - n + 1; ++i) {

        const ngram = tokens.slice(i,i+n).join(' ')

        if (!ngrams.hasOwnProperty(ngram)) {
            ngrams[ngram] = []
        }

        ngrams[ngram].push(tokens.slice(i+n, i+(2*n)).join(' '))
    }
    return ngrams
}

// Create Markovs for each line of a text
function textMarkovs (textLines, n) {
    const markovs = []
    
    textLines.forEach((line) => markovs.push(createMarkov(line, n)))

    return markovs
}

const sampleMarkovs = textMarkovs(sampleLines, 2)

// Merge Markovs of a multiple line text
function mergeMarkovs(markovsArr) {
    const mergedMarkov = {}

    for (let markov of markovsArr) {

        for (let ngram of Object.keys(markov)) {

            if (!mergedMarkov.hasOwnProperty(ngram)) {
                mergedMarkov[ngram] = []
            }

            markov[ngram].forEach((nextNgram) => mergedMarkov[ngram].push(nextNgram))
        }
    }
    return mergedMarkov
}

const sampleMergedMarkov = mergeMarkovs(sampleMarkovs)
// console.log(sampleMergedMarkov)

// Randomly choose one element from list
function choice(list) {
    const i = Math.floor(Math.random() * list.length)
    return list[i]
}

function generateMarkovChain(markovObj, length) {
    const start = choice(Object.keys(markovObj))
    let current = start
    let output = [current]

    for (let i = 0; i < length; ++i) {
        if (markovObj.hasOwnProperty(current)) {
            const next = choice(markovObj[current])

            output.push(next)
            current = output[output.length - 1]
        }
    }

    return output.join(' ')
}

const sampleChain = generateMarkovChain(sampleMergedMarkov, 10)
console.log(sampleChain)
