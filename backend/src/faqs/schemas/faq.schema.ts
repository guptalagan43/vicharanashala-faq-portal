import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FAQDocument = HydratedDocument<FAQ>;

@Schema({ timestamps: true, collection: 'faqs' })
export class FAQ {
  @Prop({ required: true, type: String })
  question: string;

  @Prop({ required: true, type: String })
  answer: string;

  @Prop({ required: true, type: String })
  category: string;

  @Prop({ default: 0, type: Number })
  view_count: number;

  @Prop({ type: String, required: false })
  actionUrl?: string;
}

export const FAQSchema = SchemaFactory.createForClass(FAQ);
