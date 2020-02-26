/// <reference types="Cypress" />

describe('Test Tables component', function() {
  it('clicking "tables" navigates to a new url', function() {
    const network = Cypress.env('NETWORK') || 'localhost'
    cy.visit(`http://${network}:5000`)
    cy.contains('Tables').click()

    // Should be on a new URL which includes '/tables'
    cy.url().should('include', '/tables')
  })
})
