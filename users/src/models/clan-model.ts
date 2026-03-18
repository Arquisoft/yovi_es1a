import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IClan extends Document {
  name: string;
  members: Types.ObjectId[]; // referencias a usuarios
  createdAt: Date;
}

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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Clan = mongoose.model<IClan>('Clan', clanSchema);

export default Clan;