'use client'
import {FC, useEffect, useState} from "react";
import {Textarea} from "@nextui-org/input";
import {parseMidjourneyPrompt, TextPromptPart} from "@/lib/prompt";
import {Divider} from "@nextui-org/divider";
import {Button} from "@nextui-org/button";
import {AiFillSetting} from "react-icons/ai";


interface PromptTextEditorProps {
    className?: string;
}

export const PromptTextEditor: FC<PromptTextEditorProps> = ({className}: {
    className?: string;
}) => {
    const [textPrompts, setTextPrompts] = useState<TextPromptPart[]>([])
    const [imagePrompts, setImagePrompts] = useState<string[]>([])
    const [systemParameters, setSystemParameters] = useState<Record<string, string>>({})
    const [negativePrompts, setNegativePrompts] = useState<string[]>([])

    // 输入的原始提示词
    const [inputPrompt, setInputPrompt] = useState('')
    useEffect(() => {
        const result = parseMidjourneyPrompt(inputPrompt)
        // const result2 = parseChatMidJourneyPrompt(inputPrompt)
        console.log(result)
        // console.log(result2)
    }, [inputPrompt]);

    return (
        <div className={'w-2/5 flex gap-y-2 flex-col'}>
            <div className={'flex'}>
                <h2 className={""}>prompt text editor</h2>
                <Button className={""} size={"sm"} variant={'flat'} isIconOnly={true}><AiFillSetting/></Button>
            </div>

            <Divider />
            <div className={'flex flex-col gap-2'}>
                {/*文本提示词输入和展示区*/}
                <Textarea className={'text-xs'} maxRows={20} minRows={10} placeholder={"请输入你的提示词"}
                          value={inputPrompt} onValueChange={(val) => setInputPrompt(val)}/>
                <div
                    className={"overflow-wrap break-words w-full text-xs text-gray-200 font-mono bg-gray-700 p-1.5 rounded-xl bordered"}>
                    {inputPrompt}
                </div>

            </div>
            <div>
                {/*系统参数*/}
            </div>
            <div>
                {/*其他设置*/}
            </div>
            <div>
                {/*    按钮*/}
            </div>
        </div>
    )
}
