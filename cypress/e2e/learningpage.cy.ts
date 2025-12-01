describe('Deck learning page test', function() {
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
        cy.get('[data-testid="options-dialog"]').click()
        cy.get('[data-testid="include-completed-checkbox"]').click()
    })
    it('can press shuffle', () => {
        cy.get('[data-testid="options-dialog"]').click()
        cy.get('[data-testid="shuffle-cards-checkbox"]').click();
    })
    it('can modify the quantity of quizzes', () => {
        cy.get('[data-testid="options-dialog"]').click()
        cy.get('[data-testid="cards-to-learn-input"]').clear().type('5')
    })
    it('can choose which kind of words to learn', () => {
        cy.get('[data-testid="options-dialog"]').click();
        cy.wait(500); 
        const selectAndClick = (option: any) => {
          cy.get('[data-testid="card-type-select"]').click();
          cy.get(`[data-testid="card-type-option-${option}"]`).click({ force: true });
        };
        ['all', 'not-studied', 'learning', 'completed'].forEach(option => {
          selectAndClick(option);
          cy.wait(500); 
        });
      });
    it('can select answers using number keys 1, 2, 3, 4 and by clicking', () => {
        const checkAnswerSelection = () => {
            cy.get('[data-testid="question-box"]')
                .find('[data-testid="answer-test"]')
                .should('have.length', 4)
                .and('exist');
            cy.wait(1500);
        }
        ['1','2','3','4'].forEach(key => {
            cy.get('body').type(key)
            checkAnswerSelection()
        })
    })
})