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
    const skip = (page - 1) * size;

    // 1. Usamos el Query Builder de Mongoose en lugar de un objeto {}
    const queryBuilder = Match.find().where('user').equals(userObjectId);

    // 2. Añado los filtros usando funciones seguras
    if (filters) {
        if (filters.result) {
            queryBuilder.where('result').equals(String(filters.result));
        }
        if (filters.maxMoves) {
            queryBuilder.where('totalMoves').lte(Number(filters.maxMoves));
        }
        if (filters.maxDuration) {
            queryBuilder.where('duration').lte(Number(filters.maxDuration));
        }
    }

    // Buscar partidas paginadas
    const content = await Match.find(query)//Busca las partidas del usuario 
        .sort({ createdAt: -1 })//Ordenado por fecha (primero más recientes)
        .skip(skip)
        .limit(size)//Límite por página --> size
        .populate('user', 'username'); //Poblar el username

    // 4. Añadir la paginación a la consulta original y ejecutar.
    const content = await queryBuilder
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(size)
        .exec();

    return {
        content,
        page,
        size,
        totalElements,
        totalPages: Math.ceil(totalElements / size)
    };
}