import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.baseUrl = this.configService.get<string>('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta');
    this.model = this.configService.get<string>('GEMINI_MODEL', 'gemini-1.5-flash-latest');
    
    if (!this.apiKey) {
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
      
      this.logger.log(`Calling Gemini API with model: ${this.model}...`);
      
      const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
      
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
        return this.getMockRoast();
      }

      this.logger.log('Roast generated successfully');
      return roast;
    } catch (error: any) {
      this.logger.error(`Gemini API error for model ${this.model}:`, error.response?.data || error.message);
      
      // Try fallback model
      return this.tryFallbackModels(prompt);
    }
  }

  private async tryFallbackModels(prompt: string): Promise<string> {
    const fallbackModels = [
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest',
      'gemini-1.0-pro-latest',
      'gemini-pro',
    ];
    
    for (const model of fallbackModels) {
      try {
        this.logger.log(`Trying fallback model: ${model}`);
        const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;
        
        const response = await axios.post(
          url,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 500,
            },
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000,
          },
        );
        
        const roast = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (roast) {
          this.logger.log(`Success with model: ${model}`);
          return roast;
        }
      } catch (error) {
        this.logger.warn(`Model ${model} failed: ${error.message}`);
      }
    }
    
    this.logger.warn('All Gemini models failed, using mock response');
    return this.getMockRoast();
  }

  private getMockRoast(): string {
    return `🔥 GitHub Roast 🔥

Well well well, look who we have here! Another GitHub warrior braving the digital frontier. 

I see you've been committing code like it's going out of style... or maybe not enough? Either way, those repositories are looking mighty fine!

Your most used language? Let me guess... JavaScript, because who doesn't love a good callback hell? Or maybe Python, because indentation is life!

But seriously, keep up the good work! Every commit counts, even if it's just fixing that one typo you've been ignoring for months.

💻 Stay awesome, you coding legend!`;
  }
}