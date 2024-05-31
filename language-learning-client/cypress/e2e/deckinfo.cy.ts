const test_content = '[data-testid="sort-select-content"]'
const test_trigger = '[data-testid="sort-select-trigger"]'

const testSelectDropdown = (selectOption: string) => {
    cy.get(test_trigger).click()
    cy.get(test_content).contains(selectOption).click()
    cy.get(test_trigger).should('contain.text', selectOption);
}

describe('Deck details test', function() {
    const selectOptions = [
        'Most recent',
        'Top Progress',
        'Most old',
        'Least Progress',
        'Most cards',
        'Finnish',
        'Vietnamese',
    ];
    beforeEach(function() {
        cy.visit('http://localhost:5173')
        cy.contains('Log In').click()
        cy.get('#username').type('1111')
        cy.get('[data-testid="pin-input"]') 
        .find('input')
        .each(($el) => {
          cy.wrap($el).type('{selectall}') .type('1111') 
        });
        cy.contains('Login').click();
    })
    it('allows users to select different sorting options', function() {
        cy.get(test_trigger).should('contain.text', 'Most cards');
        selectOptions.forEach(option => {
            testSelectDropdown(option);
        });
    })
    it('allows user to click on View Details for each deck', () => {
        cy.contains('View Details').click()
        cy.url().should('include', '/view-decks');
    });
    it('allows user to click on View All Your Decks button', () => {
        cy.contains('View All Your Decks').click()
        cy.url().should('include', '/view-all-decks')
    })
    it('allows users to select different sorting options in view-all-decks', function() {
        cy.contains('View All Your Decks').click()
        cy.url().should('include', '/view-all-decks')    
        selectOptions.forEach(option => {
            testSelectDropdown(option);
        });
    })
})