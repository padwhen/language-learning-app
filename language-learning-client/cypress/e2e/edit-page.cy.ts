describe('Edit deck test', function() {
    beforeEach(function() {
        cy.visit('http://localhost:5173')
        cy.contains('Log In').click()
        cy.get('#username').type('june_testing')
        cy.get('[data-testid="pin-input"]') 
        .find('input')
        .each(($el) => {
          cy.wrap($el).type('{selectall}') .type('0606') 
        });
        cy.contains('Login').click();
        cy.contains('View Details').click()
        cy.scrollTo(0, 500)
        cy.get('[data-testid="modify-deck"]').click()

    })
    it('access to edit-deck', function() {
        cy.url().should('include', '/edit-deck');
    })
    it('should modify title, language, and tags', function() {
        // Able to modify title
        cy.get('[data-testid="edit-title"]').clear().type('New Deck Title');
        // Able to modify language
        cy.get('[data-testid="edit-language"]').clear().type('New Language');
        cy.contains('NewLanguage').should('exist');
        // Able to add tags
        cy.get('[data-testid="edit-tags-input"]').clear().type('tag1')
        cy.contains('Add').click()
        cy.get('[data-testid="edit-tags-input"]').clear().type('tag2')
        cy.contains('Add').click()
        cy.contains('tag1').should('exist');
        cy.contains('tag2').should('exist');
    })
    it('should remove tags', function() {
        cy.get('[data-testid="edit-tags-input"]').clear().type('tag1')
        cy.contains('Add').click()
        cy.contains('tag1').parent().find('[data-testid^="remove-tag"]').click()
        cy.contains('tag1').should('not.exist')
    })
    it('able to swap terms', function() {
        cy.get('[data-testid="term-input-0"]').should('have.value', 'kesää');
        cy.get('[data-testid="definition-input-0"]').should('have.value', 'summer');
        cy.get('[data-testid="swap-terms"]').click()
        cy.get('[data-testid="term-input-0"]').should('have.value', 'summer');
        cy.get('[data-testid="definition-input-0"]').should('have.value', 'kesää');
    })
    it('should modify TERM/DEFINITION', function() {
        cy.get('[data-testid="term-input-0"]').clear().type('New Term');
        cy.get('[data-testid="definition-input-0"]').clear().type('New Definition');
        cy.get('[data-testid="term-input-0"]').should('have.value', 'New Term');
        cy.get('[data-testid="definition-input-0"]').should('have.value', 'New Definition');
    })
    it('should delete a card', function() {
        cy.get('[data-testid^="delete-card-0"]').click()
        cy.get('[data-testid="term-input-0"]').should('not.have.value', 'kesää');
        cy.get('[data-testid="definition-input-0"]').should('not.have.value', 'summer');
    })
    it('should add a card with no term/definition', function() {
        cy.scrollTo(0, 1000)
        cy.get('[data-testid="add-card-button"]').click();
        cy.get('[data-testid="term-input-7"]').should('have.value', '');
        cy.get('[data-testid="definition-input-7"]').should('have.value', '');
    })
    it('should add TERM/DEFINITION to new card', function() {
        cy.scrollTo(0, 1000)
        cy.get('[data-testid="add-card-button"]').click();
        cy.get('[data-testid="term-input-7"]').should('have.value', '');
        cy.get('[data-testid="definition-input-7"]').should('have.value', '');
        cy.get('[data-testid="term-input-7"]').type('New Term');
        cy.get('[data-testid="definition-input-7"]').type('New Definition');
        cy.get('[data-testid="term-input-7"]').should('have.value', 'New Term');
        cy.get('[data-testid="definition-input-7"]').should('have.value', 'New Definition');
    })
    it('should press DONE', function() {
        cy.scrollTo(0, 1200)
        cy.get('[data-testid="done-button-bottom"]').click();
        cy.url().should('include', '/view-decks');
    })
})