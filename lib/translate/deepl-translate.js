const DEEPL_API_HOST = process.env.DEEPL_API_HOST ? process.env.DEEPL_API_HOST : "https://api-free.deepl.com/";

const DEEPL_API_URL = "/v2/translate";

export const deeplTranslate = async (tarLang, textList) => {
    const url = new URL(DEEPL_API_URL, DEEPL_API_HOST)
    const resp = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "DeepL-Auth-Key " + process.env.DEEPL_AUTH_KEY
        },
        body: JSON.stringify({
            "text": textList,
            "target_lang": tarLang
        })
    })
    const respJson = await resp.json()
    return respJson.translations.map(t => t.text)
}
