# Language Learning Application

This language learning application allows users to input sentences and paragraphs, which are then **automatically translated** and **parsed into individual words**. Users can **save these words as flashcards** to their own decks, enabling them to efficiently study and memorize vocabulary. The app incorporates **a spaced-repetition algorithm** to optimize learning retention.
Created from scratch by @padwhen.

## Technologies
* Programming Languages: TypeScript, JavaScript
* Front-End: React.JS, TailwindCSS, ShadcnUI, React-Router-Dom.
* Back-end: Express.JS, Node.JS.
* Database: MongoDB
* Cloud Services: Google Cloud Platform

## Inspiration & Challenges  
> When I first started learning Finnish, I found it really difficult to fully understand a Finnish paragraph, even with a translation tool. I didn't know why this word transformed into this or what grammatical point is in this word. So I decided to create this app to help me start learning the language easily. (also, no more excuses for me)

**Challenges:** Even though this idea was sparked in me for almost half a year ago, but it took me a lot of researches and dozens of similar coding projects in order to complete this. Before this, I gave up once because I don't know how to proceed.
* In the beginning, for the UI, I drew in my notebook about how my app will look like, what features will it have. I note down the pros and cons of any new features that come up into my head, and asking myself if this feature exist, could it implement or undermine another features? I then created the UI first, with mock datas.
* With mock datas, I know how my back-end structure will look like, then I create my own diagrams for tables to see how it connected. 
* Of course, in all process, a lot of problems arose and not everything works as I planned. I managed them by break down a problem into smaller tasks, and handle those smaller one first. Then I compare it to the previous version, if it helps the application in any aspect, I will keep it. If not, I will rollback and do it again.

**Features I want to implement in the future**: 
* As right now, the only features with flashcards are study it by answering quizzes. In the future, I want to add features like matching, doing a test with flashcards. Moreover, user can play games like hang man, wordle with the current flashcards. 
* Implement a feature in which user can write characters with their mouses, using this feature for language that is non-Latin words such as Korean, Chinese, Greek, ...
* Testing for both frontend & backend.



## Installation

Go to the backend folder and install all the dependencies
```bash
cd backend && npm install
```
Run the app:
```bash
node index.js
```
## Usage & Video demo


## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

This README.md is created by [padwhen](https://github.com/padwhen)
