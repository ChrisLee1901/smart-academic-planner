import type { AcademicEvent } from '../types';
import dayjs from '../utils/dayjs';

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

      // Xử lý thời gian ước tính từ Gemini response
      let estimatedTime = 1; // Default 1 hour
      if (extractedInfo.estimatedTime) {
        estimatedTime = parseFloat(extractedInfo.estimatedTime);
      } else {
        // Ước tính dựa trên type và title
        const title = extractedInfo.title.toLowerCase();
        if (title.includes('học') || title.includes('đọc') || title.includes('nghiên cứu')) {
          estimatedTime = 2;
        } else if (title.includes('bài tập') || title.includes('assignment')) {
          estimatedTime = 1.5;
        } else if (title.includes('dự án') || title.includes('project')) {
          estimatedTime = 3;
        } else if (title.includes('thi') || title.includes('exam')) {
          estimatedTime = 2;
        }
      }

      return {
        confidence: 0.8,
        event: {
          title: extractedInfo.title,
          type: extractedInfo.type as AcademicEvent['type'] || 'personal',
          startTime,
          status: 'todo' as const,
          priority: extractedInfo.priority as AcademicEvent['priority'] || 'medium',
          course: extractedInfo.course,
          estimatedTime
        }
      };

    } catch (error) {
      return this.fallbackParsing(input);
    }
  }

  private async extractTaskInfoWithGemini(input: string): Promise<any> {
    const today = new Date();
    const todayStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    
    const prompt = `Hôm nay là ${todayStr}. Phân tích câu sau và trích xuất thông tin tạo sự kiện/nhiệm vụ. 

QUAN TRỌNG về thời gian:
- "ngày mai", "mai" = ngày 15/9/2025 (Chủ nhật)
- "ngày sau", "hôm sau" = ngày 15/9/2025 (Chủ nhật)  
- "tuần sau", "tuần tới" = ngày 21/9/2025 (Thứ 7, cùng thứ tuần sau)
- "đầu tuần sau" = ngày 15/9/2025 (Thứ 2 tuần sau)
- "cuối tuần sau" = ngày 20/9/2025 hoặc 21/9/2025 (T6-T7 tuần sau)
- "thứ 2 tuần sau" = ngày 15/9/2025
- "thứ 3 tuần sau" = ngày 16/9/2025
- "thứ 4 tuần sau" = ngày 17/9/2025
- "thứ 5 tuần sau" = ngày 18/9/2025
- "thứ 6 tuần sau" = ngày 19/9/2025
- "thứ 7 tuần sau" = ngày 20/9/2025
- "chủ nhật tuần sau" = ngày 21/9/2025
- Nếu có số + "ngày sau": cộng thêm số ngày đó vào hôm nay (14/9)

Trả lời bằng JSON chính xác:
{
  "title": "tên nhiệm vụ rõ ràng",
  "type": "deadline/class/project/personal",
  "date": "ngày cụ thể hoặc cụm từ thời gian (ưu tiên ngày cụ thể)",
  "time": "giờ phút cụ thể",
  "priority": "high/medium/low",
  "course": "tên môn học nếu có",
  "estimatedTime": "số giờ ước tính (1-8)",
  "confidence": 0.0-1.0,
  "error": "lỗi nếu không đủ thông tin",
  "suggestions": ["gợi ý cụ thể"]
}

Ví dụ tốt:
- "3 ngày sau" → "date": "${today.getDate() + 3}/${today.getMonth() + 1}/${today.getFullYear()}"
- "thứ 2 tuần sau" → "date": "thứ hai"
- "mai lúc 5 giờ chiều" → "date": "ngày mai", "time": "5 giờ chiều"

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
    const now = new Date();
    let dateTime = new Date(now);
    
    if (dateStr) {
      const dateInput = dateStr.toLowerCase();
      
      // Xử lý các cụm từ ngày tương đối
      if (dateInput.includes('hôm nay')) {
        // Giữ nguyên ngày hiện tại
      } else if (dateInput.includes('ngày mai') || dateInput.includes('mai')) {
        dateTime.setDate(dateTime.getDate() + 1);
      } else if (dateInput.includes('ngày sau') || dateInput.includes('hôm sau')) {
        dateTime.setDate(dateTime.getDate() + 1);
      } else if (dateInput.includes('ngày kia')) {
        dateTime.setDate(dateTime.getDate() + 2);
      } else if (dateInput.includes('đầu tuần sau')) {
        // Tính Thứ 2 của tuần sau
        const nextMonday = dayjs().add(1, 'week').startOf('week');
        dateTime = nextMonday.toDate();
      } else if (dateInput.includes('cuối tuần sau')) {
        // Tính Thứ 7 của tuần sau  
        const nextSaturday = dayjs().add(1, 'week').startOf('week').add(5, 'day');
        dateTime = nextSaturday.toDate();
      } else if (dateInput.includes('tuần sau') || dateInput.includes('tuần tới')) {
        dateTime.setDate(dateTime.getDate() + 7);
      } else if (dateInput.includes('tháng sau') || dateInput.includes('tháng tới')) {
        dateTime.setMonth(dateTime.getMonth() + 1);
      }
      
      // Xử lý "X ngày sau", "X tuần sau", etc.
      const relativeDayMatch = dateInput.match(/(\d+)\s*ngày\s*sau/);
      if (relativeDayMatch) {
        const days = parseInt(relativeDayMatch[1]);
        dateTime.setDate(dateTime.getDate() + days);
      }
      
      const relativeWeekMatch = dateInput.match(/(\d+)\s*tuần\s*sau/);
      if (relativeWeekMatch) {
        const weeks = parseInt(relativeWeekMatch[1]);
        dateTime.setDate(dateTime.getDate() + (weeks * 7));
      }
      
      const relativeMonthMatch = dateInput.match(/(\d+)\s*tháng\s*sau/);
      if (relativeMonthMatch) {
        const months = parseInt(relativeMonthMatch[1]);
        dateTime.setMonth(dateTime.getMonth() + months);
      }
      
      // Xử lý thứ trong tuần (ưu tiên xử lý "thứ X tuần sau" trước)
      const dayOfWeekMap: { [key: string]: number } = {
        'chủ nhật': 0, 'cn': 0,
        'thứ hai': 1, 't2': 1, 'thứ 2': 1,
        'thứ ba': 2, 't3': 2, 'thứ 3': 2,
        'thứ tư': 3, 't4': 3, 'thứ 4': 3,
        'thứ năm': 4, 't5': 4, 'thứ 5': 4,
        'thứ sáu': 5, 't6': 5, 'thứ 6': 5,
        'thứ bảy': 6, 't7': 6, 'thứ 7': 6
      };
      
      // Xử lý "thứ X tuần sau" - phải xử lý trước "tuần sau"
      let dayOfWeekProcessed = false;
      for (const [dayName, dayNumber] of Object.entries(dayOfWeekMap)) {
        if (dateInput.includes(dayName) && dateInput.includes('tuần sau')) {
          // Tính thứ X của tuần sau
          const nextWeekDay = dayjs().add(1, 'week').startOf('week').add(dayNumber === 0 ? 6 : dayNumber - 1, 'day');
          dateTime = nextWeekDay.toDate();
          dayOfWeekProcessed = true;
          break;
        }
      }
      
      // Xử lý thứ trong tuần hiện tại (nếu chưa xử lý "tuần sau")
      if (!dayOfWeekProcessed) {
        for (const [dayName, dayNumber] of Object.entries(dayOfWeekMap)) {
          if (dateInput.includes(dayName)) {
            const currentDay = dateTime.getDay();
            let daysToAdd = dayNumber - currentDay;
            if (daysToAdd <= 0) daysToAdd += 7; // Nếu là ngày trong tuần này thì chuyển sang tuần sau
            dateTime.setDate(dateTime.getDate() + daysToAdd);
            break;
          }
        }
      }
      
      // Xử lý ngày cụ thể (dd/mm, dd/mm/yyyy)
      const dateMatch = dateInput.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
      if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]) - 1; // JavaScript months are 0-indexed
        const year = dateMatch[3] ? parseInt(dateMatch[3]) : dateTime.getFullYear();
        dateTime = new Date(year, month, day);
      }
    }
    
    // Xử lý thời gian
    if (timeStr) {
      const timeInput = timeStr.toLowerCase();
      
      // Xử lý giờ cụ thể (HH:mm, HH giờ mm, etc.)
      let timeMatch = timeInput.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        dateTime.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0, 0);
      } else {
        timeMatch = timeInput.match(/(\d{1,2})\s*giờ\s*(\d{1,2})?/);
        if (timeMatch) {
          const hour = parseInt(timeMatch[1]);
          const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
          dateTime.setHours(hour, minute, 0, 0);
        } else {
          timeMatch = timeInput.match(/(\d{1,2})h(\d{2})?/);
          if (timeMatch) {
            const hour = parseInt(timeMatch[1]);
            const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
            dateTime.setHours(hour, minute, 0, 0);
          }
        }
      }
      
      // Xử lý AM/PM
      if (timeInput.includes('chiều') || timeInput.includes('pm')) {
        const currentHour = dateTime.getHours();
        if (currentHour < 12) {
          dateTime.setHours(currentHour + 12);
        }
      } else if (timeInput.includes('sáng') || timeInput.includes('am')) {
        const currentHour = dateTime.getHours();
        if (currentHour >= 12) {
          dateTime.setHours(currentHour - 12);
        }
      }
      
      // Xử lý các cụm từ thời gian đặc biệt
      if (timeInput.includes('trua')) {
        dateTime.setHours(12, 0, 0, 0);
      } else if (timeInput.includes('tối')) {
        dateTime.setHours(19, 0, 0, 0);
      } else if (timeInput.includes('khuya')) {
        dateTime.setHours(22, 0, 0, 0);
      }
    }
    
    return dateTime;
  }

  private fallbackParsing(input: string): ParsedEventData {
    const text = input.toLowerCase().trim();
    
    // Trích xuất tiêu đề
    let title = text;
    const titlePatterns = [
      /(?:nộp|deadline|học|họp|thi|làm)\s+(.+?)(?:\s+(?:vào|lúc|ngày|trong|sau)|$)/i,
      /(.+?)(?:\s+(?:vào|lúc|ngày|trong|sau)\s+)/i
    ];
    
    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        title = match[1].trim();
        break;
      }
    }
    
    if (!title) {
      return {
        confidence: 0,
        event: {},
        error: "Không thể xác định tiêu đề của nhiệm vụ. Vui lòng mô tả rõ hơn."
      };
    }

    // Trích xuất thông tin thời gian
    const timePatterns = {
      date: [
        /(\d+)\s*ngày\s*sau/,
        /(\d+)\s*tuần\s*sau/,
        /(hôm nay|ngày mai|mai|ngày sau|hôm sau|ngày kia|tuần sau|tuần tới)/,
        /(thứ\s+(?:hai|ba|tư|năm|sáu|bảy)|chủ nhật)/,
        /(\d{1,2}\/\d{1,2}(?:\/\d{4})?)/
      ],
      time: [
        /(\d{1,2}):(\d{2})/,
        /(\d{1,2})\s*giờ\s*(\d{1,2})?/,
        /(\d{1,2})h(\d{2})?/,
        /(sáng|trua|chiều|tối|khuya)/,
        /(am|pm)/
      ]
    };

    let dateStr = '';
    let timeStr = '';

    // Tìm thông tin ngày
    for (const pattern of timePatterns.date) {
      const match = text.match(pattern);
      if (match) {
        dateStr = match[0];
        break;
      }
    }

    // Tìm thông tin giờ
    for (const pattern of timePatterns.time) {
      const match = text.match(pattern);
      if (match) {
        timeStr = match[0];
        break;
      }
    }

    // Nếu không có thông tin thời gian nào
    if (!dateStr && !timeStr) {
      return {
        confidence: 0.3,
        event: { 
          title, 
          type: 'personal', 
          status: 'todo' as const, 
          priority: 'medium'
        },
        error: "Vui lòng cung cấp ngày hoặc thời hạn cho nhiệm vụ",
        suggestions: [
          'Ví dụ: "' + title + ' vào mai lúc 5 giờ chiều"',
          'Thêm thông tin thời gian như "3 ngày sau", "thứ 2 tuần sau"'
        ]
      };
    }

    // Sử dụng parseDateTime để xử lý thời gian
    const parsedDate = this.parseDateTime(dateStr, timeStr);
    
    // Xác định loại sự kiện
    let eventType: AcademicEvent['type'] = 'personal';
    if (text.includes('nộp') || text.includes('deadline')) eventType = 'deadline';
    else if (text.includes('học') || text.includes('lớp')) eventType = 'class';
    else if (text.includes('dự án') || text.includes('project')) eventType = 'project';
    else if (text.includes('thi') || text.includes('họp')) eventType = 'deadline'; // Thi và họp coi như deadline

    // Xác định độ ưu tiên
    let priority: 'high' | 'medium' | 'low' = 'medium';
    if (text.includes('gấp') || text.includes('quan trọng')) priority = 'high';
    else if (text.includes('không gấp') || text.includes('thường')) priority = 'low';

    // Ước tính thời gian dựa trên loại nhiệm vụ và nội dung
    let estimatedTime = 1; // Default 1 hour
    
    // Tìm số giờ trong text trước
    const hourMatch = text.match(/(\d+)\s*giờ/);
    if (hourMatch) {
      estimatedTime = parseInt(hourMatch[1]);
    } else {
      // Ước tính dựa trên loại và nội dung
      if (text.includes('học') || text.includes('đọc') || text.includes('nghiên cứu')) {
        estimatedTime = 2;
      } else if (text.includes('bài tập') || text.includes('assignment')) {
        estimatedTime = 1.5;
      } else if (text.includes('dự án') || text.includes('project')) {
        estimatedTime = 3;
      } else if (text.includes('thi') || text.includes('exam')) {
        estimatedTime = 2;
      } else if (text.includes('họp') || text.includes('meeting')) {
        estimatedTime = 1;
      }
    }

    return {
      confidence: 0.8,
      event: {
        title,
        type: eventType,
        startTime: parsedDate,
        status: 'todo' as const,
        priority,
        estimatedTime
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