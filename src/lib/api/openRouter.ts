export interface FoodAnalysisRequest {
  imageData: string;
  model?: string;
  apiKey?: string;
}

export interface FoodAnalysisResponse {
  name: string;
  description: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

const DEFAULT_MODEL = 'z-ai/glm-4.6v:floor';

const FOOD_ANALYSIS_PROMPT = `Analyze this food image and provide detailed nutritional information. Respond with JSON in this exact format:
{
  "name": "Food name",
  "description": "Brief description of what the food is",
  "servingSize": 100,
  "servingUnit": "grams",
  "calories": 250,
  "protein": 15,
  "carbs": 30,
  "fat": 8,
  "fiber": 3,
  "sugar": 5
}

Only respond with the JSON object, no other text.`;

export async function analyzeFood(
  request: FoodAnalysisRequest
): Promise<FoodAnalysisResponse> {
  const { imageData, model = DEFAULT_MODEL, apiKey } = request;

  if (!apiKey) {
    throw new Error('OpenRouter API key is required');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: FOOD_ANALYSIS_PROMPT },
            { type: 'image_url', image_url: { url: imageData } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No response from AI');
  }

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    throw new Error('Failed to parse AI response');
  }
}
