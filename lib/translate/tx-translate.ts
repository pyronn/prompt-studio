import { tmt } from "tencentcloud-sdk-nodejs-tmt/tencentcloud/services/";
import {
    TextTranslateBatchResponse,
    TextTranslateResponse
} from "tencentcloud-sdk-nodejs-tmt/tencentcloud/services/tmt/v20180321/tmt_models";

const TmtClient = tmt.v20180321.Client;

const client = new TmtClient({
    credential: {
        secretId: process.env.TENCENTCLOUD_SECRET_ID as string,
        secretKey: process.env.TENCENTCLOUD_SECRET_KEY as string,
    },
    region: "ap-shanghai",
    profile: {
        signMethod: "TC3-HMAC-SHA256",
        httpProfile: {
            reqMethod: "POST",
            reqTimeout: 30,
        },
    },
});


export const translateText = async (srcLang: string, tarLang: string, textList: string[]): Promise<string[]> => {
    const translatedWords: string[] = [];
    if (textList.length > 1) {
        const resp: TextTranslateBatchResponse = await client.TextTranslateBatch({
            Source: srcLang,
            Target: tarLang,
            ProjectId: 0,
            SourceTextList: textList,
        });
        translatedWords.push(...resp.TargetTextList??[]);
    } else if (textList.length === 1) {
        const resp: TextTranslateResponse = await client.TextTranslate({
            Source: srcLang,
            Target: tarLang,
            ProjectId: 0,
            SourceText: textList[0],
        });
        translatedWords.push(resp.TargetText??"");
    }
    return translatedWords;
};
