import { translateWithCache } from "@/lib/translate";
import { NextRequest, NextResponse } from "next/server";

interface RequestParams {
    srcLang?: string;
    tarLang: string;
    textList: string[];
    provider: "tencent" | "deepl";
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    const reqParam: RequestParams = await req.json();
    const srcLang = reqParam.srcLang ?? "auto";
    const { tarLang, textList, provider } = reqParam;

    if (!tarLang || !textList || !provider) {
        return NextResponse.json({
            status: "error",
            msg: "tarLang, textList, provider are required"
        });
    }

    if (textList.length === 0) {
        return NextResponse.json({
            status: "error",
            msg: "textList is empty"
        });
    }

    if (!checkProviderEnable(provider)) {
        return NextResponse.json({
            status: "error",
            msg: "provider not enabled, set api key in env"
        });
    }

    const targetTextList = await translateWithCache({ srcLang, tarLang, textList, provider });

    return NextResponse.json({
        status: "ok",
        data: {
            targetList: targetTextList
        }
    });
}

const checkProviderEnable = (provider: "tencent" | "deepl"): boolean => {
    if (provider === "tencent") {
        return !!process.env.TENCENTCLOUD_SECRET_ID && !!process.env.TENCENTCLOUD_SECRET_KEY;
    } else if (provider === "deepl") {
        return !!process.env.DEEPL_AUTH_KEY;
    }
    return false;
};
