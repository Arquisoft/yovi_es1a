import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import Clan from '../models/clan-model';
import User from '../models/user-model';
import { ClanService } from './clan-service';

vi.mock('../models/user-model');
vi.mock('../models/clan-model');

const VALID_ID_1 = new Types.ObjectId();
const VALID_ID_2 = new Types.ObjectId();

describe('ClanService - createClan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. It should create a clan if all users exist', async () => {
    vi.mocked(User.find).mockResolvedValue([
      { _id: VALID_ID_1, username: 'User1' },
      { _id: VALID_ID_2, username: 'User2' },
    ] as any);
    const mockSave = vi.fn().mockResolvedValue({ name: 'TestClan', members: [VALID_ID_1, VALID_ID_2] });//mockSave

    vi.spyOn(Clan.prototype, 'save').mockImplementation(mockSave);//Reemplaza el save por el mockSave

    const result = await ClanService.createClan('TestClan', [VALID_ID_1, VALID_ID_2]);

    expect(result.name).toBe('TestClan');
    expect(result.members).toEqual([VALID_ID_1, VALID_ID_2]);
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('2. It should throw an error if some users do not exist', async () => {
    vi.mocked(User.find).mockResolvedValue([
      { _id: VALID_ID_1, username: 'User1' },
    ] as any);
    await expect(ClanService.createClan('TestClan', [VALID_ID_1, VALID_ID_2]))
      .rejects
      .toThrow('Algunos usuarios no existen');
  });
});

describe('ClanService - addMemberToClan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. It should add a new member if not already in the clan', async () => {
    const clanMock = { members: [], save: vi.fn().mockResolvedValue(true) };
    vi.mocked(Clan.findById).mockResolvedValue(clanMock as any);

    const userId = new Types.ObjectId();
    const result = await ClanService.addMemberToClan('clanId', userId);

    expect(result?.members).toContain(userId);
    expect(clanMock.save).toHaveBeenCalled();
  });

  it('2. It should not add a member if already in the clan', async () => {
    const userId = new Types.ObjectId();
    const clanMock = { members: [userId], save: vi.fn() };
    vi.mocked(Clan.findById).mockResolvedValue(clanMock as any);

    const result = await ClanService.addMemberToClan('clanId', userId);

    expect(result?.members).toEqual([userId]);
    expect(clanMock.save).not.toHaveBeenCalled();
  });

  it('3. It should throw an error if the clan does not exist', async () => {
    vi.mocked(Clan.findById).mockResolvedValue(null);

    await expect(ClanService.addMemberToClan('clanId', VALID_ID_1))
      .rejects
      .toThrow('Clan not found');
  });
});

describe('ClanService - getClanMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. It should return clan messages correctly', async () => {
    const messagesMock = [
      { username: 'User1', text: 'Hello', timestamp: new Date() },
      { username: 'User2', text: 'Hi', timestamp: new Date() }
    ];
    vi.mocked(Clan.findById).mockReturnValue({
    populate: vi.fn().mockResolvedValue({
        messages: messagesMock
    })
    } as any);

    const result = await ClanService.getClanMessages('clanId');

    expect(result.length).toBe(2);
    expect(result[0].username).toBe('User1');
    expect(result[0].text).toBe('Hello');
  });

  it('2. It should throw an error if the clan does not exist', async () => {
    vi.mocked(Clan.findById).mockReturnValue({
        populate: vi.fn().mockResolvedValue(null)
    } as any);

    await expect(ClanService.getClanMessages('clanId'))
      .rejects
      .toThrow('Clan no encontrado');
  });
});

describe('ClanService - sendMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. It should send a message correctly', async () => {
    const clanMock = { messages: [], save: vi.fn().mockResolvedValue(true) };
    vi.mocked(Clan.findById).mockResolvedValue(clanMock as any);

    const userId = new Types.ObjectId();
    const result = await ClanService.sendMessage('clanId', userId, 'User1', 'Hola');

    expect(result.length).toBe(1);
    expect(result[0].username).toBe('User1');
    expect(result[0].text).toBe('Hola');
    expect(clanMock.save).toHaveBeenCalled();
  });

  it('2. It should throw an error if the clan does not exist', async () => {
    vi.mocked(Clan.findById).mockResolvedValue(null as any);

    await expect(ClanService.sendMessage('clanId', VALID_ID_1, 'User1', 'Hola'))
      .rejects
      .toThrow('Clan no encontrado');
  });
});