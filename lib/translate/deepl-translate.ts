const DEEPL_API_HOST: string = process.env.DEEPL_API_HOST ? process.env.DEEPL_API_HOST : "https://api-free.deepl.com/";

const DEEPL_API_URL: string = "/v2/translate";

interface TranslationResponse {
    translations: { text: string, "detected_source_language": string }[];
}

export const deeplTranslate = async (tarLang: string, textList: string[]): Promise<string[]> => {
    const url = new URL(DEEPL_API_URL, DEEPL_API_HOST);
    const resp = await fetch(url.toString(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "DeepL-Auth-Key " + process.env.DEEPL_AUTH_KEY
        },
        body: JSON.stringify({
            "text": textList,
            "target_lang": tarLang
        })
    });
    const respJson: TranslationResponse = await resp.json();
    console.log(respJson.translations)
    return respJson.translations.map((item: { text: string }) => item.text);
}
