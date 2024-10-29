const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 3000;

var jsonData;

let words = [];
const wordsMap = {};

/**
 * This function fetches the word list from the GitHub repository.
 * The word list is then stored in the words array.
 * This function will not be called everytime the program is run.
 * This function will be called when the user requests the words list to be refreshed
 * or on a scheduled basis (e.g. once a day) depending on the systems requirements.
 * @returns {Promise<void>}
 */
async function readWords() {
    const url = 'https://raw.githubusercontent.com/dwyl/english-words/refs/heads/master/words_alpha.txt';

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                words = data.split('\n');
                resolve();
            });
        }).on('error', (err) => {
            console.error('Error fetching words:', err);
            reject(err);
        });
    });
}

/**
 * This function creates a folder named 'letters' in the current directory.
 * It then creates 26 text files in the 'letters' folder, one for each letter of the alphabet.
 * Each text file contains all the words that start with the corresponding letter.
 */
function createFolderAndTextFiles() {
    const lettersFolder = path.join(__dirname, 'letters');
    if (!fs.existsSync(lettersFolder)) {
        fs.mkdirSync(lettersFolder);
    }

    for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(97 + i);
        const filePath = path.join(lettersFolder, `${letter}.txt`);
        const wordsForLetter = words.filter(word => word.startsWith(letter));
        fs.writeFileSync(filePath, wordsForLetter.join('\n'), 'utf8');
    }
}

/**
 * This function sorts the words array by length.
 * The words array is sorted in ascending order of word length.
 */
function sortWordsByLength() {
    words.sort((a, b) => a.length - b.length);
}

/**
 * This function gets the index each time a word increases in length.
 * The indexes are stored in a separate file.
 */
function generateLengthIndexes() {

    // Hashmap to store the indexes for each letter
    const letters = {};

    for (let i = 0; i < 26; i++) {
        // Get the letter using the ASCII code and convert it to a char
        const letter = String.fromCharCode(97 + i);
        const filePath = path.join(__dirname, 'letters', `${letter}.txt`);

        // Read words from the file for the current letter
        const allWords = fs.readFileSync(filePath, 'utf-8').split('\n').map(word => word.trim()).filter(word => word);

        // Hashmap to store the indexes for each length
        const indexes = {};

        allWords.forEach((word, index) => {
            const length = word.length;

            // Check if this length already has an entry
            if (!indexes[length]) {
                indexes[length] = { first: index, last: index };
            } else {
                // Update the 'last' index for this length
                indexes[length].last = index;
            }
        });

        letters[letter] = indexes;
    }

    // Write the indexes to the indexes file
    const indexesFilePath = path.join(__dirname, 'indexes.json');
    fs.writeFileSync(indexesFilePath, JSON.stringify(letters, null, 2), 'utf8');
}

/**
 * This function loads the indexes from the indexes.json file.
 * The indexes are stored in a hashmap.
 * The hashmap is then used to get the indexes for each word length.
 */
function loadData() {
    const indexesFilePath = path.join(__dirname, 'indexes.json');
    jsonData = JSON.parse(fs.readFileSync(indexesFilePath, 'utf-8'));

    for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(97 + i);

        const words = fs.readFileSync(path.join(__dirname, 'letters', `${letter}.txt`), 'utf-8').split('\n');
        wordsMap[letter] = words;
    }
}

/**
 * This function replaces each word in the sentence with a random word of the same length.
 * If no word of the same length is found, the word is not replaced.
 * The new sentence is then returned.
 * @param {string} sentence 
 * @returns string
 */
function replaceSentence(sentence) {
    const words = sentence.split(' ');
    let newSentence = [];
    words.forEach(word => {

        try {
            const firstLetter = word.charAt(0);
            const indexes = jsonData[firstLetter][word.length];

            if (indexes.last - indexes.first > 0) {
                let randomIndex;
                do {
                    randomIndex = Math.floor(Math.random() * (indexes.last - indexes.first + 1) + indexes.first);
                } while (word.trim() === wordsMap[firstLetter][randomIndex].trim())
                newSentence.push(wordsMap[firstLetter][randomIndex].trim());
            }
            else {
                console.log('No replacement word found with that length, returning', word.trim());
                newSentence.push(word);
            }
        } catch (error) {
            console.log('No replacement word found with that length, returning', word.trim());
            newSentence.push(word.trim());
        }
    });

    return newSentence.join(' ');
}

/**
 * Endpoint to fetch the words from the GitHub repository.
 * The words are then stored in separate text files based on the starting letter.
 * The words are sorted by length in each file.
 * The indexes for the lengths of the letters are then generated and stored in a separate file.
 * Thee indexes are then fetched and stored in a hashmap to be used.
 * The response is sent back to the client.
*/
app.get('/fetch-words', async (req, res) => {
    try {
        await readWords();

        createFolderAndTextFiles();

        sortWordsByLength();

        generateLengthIndexes();

        loadData();

        res.json({ message: 'Words fetched and loaded' });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching words' });
    }
});

/**
 * Endpoint to load the indexes from the indexes.json file.
 */
app.get('/load-indexes', (req, res) => {
    try {
        loadData();
        res.json({ message: 'Length indexes loaded', data: jsonData });
    } catch (error) {
        res.status(500).json({ error: 'Error loading indexes' });
    }
});

/**
 * Endpoint to replace words in a sentence.
 */
app.get('/replace-sentence', (req, res) => {
    const sentence = req.query.sentence;
    const newSentence = replaceSentence(sentence);
    res.json({ newSentence });
});

/**
 * Starts the server on the specified port.
 * Default port is 3000.
 */
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
