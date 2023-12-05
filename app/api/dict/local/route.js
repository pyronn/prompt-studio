import fs from 'fs';
import path from 'path';
import {parseCategoryObjects} from "@/lib/tools";

export async function GET(req) {
    const filePath = path.join(process.cwd(), 'data', 'localPromptDict.json');

    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(data)


    const result = parseCategoryObjects(jsonData)

    // 读取 JSON 文件
    return Response.json({
        "status":"ok",
        "data":result,
    })

}


