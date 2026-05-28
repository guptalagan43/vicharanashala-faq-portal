import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  async getAnswer(query: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://samagama.in/platform/proxy/v1',
        {
          model: 'MiniMax-M2.7',
          messages: [{ role: 'user', content: query }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
          },
        },
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Invalid response structure from Minimax API');
      }
      return content;
    } catch (error) {
      this.logger.warn(
        `Minimax API call failed, falling back to Gemini API. Error: ${error instanceof Error ? error.message : String(error)}`,
      );

      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error('GEMINI_API_KEY environment variable is not defined');
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(query);
        const text = result.response.text();
        return text;
      } catch (fallbackError) {
        this.logger.error(
          `Fallback Gemini API call failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`,
        );
        throw fallbackError;
      }
    }
  }
}
