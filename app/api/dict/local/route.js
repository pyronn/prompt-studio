import fs from 'fs';
import path from 'path';
import {parseCategoryObjects} from "@/lib/tools";
import {MemoryCache} from "@/lib/types";

const cache = new MemoryCache()

export async function GET(req) {
    if (cache.has("localPromptDict")) {
        const result = cache.get("localPromptDict")
        return Response.json({
            "status": "ok",
            "data": result,
        })
    } else {
        const filePath = path.join(process.cwd(), 'data', 'localPromptDict.json');
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data)
        const result = parseCategoryObjects(jsonData)
        cache.set("localPromptDict", result)
        return Response.json({
            "status": "ok",
            "data": result,
        })
    }
}



