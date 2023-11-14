import prisma from "@/lib/prisma";

/**
 * getAllCategory And keyword
 * @returns {Promise<Response>}
 * @constructor
 */
export async function GET() {
    const data = await prisma.Category.findMany({
        include: {
            keywords: true
        }
    })
    return Response.json({
        "status": "ok",
        "data": data
    })
}

export async function PUT(req) {

}