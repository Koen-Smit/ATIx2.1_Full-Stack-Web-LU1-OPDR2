import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ 
  collection: 'modules',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})
export class ModuleDocument extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  shortdescription: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  studycredit: number;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  contact_id: string;

  @Prop({ required: true })
  level: string;

  @Prop({ required: true })
  learningoutcomes: string;

  created_at: Date;
  updated_at: Date;
}

export const ModuleSchema = SchemaFactory.createForClass(ModuleDocument);