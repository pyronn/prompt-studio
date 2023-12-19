import {
    GetAllDictPrompts,
    GetPromptsList,
    SaveDictPromptsToNotion,
    SavePromptToNotion
} from "@/lib/notion";

export async function GetAllCategoryWithDictPrompts(auth, databaseId) {
    // TODO 判断从那种数据库获取
    return GetAllDictPrompts(auth, databaseId)
}

export async function SaveDictPrompts({auth, databaseId}, {text, transText, dir}) {
    return SaveDictPromptsToNotion({auth,databaseId},{text, transText, dir})
}

export async function SavePrompt({auth,databaseId},{title,desc,category,rawPrompt,sampleImgLink}){
    return SavePromptToNotion({auth,databaseId},{title,desc,category,rawPrompt,sampleImgLink})
}

export async function UpdatePrompt({auth, databaseId}, {id, title, desc, category, rawPrompt, sampleImgLink}) {
    return SavePromptToNotion({auth,databaseId},{id, title, desc, category, rawPrompt, sampleImgLink})
}

export async function GetPrompts({auth,databaseId}){
    return GetPromptsList({auth,databaseId})
}