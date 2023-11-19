const {Client} = require("@notionhq/client")
import {DictPrompt} from "./types"

// Initializing a client
const notion = new Client({
    auth: process.env.NOTION_TOKEN
})

const databaseId = process.env.NOTION_DATABASE_ID

export async function GetAllDictPrompts(auth,databaseID){
    let token = ""
    if (auth.startsWith("Bearer ")){
        token = auth.substring(7)
    }else{
        token = auth
    }
    const notion = new Client({
        auth: token
    })
    console.log(token)
    console.log(databaseID)

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

function parseCategoryObjects(categoryObjects) {
    // 建立一个空的根分类对象的数组
    const rootCategories = [];

    // 遍历每个对象
    categoryObjects.forEach((categoryObject) => {
        const {text, dir} = categoryObject;
        const categories = dir.split('/');

        // 在根分类对象数组中查找或创建匹配的分类树
        let currentCategory = null;
        let parentCategory = null;

        for (let i = 0; i < categories.length; i++) {
            const categoryName = categories[i];

            // 在当前分类的子分类中查找匹配的分类
            const matchingCategory = currentCategory
                ? currentCategory.children.find((child) => child.name === categoryName)
                : rootCategories.find((rootCategory) => rootCategory.name === categoryName);

            if (matchingCategory) {
                // 如果分类已存在，将其设置为当前分类，并继续到下一个子分类
                currentCategory = matchingCategory;
            } else {
                // 如果分类不存在，创建一个新的分类，将其添加到当前分类的子分类列表中，并设置为当前分类
                const newCategory = {
                    name: categoryName,
                    children: [],
                    texts: [],
                };

                if (currentCategory) {
                    currentCategory.children.push(newCategory);
                } else {
                    rootCategories.push(newCategory);
                }

                currentCategory = newCategory;
            }

            parentCategory = currentCategory;
        }

        // 将文本添加到叶子分类节点的文本列表中
        if (parentCategory) {
            parentCategory.texts.push(categoryObject);
        }
    });

    return rootCategories;
}


export async function SaveDictPromptsToNotion({text, transText, dir}) {
    const dirs = dir.split("/")
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
