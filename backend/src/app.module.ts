import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FaqController } from './faq.controller';
import { FAQ, FAQSchema } from './faqs/schemas/faq.schema';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/samagama'),
    MongooseModule.forFeature([{ name: FAQ.name, schema: FAQSchema }]),
  ],
  controllers: [AppController, FaqController],
  providers: [AppService],
})
export class AppModule {}
