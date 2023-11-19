import {GetAllDictPrompts, SaveDictPromptsToNotion} from "@/app/lib/notion";

export async function GetAllCategoryWithDictPrompts(auth,databaseId) {
    // TODO 判断从那种数据库获取
    return GetAllDictPrompts(auth,databaseId)
}

export async function SaveDictPrompts({text, transText, dir}) {
    return SaveDictPromptsToNotion({text, transText, dir})
}
