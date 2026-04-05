// @vitest-environment jsdom
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { UserUtils } from './user.utils';

describe('UserUtils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getCurrentUser', () => {
    test('devuelve el objeto parseado si existe en localStorage', () => {
      const fakeUser = { id: '123', username: 'Tester' };
      localStorage.setItem('user', JSON.stringify(fakeUser));
      expect(UserUtils.getCurrentUser()).toEqual(fakeUser);
    });

    test('devuelve null si no hay usuario en localStorage', () => {
      expect(UserUtils.getCurrentUser()).toBeNull();
    });
  });

  describe('getUserId', () => {
    test('encuentra el userId en diferentes formatos (userId, _id, id)', () => {
      localStorage.setItem('user', JSON.stringify({ userId: 'A' }));
      expect(UserUtils.getUserId()).toBe('A');

      localStorage.setItem('user', JSON.stringify({ _id: 'B' }));
      expect(UserUtils.getUserId()).toBe('B');

      localStorage.setItem('user', JSON.stringify({ id: 'C' }));
      expect(UserUtils.getUserId()).toBe('C');
    });

    test('devuelve null si no encuentra identificador válido o no hay usuario', () => {
      localStorage.setItem('user', JSON.stringify({ username: 'NoIdUser' }));
      expect(UserUtils.getUserId()).toBeNull();

      localStorage.clear();
      expect(UserUtils.getUserId()).toBeNull();
    });
  });

  describe('getUsername', () => {
    test('devuelve el username real si existe', () => {
      localStorage.setItem('user', JSON.stringify({ username: 'SuperPlayer' }));
      expect(UserUtils.getUsername()).toBe('SuperPlayer');
    });

    test('devuelve Invitado si no hay usuario', () => {
      expect(UserUtils.getUsername()).toBe('Invitado');
    });
  });
});