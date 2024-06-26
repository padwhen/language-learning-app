describe('Deck details test', function() {
    beforeEach(function() {
        cy.visit('https://padwhen-learningapp.fly.dev')
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
        cy.get('[data-testid="learn-link"]').then(($link) => {
            if ($link.length > 0) {
                cy.wrap($link).click(); 
                cy.url().should('include', '/learn-decks/');
            }
        })      
    })
    it('can press include completed', function() {
        cy.get('[data-testid="include-completed-checkbox"]').click()
    })
    it('can press shuffle', () => {
        cy.get('[data-testid="shuffle-cards-checkbox"]').click();
    })
    it('can modify the quantity of quizzes', () => {
        cy.get('[data-testid="cards-to-learn-input"]').clear().type('5')
    })
    it('can choose which kind of words to learn', () => {
        cy.get('[data-testid="card-type-select"]').click()
        cy.get('[data-testid="card-type-option-all"]').click()
        cy.get('[data-testid="card-type-select"]').click()
        cy.get('[data-testid="card-type-option-not-studied"]').click()
        cy.get('[data-testid="card-type-select"]').click()
        cy.get('[data-testid="card-type-option-learning"]').click()
        cy.get('[data-testid="card-type-select"]').click()
        cy.get('[data-testid="card-type-option-completed"]').click()
    })
})