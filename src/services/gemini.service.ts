import { Injectable } from '@angular/core';
import { GoogleGenAI, Type, SchemaType, Chat } from '@google/genai';
import { SkillData } from './user-progress.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY']! });
  }

  createVoiceChat(): Chat {
    return this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are Lingua, a specialized 1-on-1 English Spoken Tutor. 
        Your goal is to help the user improve their speaking skills through natural conversation.
        
        Guidelines:
        1. Keep responses concise (1-3 sentences) and conversational.
        2. Listen for grammar and vocabulary mistakes. If you hear one, gently correct it before continuing.
        3. Ask follow-up questions to keep the user talking.
        4. Do NOT use markdown (bold, italics) or emojis, as your response will be read aloud by a text-to-speech engine.
        5. Be encouraging, patient, and friendly.
        `
      }
    });
  }

  async analyzePronunciation(audioBase64: string, referenceText: string): Promise<any> {
    const prompt = `
      You are an expert English pronunciation coach (IPA specialist).
      The user is trying to say the following sentence: "${referenceText}".
      Analyze the attached audio recording of the user.
      
      Return a JSON object with:
      1. score: An integer from 0-100 representing overall pronunciation accuracy.
      2. phoneme_feedback: A list of objects identifying specific words that were mispronounced, with 'word', 'actual_phoneme', 'expected_phoneme', and 'tip'.
      3. intonation_comment: A string commenting on the intonation and stress.
      4. general_feedback: A supportive and constructive comment.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: 'audio/wav', data: audioBase64 } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              phoneme_feedback: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    expected_phoneme: { type: Type.STRING },
                    tip: { type: Type.STRING }
                  }
                }
              },
              intonation_comment: { type: Type.STRING },
              general_feedback: { type: Type.STRING }
            }
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Pronunciation Analysis Error", e);
      return { score: 0, phoneme_feedback: [], intonation_comment: "Could not analyze.", general_feedback: "Please try again." };
    }
  }

  async chatWithTutor(message: string, history: any[], useSearch: boolean = false): Promise<string> {
    const systemInstruction = `
      You are 'Lingua', a friendly and highly skilled AI English Tutor.
      Your goal is to help the user improve their English through conversation.
      Correct their grammar and vocabulary subtly in your responses if they make mistakes.
      Keep responses concise and encouraging.
      If the user asks about real-time events, news, or factual data, use the search tool if enabled.
    `;

    const contents = [...history, { role: 'user', parts: [{ text: message }] }];

    const config: any = {
      systemInstruction: systemInstruction,
    };

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: config
      });
      return response.text || "I'm sorry, I couldn't generate a response.";
    } catch (e) {
      console.error("Chat error", e);
      return "I encountered an error connecting to the AI tutor.";
    }
  }

  async generateVocabImage(word: string): Promise<string | null> {
    try {
      const response = await this.ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `A clear, educational illustration representing the word or concept: "${word}". Minimalist, icon-like, suitable for a language learning flashcard.`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg'
        }
      });
      
      const b64 = response.generatedImages?.[0]?.image?.imageBytes;
      return b64 ? `data:image/jpeg;base64,${b64}` : null;
    } catch (e) {
      console.error("Image gen error", e);
      return null;
    }
  }

  async getWordDetails(word: string): Promise<any> {
    try {
      const prompt = `
        Provide the following details for the English word "${word}":
        1. IPA (International Phonetic Alphabet) transcription.
        2. A short definition.
        3. A simple example sentence.
        
        Return JSON object with keys: ipa, definition, example.
      `;
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
              type: Type.OBJECT,
              properties: {
                  ipa: {type: Type.STRING},
                  definition: {type: Type.STRING},
                  example: {type: Type.STRING}
              }
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Word details error", e);
      return { ipa: '', definition: 'Could not fetch definition.', example: '' };
    }
  }

  async generateCurriculum(userStats: SkillData[]): Promise<any> {
    const statsDescription = userStats
      .map(stat => `${stat.axis}: ${stat.value}/100`)
      .join(', ');

    const prompt = `
      Act as an expert English curriculum designer. 
      The student has the following current skill profile based on recent analysis:
      [ ${statsDescription} ]

      Analyze these numbers to identify the student's weakest areas (lowest scores).
      Create a highly personalized 3-item daily learning plan that specifically targets these weak points to maximize improvement.
      
      For example, if 'Intonation' is low, suggest shadowing exercises focusing on pitch. If 'Vocabulary' is low, suggest active recall.

      Return JSON in this format: 
      { 
        "plan": [ 
          { 
            "title": "Short catchy title", 
            "duration": "e.g. 10 min", 
            "focus": "The specific skill being improved (e.g. Intonation)" 
          } 
        ] 
      }
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { 
          maxOutputTokens: 1000,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              plan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    focus: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });
      return JSON.parse(response.text || '{ "plan": [] }');
    } catch (e) {
      console.error("Generate Curriculum Error", e);
      return { plan: [] };
    }
  }

  async generateReadingPractice(part: 'Part 5' | 'Part 7'): Promise<any> {
    let prompt = "";
    
    if (part === 'Part 5') {
      prompt = `
        Generate 5 "TOEIC Part 5: Incomplete Sentences" practice questions.
        These should cover grammar (verb tenses, prepositions) and vocabulary suitable for business English.
        
        Return JSON structure:
        {
          "passage": null,
          "questions": [
            {
              "id": 1,
              "questionText": "The sentence with a blank (use _____)",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctIndex": 0,
              "explanation": "Why the answer is correct."
            }
          ]
        }
      `;
    } else {
      prompt = `
        Generate a short business email, memo, or advertisement (approx 100-150 words) for "TOEIC Part 7: Reading Comprehension".
        Then generate 3 multiple-choice questions based on this text.
        
        Return JSON structure:
        {
          "passage": "The full text of the email/article...",
          "questions": [
            {
              "id": 1,
              "questionText": "The question asking about details in the text",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctIndex": 0,
              "explanation": "Why the answer is correct."
            }
          ]
        }
      `;
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          maxOutputTokens: 2000,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              passage: { type: Type.STRING, nullable: true },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    questionText: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Generate Reading Error", e);
      return { questions: [] };
    }
  }

  async generateReadingByTopic(topic: string, level: string): Promise<any> {
    const prompt = `
      Create an English reading passage about: "${topic}".
      Difficulty Level: ${level} (CEFR standard).
      Length: Approx 150-200 words.
      
      After the passage, generate 3 multiple-choice comprehension questions.
      
      Return JSON structure:
      {
        "passage": "The full text of the article...",
        "questions": [
          {
            "id": 1,
            "questionText": "Question text...",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctIndex": 0,
            "explanation": "Why it is correct."
          }
        ]
      }
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          maxOutputTokens: 2000,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              passage: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    questionText: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Reading Topic Error", e);
      return { questions: [] };
    }
  }

  async generateGrammarLesson(topic: string): Promise<any> {
    const prompt = `
      Act as an English Grammar expert.
      Provide a structured lesson for the grammar topic: "${topic}".
      
      Return a JSON object with:
      1. title: The formal name of the grammar point.
      2. purpose: A concise explanation of "What is this used to say/express?" (Communicative purpose).
      3. structures: An object containing 'affirmative', 'negative', and 'interrogative'. 
         Each should have a 'formula' (e.g., S + V + O) and an 'example' sentence.
      4. situations: A list of specific contexts or situations where this is commonly used.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          maxOutputTokens: 1500,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              purpose: { type: Type.STRING },
              structures: {
                type: Type.OBJECT,
                properties: {
                  affirmative: {
                    type: Type.OBJECT,
                    properties: { formula: { type: Type.STRING }, example: { type: Type.STRING } }
                  },
                  negative: {
                    type: Type.OBJECT,
                    properties: { formula: { type: Type.STRING }, example: { type: Type.STRING } }
                  },
                  interrogative: {
                    type: Type.OBJECT,
                    properties: { formula: { type: Type.STRING }, example: { type: Type.STRING } }
                  }
                }
              },
              situations: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });
      
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Grammar Gen Error", e);
      return null;
    }
  }
}