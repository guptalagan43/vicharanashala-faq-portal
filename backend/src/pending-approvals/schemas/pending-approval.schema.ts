import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PendingApprovalDocument = HydratedDocument<PendingApproval>;

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true, collection: 'pending_approvals' })
export class PendingApproval {
  @Prop({ required: true, type: String })
  question: string;

  @Prop({ required: true, type: String })
  draft_answer: string;

  @Prop({
    required: true,
    type: String,
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @Prop({ required: true, type: String })
  studentId: string;
}

export const PendingApprovalSchema = SchemaFactory.createForClass(PendingApproval);
