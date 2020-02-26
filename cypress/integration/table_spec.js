/// <reference types="Cypress" />

describe('Test Table component', function() {
  it('clicking "tables" and then on a table navigates to a new url', function() {
    const network = Cypress.env('NETWORK') || 'localhost'
    cy.visit(`http://${network}:5000`)
    cy.contains('Tables').click()
    // technically invisible so must be forced
    cy.contains('public.users').click({ force: true })

    // Should be on a new URL which includes '/tables'
    cy.url().should('include', '/tables/public.users')
  })

  it('loads the example columns and metadata for a table', function(){
    const network = Cypress.env('NETWORK') || 'localhost'
    cy.visit(`http://${network}:5000/tables/public.users`)
    cy.get('.columns').its('length').should('eq', 3)

    // column data type
    cy.get('.columns').first().contains('int')

    // column tags
    cy.get('.columns').first().contains('first tag')
    cy.get('.columns').first().contains('second tag')

    // column description
    cy.get('.columns').first().contains('No description yet')
    cy.get('.columns').last().contains('impolite to ask')
  })

  it('can update the table description', function(){
    const network = Cypress.env('NETWORK') || 'localhost'

    cy.visit(`http://${network}:5000/tables/public.users`)

    // no description on load
    cy.get('.description-table-users').contains("No description yet")
  })

  it('can update a column description', function(){
    const network = Cypress.env('NETWORK') || 'localhost'

    cy.visit(`http://${network}:5000/tables/public.users`)

    // no description on load
    cy.get('.description-column-id').find('.description-edit').click()

    // input a new description
    cy.get('textarea').type("hello world")
    cy.get('.columns').first().find('button').click()

    // the new description appears
    cy.get('.columns').first().contains('hello world')
    cy.reload() // refresh the page

    // its been persisted
    cy.get('.columns').first().contains('hello world')

    // undo all of that so subsequent runs will work without
    // reloading the server
    cy.get('.description-column-id').find('.description-edit').click()
    cy.get('textarea').clear()
    cy.get('.columns').first().find('button').click()
  })

  it('can add and delete tags', function(){
    const network = Cypress.env('NETWORK') || 'localhost'
    cy.visit(`http://${network}:5000/tables/public.users`)

    // there are initially two tags
    cy.get('.columns').first().find('.tag').its('length').should('eq', 2)

    // clicking edit opens an input to add another tag
    cy.get('.columns').first().find('.tags > span > ion-icon').click()
    cy.get('.columns').first().find('input').type("ooh a tag!")
    cy.get('.columns').first().find('button').click()

    // now there are three tags
    cy.get('.columns').first().find('.tag').its('length').should('eq', 3)
    cy.get('.columns').first().find('.tag').last().contains("ooh")

    // delete that last tag
    cy.get('.columns').first().find('.tag').last().find('a').click()

    // and now there are two again
    cy.get('.columns').first().find('.tag').its('length').should('eq', 2)
  })
})
