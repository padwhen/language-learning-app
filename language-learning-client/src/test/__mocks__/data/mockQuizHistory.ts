export const mockQuizHistoryData = {
  _id: 'history-123',
  userId: 'user-123',
  deckId: 'deck-123',
  cardsStudied: 5,
  correctAnswers: 4,
  quizType: 'flashcard',
  nextQuizDate: '2023-02-01T00:00:00.000Z',
  randomName: 'Winter Quiz',
  quizDetails: [
    {
      question: 'Test question 1',
      userAnswer: 'Test answer 1',
      correctAnswer: 'Correct answer 1',
      isCorrect: true,
      timeTaken: 3000
    },
    {
      question: 'Test question 2',
      userAnswer: 'Test answer 2',
      correctAnswer: 'Correct answer 2',
      isCorrect: true,
      timeTaken: 5000
    },
    {
      question: 'Difficult question 3',
      userAnswer: 'Wrong answer',
      correctAnswer: 'Correct answer 3',
      isCorrect: false,
      timeTaken: 7000
    }
  ],
  date: '2023-01-15T00:00:00.000Z'
}