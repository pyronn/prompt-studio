import {GetAllDictPrompts, SaveDictPromptsToNotion} from "@/app/lib/notion";

export async function GetAllCategoryWithDictPrompts() {
    // TODO 判断从那种数据库获取
    return GetAllDictPrompts()
}

export async function SaveDictPrompts({text, transText, dir}) {
    return SaveDictPromptsToNotion({text, transText, dir})
}
