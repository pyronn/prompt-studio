import React, {useState} from 'react';
import {Button, Card, Image} from "@nextui-org/react";
import {AiFillContacts, AiOutlineClose, AiOutlineFileImage, AiOutlineLink} from "react-icons/ai";
import {Tab, Tabs} from "@nextui-org/tabs";
import {CardFooter, CardHeader} from "@nextui-org/card";

type ImagePromptType = 'image' | 'mask' | 'reference';

interface ImagePromptProps {
    imageUrl: string;
    type: ImagePromptType;
    onDelete: () => void;
    onTypeChange: (newType: ImagePromptType) => void;
}

export default function ImagePrompt({imageUrl, type, onDelete, onTypeChange}: ImagePromptProps) {
    const [isHovered, setIsHovered] = useState(false);

    const typeButtons = [
        {type: 'image' as ImagePromptType, icon: <AiOutlineFileImage className="w-4 h-4"/>},
        {type: 'mask' as ImagePromptType, icon: <AiFillContacts className="w-4 h-4"/>},
        {type: 'reference' as ImagePromptType, icon: <AiOutlineLink className="w-4 h-4"/>},
    ];

    return (
        <Card
            isFooterBlurred
            isHoverable
            isBlurred
            className="w-24 h-24 group relative overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Delete button */}

            <Image
                removeWrapper
                alt="Image prompt"
                className="z-0 w-full h-full object-cover transition-transform duration-300"
                src={imageUrl}
            />
            <CardHeader>
                <Button
                    isIconOnly={true}
                    className={`p-0 w-6 h-6 min-w-6 absolute bg-gray-200 top-0.5 right-0.5 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <AiOutlineClose className="w-4 h-4"/>
                </Button>
            </CardHeader>

            {/* Type selection buttons */}
            <Tabs
                className={`absolute bottom-1 right-1 flex transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                classNames={
                    {
                        tabList: "p-1 gap-x-1/2",
                        tab: "p-2 m-0 h-5 w-5"
                    }
                } size={"sm"} aria-label="Tabs sizes">
                <Tab key="photos" title={<AiOutlineFileImage className={'w-4 h-4'}/>}/>
                <Tab key="music" title={<AiOutlineFileImage className={'w-4 h-4'}/>}/>
                <Tab key="videos" title={<AiOutlineFileImage className={'w-4 h-4'}/>}/>
            </Tabs>
            {/*<CardFooter>*/}
            {/*    */}
            {/*</CardFooter>*/}

            {/*<ButtonGroup size={'sm'}*/}
            {/*             className={`absolute bottom-1 right-1 flex transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>*/}
            {/*    {typeButtons.map((btn) => (*/}
            {/*        <Button*/}
            {/*            key={btn.type}*/}
            {/*            isIconOnly*/}
            {/*            size="sm"*/}
            {/*            variant="flat"*/}
            {/*            className={` bg-white/10 backdrop-blur-md ${type === btn.type ? 'bg-white/30' : ''}`}*/}
            {/*            onClick={() => onTypeChange(btn.type)}*/}
            {/*        >*/}
            {/*            {btn.icon}*/}
            {/*        </Button>*/}
            {/*    ))}*/}
            {/*</ButtonGroup>*/}
        </Card>
    );
}
