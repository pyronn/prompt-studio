import {translateWithCache} from "@/lib/translate";


export async function POST(req) {
    const reqParam = await req.json()
    const srcLang = reqParam.srcLang === undefined ? "auto" : reqParam.srcLang
    const tarLang = reqParam.tarLang
    const textList = reqParam.textList
    const provider = reqParam.provider
    if (tarLang === undefined || textList === undefined) {
        return Response.json({
            "status": "error",
            "msg": "tarLang, textList are required"
        })
    }
    if (!checkProviderEnable(provider)) {
        return Response.json({
            "status": "error",
            "msg": "provider not enabled, set api key in env"
        })
    }


    const targetTextList = await translateWithCache({srcLang, tarLang, textList,provider});

    return Response.json({
        "status": "ok",
        "data": {
            targetList: targetTextList
        }
    })
}

const checkProviderEnable = (provider) => {
    if (provider === "tencent") {
        return process.env.TENCENTCLOUD_SECRET_ID && process.env.TENCENTCLOUD_SECRET_KEY
    } else if (provider === "deepl") {
        return !!process.env.DEEPL_AUTH_KEY
    }
    return false

}
