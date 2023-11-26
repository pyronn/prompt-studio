import {parseCategoryObjects} from "@/lib/tools";
import {DictPrompt} from "./types"

const {Client} = require("@notionhq/client")


const databaseId = process.env.NOTION_DATABASE_ID

export async function GetAllDictPrompts(auth, databaseID) {
    let token = ""
    if (auth.startsWith("Bearer ")) {
        token = auth.substring(7)
    } else {
        token = auth
    }
    const notion = new Client({
        auth: token
    })

    const response = await notion.databases.query({
        database_id: databaseID,
        filter: {
            property: "type",
            select: {
                "equals": "提示词库"
            }
        },
    })
    const promptsDict = []

    const data = response.results
    data.map((item) => {
        const id = item.id
        const text = parsePropertyValue(item.properties, "text")
        const transText = parsePropertyValue(item.properties, "transText")
        const category = parsePropertyValue(item.properties, "category")
        const dir = parsePropertyValue(item.properties, "dir")
        const p = new DictPrompt(id, text, transText, category, dir);
        promptsDict.push(p)
    })
    const categoryPrompts = parseCategoryObjects(promptsDict)
    // TODO close notion client
    return categoryPrompts
}

function parsePropertyValue(properties, propertyName) {
    if (propertyName in properties) {
        const property = properties[propertyName];
        switch (property.type) {
            case 'title':
                return property.title[0].plain_text;
            case 'select':
                return property.select.name;
            case 'multi_select':
                return property[propertyName].map((option) => option.name);
            case 'rich_text':
                return property.rich_text[0].plain_text;
            default:
                return undefined;
        }
    }

    return undefined;
}


export async function SaveDictPromptsToNotion({auth, databaseId}, {text, transText, dir}) {
    const dirs = dir.split("/")
    let token = ""
    if (auth.startsWith("Bearer ")) {
        token = auth.substring(7)
    } else {
        token = auth
    }
    const notion = new Client({
        auth: token
    })
    const resp = notion.pages.create({
        parent: {
            "type": "database_id",
            "database_id": databaseId
        },
        properties: {
            text: {
                type: "title",
                title: [
                    {
                        type: "text",
                        text: {
                            content: text
                        }
                    }
                ],
            },
            transText: {
                type: "rich_text",
                rich_text: [
                    {
                        type: "text",
                        text: {
                            content: transText
                        }
                    }
                ],
            },
            category: {
                type: "select",
                select: {
                    name: dirs[0]
                }
            },
            dir: {
                type: "select",
                select: {
                    name: dir
                }
            },
            type: {
                type: "select",
                select: {
                    name: "提示词库"
                }
            }
        }
    })

    console.log(resp);


    return Response.json({
        "status": "ok"
    })
}


export async function SavePromptToNotion({auth,databaseId},{title,desc,rawPrompt,category,imageLink}){
    // TODO
}
