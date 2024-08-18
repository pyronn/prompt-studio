import React from 'react';
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {rectSortingStrategy, SortableContext, sortableKeyboardCoordinates,} from '@dnd-kit/sortable';

import SortableButton from "@/components/editor/sortable-button";
import {usePromptEditor} from "@/components/editor/prompt-editor-context";


interface Item {
    id: string;

    [key: string]: any;  // 允许其他属性
}

interface SortableButtonContainerProps {

}

const SortableButtonContainer: React.FC<SortableButtonContainerProps> = ({}) => {

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const {state, dispatch} = usePromptEditor()
    const {textPrompts} = state

    const handleKeywordSortChange = (activeId: string, overId?: string) => {
        const oldIndex = textPrompts.findIndex(item => item.id === activeId);
        const newIndex = textPrompts.findIndex(item => item.id === overId);
        dispatch({type: 'REORDER_TEXT_PROMPTS', payload: {startIndex: oldIndex, endIndex: newIndex}})
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;
        if (active.id !== over?.id) {
            handleKeywordSortChange(active.id.toString(), over?.id.toString())
        }
    };

    const toggleKeyword = (index: number) => {
        const newPrompt = textPrompts[index]
        newPrompt.isActivated = !newPrompt.isActivated
        dispatch({
            payload: {index, newPrompt: newPrompt},
            type: 'UPDATE_TEXT_PROMPT'
        })
    }



    const isTextInDict = (word: string) => {
        return false
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={textPrompts.map(item => item.id)} strategy={rectSortingStrategy}>
                <div className="flex flex-wrap">
                    {textPrompts.map((item, index) => (
                        <SortableButton
                            key={item.id}
                            id={item.id}
                            item={item}
                            index={index}
                            // saveNewDictPromptDialog={saveNewDictPromptDialog}
                            toggleKeyword={toggleKeyword}
                            // activeKeywords={activeKeywords}
                            isTextInDict={isTextInDict}
                            // transKeywords={transKeywords}
                            // contextMenuItems={contextMenuItems}
                            // contextMenuClick={contextMenuClick}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default SortableButtonContainer;
