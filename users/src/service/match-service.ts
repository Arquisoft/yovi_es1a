import Match, {IMatch} from '../models/match-model';
export interface SaveMatchInput
{
    userId:string;
    result:string;
    duration:number;
    boardSize?:number; //Optional default 7.
}
export async function saveMatch(matchData:SaveMatchInput):Promise<IMatch>
{
    const {userId,result,duration,boardSize} = matchData;

    if(typeof userId !== 'string' || typeof result !== 'string' || typeof duration !== 'number'){
        throw new Error('Invalid input format');
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
        boardSize:boardSize || 7
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