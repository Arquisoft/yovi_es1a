import { describe, it, expect, vi, beforeEach } from 'vitest';
import Match from '../models/match-model';
import { saveMatch, getMatchHistory } from './match-service';
vi.mock('../models/match-model');
const VALID_ID = '699f08aefc032d17cf370682';
describe('Match service - Save Match',()=> {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('1.It should save a game successfully with all the correct data.', async () => {
      const mockInput = { userId: VALID_ID, result: 'win', duration: 150, boardSize: 9 };
      const mockSavedMatch = { _id: 'match1', ...mockInput };
      
      Match.prototype.save = vi.fn().mockResolvedValue(mockSavedMatch);

      const result = await saveMatch(mockInput);

      expect(result).toEqual(mockSavedMatch);
      expect(Match.prototype.save).toHaveBeenCalledTimes(1);
    });
    it('2.It should assign a default boardSize of 7 if no sends board size.', async () => {
      const mockInput = { userId: VALID_ID, result: 'lose', duration: 100 };
      Match.prototype.save = vi.fn().mockResolvedValue({ _id: 'match2', ...mockInput, boardSize: 7 });

      await saveMatch(mockInput);
      expect(Match).toHaveBeenCalledWith(expect.objectContaining({ boardSize: 7 }));
    });
    it('3.It should throw an error if basic types (userId, result, duration) are missing', async () => {
      const invalidInput: any = { userId: 123, result: 'win', duration: '9' };
      
      await expect(saveMatch(invalidInput)).rejects.toThrow('Invalid input format');
    });
    it('4.It shoul throw an erroe if boardsize isnt a number', async () => {
      const invalidInput: any = { userId: VALID_ID, result: 'win', duration: 100, boardSize: 'very big' };
      
      await expect(saveMatch(invalidInput)).rejects.toThrow('Invalid input format for boardSize');
    });
    it('5.It should throw an error if the result is not win, lose, or surrender.', async () => {
      const invalidInput = { userId: VALID_ID, result: 'the best', duration: 100 };
      
      await expect(saveMatch(invalidInput)).rejects.toThrow('Invalid match result');
    });
    it('6.It should throw an error if duration is negative', async () => {
      const invalidInput = { userId: VALID_ID, result: 'surrender', duration: -5 };
      
      await expect(saveMatch(invalidInput)).rejects.toThrow('Duration cannot be negative');
    });
    it('7. It should save opponent, totalMoves and gameMode correctly', async () => {
        const mockInput = { 
            userId: VALID_ID, 
            result: 'win', 
            duration: 150, 
            boardSize: 9,
            opponent: 'SuperBot',
            totalMoves: 42,
            gameMode: 'computer'
        };
        
        const mockSavedMatch = { _id: 'matchNew', ...mockInput };
        Match.prototype.save = vi.fn().mockResolvedValue(mockSavedMatch);

        const result = await saveMatch(mockInput);

        expect(result).toEqual(mockSavedMatch);
        expect(Match).toHaveBeenCalledWith(expect.objectContaining({
            opponent: 'SuperBot',
            totalMoves: 42,
            gameMode: 'computer'
        }));
    });

    it('8. It should use default values for opponent ("Generic bot") and gameMode ("computer") if missing', async () => {
        const mockInput = { userId: VALID_ID, result: 'lose', duration: 100 };        
        Match.prototype.save = vi.fn().mockResolvedValue({ 
            _id: 'matchDef', 
            ...mockInput, 
            opponent: 'Generic bot',
            gameMode: 'computer',
            totalMoves: 0 
        });

        await saveMatch(mockInput);
        expect(Match).toHaveBeenCalledWith(expect.objectContaining({
            opponent: 'Generic bot',
            gameMode: 'computer',
            totalMoves: 0
        }));
    });

    it('9. It should throw an error if totalMoves is negative', async () => {
        const invalidInput = { userId: VALID_ID, result: 'win', duration: 10, totalMoves: -10 };
        
        await expect(saveMatch(invalidInput)).rejects.toThrow('Total moves cannot be negative');
    });
    it('10. It should throw an error if the userId string is not a valid ObjectId format', async () => {
        const invalidInput = { userId: 'id-invalido-que-no-es-hexadecimal', result: 'win', duration: 100 };
        
        await expect(saveMatch(invalidInput)).rejects.toThrow('Invalid User ID format');
    });
}) 
describe('Match service - Get Match History', () => {
    it('1.It should retrieve the paginated history correctly.', async () => {
      const fakeHistory = [{ _id: '1', result: 'win', duration: 100 }];
      
      const queryBuilderMock: any = {
        where: vi.fn().mockReturnThis(),
        equals: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        clone: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        countDocuments: vi.fn().mockResolvedValue(1),
        exec: vi.fn().mockResolvedValue(fakeHistory)  
      };
      (Match.find as any) = vi.fn().mockReturnValue(queryBuilderMock);

      const result = await getMatchHistory(VALID_ID);
      
      expect(result.content).toEqual(fakeHistory);
      expect(Match.find).toHaveBeenCalled();
      expect(queryBuilderMock.where).toHaveBeenCalledWith('user');
      expect(queryBuilderMock.clone).toHaveBeenCalled();
      expect(queryBuilderMock.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(queryBuilderMock.skip).toHaveBeenCalledWith(0);
      expect(queryBuilderMock.limit).toHaveBeenCalledWith(5);
      expect(queryBuilderMock.exec).toHaveBeenCalled();
    });

    it('2. It should throw an error if the userId is not a string', async () => {
        await expect(getMatchHistory(12345 as any)).rejects.toThrow('Invalid input format');
    });
});