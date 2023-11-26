import {GetAllDictPrompts, SaveDictPromptsToNotion} from "@/lib/notion";

export async function GetAllCategoryWithDictPrompts(auth, databaseId) {
    // TODO 判断从那种数据库获取
    return GetAllDictPrompts(auth, databaseId)
}

export async function SaveDictPrompts({auth, databaseId}, {text, transText, dir}) {
    return SaveDictPromptsToNotion({auth,databaseId},{text, transText, dir})
}
