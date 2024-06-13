function accessToDeckDetails(deckName: string) {
    cy.contains('View All Your Decks').should('be.visible').click()
    cy.contains(deckName).click()
}

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
    })
    it('access to deck details', function() {
        accessToDeckDetails('deck_example')
    })
    it('progress bar moves on card navigation', function() {
        accessToDeckDetails('deck_example')
        cy.get('[data-testid="current-card-number"]').should('contain.text', '1 /')
        // Assert the initial stage 
        cy.get('[role="progressbar"]').should('have.attr', 'aria-valuemin', '0');
        cy.get('[role="progressbar"]').should('have.attr', 'aria-valuemax', '100');
        cy.get('[role="progressbar"] > div').should('have.attr', 'style', 'transform: translateX(-98.1132%);');
        // Move to the second card
        cy.get('[data-testid="move-right"]').click();
        cy.get('[data-testid="current-card-number"]').should('contain.text', '2 /')
        cy.get('[role="progressbar"] > div').should('have.attr', 'style', 'transform: translateX(-96.2264%);'); 
        // Move back to the first card
        cy.get('[data-testid="move-left"]').click()
        cy.get('[data-testid="current-card-number"]').should('contain.text', '1 /')
        cy.get('[role="progressbar"] > div').should('have.attr', 'style', 'transform: translateX(-98.1132%);');
    })
    it('cannot move left from first card or right from last card', () => {
        accessToDeckDetails('finnish2')
        // This deck only has 2 cards
        cy.get('[data-testid="current-card-number"]').should('contain.text', '1 /')
        cy.get('[data-testid="move-left"]').should('have.class', 'pointer-events-none');
        cy.get('[data-testid="move-right"]').click()
        cy.get('[data-testid="current-card-number"]').should('contain.text', '2 /')
        cy.get('[data-testid="move-right"]').should('have.class', 'pointer-events-none');
    })
    it('cannot move left or right if only one card', function() {
        accessToDeckDetails('deck_example3') // This deck only has 1 card
        cy.get('[data-testid="current-card-number"]').should('contain.text', '1 /')
        cy.get('[data-testid="move-left"]').should('have.class', 'pointer-events-none');
        cy.get('[data-testid="move-right"]').should('have.class', 'pointer-events-none');
    })
    it('keyboard navigation works', () => {
        accessToDeckDetails('deck_example')
        cy.wait(500)
        cy.get('body').type('{rightarrow}')
        cy.get('[role="progressbar"] > div').should('have.attr', 'style', 'transform: translateX(-96.2264%);'); 
        cy.get('[data-testid="current-card-number"]').should('contain.text', '2 /')
        cy.get('body').type('{leftarrow}')
        cy.get('[role="progressbar"] > div').should('have.attr', 'style', 'transform: translateX(-98.1132%);');
        cy.get('[data-testid="current-card-number"]').should('contain.text', '1 /')
    })
    it('allows user to click "Learn" when where there are more than 4 flashcards', () => {
        accessToDeckDetails('deck_example')
        cy.get('[data-testid="current-card-number"]').should('contain.text', '1 /');
        cy.get('[data-testid="learn-link"]').then(($link) => {
            if ($link.length > 0) {
                cy.wrap($link).click(); 
                cy.url().should('include', '/learn-decks/');
            }
        })
    })
    it('shows tooltip when clicking "Learn" with fewer than 4 flashcards', () => {
        accessToDeckDetails('finnish2') // This deck only has 2 cards
        cy.get('[data-testid="current-card-number"]').should('contain.text', '1 /');
        cy.get('[data-testid="learn-link"]').should('not.exist');
        cy.get('[data-testid="cannot-learn-link"]').trigger('mouseover')
    })
})