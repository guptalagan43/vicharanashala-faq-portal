import { Controller, Get, Patch, Param, Post, Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FAQ, FAQDocument } from './faqs/schemas/faq.schema';

@Controller('api/faqs')
export class FaqController {
  constructor(
    @InjectModel(FAQ.name) private readonly faqModel: Model<FAQDocument>,
  ) {}

  @Get()
  async getAllFaqs(): Promise<FAQ[]> {
    return this.faqModel.find().exec();
  }

  @Post()
  async createFaq(@Body() createFaqDto: Partial<FAQ>): Promise<FAQ> {
    return this.faqModel.create({
      ...createFaqDto,
      view_count: 0
    });
  }

  @Patch(':id/view')
  async incrementViewCount(@Param('id') id: string): Promise<FAQ | null> {
    return this.faqModel.findByIdAndUpdate(
      id,
      { $inc: { view_count: 1 } },
      { new: true },
    ).exec();
  }
}
