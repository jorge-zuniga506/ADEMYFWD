import { generateText, analyzeImage, verifyCertificate } from "./gemini";
import { generateCourseDescription, chat } from "./openrouter";
import { analyzeLongText } from "./kimi";

export const ai = {
  gemini: {
    generateText,
    analyzeImage,
    verifyCertificate,
  },
  openrouter: {
    generateCourseDescription,
    chat,
  },
  kimi: {
    analyzeLongText,
  },
};
