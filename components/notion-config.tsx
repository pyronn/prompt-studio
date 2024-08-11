'use client'
import {Popover, PopoverContent, PopoverTrigger} from "@nextui-org/popover";
import {Button} from "@nextui-org/button";
import {SwitchProps} from "@nextui-org/switch";
import {FC, useEffect, useState} from "react";
import {Checkbox} from "@nextui-org/checkbox";
import {Input} from "@nextui-org/input";


export interface NotionConfigProps {
    className?: string;
    classNames?: SwitchProps["classNames"];
    props?: SwitchProps;
}

export const NotionConfig: FC<NotionConfigProps> = ({
                                                        className,
                                                        classNames,
                                                        props
                                                    }) => {
    const [isNotionEnable, setIsNotionEnable] = useState(false); // 是否启用notion词典
    const [notionToken, setNotionToken] = useState(""); // notion token
    const [notionDatabaseId, setNotionDatabaseId] = useState(""); // notion database id
    const [isOnlyNotion, setIsOnlyNotion] = useState(false); // 是否只使用notion词典

    const onEnableNotionDictChange = (isSelected:boolean) => {
        setIsNotionEnable(isSelected)
        localStorage.setItem("enableNotionDict", isSelected.toString())
    }

    const onNotionTokenChange = (value:string) => {
        setNotionToken(value)
        localStorage.setItem("notionToken", value)
    }

    function onOnlyNotionChange(isSelected:boolean) {
        setIsOnlyNotion(isSelected)
        localStorage.setItem("onlyNotionDict", isSelected.toString())
    }

    const onNotionDatabaseIdChange = (value:string) => {
        setNotionDatabaseId(value)
        localStorage.setItem("notionDatabaseId", value)
    }

    useEffect(() => {
        setIsNotionEnable(localStorage.getItem("enableNotionDict") === "true")
        setIsOnlyNotion(localStorage.getItem("onlyNotionDict") === "true")
        setNotionToken(localStorage.getItem("notionToken")??"")
        setNotionDatabaseId(localStorage.getItem("notionDatabaseId")??"")
    }, []);

    return (
        <Popover placement="bottom" className={className} {...props}>
            <PopoverTrigger>
                <Button variant={'flat'} color={'default'} size={'sm'}>Notion配置</Button>
            </PopoverTrigger>
            <PopoverContent>
                <div className={`flex flex-col space-y-2 p-2`}>
                    <div>
                        <Checkbox
                            checked={isNotionEnable}
                            onValueChange={onEnableNotionDictChange}>是否启用Notion</Checkbox>
                    </div>
                    <div>
                        <Checkbox
                            checked={isOnlyNotion}
                            onValueChange={onOnlyNotionChange}>是否只使用notion词典</Checkbox>
                    </div>
                    <div className={`p-1`}>
                        <label className={`label text-xs z-20`}>NotionToken:</label>
                        <Input type='text'
                               name={`notionToken`}
                               placeholder={`NotionToken`} value={notionToken}
                               onValueChange={onNotionTokenChange} disabled={!isNotionEnable}/>

                    </div>
                    <div className={`p-1`}>
                        <label className={`label text-xs`}>NotionDatabaseID:</label>
                        <Input type='text'
                               name={`notionDatabaseId`}
                               value={notionDatabaseId}
                               placeholder={`NotionDatabaseID`}
                               onValueChange={onNotionDatabaseIdChange} disabled={!isNotionEnable}/>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
