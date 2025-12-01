describe('Index page', () => {
  beforeEach(function() {
    cy.visit('https://padwhen-learningapp.fly.dev')
  })
  it('front page can be opened', function() {
    cy.contains("Translate")
    cy.contains("Finnish")
  })
})

describe('log in', () => {
  beforeEach(function() {
    cy.visit('https://padwhen-learningapp.fly.dev')
  })
  it('should display username not found for incorrect username', () => {
    cy.contains('Log In').click()
    cy.get('#username').type('nottestuser');
    cy.get('[data-testid="pin-input"]') 
    .find('input')
    .each(($el) => {
      cy.wrap($el).type('{selectall}') .type('1234') 
    });
    cy.contains('Login').click()
    cy.contains('Error').should('be.visible');
    cy.contains('Username not found. Please try again').should('be.visible');
  })
  it('should display error for incorrect password', () => {
    cy.contains('Log In').click()
    cy.get('#username').type('0000');
    cy.get('[data-testid="pin-input"]') 
    .find('input')
    .each(($el) => {
      cy.wrap($el).type('{selectall}') .type('1234') 
    });
    cy.contains('Login').click()
    cy.contains('Error').should('be.visible');
    cy.contains('Password incorrect. Please try again').should('be.visible');
  })
  it('should display error for missing fields', () => {
    cy.contains('Log In').click();
    cy.contains('Login').click();
    cy.contains('Error').should('be.visible');
    cy.contains('Username is required').should('be.visible');
    cy.contains('PIN is required').should('be.visible');
  });
  it('front page can be logged in', function() {
    cy.contains('Log In').click()
    cy.get('#username').type('1111')
    cy.get('[data-testid="pin-input"]') 
    .find('input')
    .each(($el) => {
      cy.wrap($el).type('{selectall}') .type('1111') 
    });
    cy.contains('Login').click();
    cy.url().should('include', '/');
    cy.contains('Log Out').should('exist');
  })
  it('can logged out after logged in', function() {
    cy.contains('Log In').click()
    cy.get('#username').type('1111')
    cy.get('[data-testid="pin-input"]') 
    .find('input')
    .each(($el) => {
      cy.wrap($el).type('{selectall}') .type('1111') 
    });
    cy.contains('Login').click();
    cy.url().should('include', '/');
    cy.contains('Log Out').click();
    cy.contains('Log In').should('exist');
  })
})

describe('register', () => {
  beforeEach(function() {
    cy.visit('https://padwhen-learningapp.fly.dev')
  })
  it('can see the register button', function() {
    cy.contains('Register').click()
  })
  it('should register successfully with valid inputs', function() {
    cy.contains('Register').click()

  })

})