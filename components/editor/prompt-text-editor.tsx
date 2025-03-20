'use client'
import {FC, useEffect, useState} from "react";
import {Textarea} from "@nextui-org/input";
import {Divider} from "@nextui-org/divider";
import {Button} from "@nextui-org/button";
import {usePromptEditor} from "@/components/editor/prompt-editor-context";
import {TextEditorSetting} from "@/components/editor/text-editor-setting";
import {translateText} from "@/lib/api/translate";

interface PromptTextEditorProps {
    className?: string;
}

export const PromptTextEditor: FC<PromptTextEditorProps> = ({className}) => {
    const {state, dispatch} = usePromptEditor();
    const {
        rawInput,
        textPrompts,
        systemParameters,
        negativePrompts,
        finalPrompt,
        autoTranslate,
        translateService,
    } = state;

    const [translateTimer, setTranslateTimer] = useState<NodeJS.Timeout>();

    // 翻译提示词
    const translateTextPrompts = async () => {
        const textList = textPrompts.map((prompt) => prompt.text);
        const resp = await translateText(textList, translateService).then((res) => res.json());
        console.log(resp)
        if (resp.status === "ok") {
            const targetList = resp.data.targetList;
            const newTextPrompts = textPrompts.map((prompt, index) => ({...prompt, translation: targetList[index]}));
            dispatch({type: 'SET_TEXT_PROMPT', payload: newTextPrompts});
        }
    }

    useEffect(() => {
        if (translateTimer) {
            clearTimeout(translateTimer);
        }
        if (autoTranslate) {
            const timer = setTimeout(() => {
                translateTextPrompts();
            }, 400);
            setTranslateTimer(timer);
        }
    }, [rawInput, autoTranslate, translateService]);

    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Prompt Text Editor</h2>
                <TextEditorSetting/>
            </div>

            <Divider/>

            <Textarea
                className="text-sm"
                maxRows={20}
                minRows={10}
                placeholder="请输入你的提示词"
                value={rawInput}
                onChange={(e) => dispatch({type: 'SET_RAW_INPUT', payload: e.target.value})}
            />

            <div className="bg-gray-700 p-3 rounded-xl text-xs text-gray-200 font-mono whitespace-pre-wrap">
                {finalPrompt}
            </div>

            <div className="bg-gray-100 p-3 rounded-xl">
                <h3 className="font-bold mb-2">系统参数</h3>
                {Object.entries(systemParameters).map(([key, value]) => (
                    <div key={key} className="text-sm">
                        <span className="font-semibold">{key}:</span> {value}
                    </div>
                ))}
            </div>

            <div className="bg-gray-100 p-3 rounded-xl">
                <h3 className="font-bold mb-2">负面提示词</h3>
                <div className="text-sm">{negativePrompts.join(', ')}</div>
            </div>

            <div className="flex justify-end">
                <Button color="primary">生成图片</Button>
            </div>
        </div>
    );
};
