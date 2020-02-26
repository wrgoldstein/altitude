/// <reference types="Cypress" />

describe('Test Tables component', function() {
  it('clicking "type" navigates to a new url', function() {
    cy.debug()
    cy.visit(`http://${Cypress.env('NETWORK')}:5000`)

    cy.contains('Tables').click()

    // // Should be on a new URL which includes '/commands/actions'
    cy.url().should('include', '/tables')
  })
})
