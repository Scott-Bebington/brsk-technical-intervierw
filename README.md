# brsk technical intervierw
 
### Thought process
- I will start by creating a simple web page with a form that will take the user input and display the result on the same page. as this is not the main aspect of the task, I will not spend much time on the design of the page.
- For the sake of effeciency, I will preproccess the data in the following way:
    - Split the large text file into 26 smaller teext files based on the first letter of the word.
    - I will sort the file based on word length storing the shortest words at the front and the largest words at the end.
    - I will then traverse the word list and get the index of each time a word length increases. i will store this information in a new file in the form of a Dictionary/Hashmap.
- The reason for preproccessing the data is to reduce the client side calculations, let the "server" do the heavy lifting and to reduce the lookup time to O(1) instead of O(n) for all subsequent searches.
- The initial data proceessing may be more expensive but the subsequent searches will make up for the time lost sorting and organizing the data.

### Program usage
- The program is written in js and can be run on any browser.
- The program utilizes node.js to run and therefor must be installed on the machine.
- 