import {GetAllPromptsDict} from "@/lib/notion";

export async function GET(){
    const resp = await GetAllPromptsDict()
    const titles = []
    resp.map((item)=>{
        titles.push(item.properties)
    })
    console.log(resp)
    return Response.json(resp)
}