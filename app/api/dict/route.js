import {GetAllCategoryWithDictPrompts, SaveDictPrompts} from "@/app/lib/store";
import {headers} from "next/headers";

/**
 * getAllCategory And keyword
 * @returns {Promise<Response>}
 * @constructor
 */
export async function GET(req) {
    const headers = req.headers

    const auth = headers.get("authorization")
    const databaseID = headers.get("notion-database-id")
    const data = await GetAllCategoryWithDictPrompts(auth, databaseID)
    return Response.json({
        "status": "ok",
        "data": data
    })
}

export async function POST(req) {
    const reqBody = await req.json()
    const result = await SaveDictPrompts(reqBody)
    console.log(result);
    return Response.json({
        "status": "ok"
    })
}
