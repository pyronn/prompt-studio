import {parseCategoryObjects} from "@/lib/tools";
import {DictPrompt} from "./types"

const {Client} = require("@notionhq/client")


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
                "equals": "提示词典"
            }
        },
    })
    const promptsDict = []

    const data = response.results
    data.map((item) => {
        const id = item.id
        const text = parsePropertyValue(item.properties, "text")
        const transText = parsePropertyValue(item.properties, "trans_text")
        const category = parsePropertyValue(item.properties, "category")
        const dir = parsePropertyValue(item.properties, "dir")
        const p = new DictPrompt(id, text, transText, category, dir);
        promptsDict.push(p)
    })
    const categoryPrompts = parseCategoryObjects(promptsDict)
    // TODO close notion client
    return Response.json({
        "status": "ok",
        "data": categoryPrompts
    })
}

function parsePropertyValue(properties, propertyName) {
    if (propertyName in properties) {
        const property = properties[propertyName];
        switch (property.type) {
            case 'title':
                if (property.title.length === 0) {
                    return "";
                }
                return property.title[0].plain_text;
            case 'select':
                if (property.select === null || property.select === undefined) {
                    return "其他"
                }
                return property.select.name;
            case 'multi_select':
                return property[propertyName].map((option) => option.name);
            case 'rich_text':
                if (property.rich_text.length === 0) {
                    return "";
                }
                return property.rich_text[0].plain_text;
            case 'files':
                if (property.files.length === 0) {
                    return "";
                }
                return property.files[0].external.url;
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
            trans_text: {
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
                    name: "提示词典"
                }
            }
        }
    })

    return Response.json({
        "status": "ok"
    })
}


export async function SavePromptToNotion({auth, databaseId}, {title, desc, category, rawPrompt, sampleImgLink}) {
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
            title: {
                type: "title",
                title: [
                    {
                        type: "text",
                        text: {
                            content: title ? title : ""
                        }
                    }
                ],
            },
            desc: {
                type: "rich_text",
                rich_text: [
                    {
                        type: "text",
                        text: {
                            content: desc ? desc : ""
                        }
                    }
                ],
            },
            category: {
                type: "select",
                select: {
                    name: category ? category : "其他"
                }
            },
            raw_prompt: {
                type: "rich_text",
                rich_text: [
                    {
                        type: "text",
                        text: {
                            content: rawPrompt
                        }
                    }
                ],
            },
            sample_image: {
                type: "files",
                files: [
                    {
                        name: "sample",
                        type: "external",
                        external: {
                            url: sampleImgLink ? sampleImgLink : ""
                        }
                    }
                ]
            },
            type: {
                type: "select",
                select: {
                    name: "提示词库"
                }
            }
        },
        children: [
            {
                object: "block",
                type: "image",
                image: {
                    type: "external",
                    external: {
                        url: sampleImgLink ? sampleImgLink : ""
                    }
                },
            },

        ]
    })
    return Response.json({
        "status": "ok"
    })
}

export async function GetPromptsList({auth, databaseId}) {
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
        database_id: databaseId,
        filter: {
            property: "type",
            select: {
                "equals": "提示词库"
            }
        },
    })
    const data = response.results;
    const results = []
    data.map(item => {
        const id = item.id
        const title = parsePropertyValue(item.properties, "text")
        const desc = parsePropertyValue(item.properties, "desc")
        const category = parsePropertyValue(item.properties, "category")
        const rawPrompt = parsePropertyValue(item.properties, "raw_prompt")
        const sampleImage = parsePropertyValue(item.properties, "sample_image")
        results.push({
            id, title, desc, category, rawPrompt, sampleImage
        })
    })
    return Response.json({
        "status": "ok",
        "data": results
    })
}