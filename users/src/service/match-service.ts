import Match, {IMatch} from '../models/match-model';
export interface SaveMatchInput
{
    userId:string;
    result:string;
    duration:number;
    boardSize?:number; //Optional default 7.
    opponent?: string;
    totalMoves?: number;
    gameMode?: string;
}
export async function saveMatch(matchData:SaveMatchInput):Promise<IMatch>
{
    const {userId,result,duration,boardSize,totalMoves,gameMode,opponent} = matchData;

    if(typeof userId !== 'string' || typeof result !== 'string' || typeof duration !== 'number'){
        throw new Error('Invalid input format');
    }
    
    if (totalMoves && totalMoves < 0) {
        throw new Error('Total moves cannot be negative');
    }
    if(boardSize!==undefined && typeof boardSize !=='number')
    {
        throw new Error('Invalid input format for boardSize');
    }

    const validresults = ['win','lose','surrender'];
    if(!validresults.includes(result))
    {
        throw new Error('Invalid match result');
    }

    if(duration<0)
    {
        throw new Error('Duration cannot be negative');
    }
    
    const newMatch = new Match({
        user:userId,
        result:result,
        duration:duration,
        boardSize:boardSize || 7,
        opponent: opponent || 'Generic bot', 
        totalMoves: totalMoves || 0,
        gameMode: gameMode || 'computer'
    });
    return await newMatch.save();
}
export async function getMatchHistory(userId:string): Promise<IMatch[]>{
    if(typeof userId !== 'string')
    {
        throw new Error('Invalid input format');
    }
    const safeUserId=userId.trim();
    // search matches and order it from most recent to oldest (-1)
    return await Match.find({ user: { $eq: safeUserId } }).sort({ createdAt: -1 }).populate('user','username');
}