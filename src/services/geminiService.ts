interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface StudyContext {
  userMessage: string;
  completedTasks: number;
  totalTasks: number;
  currentTime: string;
  recentTopics?: string[];
}

export class GeminiService {
  private readonly apiKey = 'AIzaSyBD9JIWh_SaMMrv_rJCoKJ3qJwJ1Yi6b8Q';
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  private isAvailable = true;

  // Prompt templates cho các tình huống khác nhau
  private getSystemPrompt(context: StudyContext): string {
    return `Bạn là AI Study Assistant chuyên nghiệp hỗ trợ học tập tiếng Việt. 

NGUYÊN TẮC TRẢ LỜI:
- Trả lời ngắn gọn, xúc tích nhưng đủ ý
- Sử dụng tiếng Việt thân thiện, dễ hiểu
- Đưa ra lời khuyên thực tế, có thể áp dụng ngay
- Có cấu trúc rõ ràng với đánh số (1. 2. 3.) 
- KHÔNG sử dụng dấu *, **, markdown hay bullet points
- Sử dụng emoji phù hợp để tạo điểm nhấn
- Khuyến khích và tích cực

FORMAT TRẢ LỜI:
- Dùng đánh số (1. 2. 3.) thay vì dấu *
- Xuống dòng rõ ràng giữa các ý
- Dùng emoji 🎯 💡 ⚡ 🌟 để làm nổi bật
- Kết thúc bằng lời khuyến khích

CONTEXT HIỆN TẠI:
- Thời gian: ${context.currentTime}
- Tiến độ hôm nay: ${context.completedTasks}/${context.totalTasks} nhiệm vụ
- Tỷ lệ hoàn thành: ${context.totalTasks > 0 ? ((context.completedTasks / context.totalTasks) * 100).toFixed(1) : 0}%

HÃY TRẢ LỜI CÂU HỎI SAU:`;
  }

  private getPromptTemplate(userMessage: string, context: StudyContext): string {
    const lowerMessage = userMessage.toLowerCase();
    let specificPrompt = '';

    if (lowerMessage.includes('học') || lowerMessage.includes('tập trung') || lowerMessage.includes('hiệu quả')) {
      specificPrompt = `
Người dùng hỏi về kỹ thuật học tập. Hãy đưa ra:
1. Kỹ thuật học hiệu quả cụ thể (2-3 kỹ thuật)
2. Cách áp dụng ngay hôm nay
3. Mẹo để duy trì động lực

ĐỊNH DẠNG: Sử dụng số thứ tự (1. 2. 3.) và emoji. Không dùng dấu * hay **
Câu hỏi: "${userMessage}"`;
    } else if (lowerMessage.includes('thời gian') || lowerMessage.includes('lịch') || lowerMessage.includes('kế hoạch')) {
      specificPrompt = `
Người dùng cần hỗ trợ quản lý thời gian. Hãy đưa ra:
1. Phương pháp ưu tiên công việc
2. Cách lập lịch học hiệu quả
3. Balance giữa học và nghỉ ngơi

ĐỊNH DẠNG: Sử dụng số thứ tự (1. 2. 3.) và emoji. Không dùng dấu * hay **
Câu hỏi: "${userMessage}"`;
    } else if (lowerMessage.includes('động lực') || lowerMessage.includes('stress') || lowerMessage.includes('áp lực')) {
      specificPrompt = `
Người dùng cần hỗ trợ về tâm lý học tập. Hãy đưa ra:
1. Cách xây dựng động lực bền vững
2. Kỹ thuật giảm stress hiệu quả
3. Mindset tích cực cho việc học

ĐỊNH DẠNG: Sử dụng số thứ tự (1. 2. 3.) và emoji. Không dùng dấu * hay **
Câu hỏi: "${userMessage}"`;
    } else if (lowerMessage.includes('thi') || lowerMessage.includes('kiểm tra') || lowerMessage.includes('ôn tập')) {
      specificPrompt = `
Người dùng cần chuẩn bị thi cử. Hãy đưa ra:
1. Chiến lược ôn tập hiệu quả
2. Kỹ thuật ghi nhớ lâu dài
3. Cách quản lý lo lắng trước thi

ĐỊNH DẠNG: Sử dụng số thứ tự (1. 2. 3.) và emoji. Không dùng dấu * hay **
Câu hỏi: "${userMessage}"`;
    } else if (lowerMessage.includes('nhớ') || lowerMessage.includes('ghi nhớ') || lowerMessage.includes('memory')) {
      specificPrompt = `
Người dùng muốn cải thiện khả năng ghi nhớ. Hãy đưa ra:
1. Kỹ thuật ghi nhớ hiệu quả (spaced repetition, mnemonics...)
2. Cách tối ưu não bộ cho việc học
3. Thói quen hàng ngày tăng trí nhớ

ĐỊNH DẠNG: Sử dụng số thứ tự (1. 2. 3.) và emoji. Không dùng dấu * hay **
Câu hỏi: "${userMessage}"`;
    } else {
      specificPrompt = `
Người dùng có câu hỏi chung về học tập. Hãy:
1. Phân tích vấn đề họ đang gặp
2. Đưa ra giải pháp cụ thể và thực tế
3. Khuyến khích họ hành động

ĐỊNH DẠNG: Sử dụng số thứ tự (1. 2. 3.) và emoji. Không dùng dấu * hay **
Câu hỏi: "${userMessage}"`;
    }

    return `${this.getSystemPrompt(context)}\n${specificPrompt}

VÍ DỤ FORMAT MONG MUỐN:
🎯 Cải thiện tập trung học tập

1. Kỹ thuật Pomodoro: Học 25 phút, nghỉ 5 phút
2. Môi trường yên tĩnh: Tắt thông báo, dọn dẹp bàn học
3. Mục tiêu rõ ràng: Đặt target cụ thể cho mỗi buổi học

Với tiến độ hiện tại, bạn đang làm rất tốt! Hãy áp dụng ngay hôm nay nhé! 💪

HÃY TRẢ LỜI THEO FORMAT TƯƠNG TỰ.`;
  }

  async generateResponse(userMessage: string, context: StudyContext): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('Gemini API không khả dụng');
    }

    try {
      const prompt = this.getPromptTemplate(userMessage, context);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this.apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 800
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          this.isAvailable = false;
          throw new Error('API key không hợp lệ hoặc đã hết quota');
        }
        if (response.status === 429) {
          throw new Error('Đã vượt quá giới hạn API, vui lòng thử lại sau');
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('Không nhận được phản hồi từ AI');
      }

      const aiResponse = data.candidates[0].content.parts[0].text;
      
      // Clean up any markdown formatting that might slip through
      const cleanedResponse = aiResponse
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
        .replace(/\*(.*?)\*/g, '$1')     // Remove *italic*
        .replace(/^[\s]*\*[\s]*/gm, '')  // Remove bullet points at start of lines
        .replace(/^[\s]*-[\s]*/gm, '')   // Remove dash bullet points
        .trim();
      
      return cleanedResponse;

    } catch (error) {
      if (error instanceof Error) {
        // Nếu là lỗi mạng hoặc API không khả dụng, đánh dấu service không khả dụng
        if (error.message.includes('fetch') || error.message.includes('network')) {
          this.isAvailable = false;
        }
        throw error;
      }
      throw new Error('Lỗi không xác định khi gọi Gemini API');
    }
  }

  // Fallback AI response (logic cũ)
  generateFallbackResponse(userMessage: string, context: StudyContext): string {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('học') || lowerMessage.includes('tập trung')) {
      return `🎯 Học hiệu quả hơn

1. Kỹ thuật Pomodoro: 25 phút học + 5 phút nghỉ
2. Môi trường: Tắt thông báo, chuẩn bị đủ tài liệu  
3. Mục tiêu rõ ràng: Đặt target cụ thể cho mỗi phiên
4. Active Recall: Tự kiểm tra kiến thức thay vì chỉ đọc lại

Với tiến độ ${context.completedTasks}/${context.totalTasks} hôm nay, bạn đang làm rất tốt! 💪`;
    }
    
    if (lowerMessage.includes('thời gian') || lowerMessage.includes('lịch trình')) {
      return `⏰ Quản lý thời gian hiệu quả

1. Ma trận Eisenhower: Phân loại urgent/important
2. Time blocking: Dành khung giờ cố định cho từng môn
3. Rule 80/20: 80% thời gian cho việc quan trọng nhất
4. Buffer time: Để 15-20% thời gian dự phòng

Gợi ý: Với ${((context.completedTasks/context.totalTasks)*100).toFixed(0)}% hoàn thành, hãy tập trung vào 2-3 task ưu tiên! 🎯`;
    }
    
    if (lowerMessage.includes('động lực') || lowerMessage.includes('stress')) {
      return `🌟 Duy trì động lực & giảm stress

1. Mục tiêu nhỏ: Chia task lớn thành milestone nhỏ
2. Reward system: Tự thưởng khi hoàn thành mục tiêu
3. Study buddy: Tìm bạn học cùng để tạo accountability  
4. Mindfulness: 5 phút thiền/thở sâu khi căng thẳng

Remember: Tiến bộ nhỏ mỗi ngày = Thành công lớn! 💫`;
    }
    
    if (lowerMessage.includes('thi') || lowerMessage.includes('kiểm tra')) {
      return `📚 Chuẩn bị thi hiệu quả

1. Planning: Lập kế hoạch ôn 2-3 tuần trước
2. Practice tests: Làm đề thi thử thường xuyên
3. Spaced repetition: Ôn lại theo chu kỳ 1-3-7-21 ngày
4. Sleep & nutrition: Ngủ đủ 7-8h, ăn uống điều độ

Tip: Tạo checklist và tick off từng phần đã ôn xong! ✅`;
    }
    
    return `🤖 AI Study Assistant

Tôi có thể hỗ trợ bạn về:

1. Kỹ thuật học tập hiệu quả
2. Quản lý thời gian và lập kế hoạch  
3. Tạo động lực và giảm stress
4. Chuẩn bị thi cử strategic

Hiện tại bạn đã hoàn thành ${context.completedTasks}/${context.totalTasks} task. Hãy cho tôi biết bạn cần hỗ trợ gì cụ thể nhé! 😊`;
  }

  // Check if Gemini API is available
  isGeminiAvailable(): boolean {
    return this.isAvailable;
  }

  // Reset availability status (for retry)
  resetAvailability(): void {
    this.isAvailable = true;
  }
}

// Export singleton instance
export const geminiService = new GeminiService();