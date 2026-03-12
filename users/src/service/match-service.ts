import Match, {IMatch} from '../models/match-model';
import mongoose from 'mongoose';

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
    
    let userObjectId;
    try {
        userObjectId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
        throw new Error('Invalid User ID format');
    }
    const newMatch = new Match({
        user:userObjectId,
        result:result,
        duration:duration,
        boardSize:boardSize || 7,
        opponent: opponent || 'Generic bot', 
        totalMoves: totalMoves || 0,
        gameMode: gameMode || 'computer'
    });
    return await newMatch.save();
}
/*export async function getMatchHistory(userId: string): Promise<IMatch[]> {
    if (typeof userId !== 'string') {
        throw new Error('Invalid input format');
    }
    const safeUserId = userId.trim();
    const userObjectId = new mongoose.Types.ObjectId(safeUserId);

    return await Match.find({ user: userObjectId })
        .sort({ createdAt: -1 })
        .populate('user', 'username');
}*/

export async function getMatchHistory(userId: string, page = 1, size = 5, 
    filters?: { result?: string; maxMoves?: number; maxDuration?: number }

):
     Promise<{ content: IMatch[]; page: number; size: number; totalElements: number; totalPages: number }> {
    if (typeof userId !== 'string') {
        throw new Error('Invalid input format');
    }
    const safeUserId = userId.trim();
    const userObjectId = new mongoose.Types.ObjectId(safeUserId);

    //return await Match.find({ user: userObjectId })
    //    .sort({ createdAt: -1 })
    //    .populate('user', 'username');
    const skip = (page - 1) * size;// Ejemplo: (2 - 1) * size = size → se saltan los primeros size documentos.

    // query base
    const query: any = { user: userObjectId };

    //Para filtrar
    //if (result && result !== "") {
    //    query.result = result;
    //}

    if (filters) {
        if (filters.result) query.result = filters.result;
        if (filters.maxMoves) query.totalMoves = { $lte: filters.maxMoves };
        if (filters.maxDuration) query.duration = { $lte: filters.maxDuration };
    }

    // Buscar partidas paginadas
    const content = await Match.find(query)//Busca las partidas del usuario 
        .sort({ createdAt: -1 })//Ordenado por fecha (primero más recientes)
        .skip(skip)
        .limit(size);//Límite por página --> size

    const totalElements = await Match.countDocuments( query );//Total de partidas del usuario (await para esperar el resultado)

    return {
        content,
        page,
        size,
        totalElements,
        totalPages: Math.ceil(totalElements / size)//Redondea hacia arriba
    };

}