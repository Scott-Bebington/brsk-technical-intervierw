/**
 * This function fetches the words from the server.
 */
async function fetchWords() {
    const fetchWordsButton = document.getElementById('fetch-words-button');
    fetchWordsButton.disabled = true;
    fetchWordsButton.textContent = 'Fetching words...';

    const startTime = Date.now();

    try {
        const response = await fetch('http://localhost:3000/fetch-words');
        const result = await response.json();

        showSnackbar(result.message ? 'Word list refreshed successfully!' : 'Failed to refresh word list!', result.message);
    } catch (error) {
        showSnackbar('Failed to refresh word list!', false);
    } finally {
        fetchWordsButton.disabled = false;
        fetchWordsButton.textContent = 'Refresh Word List';
        console.log('Time taken:', Date.now() - startTime, 'ms');
    }
}

/**
 * This function loads the indexes from the server.
 */
async function loadIndexes() {
    try {
        const response = await fetch('http://localhost:3000/load-indexes');
        await response.json();
    } catch (error) {
        console.error('Failed to load indexes:', error);
    }
}

/**
 * This function replaces the sentence that the user has inputted.
 * The sentence is then sent to the server to be replaced.
 * The new sentence is then displayed to the user.
 * @returns string
 */
async function replaceSentence() {

    const checkSentenceFunction = checkSentence();

    if (!checkSentenceFunction) {
        return;
    }

    const replaceSentenceButton = document.getElementById('replace-sentence-button');
    replaceSentenceButton.disabled = true;
    replaceSentenceButton.textContent = 'Replacing sentence...';

    const sentence = document.getElementById('sentence-input').value.trim().toLowerCase();
    console.log('Sentence:', sentence);

    try {
        const response = await fetch(`http://localhost:3000/replace-sentence?sentence=${encodeURIComponent(sentence)}`);
        const result = await response.json();
        document.getElementById('new-sentence').textContent = result.newSentence;
    } catch (error) {
        console.error('Failed to replace sentence:', error);
        showSnackbar('Failed to replace sentence!', false);
    } finally {
        replaceSentenceButton.disabled = false;
        replaceSentenceButton.textContent = 'Replace Sentence';
    }
}

/**
 * This functions checks to see if the enter button is clicked.
 * If the enter button is clicked, the replaceSentence function is called. as the user has finished typing the sentence.
 * @param {key} event 
 */
function checkKeyPress(event) {
    if (event.key === 'Enter') {
        replaceSentence();
    }
}

function checkInputChange() {

    console.log('Input change detected');

    const sentence = document.getElementById('sentence-input').value;
    let parts = sentence.split(' ').map(word => word.trim()).filter(word => word !== '').join(' ');
    const originalSentence = document.getElementById('original-sentence');
    originalSentence.textContent = parts;

    if (sentence === '') {
        const newSentence = document.getElementById('new-sentence');
        newSentence.textContent = '';
    }
}

/**
 * This function checks the sentence that the user has inputted.
 * The following conditions haveeee to be met:
 * 1. The sentence must not be empty.
 * 2. Each word must start with a letter.
 * 
 * If the conditions are not met, a snackbar is displayed to the user.
 * 
 * This function is lenient and does not worry about aditional spaces or special characters in the middle of the sentence as only the starting letter and the length of the word is important.
 * @returns boolean
 */
function checkSentence() {

    let boolCheck = true;

    const snackbar = document.createElement('div');

    const sentence = document.getElementById('sentence-input').value.trim();

    if (sentence === '') {
        snackbar.textContent = 'Please make sure there is a sentence!';
        snackbar.classList.add('snackbar-error');
        document.body.appendChild(snackbar);
        boolCheck = false;
    }

    let parts = sentence.split(' ').map(word => word.trim().toLowerCase()).filter(word => word !== '');

    for (let i = 0; i < parts.length; i++) {
        if (!/^[a-z]/.test(parts[i])) {
            snackbar.textContent = 'Each word must start with a letter!';
            snackbar.classList.add('snackbar-error');
            document.body.appendChild(snackbar);
            boolCheck = false;
        }
    }

    setTimeout(() => {
        snackbar.remove();
    }, 3000);

    return boolCheck;
}

/**
 * This function shows a snackbar to the user.
 * @param {string} message 
 * @param {boolean} isSuccess 
 */
function showSnackbar(message, isSuccess) {
    const snackbar = document.createElement('div');
    snackbar.textContent = message;
    snackbar.classList.add(isSuccess ? 'snackbar-success' : 'snackbar-error');
    document.body.appendChild(snackbar);
    setTimeout(() => snackbar.remove(), 3000);
}