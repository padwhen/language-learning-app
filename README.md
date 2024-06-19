# Language Learning Application

This language learning application allows users to input sentences and paragraphs, which are then **automatically translated** and **parsed into individual words**. Users can **save these words as flashcards** to their own decks, enabling them to efficiently study and memorize vocabulary. The app incorporates **a spaced-repetition algorithm** to optimize learning retention.
Created from scratch by @padwhen.

## Inspiration & Challenges  
> When I first started learning Finnish, I found it really difficult to fully understand a Finnish paragraph, even with a translation tool. I didn't know why this word transformed into this or what grammatical point is in this word. So I decided to create this app to help me start learning the language easily. (also, no more excuses for me)

## Usage & Video demo
> Quick demo of how my app works:

# **Translate**:
  
https://github.com/padwhen/language-learning-app/assets/123895854/ac95bd75-979c-4d17-aff4-45998d86d849

# **View Card**:
* In each card will display the English translation, the original word, the pronunciation, and the explanation.

https://github.com/padwhen/language-learning-app/assets/123895854/33bc0af2-d8ba-4455-a026-953fdc4b58e0

# **Add card to deck**:
* User can add card to their own decks. Decks here will be filtered based on the language user initially chose. Card will be removed out of the page once it is added to a deck.

https://github.com/padwhen/language-learning-app/assets/123895854/80ca5928-e4c6-4961-b8e4-88d178ab11a0

# **Create a new deck**:
* Create a new deck requires deck's name, deck's language, deck's tags

https://github.com/padwhen/language-learning-app/assets/123895854/cf8db9a3-c5b7-4219-899d-570029c97c49

# **View Deck Details**:
* User can view deck details, flipping flashcards, seeing words that are being learned/will be learned/learned.
* Flipping flashcards here will not modify with the card's score and the learning algorithm.

https://github.com/padwhen/language-learning-app/assets/123895854/1bcc115f-b662-4c5a-82ca-24f4e2e56207

# **Modify Card**:
* User can modify card directly in deck's details page, or in the edit page itself
* Modify a card will reset its score, meaning user has to learn it again.
* In the edit page, user can add their own cards, modifying the deck's information.

https://github.com/padwhen/language-learning-app/assets/123895854/caba4cc5-40eb-4a3f-8413-4a6d7f559b0e

# **Users' Settings**:
* User can modify their avatar, name, and username
* Notifications/Errors will be displayed accordingly.

https://github.com/padwhen/language-learning-app/assets/123895854/67de68d3-7071-450a-9bd4-fc87b8a80f90

# **Tailor Decks**:
* Since the vocabularies are translated based on a sentence, sometimes the meaning is vague and not correct. I add a feature in the Deck Details page to allow user to tailor the decks. It will run through all the vocabularies, choosing the one with incorrect translation and ask AI to change that.
* I also do some web scrapping. Users will have 2 suggestions and they can choose which one they prefer
  
https://github.com/padwhen/language-learning-app/assets/123895854/8b6d2e9e-23f7-40df-b4f4-994a8254b118



## Testing
> With every features added, I always write extremely careful and clear tests to it. As right now, all of my tests passed even if a new feature just added.

<img width="889" alt="TestScreenshot" src="https://github.com/padwhen/language-learning-app/assets/123895854/cce8262e-b344-409b-bf66-b08b2a8171b8">

## New Update
* Edit profile (adding avatars, modifying username, name): 05.06.2024
* Edit decks' details, adding cards by inputting term/definition: 03.06.2024
* Filtering decks based on criterias: 31.05.2024

## Technologies
* Programming Languages: TypeScript, JavaScript
* Front-End: React.JS, TailwindCSS, ShadcnUI, React-Router-Dom.
* Back-end: Express.JS, Node.JS.
* Database: MongoDB
* Testing: Vitest, Cypress
* Cloud Services: Google Cloud Platform
* Containers: Docker (for easier deployment)
* Kanban's board on GitHub for project mangagement: bugs to fix, features (from user stories) to add.


## Challenges: 
* Even though this idea was sparked in me for almost half a year ago, but it took me a lot of researches and dozens of similar coding projects in order to complete this. Before this, I gave up once because I don't know how to proceed.
* In the beginning, for the UI, I drew in my notebook about how my app will look like, what features will it have. I note down the pros and cons of any new features that come up into my head, and asking myself if this feature exist, could it implement or undermine another features? I then created the UI first, with mock datas.
* With mock datas, I know how my back-end structure will look like, then I create my own diagrams for tables to see how it connected. 
* Of course, in all process, a lot of problems arose and not everything works as I planned. I managed them by break down a problem into smaller tasks, and handle those smaller one first. Then I compare it to the previous version, if it helps the application in any aspect, I will keep it. If not, I will rollback and do it again.
  
**Features I want to implement in the future**: 
* As right now, the only features with flashcards are study it by answering quizzes. In the future, I want to add features like matching, doing a test with flashcards. Moreover, user can play games like hang man, wordle with the current flashcards. 
* Implement a feature in which user can write characters with their mouses, using this feature for language that is non-Latin words such as Korean, Chinese, Greek, ...
* Testing for both frontend & backend.
* Some machine learning features.


## Installation

Go to the backend folder and install all the dependencies
```bash
cd backend && npm install
```
Run the app:
```bash
node index.js
```


## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

This README.md is created by [padwhen](https://github.com/padwhen)
