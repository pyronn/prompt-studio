export const translateText = async (textList: string[], provider: string, tarLang = "zh", srcLang?: string) => {
    return fetch('/api/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            srcLang,
            tarLang,
            textList,
            provider
        })
    })
}
