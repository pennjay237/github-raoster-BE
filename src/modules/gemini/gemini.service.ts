import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.baseUrl = this.configService.get<string>('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta');
    
    // Only warn in development, don't throw error
    if (!this.apiKey && process.env.NODE_ENV === 'development') {
      this.logger.warn('GEMINI_API_KEY is not configured. Mock mode enabled.');
    }
  }

  async generateRoast(prompt: string): Promise<string> {
    try {
      // If no API key, return mock response for development
      if (!this.apiKey) {
        this.logger.warn('Using mock Gemini response (no API key)');
        return this.getMockRoast();
      }
      
      this.logger.log('Calling Gemini API...');
      
      const model = this.configService.get<string>('GEMINI_MODEL', 'gemini-pro');
      const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;
      
      const response = await axios.post(
        url,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 500,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      const roast = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!roast) {
        this.logger.warn('Gemini returned empty response');
        return 'Even the AI couldn\'t find anything to roast about this perfect developer! 🌟';
      }

      this.logger.log('Roast generated successfully');
      return roast;
    } catch (error: any) {
      this.logger.error('Gemini API error:', error.response?.data || error.message);
      
      if (error.response?.data) {
        console.error('Gemini API Error Details:', error.response.data);
      }
      
      // Return mock response if API fails
      this.logger.warn('Falling back to mock response');
      return this.getMockRoast();
    }
  }

  private getMockRoast(): string {
    return `🔥 GitHub Roast of User 🔥

Well well well, look who we have here! Another GitHub user trying to make their mark in the digital world. 

I see you've been on GitHub for a while, but your commit history looks more sporadic than my attempts at New Year's resolutions. Your most used language? Probably "procrastination" if we're being honest!

But hey, at least you're trying! Those repositories may not have many stars, but they're perfect for... well, for being repositories. And that bio? "Passionate developer" - how original! 

Remember: every great developer starts with a "Hello World" and a lot of confusion. Keep pushing those commits, even if they're just fixing typos in your README!

💻 Keep coding, you digital wizard!`;
  }
}