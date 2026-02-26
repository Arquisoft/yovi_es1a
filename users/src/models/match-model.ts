import mongoose, { Schema, Document } from 'mongoose';
export interface IMatch extends Document{
    user:mongoose.Types.ObjectId; //Refer to user that plays
    result: 'win' | 'lose' | 'surrender';
    duration:number;
    boardSize:number;
    opponent: string;      
    totalMoves: number;
    gameMode: string;      
    createdAt:Date;
}
const MatchSchema:Schema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    result:{
        type:String,
        enum:['win','lose','surrender'],
        required:true,
    },
    duration:{
        type:Number,
        required:true,
    },
    boardSize:{
        type:Number,
        required:true,
        default:7
    },
    opponent: { type: String, default: 'Unknown' },
    totalMoves: { type: Number, default: 0 },
    gameMode: { type: String, default: 'computer' }
}, {
  timestamps: true
});
export default mongoose.model<IMatch>('Match',MatchSchema);