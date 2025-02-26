export const onboardingConfig = {
    // Single step example
    allDecks: {
        pageName: "indexPage", 
        steps: [
            {
                title: "Welcome to Franssitsanakirja - Language Learning App!", 
                description: "We're excited to help you master your languages! Let's take a quick tour!",
                gifUrl: "https://www.icegif.com/wp-content/uploads/2023/10/icegif-26.gif"
            },
            {
                title: 'Translate and Learn!',
                description: "Type a sentence to translate and create flashcards instantly. No account needed! Want to save them? Just sign up – it’s quick and easy.",
                gifUrl: "https://lla-bucket.s3.eu-north-1.amazonaws.com/First.gif"
            },
            {
                title: "Save Words to Your Deck!",
                description: "Save words to a new or existing deck to keep your learning organized. Once saved, they’re removed from the translation to avoid mistakes!",
                gifUrl: "https://lla-bucket.s3.eu-north-1.amazonaws.com/Second.gif"
            }
        ]
    }
}