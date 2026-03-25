import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly systemApiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    this.systemApiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.baseUrl = this.configService.get<string>('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta');
    this.model = this.configService.get<string>('GEMINI_MODEL', 'gemini-2.5-flash');
    
    if (!this.systemApiKey) {
      this.logger.warn('⚠️ GEMINI_API_KEY is not configured. Gemini API calls will fail.');
    } else {
      this.logger.log(`✅ Gemini Service initialized with model: ${this.model}`);
      this.logger.log(`🔑 System API Key loaded: ${this.systemApiKey.substring(0, 20)}...`);
    }
  }

  async generateRoast(
  prompt: string, 
  temperature: number = 0.7,
  userApiKey?: string,  
): Promise<string> {
  try {
    const apiKeyToUse = userApiKey || this.systemApiKey;
    
    if (!apiKeyToUse) {
      this.logger.error('❌ No API key available (neither user nor server)');
      throw new InternalServerErrorException('Gemini API key is required');
    }
    
    this.logger.log(
      `🚀 Calling Gemini API with model: ${this.model}, temperature: ${temperature} ` +
      `(using ${userApiKey ? 'user' : 'server'} API key)`
    );
    
    const modelName = this.model.startsWith('models/') 
      ? this.model.replace('models/', '')
      : this.model;
    
    const url = `${this.baseUrl}/models/${modelName}:generateContent?key=${apiKeyToUse}`;
    
    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: temperature,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        candidateCount: 1,
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
    };

    this.logger.debug('📤 Request URL:', url.replace(apiKeyToUse, 'HIDDEN_KEY'));

    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    const roast = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!roast) {
      this.logger.error('❌ Gemini returned empty response');
      throw new InternalServerErrorException('Gemini API returned empty response');
    }

    this.logger.log(`✅ Roast generated successfully (${roast.length} characters)`);
    return roast.trim();
    
  } catch (error: any) {
    this.logger.error(`❌ Gemini API error:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.error?.message || '';
      if (errorMessage.includes('API key')) {
        throw new InternalServerErrorException(
          userApiKey 
            ? 'Your API key is invalid or expired. Please generate a new one.'
            : 'Server API key is invalid. Please use your own API key.'
        );
      }
    }
    
    if (error.response?.status === 403) {
      throw new InternalServerErrorException(
        userApiKey
          ? 'Your API key is invalid or expired.'
          : 'Server API key is invalid or expired.'
      );
    }
    
    if (error.response?.status === 429) {
      throw new InternalServerErrorException(
        userApiKey
          ? 'Your API key has exceeded the rate limit. Please wait a moment and try again.'
          : 'RATE_LIMIT_EXCEEDED'  
      );
    }
    
    throw new InternalServerErrorException(
      `Failed to generate roast: ${error.message}`,
    );
  }
}
}