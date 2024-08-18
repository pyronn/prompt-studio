import React from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {TextPromptPart} from "@/lib/prompt";
import {AiFillSave, AiOutlineSave} from "react-icons/ai";
import {Popover, PopoverContent, PopoverTrigger} from "@nextui-org/popover";
import {Menu, MenuItem} from "@nextui-org/menu";
import {DropdownItem} from "@nextui-org/dropdown";
import {BiSave} from "react-icons/bi";


interface SortableButtonProps {
    id: string;
    item: TextPromptPart;
    index: number;
    // saveNewDictPromptDialog: (item: Item) => void;
    toggleKeyword: (index: number) => void;
    isTextInDict: (word: string) => boolean;
    // transKeywords: { [key: string]: string };
    // contextMenuItems: MenuProps['items'];
    // contextMenuClick: (menuItem: any, word: string, index: number) => void;
}

const SortableButton: React.FC<SortableButtonProps> = ({
                                                           id,
                                                           item,
                                                           index,
                                                           toggleKeyword,
                                                           // activeKeywords,
                                                           isTextInDict,
                                                           // transKeywords,
                                                           // contextMenuClick
                                                       }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({id: id});

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const onContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        // 触发按钮点击事件来触发右键菜单
        setOpen(true)
    }

    // 关闭左键点击触发
    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setOpen(false)
        }
    }

    const [isOpen, setOpen] = React.useState(false);

    return (
        <Popover isOpen={isOpen} onOpenChange={handleOpenChange} key={id}>
            <PopoverTrigger>
                <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`relative`}>
                    {
                        !isTextInDict(item.text) && (
                            <button
                                className={`p-0.25 absolute bottom-0 right-0 rounded`}
                                // onClick={() => saveNewDictPromptDialog(item)}
                            >
                                <AiOutlineSave className={'w-4 rounded'}/>
                            </button>
                        )
                    }
                    <div
                        className={`inline-block rounded-lg cursor-pointer hover:cursor-pointer text-xs m-2`}
                        onClick={() => toggleKeyword(index)}
                        onContextMenu={onContextMenu}
                        key={id}
                    >
                        <div
                            className={`rounded-s-sm inline-block p-1 text-white ${item.isActivated ? "bg-green-600" : "bg-gray-300"}`}
                        >
                            {item.text}
                        </div>
                        <div
                            className={`${item.translation && item.translation !== '' ? "show" : "hidden"} rounded-e-sm inline-block p-1 text-white ${item.isActivated ? "bg-secondary" : "bg-gray-400"}`}
                        >
                            {item.translation && item.translation !== '' ? item.translation : ''}
                        </div>
                    </div>
                </div>

            </PopoverTrigger>
            <PopoverContent>
                <Menu>
                    <MenuItem>
                        复制
                    </MenuItem>
                    <DropdownItem>
                        删除
                    </DropdownItem>
                </Menu>
            </PopoverContent>
        </Popover>
    );
};

export default SortableButton;
