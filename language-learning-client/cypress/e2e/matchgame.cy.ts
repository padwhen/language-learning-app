describe('Match Game Test', () => {
    beforeEach(function() {
        cy.visit('http://localhost:5173/')
        cy.contains('Log In').click()
        cy.get('#username').type('1111')
        cy.get('[data-testid="pin-input"]') 
        .find('input')
        .each(($el) => {
          cy.wrap($el).type('{selectall}') .type('1111') 
        });
        cy.contains('Login').click();
        cy.contains("View All Your Decks").click()
        cy.url().should('include', '/view-all-decks')
        cy.contains('deck_example').click()
        cy.contains('Match').click()    
        cy.url().should('include', '/matchgame/');
    })
    it('should display game intro and start the game', () => {
        cy.contains('Ready to play?').should('be.visible')
        cy.contains('Start Game').click()
        cy.contains('Return to Deck Details').should('be.visible')
    })
    it('should allow changing game options', () => {
        cy.get('#show-timer').click()
        cy.get('#allow-deselect').click()
        cy.contains('Start Game').click()
        cy.contains('Return to Deck Details').should('be.visible')
    })
    it('should display game cards and allow selection', () => {
        cy.contains('Start Game').click()
        cy.get('[data-testid^="game-card-"]').should('have.length', 12);
        cy.get('[data-testid^="game-card-"]').first().click()
        cy.get('[data-testid^="game-card-"]').first().should('have.class', 'bg-blue-100')
    })
    it('should match correct pairs without shuffling', () => {
        cy.contains('Start Game').click()
        cy.wait(1000)
        // Click on 'Term1'
        cy.get('[data-testid^="game-card-"]').contains('Term1').click()
        cy.wait(500)
        // Click on 'Definition1'
        cy.get('[data-testid^="game-card-"]').contains('Definition1').click()
        cy.wait(500) // Wait for any animations
        cy.contains('Term1').should('not.be.visible')
        cy.contains('Definition1').should('not.be.visible')
    })
    it('should handle incorrect pairs', () => {
        cy.contains('Start Game').click()
        cy.wait(1000)
        cy.get('[data-testid^="game-card-"]').contains('Term1').click()
        cy.wait(500)
        cy.get('[data-testid^="game-card-"]').contains('Definition2').click()
        cy.wait(500)
        cy.get('.bg-red-100').should('have.length', 2)
    })
    it('should complete the game and show completion message', () => {
        cy.contains('Start Game').click()
        cy.wait(1000)
        const gameCard = ['Term1', 'Definition1', 'Term2', 'Definition2', 'Term3', 'Definition3', 'Term5', 'Definition5', 'Term7', 'Definition7', 'Term6', 'Definition6']
        for (let i = 0; i < gameCard.length; i++) {
            cy.get('[data-testid^="game-card-"]').contains(gameCard[i]).click()
            cy.wait(500)
        }
        cy.contains('Time Taken:').should('be.visible');
    })
    it('should allow shuffling cards', () => {
        cy.contains('Start Game').click()
        cy.get('[data-testid="shuffle-button"]').click()
        
    })
})