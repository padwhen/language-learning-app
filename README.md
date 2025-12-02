# Language Learning Application

This language learning application allows users to input sentences and paragraphs, which are then **automatically translated and parsed into individual words.** Users can **save these words as flashcards** to their own decks, or use the new **“Save all”** action to capture every term from a sentence in one go. An AI-powered review layer now provides an **overall confidence score with a detailed breakdown (accuracy, completeness, naturalness, grammar)** plus concrete concerns, so learners always know how much to trust a translation and where it might be imperfect. The app incorporates a **spaced‑repetition algorithm** to optimize learning retention and features a fully redesigned, Figma-inspired UI (sidebar navigation, modern word-detail popup, and deck picker) with **responsive design** for a seamless experience across desktop and mobile devices. Created from scratch by @padwhen.
* URL: https://padwhen-learningapp.fly.dev/

## Inspiration & Challenges  
> When I first started learning Finnish, I struggled to fully comprehend paragraphs even with translation tools. I often couldn't understand why words changed form or what grammatical rules were at play. This challenge inspired me to create this app, designed to make language learning more accessible and efficient.
> In my language learning journey, I've come to realize that vocabulary is crucial. However, without a structured study plan and clear context, it's difficult to retain words over time. That's why this app provides users with a personalized study plan and contextual learning, making vocabulary acquisition more effective and long-lasting.

## Usage & Video demo
> Quick demo of how my app works:

# **Translate**:

https://github.com/padwhen/language-learning-app/assets/123895854/ac95bd75-979c-4d17-aff4-45998d86d849

# **View Card**:
* In each card will display the English translation, the original word, the pronunciation, and the explanation.

https://github.com/padwhen/language-learning-app/assets/123895854/33bc0af2-d8ba-4455-a026-953fdc4b58e0

# **Add card to deck**:
* User can add card to their own decks. Decks here will be filtered based on the language user initially chose. Card will be removed out of the page once it is added to a deck.
* From the Translate page, users can either save a **single word** (via the word pill popup + deck selector) or use **Save all** to store all valid terms from the current sentence into one deck in a single backend call.

https://github.com/padwhen/language-learning-app/assets/123895854/80ca5928-e4c6-4961-b8e4-88d178ab11a0

# **Create a new deck**:
* Create a new deck requires deck's name, deck's language, deck's tags.
* The new side‑by‑side layout lets users see **word details + Context Tip** on the left while choosing or creating decks on the right, mirroring the latest Figma design.

# **AI Confidence & Context Tips**:
* Every translation now comes with an **AI confidence badge** showing an overall score (0–100) and a tooltip that breaks it down into **accuracy, completeness, naturalness, and grammar**, plus a list of specific concerns.
* The **Context Tip** explains when a saved word can be stored in its **base form vs. the surface form** seen in the sentence, helping learners understand inflectional morphology (e.g. Finnish cases) while choosing how to save vocabulary.

https://github.com/padwhen/language-learning-app/assets/123895854/cf8db9a3-c5b7-4219-899d-570029c97c49

# **View Deck Details**:
* User can view deck details, flipping flashcards, seeing words that are being learned/will be learned/learned.
* User can view the history of learning, also the app will display the upcoming learning schedule.
* Flashcards will be divided into 3 sections: **Not studied**, **Learning**, and **Completed**
* User can interact with flashcards by marking favorites, editing, and deleting.
* Flipping flashcards here will not modify with the card's score and the learning algorithm.

https://github.com/padwhen/language-learning-app/assets/123895854/a14bab1c-d368-4bfd-a8a3-5419cefca54d

# **Learning Page**:
* Users learn through interactive quizzes. Each quiz question presents a term from a flashcard, with four possible answers randomly selected from the deck.
* Customizable learning sessions allow users to choose the quantity and type of flashcards, with an option to shuffle for variety.
* The app uses quiz performance to calculate optimal review dates, employing spaced repetition for efficient learning.

https://github.com/padwhen/language-learning-app/assets/123895854/3ccc5ceb-2c45-41f2-b635-480857e0cb17

# **Modify Card**:
* User can modify card directly in deck's details page, or in the edit page itself
* Modify a card will reset its score, meaning user has to learn it again.
* In the edit page, user can add their own cards, modifying the deck's information.

https://github.com/padwhen/language-learning-app/assets/123895854/caba4cc5-40eb-4a3f-8413-4a6d7f559b0e

# **Import Card**:
* User can import card from their own data
* User can modify their own rules for the app to read the data

https://github.com/padwhen/language-learning-app/assets/123895854/e23da94c-f722-4e30-ae45-8ebf0e6060ac


# **Users' Settings**:
* User can modify their avatar, name, and username
* Notifications/Errors will be displayed accordingly.

https://github.com/padwhen/language-learning-app/assets/123895854/67de68d3-7071-450a-9bd4-fc87b8a80f90

# **Tailor Decks**:
* Since the vocabularies are translated based on a sentence, sometimes the meaning is vague and not correct. I add a feature in the Deck Details page to allow user to tailor the decks. It will run through all the vocabularies, choosing the one with incorrect translation and ask AI to change that.
* I also do some web scrapping. Users will have 2 suggestions and they can choose which one they prefer
  
https://github.com/padwhen/language-learning-app/assets/123895854/8b6d2e9e-23f7-40df-b4f4-994a8254b118

# Responsive Design on Mobile:
* Fully responsive design for seamless usage across desktop and mobile devices
* Optimized user interface for efficient language learning on-the-go

https://github.com/padwhen/language-learning-app/assets/123895854/b792e278-7f0f-45a9-af4f-b72db2cfdd4c

## Testing
> With every features added, I always write extremely careful and clear tests to it. As right now, all of my tests passed even if a new feature just added.

<img width="889" alt="TestScreenshot" src="https://github.com/padwhen/language-learning-app/assets/123895854/cce8262e-b344-409b-bf66-b08b2a8171b8">

## Continuous Integration / Continuous Deployment
> File: .github/pipeline.yml & .github/healthcheck.yml
* Automated CI/CD pipeline with 100+ tests ensuring quality before deployment
* Daily health checks maintaining continuous application availability
* Secure environment variable management for API keys and sensitive data
* Built with Node.js v20 and MongoDB, deployed on Fly.io

## New Update & Modification
* Redesigned Translate page UI (sidebar layout, updated word pills, modern deck modal): 02.12.2025
* Added AI confidence score with detailed breakdown and concerns, surfaced via a new Confidence badge beside Translate/Speak: 02.12.2025
* Implemented bulk **“Save all”** endpoint + UI for saving all valid words from a sentence to a single deck, with duplicate and empty-word safeguards: 02.12.2025
* Gamification: Streak, Toast - Ongoing
* Onboarding Models: 10.01.2025
* Create Review Page: 23.10.2024
* App now can detect duplications in deck details page: 13.09.2024
* Vocabulary Page: 27.08.2024
* Allowing users to search for terms/definitions in Deck Details Page: 23.08.2024
* Mock exam page: 29.07.2024
* Allowing user to mark a card as favorite: 17.07.2024
* Flashcard Flipping Page: 16.07.2024
* Match Game Page: 16.07.2024
* Learning History Report: 13.07.2024
* Fully responsive in both mobile and large screen devices: 09.07.2024
* Add new Header for Mobile App: 01.07.2024
* Import Card by Copy/Paste: 29.06.2024
* Add history of learning, reminder of next quiz: 28.06.2024
* Allowing user to press 1,2,3,4 in addition to clicking in Learning Page: 27.06.2024
* Add options in learning page: 27.06.2024
* Tailor decks with AI: 10.06.2024
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
* CI/CD: GitHub Actions
* Kanban's board on GitHub for project mangagement: bugs to fix, features (from user stories) to add.

## Development Highlights:
* Implements 30+ custom hooks and utility functions for enhanced code reusability and maintainability
* Utilizes GitHub Kanban Board for efficient feature planning and bug tracking
* Implements Git best practices with feature branches and 10+ pull requests
* Demonstrates strong version control skills and collaborative development workflow
![image](https://github.com/padwhen/language-learning-app/assets/123895854/89884595-db7c-452f-8d17-393cd3211691)


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

## License

This README.md is created by [padwhen](https://github.com/padwhen)