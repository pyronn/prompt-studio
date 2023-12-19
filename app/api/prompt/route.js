import {GetPrompts, SavePrompt, UpdatePrompt} from "@/lib/store";

export async function GET(req) {
    const headers = req.headers
    const auth = headers.get("authorization")
    const databaseId = headers.get("notion-database-id")
    const resp = await GetPrompts({auth, databaseId})
    return resp
}

export async function POST(req) {
    const headers = req.headers
    const auth = headers.get("authorization")
    const databaseId = headers.get("notion-database-id")
    const reqBody = await req.json()
    const resp = await SavePrompt({auth, databaseId}, {...reqBody})
    return resp
}

export async function PATCH(req) {
    const headers = req.headers
    const auth = headers.get("authorization")
    const databaseId = headers.get("notion-database-id")
    const reqBody = await req.json()
    const resp = await UpdatePrompt({auth, databaseId}, {...reqBody})
    return resp
}