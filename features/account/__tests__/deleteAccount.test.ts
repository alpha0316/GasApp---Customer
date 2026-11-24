import { deletionMessage } from '../deleteAccount';

// Hoisted above the import by jest.
jest.mock('../api', () => ({ sendContactMessage: jest.fn() }));

const user = {
  id: 'u1',
  role: 'customer' as const,
  firstName: 'Ama',
  lastName: 'Owusu',
  phoneNumber: '0241234567',
  email: 'ama@example.com',
  createdAt: '',
  updatedAt: '',
};

describe('deletionMessage', () => {
  it('leads with the request and reason, then who to follow up with', () => {
    const lines = deletionMessage(user, 'Deliveries took too long', '  Waited 2 hours  ').split('\n');
    expect(lines.slice(0, 3)).toEqual(['ACCOUNT DELETION REQUEST', 'Reason: Deliveries took too long', 'Details: Waited 2 hours']);
    expect(lines).toContain('User ID: u1');
    expect(lines).toContain('Phone: 0241234567');
    expect(lines).toContain('Email: ama@example.com');
  });

  it('leaves out empty details', () => {
    expect(deletionMessage(user, 'Other', '   ')).not.toContain('Details:');
  });
});
