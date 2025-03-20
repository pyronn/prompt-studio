import {MemoryCache} from "@/lib/types";
import {translateText as txTranslate} from "@/lib/translate/tx-translate";
import {deeplTranslate} from "@/lib/translate/deepl-translate";

const cache = new MemoryCache();

interface TranslateWithCacheParams {
    srcLang: string;
    tarLang: string;
    textList: string[];
    provider: "tencent" | "deepl";
}

export const translateWithCache = async ({
                                             srcLang,
                                             tarLang,
                                             textList,
                                             provider
                                         }: TranslateWithCacheParams): Promise<string[]> => {
    const translations: { [key: string]: string } = {};
    const wordsToTranslate: string[] = [];

    textList.forEach(word => {
        const key = `${tarLang}-${word}`;
        if (cache.has(key)) {
            translations[word] = cache.get(key);
        } else {
            wordsToTranslate.push(word);
        }
    });

    const translatedWords: string[] = [];
    switch (provider) {
        case "tencent": {
            const words = await txTranslate(srcLang, tarLang, wordsToTranslate);
            translatedWords.push(...words);
            break;
        }
        case "deepl": {
            const words = await deeplTranslate(tarLang, wordsToTranslate);
            translatedWords.push(...words);
            break;
        }
        default:
            throw new Error("translate provider not supported");
    }

    // 对于没有缓存的单词，批量调用翻译服务
    translatedWords.forEach((translated, index) => {
        const originalWord = wordsToTranslate[index];
        const key = `${tarLang}-${originalWord}`;
        cache.set(key, translated, 5 * 60 * 60 * 1000);
        translations[originalWord] = translated;
    });
    console.log(textList)

    return textList.map(word => translations[word]);
};
