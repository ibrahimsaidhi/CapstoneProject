import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import mockAxios from 'jest-mock-axios';
import Home from './Home';

// Mock modules
jest.mock('axios', () => mockAxios);
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('Home Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it('redirect to login if no token is present', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockAxios.post).not.toHaveBeenCalled();
      
    });
  });

  // Add more tests here later
});