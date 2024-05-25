import {tmt} from "tencentcloud-sdk-nodejs-tmt/tencentcloud/services/"

const TmtClient = tmt.v20180321.Client

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

export const translateText = async (srcLang, tarLang, textList) => {
    const translatedWords = []
    if (textList.length > 1) {
        const resp = await client.TextTranslateBatch({
            Source: srcLang,
            Target: tarLang,
            ProjectId: 0,
            SourceTextList: textList,
        });
        translatedWords.push(...resp.TargetTextList)
    } else if (textList.length === 1) {
        const resp = await client.TextTranslate({
            Source: srcLang,
            Target: tarLang,
            ProjectId: 0,
            SourceText: textList[0],
        });
        translatedWords.push(resp.TargetText)
    }
    return translatedWords
}

