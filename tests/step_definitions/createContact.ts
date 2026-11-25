import { DataTable, Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import ContactTask from '../../e2e/common/components/taskView/contactTask';
import TaskDetails from '../../e2e/common/components/taskView/taskDetails';

const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();

const rowIndex = (row: number) => row - 1;

const mockContacts = (contacts: any[]) => {
  cy.wrap(contacts).as('siteContacts');

  cy.intercept('GET', '**/sites/*/contacts', { code: 200, data: contacts, message: 'OK' }).as('getSiteContacts');
};

const loadContacts = (count: number) =>
  cy.fixture('site-contacts.json').then(contactsJson => structuredClone(contactsJson.data).slice(0, count));

// The contact task starts as NOT_STARTED, so every status shown is the result of the UI update.
// Must be registered before navigating to the checklist details page.
const mockContactChecklist = () => {
  cy.fixture('checklists.json').then(checklistsJson => {
    cy.get('@currentChecklist').then((currentChecklist: any) => {
      const checklist = structuredClone(currentChecklist);
      const contactTask = checklist.tasks.find((task: any) => task.task_type === 'CONTACT');

      contactTask.status = 'NOT_STARTED';

      cy.intercept('GET', `**/checklists/${checklist.id}?include_tasks=true`, req => {
        req.reply({ body: { code: checklistsJson.code, data: checklist, message: checklistsJson.message } });
      }).as('getContactChecklist');

      // The task status is persisted by the UI according to the number of contacts
      cy.intercept('PUT', '**/tasks/*', req => {
        contactTask.status = req.body.status;
        req.reply({ body: { code: 200, data: req.body, message: 'OK' }, statusCode: 200 });
      }).as('updateContactTask');
    });
  });
};

Given('the site has {int} contacts', (count: number) => {
  loadContacts(count).then(mockContacts);
  mockContactChecklist();
});

Given('the User Admin link is {string}', (link: string) => {
  cy.wrap(link).as('userAdminLink');

  cy.intercept('GET', '**/links/user-admin', { code: 200, data: link, message: 'OK' }).as('getUserAdminLink');
});

Then('I should see the contacts status message {string}', (message: string) => {
  ContactTask.statusMessage.should('be.visible').and($el => {
    expect(normalize($el.text())).to.equal(normalize(message));
  });
});

Then('The task status should be {string}', (status: string) => {
  TaskDetails.taskDetailsStatus.should('contain.text', status);
});

Then('I should see the contacts table', () => {
  ContactTask.table.should('be.visible');
});

Then('The contacts table headers should be:', (dataTable: DataTable) => {
  const expectedHeaders = dataTable
    .raw()
    .slice(1)
    .map(([header]) => header.trim());

  ContactTask.headers.should($headers => {
    const actualHeaders = $headers.toArray().map(header => normalize(header.textContent ?? ''));

    expect(actualHeaders).to.deep.equal(expectedHeaders);
  });
});

Then('the contact in row {int} should have the avatar initials {string}', (row: number, initials: string) => {
  ContactTask.avatars.eq(rowIndex(row)).should($el => {
    expect(normalize($el.text())).to.equal(initials);
  });
});

Then('the contact in row {int} should have the name {string}', (row: number, name: string) => {
  ContactTask.names.eq(rowIndex(row)).should($el => {
    expect(normalize($el.text())).to.equal(name);
  });
});

Then('the contact in row {int} should have the title {string}', (row: number, title: string) => {
  ContactTask.titles.eq(rowIndex(row)).should($el => {
    expect(normalize($el.text())).to.equal(title);
  });
});

Then('the contact in row {int} should have the pills {string}', (row: number, pills: string) => {
  const expectedPills = pills === 'none' ? [] : pills.split(',').map(pill => pill.trim());

  ContactTask.contactCells.eq(rowIndex(row)).should('be.visible');

  ContactTask.pillsInRow(rowIndex(row)).should($pills => {
    const actualPills = $pills.toArray().map(pill => normalize(pill.textContent ?? ''));

    expect(actualPills).to.deep.equal(expectedPills);
  });
});

Then(
  'the contact in row {int} should show phone {string}, mobile {string} and email {string}',
  (row: number, phone: string, mobile: string, email: string) => {
    ContactTask.phones.eq(rowIndex(row)).should($el => {
      expect(normalize($el.text())).to.equal(phone);
    });
    ContactTask.mobiles.eq(rowIndex(row)).should($el => {
      expect(normalize($el.text())).to.equal(mobile);
    });
    ContactTask.emails.eq(rowIndex(row)).should($el => {
      expect(normalize($el.text())).to.equal(email);
    });
  },
);

Given('the contacts request fails with status {int}', (statusCode: number) => {
  cy.intercept('GET', '**/sites/*/contacts', { body: { message: 'Contacts error' }, statusCode }).as('getSiteContacts');
  mockContactChecklist();
});

Given('the task status update request fails with status {int}', (statusCode: number) => {
  cy.intercept('PUT', '**/tasks/*', { body: { message: 'Update error' }, statusCode }).as('updateContactTask');
});

Given('the contact in row {int} has no user id', (row: number) => {
  cy.get('@siteContacts').then((contacts: any) => {
    const updatedContacts = structuredClone(contacts);

    delete updatedContacts[rowIndex(row)].userId;

    mockContacts(updatedContacts);
  });
});

When('the site now has {int} contacts', (count: number) => {
  loadContacts(count).then(mockContacts);
});

Then('the contacts request should have failed with status {int}', (statusCode: number) => {
  cy.wait('@getSiteContacts').its('response.statusCode').should('eq', statusCode);
});

Then('the task status update request should have failed with status {int}', (statusCode: number) => {
  cy.wait('@updateContactTask').its('response.statusCode').should('eq', statusCode);
});

Then('I should not see the contacts table', () => {
  ContactTask.table.should('not.exist');
});

Then('the contacts table should have {int} rows', (count: number) => {
  ContactTask.contactCells.should('have.length', count);
});

Then('the contacts should have been requested {int} times', (count: number) => {
  cy.get('@getSiteContacts.all').should('have.length', count);
});

Then('the task status should have been saved once as {string}', (status: string) => {
  cy.get('@updateContactTask.all').should(calls => {
    expect(calls).to.have.length(1);
    expect(calls[0].request.body.status).to.equal(status);
  });
});

Then('the last saved task status should be {string}', (status: string) => {
  cy.get('@updateContactTask.all').should(calls => {
    expect(calls[calls.length - 1].request.body.status).to.equal(status);
  });
});

Then('no task status should have been saved', () => {
  cy.get('@updateContactTask.all').should('have.length', 0);
});

When('I click the edit icon for the contact in row {int} {int} times', (row: number, times: number) => {
  cy.window().then(win => {
    cy.stub(win, 'open').as('windowOpen');
  });

  Cypress._.times(times, () => {
    ContactTask.editButtons.eq(rowIndex(row)).click();
  });
});

Then(
  'a new tab should have been opened {int} times with the User Admin edit page for the contact in row {int}',
  (times: number, row: number) => {
    cy.get('@userAdminLink').then(link => {
      cy.get('@siteContacts').then((contacts: any) => {
        const url = `${link}/details/${contacts[rowIndex(row)].userId}/edit`;

        cy.get('@windowOpen').should('have.callCount', times);
        cy.get('@windowOpen').should('always.have.been.calledWithExactly', url, '_blank');
      });
    });
  },
);

Then('no new tab should be opened', () => {
  cy.get('@windowOpen').should('not.have.been.called');
});

When('I click the edit icon for the contact in row {int}', (row: number) => {
  cy.window().then(win => {
    cy.stub(win, 'open').as('windowOpen');
  });

  ContactTask.editButtons.eq(rowIndex(row)).click();
});

Then('a new tab should open with the User Admin edit page for the contact in row {int}', (row: number) => {
  cy.get('@userAdminLink').then(link => {
    cy.get('@siteContacts').then((contacts: any) => {
      const { userId } = contacts[rowIndex(row)];

      cy.get('@windowOpen').should('be.calledWith', `${link}/details/${userId}/edit`, '_blank');
    });
  });
});
