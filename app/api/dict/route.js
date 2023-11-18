import {GetAllCategoryWithDictPrompts, SaveDictPrompts} from "@/app/lib/store";

/**
 * getAllCategory And keyword
 * @returns {Promise<Response>}
 * @constructor
 */
export async function GET() {
    const data = await GetAllCategoryWithDictPrompts()
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
        "status":"ok"
    })
}