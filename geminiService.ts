// Arquivo: geminiService.ts (Corrigido)

import { GoogleGenerativeAI } from "@google/generative-ai";
import { HarmCategory, HarmBlockThreshold } from "@google/genai";
import type { PurchaseOrder } from './types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("Chave de API do Gemini não encontrada. Verifique as variáveis de ambiente.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

function fileToGenerativePart(data: string, mimeType: string) {
  return {
    inlineData: {
      data,
      mimeType
    },
  };
}

export async function extractOrderDetails(fileData: string, mimeType: string): Promise<PurchaseOrder> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const generationConfig = {
    temperature: 0.2,
    topK: 32,
    topP: 1,
    maxOutputTokens: 8192,
    response_mime_type: "application/json",
  };

  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ];

  const parts = [
    fileToGenerativePart(fileData, mimeType),
    { text: `Analise este documento de pedido de compra e extraia as seguintes informações em formato JSON. Responda apenas com o JSON, sem nenhum texto ou formatação adicional.

O JSON deve seguir esta estrutura:
{
  "numero_pedido": "string",
  "fornecedor": "string",
  "data_pedido": "string (formato DD/MM/AAAA)",
  "total": "number",
  "itens": [
    {
      "descricao": "string",
      "quantidade": "number",
      "preco_unitario": "number"
    }
  ]
}

Se alguma informação não for encontrada, retorne null para o campo correspondente.` },
  ];

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    });

    const responseText = result.response.text();
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData: PurchaseOrder = JSON.parse(cleanedJson);
    return parsedData;

  } catch (error) {
    console.error("Erro ao chamar a API do Gemini:", error);
    throw new Error("Não foi possível extrair os detalhes do pedido.");
  }
}
