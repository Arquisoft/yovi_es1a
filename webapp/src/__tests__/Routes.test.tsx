import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { UnloginRoute, GameAccessRoute } from '../components/Routes';
import '@testing-library/jest-dom/vitest';

describe('Routes', () => {
  
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe('UnloginRoute', () => {
    test('redirects to /login if there is no user in localStorage', () => {
      render(
        <MemoryRouter initialEntries={['/private']}>
          <Routes>
            <Route element={<UnloginRoute />}>
              <Route path="/private" element={<div>Private Content</div>} />
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Private Content')).not.toBeInTheDocument();
    });

    test('redirects to /login if the user is the string "null" or "undefined"', () => {
      sessionStorage.setItem('user', 'null');

      render(
        <MemoryRouter initialEntries={['/private']}>
          <Routes>
            <Route element={<UnloginRoute />}>
              <Route path="/private" element={<div>Private Content</div>} />
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    test('allows access if there is a real user in localStorage', () => {
      sessionStorage.setItem('user', JSON.stringify({ username: 'testuser' }));

      render(
        <MemoryRouter initialEntries={['/private']}>
          <Routes>
            <Route element={<UnloginRoute />}>
              <Route path="/private" element={<div>Private Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Private Content')).toBeInTheDocument();
    });
  });

  describe('GameAccessRoute', () => {
    test('Step 1: redirects to /login if there is no user', () => {
      render(
        <MemoryRouter initialEntries={['/game']}>
          <Routes>
            <Route element={<GameAccessRoute />}>
              <Route path="/game" element={<div>Game Screen</div>} />
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/configureGame" element={<div>Configuration Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Configuration Page')).not.toBeInTheDocument();
    });

    test('Step 2: redirects to /configureGame if logged in BUT has no configuration', () => {
      sessionStorage.setItem('user', JSON.stringify({ username: 'testuser' }));

      render(
        <MemoryRouter initialEntries={['/game']}>
          <Routes>
            <Route element={<GameAccessRoute />}>
              <Route path="/game" element={<div>Game Screen</div>} />
            </Route>
            <Route path="/configureGame" element={<div>Configuration Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Configuration Page')).toBeInTheDocument();
      expect(screen.queryByText('Game Screen')).not.toBeInTheDocument();
    });

    test('Step 3: allows access to the game if LOGGED IN and HAS configuration', () => {
      sessionStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
      
      const routeState = { tamanoSeleccionado: 5 };

      render(
        <MemoryRouter initialEntries={[{ pathname: '/game', state: routeState }]}>
          <Routes>
            <Route element={<GameAccessRoute />}>
              <Route path="/game" element={<div>Game Screen</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Game Screen')).toBeInTheDocument();
    });
  });
});