'use client'
import { FC } from "react";
import { Textarea } from "@nextui-org/input";
import { Divider } from "@nextui-org/divider";
import { Button } from "@nextui-org/button";
import { AiFillSetting } from "react-icons/ai";
import { usePromptEditor } from "@/components/editor/prompt-editor-context";
import {Popover, PopoverContent, PopoverTrigger} from "@nextui-org/popover";
import {Switch} from "@nextui-org/switch";
import {Tooltip} from "@nextui-org/tooltip";
import {Select} from "@nextui-org/select";

interface PromptTextEditorProps {
    className?: string;
}

export const PromptTextEditor: FC<PromptTextEditorProps> = ({ className }) => {
    const { state, dispatch } = usePromptEditor();
    const { rawInput, systemParameters, negativePrompts,finalPrompt } = state;

    const translateTextPrompts = () => {
        // todo translate text prompts
    }

    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Prompt Text Editor</h2>
                <Tooltip
                    content={(
                        <div>
                            <Switch size={"sm"}>添加指令前缀</Switch>
                            <Switch size={"sm"}>自动翻译</Switch>
                            {/*<Select size={'sm'} label={"翻译服务"}>*/}
                            {/*    <option key={'ddd'}>ddd</option>*/}
                            {/*</Select>*/}
                        </div>
                    )}
                >
                    <Button isIconOnly variant="flat" size="sm">
                        <AiFillSetting />
                    </Button>
                </Tooltip>

            </div>

            <Divider />

            <Textarea
                className="text-sm"
                maxRows={20}
                minRows={10}
                placeholder="请输入你的提示词"
                value={rawInput}
                onChange={(e) => dispatch({ type: 'SET_RAW_INPUT', payload: e.target.value })}
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
