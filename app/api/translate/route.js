import {tmt} from "tencentcloud-sdk-nodejs-tmt/tencentcloud/services/"
import {MemoryCache} from "@/lib/types";

// 导入对应产品模块的client models。
const TmtClient = tmt.v20180321.Client

const cache = new MemoryCache()

const client = new TmtClient({
    credential: {
        secretId: process.env.TENCENTCLOUD_SECRET_ID,
        secretKey: process.env.TENCENTCLOUD_SECRET_KEY,
    },
    // 产品地域
    region: "ap-shanghai",
    // 可选配置实例
    profile: {
        signMethod: "TC3-HMAC-SHA256", // 签名方法
        httpProfile: {
            reqMethod: "POST", // 请求方法
            reqTimeout: 30, // 请求超时时间，默认60s
            // proxy: "http://127.0.0.1:8899" // http请求代理
        },
    },
})


export async function POST(req) {
    const reqParam = await req.json()
    const srcLang = reqParam.srcLang
    const tarLang = reqParam.tarLang
    const textList = reqParam.textList


    const targetTextList = await translateWithCache({srcLang, tarLang, textList})

    return Response.json({
        "status": "ok",
        "data": {
            targetList: targetTextList
        }
    })
}

async function translateWithCache({srcLang, tarLang, textList}) {

    const translations = {};
    const wordsToTranslate = [];

    textList.forEach(word => {
        const key = `${srcLang}-${tarLang}-${word}`
        if (cache.has(key)) {
            translations[word] = cache.get(key);
        } else {
            wordsToTranslate.push(word);
        }
    });
    // 对于没有缓存的单词，批量调用翻译服务
    if (wordsToTranslate.length > 0) {
        const resp = await client.TextTranslateBatch({
            Source: srcLang,
            Target: tarLang,
            ProjectId: 0,
            SourceTextList: wordsToTranslate,
        });
        const translatedWords = resp.TargetTextList;
        console.log(translatedWords);
        translatedWords.forEach((translated, index) => {
            const originalWord = wordsToTranslate[index];
            const key = `${srcLang}-${tarLang}-${originalWord}`
            cache.set(key, translated, 5 * 60 * 60 * 1000);
            translations[originalWord] = translated;
        });
    }
    return textList.map(word => translations[word]);
}
