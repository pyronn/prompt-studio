'use client'
import {FC} from "react";
import {usePromptEditor} from "@/components/editor/prompt-editor-context";
import ImagePrompt from "@/components/editor/image-prompt";
import SortableButtonContainer from "@/components/editor/sortable-button-container";
import {Divider} from "@nextui-org/divider";

interface VisualPromptProps {
    className?: string;
}

export const VisualPrompt: FC<VisualPromptProps> = ({className}) => {
    const {state, dispatch} = usePromptEditor();
    const {textPrompts, imagePrompts} = state;

    // const onDragEnd = (result) => {
    //     if (!result.destination) return;
    //     dispatch({
    //         type: 'REORDER_TEXT_PROMPTS',
    //         payload: { startIndex: result.source.index, endIndex: result.destination.index }
    //     });
    // };

    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            <h2 className="text-xl font-bold">Visual Prompt</h2>

            <div>
                <div className={'flex flex-col gap-y-2'}>
                    <h3 className="text-lg font-semibold mb-2">Image Prompts</h3>
                    <Divider/>
                    {imagePrompts.map((url, index) => (
                            <ImagePrompt imageUrl={url} type={'image'} onDelete={() => {
                            }} onTypeChange={() => {
                            }}/>
                        )
                    )}
                </div>
            </div>

            <div className={'flex flex-col gap-y-2'}>
                <h3>Text Prompt</h3>
                <Divider/>
                <SortableButtonContainer/>
            </div>

        </div>
    );
};
