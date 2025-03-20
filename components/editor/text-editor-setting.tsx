'use client'
import {FC, useState} from "react";
import {Switch} from "@nextui-org/switch";
import {Select, SelectItem} from "@nextui-org/select";
import {TranslateSrvOptions} from "@/lib/config";
import {Button} from "@nextui-org/button";
import {AiFillSetting} from "react-icons/ai";
import {usePromptEditor} from "@/components/editor/prompt-editor-context";
import {Key} from "@react-types/shared";
import {SharedSelection} from "@nextui-org/system";
import {Popover, PopoverContent, PopoverTrigger} from "@nextui-org/popover";

export const TextEditorSetting: FC = () => {
    const {state, dispatch} = usePromptEditor();
    const {autoTranslate, addPrefix, translateService} = state;
    const [selectedTranslateService, setSelectedTranslateService] = useState<Set<Key>>(new Set([translateService]));

    const handleAutoTranslate = (isSelected: boolean) => {
        dispatch({type: 'UPDATE_SETTING', payload: {autoTranslate: isSelected}});
    }
    const handleAddPrefix = (isSelected: boolean) => {
        dispatch({type: 'UPDATE_SETTING', payload: {addPrefix: isSelected}});
    }

    const handleTranslateServiceChange = (keys: SharedSelection) => {
        const selected = keys.currentKey ? keys.currentKey : 'tencent';
        setSelectedTranslateService(new Set([selected]));
        dispatch({type: 'UPDATE_SETTING', payload: {translateService: selected}});
    }
    return (
        <Popover placement={"bottom"} className={'flex gap-x-1'}
        >
            <PopoverTrigger>
                <Button isIconOnly variant="flat" size="sm">
                    <AiFillSetting/>
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <div className={'flex-col gap-y-1'}>
                    <Switch className={'block'} isSelected={addPrefix} onValueChange={handleAddPrefix}
                            size={"sm"}>添加指令前缀</Switch>
                    <Switch className={'block'} isSelected={autoTranslate}
                            onValueChange={handleAutoTranslate} size={"sm"}>自动翻译</Switch>
                    <Select aria-label={"translate service"} size={"sm"} selectedKeys={selectedTranslateService}
                            onSelectionChange={handleTranslateServiceChange}>
                        {TranslateSrvOptions.map((option) => (
                            <SelectItem key={option.value}>{option.label}</SelectItem>
                        ))}
                    </Select>
                </div>
            </PopoverContent>
        </Popover>
    );
}
