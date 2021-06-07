import { render, screen, waitFor } from '@testing-library/react';
import { Generator } from './Generator';

const fakeUsers = [{
  "id": 1,
  "name": "Test User 1",
  "username": "testuser1",
}, {
  "id": 2,
  "name": "Test User 2",
  "username": "testuser2",
}];

describe('Generator component', () => {
  test('it renders', () => {
    render(<Generator />);
    expect(screen.getByText('The Brodal')).toBeInTheDocument();
  });
});