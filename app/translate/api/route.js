import {tmt} from "tencentcloud-sdk-nodejs-tmt/tencentcloud/services/"

// 导入对应产品模块的client models。
const TmtClient = tmt.v20180321.Client


// 实例化要请求产品(以cvm为例)的client对象
const client = new TmtClient({
    // 为了保护密钥安全，建议将密钥设置在环境变量中或者配置文件中，请参考本文凭证管理章节。
    // 硬编码密钥到代码中有可能随代码泄露而暴露，有安全隐患，并不推荐。
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


export async function POST(req){
    const reqParam = await req.json()
    const srcLang = reqParam.srcLang
    const tarLang = reqParam.tarLang
    const textList = reqParam.textList
    const resp = await client.TextTranslateBatch({
        Source: srcLang,
        Target: tarLang,
        ProjectId: 0,
        SourceTextList: textList,
    });
    return Response.json({
        "status": "ok",
        "data":{
            targetList: resp.TargetTextList
        }
    })
}
