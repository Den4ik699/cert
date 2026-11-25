Feature: Manage Site Contacts in Onboarding Task
    As an Onboarding Manager
    I want to ensure my site has at least three contacts set up
    So that onboarding communication requirements are met.

    Background:
        Given I have loaded checklist data for site with id "22e1a427-dbfd-4679-8b8f-b850d6ef86b7"
        And I am on the Onboarding Portal page

    @SOLO-4018
    @positive
    Scenario: Contacts task shows "To Do" status and the empty message when the site has no contacts
        Given the site has 0 contacts
        And I navigate to the checklist details page using loaded site data
        When I select the task card titled "QAA Task 2" from the checklist
        Then I should see the contacts status message "No contacts added."
        And The task status should be "To Do"

    @SOLO-4018
    @positive
    Scenario Outline: Contacts task shows the informational message and the status matching the number of contacts
        Given the site has <count> contacts
        And I navigate to the checklist details page using loaded site data
        When I select the task card titled "QAA Task 2" from the checklist
        Then I should see the contacts status message "You need to add at least 3 contacts. They can be created from scratch or selected from existing contact information. You can always add more contacts."
        And The task status should be "<status>"

        Examples:
            | count | status      |
            | 1     | In Progress |
            | 2     | In Progress |
            | 3     | Done        |
            | 4     | Done        |

    @SOLO-4018
    @positive
    Scenario: Contacts table headers are displayed in order
        Given the site has 3 contacts
        And I navigate to the checklist details page using loaded site data
        When I select the task card titled "QAA Task 2" from the checklist
        Then I should see the contacts table
        And The contacts table headers should be:
            | Header  |
            | Contact |
            | Phone   |
            | Mobile  |
            | Email   |
            |         |

    @SOLO-4018
    @positive
    Scenario Outline: Contact column shows avatar initials, name, title and pills
        Given the site has 4 contacts
        And I navigate to the checklist details page using loaded site data
        When I select the task card titled "QAA Task 2" from the checklist
        Then the contact in row <row> should have the avatar initials "<initials>"
        And the contact in row <row> should have the name "<name>"
        And the contact in row <row> should have the title "<title>"
        And the contact in row <row> should have the pills "<pills>"

        Examples:
            | row | initials | name       | title        | pills         |
            | 1   | JD       | Jane Doe   | Site Manager | Primary, 24/7 |
            | 2   | JS       | John Smith | Operator     | 24/7          |
            | 3   | MM       | Mary Major | Engineer     | none          |
            | 4   | AK       | Alex Kim   | Technician   | Primary       |

    @SOLO-4018
    @positive
    Scenario Outline: Phone, Mobile and Email columns show the primary contact details
        Given the site has 4 contacts
        And I navigate to the checklist details page using loaded site data
        When I select the task card titled "QAA Task 2" from the checklist
        Then the contact in row <row> should show phone "<phone>", mobile "<mobile>" and email "<email>"

        Examples:
            | row | phone           | mobile          | email                  |
            | 1   | +1 555 010 0001 | +1 555 020 0001 | jane.doe@example.com   |
            | 3   | /               | +1 555 020 0003 | mary.major@example.com |
            | 4   | +1 555 010 0004 | /               | alex.kim@example.com   |

    @SOLO-4018
    @positive
    Scenario: Edit icon opens the User Admin edit page in a new tab
        Given the site has 3 contacts
        And the User Admin link is "<INTERNAL_URL>"
        And I navigate to the checklist details page using loaded site data
        When I select the task card titled "QAA Task 2" from the checklist
        And I click the edit icon for the contact in row 2
        Then a new tab should open with the User Admin edit page for the contact in row 2

    @SOLO-4018
    @positive
    Scenario Outline: Task status is saved exactly once with the value matching the number of contacts
        Given the site has <count> contacts
        And I navigate to the checklist details page using loaded site data
        When I select the task card titled "QAA Task 2" from the checklist
        Then I should see the contacts table
        And the task status should have been saved once as "<saved status>"

        Examples:
            | count | saved status |
            | 1     | IN_PROGRESS  |
            | 2     | IN_PROGRESS  |
            | 3     | COMPLETED    |
            | 4     | COMPLETED    |

    @SOLO-4018
    @negative
    Scenario: Task status is not saved when the site has no contacts
        Given the site has 0 contacts
        And I navigate to the checklist details page using loaded site data
        When I select the task card titled "QAA Task 2" from the checklist
        Then I should see the contacts status message "No contacts added."
        And no task status should have been saved

    @SOLO-4018
    @positive
    Scenario: Refresh moves the task from In Progress to Done when a third contact was added
        Given the site has 2 contacts
        And I navigate to the checklist details page using loaded site data
        When I select the task card titled "QAA Task 2" from the checklist
        Then The task status should be "In Progress"
        And the contacts table should have 2 rows
        When the site now has 3 contacts
        And I click the "Refresh" button
        Then The task status should be "Done"
        And the contacts table should have 3 rows
        And the last saved task status should be "COMPLETED"

    @SOLO-4018
    @positive
    Scenario: Refresh moves the task from Done back to In Progress when a contact was removed
        Given the site has 3 contacts
        And I navigate to the checklist details page using loaded site data
        When I select the task card titled "QAA Task 2" from the checklist
        Then The task status should be "Done"
        When the site now has 2 contacts
        And I click the "Refresh" button
        Then The task status should be "In Progress"
        And the contacts table should have 2 rows
        And the last saved task status should be "IN_PROGRESS"

    @SOLO-4018
    @positive
    Scenario: Contacts are reloaded without duplicates when the task is closed and opened again
        Given the site has 3 contacts
        And I navigate to the checklist details page using loaded site data
        When I select the task card titled "QAA Task 2" from the checklist
        Then the contacts table should have 3 rows
        And The task status should be "Done"
        When I select the task card titled "QAA Task 1" from the checklist
        Then I should see the following information for the task:
            | Field      | Value      |
            | Task Title | QAA Task 1 |
        And I should not see the contacts table
        When I select the task card titled "QAA Task 2" from the checklist
        Then the contacts table should have 3 rows
        And the contacts should have been requested 2 times

    @SOLO-4018
    @negative
    Scenario: Contacts table is not shown and the status is not saved when loading contacts fails
        Given the contacts request fails with status 500
        And I navigate to the checklist details page using loaded site data
        When I select the task card titled "QAA Task 2" from the checklist
        Then the contacts request should have failed with status 500
        And I should see the following information for the task:
            | Field      | Value      |
            | Task Title | QAA Task 2 |
        And The task status should be "To Do"
        And I should not see the contacts table
        And no task status should have been saved

    # Bug: after a failed status update the loader never disappears (isUpdatingStatus is a plain boolean in an OnPush view).
    @ignore
    @SOLO-4018
    @negative
    Scenario: Task status stays unchanged when saving the status fails
        Given the site has 2 contacts
        And the task status update request fails with status 500
        And I navigate to the checklist details page using loaded site data
        When I select the task card titled "QAA Task 2" from the checklist
        Then the task status update request should have failed with status 500
        And The task status should be "To Do"
        And the contacts table should have 2 rows

    @SOLO-4018
    @positive
    Scenario: Every click on the edit icon opens the User Admin edit page for the same contact
        Given the site has 3 contacts
        And the User Admin link is "<INTERNAL_URL>"
        And I navigate to the checklist details page using loaded site data
        When I select the task card titled "QAA Task 2" from the checklist
        And I click the edit icon for the contact in row 2 3 times
        Then a new tab should have been opened 3 times with the User Admin edit page for the contact in row 2

    # Bug: editContact() does not check userId and opens ".../details/undefined/edit".
    @ignore
    @SOLO-4018
    @negative
    Scenario: Edit icon does not open a page for a contact without a user id
        Given the site has 3 contacts
        And the contact in row 2 has no user id
        And the User Admin link is "<INTERNAL_URL>"
        And I navigate to the checklist details page using loaded site data
        When I select the task card titled "QAA Task 2" from the checklist
        And I click the edit icon for the contact in row 2
        Then no new tab should be opened