const API_BASE_URL = 'http://localhost:5000';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: Message[];
  language: string;
  model: string;
}

export async function sendChatMessage(request: ChatRequest) {
  const endpoint = `${API_BASE_URL}/api/chat`;
  console.log(`🚀 Sending request to: ${endpoint}`);
  console.log('📤 Request payload:', {
    messages: request.messages,
    language: request.language,
    model: request.model
  });

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API request failed:', {
        status: response.status,
        statusText: response.statusText,
        endpoint,
        error: errorText
      });
      throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ API request successful:', {
      endpoint,
      responseSize: JSON.stringify(data).length
    });
    return data;
  } catch (error) {
    console.error('❌ Error in sendChatMessage:', {
      endpoint,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
} 