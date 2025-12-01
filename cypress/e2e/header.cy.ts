describe('Header test', function() {
    beforeEach(function() {
        cy.visit('https://padwhen-learningapp.fly.dev/')
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
    })
    it('should show MainNav on desktop', function() {
        cy.viewport(1024, 768)
        cy.get('[data-testid="main-nav"]').should('be.visible')
        cy.get('[data-testid="mobile-nav-toggle"]').should('not.be.visible')
    })
    it('should show MobileNav on mobile', function() {
        cy.viewport(375, 667)
        cy.get('[data-testid="main-nav"]').should('not.be.visible')
        cy.get('[data-testid="mobile-nav-toggle"]').should('be.visible')
    })
    it('should open MobileNav when clicked', function() {
        cy.viewport(375, 667)   
        cy.get('[data-testid="mobile-nav-toggle"]').click()
        cy.get('[data-testid="mobile-nav-content"]').should('be.visible').within(() => {
            cy.contains('Frassitsanakirja').should('be.visible')
            cy.contains('Translate').should('be.visible')
            cy.contains('Your decks').should('be.visible')
            cy.contains('Settings').should('be.visible')            
        })
    })
    it('should navigate correctly in MobileNav', function() {
        cy.viewport(375, 667)
        // Navigate to Your decks
        cy.get('[data-testid="mobile-nav-toggle"]').click()
        cy.get('[data-testid="mobile-nav-content"]').should('be.visible').within(() => {
            cy.contains('Your decks').click()
        })
        cy.url().should('include', '/view-all-decks')
        // Navigate to Settings
        cy.get('[data-testid="mobile-nav-toggle"]').click()
        cy.get('[data-testid="mobile-nav-content"]').should('be.visible').within(() => {
            cy.contains('Settings').click()
        })
        cy.url().should('include', '/settings')
        // Navigate to Translate
        cy.get('[data-testid="mobile-nav-toggle"]').click()
        cy.get('[data-testid="mobile-nav-content"]').should('be.visible').within(() => {
            cy.contains('Translate').click()
        })
        cy.url().should('include', '/')
    })
    it('should show correct breadcrumbs in MainNav', function() {
        cy.viewport(1024, 768)
        cy.contains('deck_example').click()
        cy.get('[data-testid="learn-link"]').then(($link) => {
            if ($link.length > 0) {
                cy.wrap($link).click(); 
                cy.url().should('include', '/learn-decks/');
            }
        })
        cy.get('[data-testid="main-nav"]').within(() => {
            cy.contains('Your decks').should('be.visible')
            cy.contains('Deck Details').should('be.visible')
            cy.contains('Deck Learning').should('be.visible')
        })
    })
    it('should navigate correctly in MainNav', function() {
        cy.viewport(1024, 768)
        cy.contains('deck_example').click()
        cy.get('[data-testid="learn-link"]').then(($link) => {
            if ($link.length > 0) {
                cy.wrap($link).click(); 
                cy.url().should('include', '/learn-decks/');
            }
        })
        cy.contains('Deck Learning').click()
        cy.url().should('include', '/learn-decks/');
        cy.contains('Deck Details').click()
        cy.url().should('include', '/view-decks/');
        cy.contains('Translate').click()
        cy.url().should('include', '/');
    })
})