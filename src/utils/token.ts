import type { SupportedModel } from '@configs/index';

export const priceList: Record<SupportedModel, number> = {
  'gpt-4': 0.06,
  'gpt-4-0314': 0.06,
  'gpt-4-32k': 0.12,
  'gpt-4-32k-0314': 0.12,
  'gpt-3.5-turbo': 0.002,
  'gpt-3.5-turbo-0301': 0.002,
};

export function countTokens(sentence: string) {
  const chineseTokenLength = 2; // 1 Chinese character ~= 2 tokens
  const englishTokenLength = 4; // 1 token ~= 4 chars in English
  const tokenRatio = 0.75; // 1 token ~= 3/4 words

  const chineseCharRegex = /[\u4e00-\u9fa5]/g; // regular expression to match Chinese characters
  const chineseCharCount = (sentence.match(chineseCharRegex) || []).length;
  const otherTokenCount = sentence.split(' ').length - chineseCharCount;

  const tokenCount =
    chineseCharCount * chineseTokenLength +
    Math.ceil(
      otherTokenCount * tokenRatio +
        (sentence.length - chineseCharCount * 2) / englishTokenLength
    );

  return tokenCount;
}

export function calculateCost(
  sentence: string,
  costPerThousandTokens = 0.03,
  ratio = 2,
  fxRate = 7
) {
  const tokenCount = countTokens(sentence);
  const cost = (tokenCount / 1000) * costPerThousandTokens * ratio * fxRate;
  return cost.toFixed(4);
}
