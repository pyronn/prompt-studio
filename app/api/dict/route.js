import {GetAllCategoryWithDictPrompts, SaveDictPrompts} from "@/lib/store";

/**
 * getAllCategory And keyword
 * @returns {Promise<Response>}
 * @constructor
 */
export async function GET(req) {
    const headers = req.headers

    const auth = headers.get("authorization")
    const databaseID = headers.get("notion-database-id")
    return GetAllCategoryWithDictPrompts(auth, databaseID)
}

export async function POST(req) {
    const headers = req.headers
    const auth = headers.get("authorization")
    const databaseId = headers.get("notion-database-id")
    const reqBody = await req.json()
    return SaveDictPrompts({auth, databaseId}, {...reqBody})
}
