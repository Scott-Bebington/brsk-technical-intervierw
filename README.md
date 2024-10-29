# Brsk Technical Interview
 
### Thought process
- I will start by creating a simple web page with a form that will take the user input and display the result on the same page. Since this is not the main aspect of the task, I will not spend much time on the design of the page.
- For the sake of efficiency, I will preprocess the data in the following way:
    - Split the large text file into 26 smaller text files based on the first letter of each word.
    - Sort each file based on word length, storing the shortest words at the front and the longest words at the end.
    - Traverse the word list and get the index each time a word length increases, storing this information in a new file as a Dictionary/Hashmap.
- The reason for preprocessing the data is to reduce client-side calculations, let the "server" do the heavy lifting, and reduce the lookup time to O(1) instead of O(n) for all subsequent searches.
- The initial data processing may be more expensive, but the subsequent searches will make up for the time spent sorting and organizing the data.
- The user can request the data to be reprocessed if they feel the data has changed or if they want to update it.
- 
### Installation and setup
- This program uses Node.js to run the server-side code.
- To install node.js, visit the [node.js website](https://nodejs.org/en/download/prebuilt-installer) and download the appropriate version for your operating system.
- run the following commands in the terminal to install the required packages:
    ```bash
    npm install express
    npm install cors
    ```

### Program usage
- The program is written in JavaScript and can be run on any browser where JavaScript is enabled.
- Once the required packages are installed, run the following command in the terminal to start the server:
    ```bash
    node server.js
    ```
- The server will start on port 3000. Once this is the case, navigate to the directory where the index.html file is located and open it in a browser.
- The user can then input a word or sentence, and the program will return a new sentence with words of the same length and first letter as the input.
- If the user wants to refresh the data, they can click the "Refresh Word List" button, and the server will reprocess the data.