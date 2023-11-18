import {GetAllDictPrompts, SaveDictPrompts} from "@/app/lib/notion";

export async function GET() {
    const resp = await GetAllDictPrompts()
    const titles = []
    resp.map((item) => {
        titles.push(item.properties)
    })
    console.log(resp)
    return Response.json(resp)
}

export async function POST() {
    const resp = await SaveDictPrompts({text: "test text", textTrans: "test texxt trans", dir: "dir/test"})
    return resp
}