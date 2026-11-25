import { BasePage } from '../../basePage';

class ContactTask extends BasePage {
  get statusMessage() {
    return this.getElementByTag('contactsStatusMessage');
  }

  get table() {
    return this.getElementByTag('contactsTable');
  }

  get headers() {
    return this.getElementByTag('contactsHeader');
  }

  get contactCells() {
    return this.getElementByTag('contactCell');
  }

  get avatars() {
    return this.getElementByTag('contactAvatar');
  }

  get names() {
    return this.getElementByTag('contactName');
  }

  get titles() {
    return this.getElementByTag('contactTitle');
  }

  pillsInRow(index: number) {
    return this.contactCells.eq(index).find('[data-automation="contactPill"]');
  }

  get phones() {
    return this.getElementByTag('contactPhone');
  }

  get mobiles() {
    return this.getElementByTag('contactMobile');
  }

  get emails() {
    return this.getElementByTag('contactEmail');
  }

  get editButtons() {
    return this.getElementByTag('contactEditButton');
  }
}

export default new ContactTask();
