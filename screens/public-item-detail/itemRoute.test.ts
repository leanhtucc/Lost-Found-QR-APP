import {
  getOwnerItemTarget,
  getPublicItemStatusMessage,
  isValidGuestPhoneNumber,
} from './guestIntake';

describe('guest intake helpers', () => {
  it('accepts local and international phone numbers in the backend length range', () => {
    expect(isValidGuestPhoneNumber('090 123 4567')).toBe(true);
    expect(isValidGuestPhoneNumber('+84901234567')).toBe(true);
    expect(isValidGuestPhoneNumber('123')).toBe(false);
  });

  it('redirects an owned item with its internal id', () => {
    expect(getOwnerItemTarget({ id: 'item-internal-1' })).toEqual({
      name: 'ItemDetails',
      params: { itemId: 'item-internal-1' },
    });
  });

  it('does not create an owner route when private owner data is unavailable', () => {
    expect(getOwnerItemTarget(null)).toBeNull();
  });

  it('explains already claimed and terminal item states', () => {
    expect(getPublicItemStatusMessage('CLAIMED')).toContain('đang được xử lý');
    expect(getPublicItemStatusMessage('RESOLVED')).toContain('hoàn tất');
    expect(getPublicItemStatusMessage('SAFE')).toContain('an toàn');
  });
});
