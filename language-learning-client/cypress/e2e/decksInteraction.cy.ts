describe('Deck interaction test', () => {
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
    it('can enter queries and result be displayed', function() {
      cy.get('[data-testid="input-bar"]').should('be.visible').and('not.be.disabled')
      cy.wait(500)
      cy.get('textarea').type('test')    
      cy.contains('Translate').click()
      cy.get('[data-testid="translation-result"]').should('be.visible').contains("An exceptional solution in grading the long mathematics high school exam: full points were not given for the correct answer.") 
      cy.contains('saanut').should('be.visible')
    })
    it('user can scroll choosing decks', function() {
        cy.get('[data-testid="input-bar"]').should('be.visible').and('not.be.disabled')
        cy.wait(500)
        cy.get('textarea').type('test')    
        cy.contains('Translate').click()
        cy.get('[data-testid="translation-result"]').should('be.visible').contains("An exceptional solution in grading the long mathematics high school exam: full points were not given for the correct answer.") 
        cy.contains('saanut').should('be.visible').click()
        cy.contains('Save this to a deck').should('be.visible').click()
        cy.get('[data-testid="current-decks"]').should('be.visible').scrollTo('bottom', { ensureScrollable: true })
        cy.contains('deck_example4').should('be.visible')
    })
})