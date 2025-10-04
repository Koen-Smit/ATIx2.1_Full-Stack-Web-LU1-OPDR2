import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ 
  collection: 'users',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})
export class UserDocument extends Document {
  declare _id: Types.ObjectId;
  
  @Prop({ required: true })
  firstname: string;

  @Prop({ required: true })
  lastname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop([{
    module_id: { type: String, required: true },
    added_at: { type: Date, required: true },
    module_name: { type: String, required: true },
    studycredit: { type: Number, required: true },
    location: { type: String, required: true }
  }])
  favorites: Array<{
    module_id: string;
    added_at: Date;
    module_name: string;
    studycredit: number;
    location: string;
  }>;

  created_at: Date;
  updated_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);