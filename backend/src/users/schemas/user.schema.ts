import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({
    required: true,
    type: String,
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Prop({ default: 0, type: Number })
  reward_points: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'FAQ' }] })
  bookmarks: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
