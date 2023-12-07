import fs from 'fs';
import path from 'path';
import {parseCategoryObjects} from "@/lib/tools";

import {kv} from "@vercel/kv";


export async function GET(req) {
    return kv.exists("localPromptDict").then((exists) => {
        if (!exists) {
            const filePath = path.join(process.cwd(), 'data', 'localPromptDict.json');
            const data = fs.readFileSync(filePath, 'utf8');
            const jsonData = JSON.parse(data)

            return kv.set("localPromptDict", JSON.stringify(jsonData)).then(() => {
                const result = parseCategoryObjects(jsonData)
                return Response.json({
                    "status": "ok",
                    "data": result,
                })
            })
        } else {
            return kv.get("localPromptDict").then((value) => {
                const jsonData = JSON.parse(value)
                const result = parseCategoryObjects(jsonData)
                return Response.json({
                    "status": "ok",
                    "data": result,
                })
            })
        }
    })
}


