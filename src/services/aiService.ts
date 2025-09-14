import type { AcademicEvent } from '../types';

interface ParsedEventData {
  confidence: number;
  event: Partial<AcademicEvent>;
  suggestions?: string[];
  error?: string;
}

class AdvancedAIService {
  async parseNaturalLanguage(input: string): Promise<ParsedEventData> {
    const text = input.toLowerCase().trim();
    
    if (!text) {
      return {
        confidence: 0,
        event: {},
        error: "Vui lòng nhập nội dung cần tạo sự kiện"
      };
    }

    try {
      const extractedInfo = await this.extractTaskInfoWithGemini(text);
      
      if (extractedInfo.error) {
        return {
          confidence: 0,
          event: {},
          error: extractedInfo.error,
          suggestions: extractedInfo.suggestions
        };
      }

      if (!extractedInfo.title) {
        return {
          confidence: 0,
          event: {},
          error: "Không thể xác định tiêu đề của nhiệm vụ. Vui lòng mô tả rõ hơn.",
          suggestions: [
            'Ví dụ: "Nộp bài tập Toán vào thứ 3 lúc 5 giờ chiều"',
            'Thêm thông tin về tên nhiệm vụ và thời hạn'
          ]
        };
      }

      if (!extractedInfo.date && !extractedInfo.time) {
        return {
          confidence: 0.3,
          event: {
            title: extractedInfo.title,
            type: (extractedInfo.type as AcademicEvent['type']) || 'personal',
            status: 'todo' as const,
            priority: (extractedInfo.priority as AcademicEvent['priority']) || 'medium'
          },
          error: "Vui lòng cung cấp ngày hoặc thời hạn cho nhiệm vụ",
          suggestions: [
            'Thêm thời gian: "vào thứ 3", "ngày mai", "25/12/2024"',
            'Hoặc thời hạn: "deadline tuần sau", "trước 5h chiều"'
          ]
        };
      }

      let startTime = new Date();
      if (extractedInfo.date || extractedInfo.time) {
        startTime = this.parseDateTime(extractedInfo.date, extractedInfo.time);
      }

      return {
        confidence: 0.8,
        event: {
          title: extractedInfo.title,
          type: extractedInfo.type as AcademicEvent['type'] || 'personal',
          startTime,
          status: 'todo' as const,
          priority: extractedInfo.priority as AcademicEvent['priority'] || 'medium',
          course: extractedInfo.course
        }
      };

    } catch (error) {
      return this.fallbackParsing(input);
    }
  }

  private async extractTaskInfoWithGemini(input: string): Promise<any> {
    const prompt = `Phân tích câu sau và trích xuất thông tin tạo sự kiện/nhiệm vụ. Trả lời bằng JSON:

{
  "title": "tên nhiệm vụ",
  "type": "deadline/class/project/meeting/exam/personal",
  "date": "ngày tháng năm hoặc ngày tương đối",
  "time": "giờ phút",
  "priority": "high/medium/low",
  "course": "tên môn học nếu có",
  "confidence": 0.0-1.0,
  "error": "lỗi nếu không đủ thông tin",
  "suggestions": ["gợi ý 1", "gợi ý 2"]
}

Câu cần phân tích: "${input}"`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': 'AIzaSyBD9JIWh_SaMMrv_rJCoKJ3qJwJ1Yi6b8Q'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 500 }
      })
    });

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch[0]);
  }

  private parseDateTime(dateStr?: string, timeStr?: string): Date {
    let dateTime = new Date();
    
    if (dateStr) {
      if (dateStr.includes('mai')) {
        dateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      } else if (dateStr.includes('tuần sau')) {
        dateTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      }
    }
    
    if (timeStr) {
      const timeMatch = timeStr.match(/(\d{1,2}):?(\d{0,2})/);
      if (timeMatch) {
        dateTime.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2] || '0'));
      }
    }
    
    return dateTime;
  }

  private fallbackParsing(input: string): ParsedEventData {
    const text = input.toLowerCase().trim();
    const titleMatch = text.match(/(?:nộp|deadline|học|họp|thi)\s+(.+?)(?:\s+(?:vào|lúc|ngày)|$)/i);
    const title = titleMatch ? titleMatch[1].trim() : text;
    
    if (!title) {
      return {
        confidence: 0,
        event: {},
        error: "Không thể xác định tiêu đề của nhiệm vụ. Vui lòng mô tả rõ hơn."
      };
    }

    const hasTime = /(?:mai|tuần sau|hôm nay|\d{1,2}\/\d{1,2}|\d{1,2}:\d{2})/i.test(text);
    
    if (!hasTime) {
      return {
        confidence: 0.3,
        event: { title, type: 'personal', status: 'todo' as const, priority: 'medium' },
        error: "Vui lòng cung cấp ngày hoặc thời hạn cho nhiệm vụ"
      };
    }

    return {
      confidence: 0.6,
      event: {
        title,
        type: 'deadline',
        startTime: new Date(),
        status: 'todo' as const,
        priority: 'medium'
      }
    };
  }

  generateSmartSuggestions(_events: AcademicEvent[]): string[] {
    return ['Gợi ý thông minh sẽ xuất hiện ở đây'];
  }

  detectConflicts(_newEvent: AcademicEvent, _existingEvents: AcademicEvent[]): string[] {
    return [];
  }
}

export const aiService = new AdvancedAIService();