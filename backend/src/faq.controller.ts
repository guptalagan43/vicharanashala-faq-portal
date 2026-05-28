import { Controller, Get } from '@nestjs/common';
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
}
