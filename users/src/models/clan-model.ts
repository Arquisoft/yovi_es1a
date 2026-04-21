import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IClan extends Document {
  name: string;
  members: Types.ObjectId[];
    messages: IMessage[];
  createdAt: Date;
}

interface IMessage {
  userId: Types.ObjectId;
  username: string;
  text: string;
  timestamp: Date;
}
const messageSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const clanSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Clan = mongoose.model<IClan>('Clan', clanSchema);

export default Clan;