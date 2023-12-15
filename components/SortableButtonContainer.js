import React from 'react';
import {closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors} from '@dnd-kit/core';
import {rectSortingStrategy, SortableContext, sortableKeyboardCoordinates,} from '@dnd-kit/sortable';
import SortableButton from './SortableButton';

const SortableButtonContainer = ({
                                     items,
                                     onItemsChange,
                                     saveNewDictPromptDialog,
                                     toggleKeyword,
                                     activeKeywords,
                                     isTextInDict
                                 }) => {

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

    const handleDragEnd = (event) => {
        const {active, over} = event;
        if (active.id !== over.id) {
            const oldIndex = items.findIndex(item => item.id === active.id);
            const newIndex = items.findIndex(item => item.id === over.id);
            onItemsChange(new Array(...arrayMove(items, oldIndex, newIndex)), new Array(...arrayMove(activeKeywords, oldIndex, newIndex)))
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
                <div className="flex flex-wrap">
                    {items.map((item, index) => (
                        <SortableButton key={item.id} id={item.id} item={item} index={index}
                                        saveNewDictPromptDialog={saveNewDictPromptDialog} toggleKeyword={toggleKeyword}
                                        activeKeywords={activeKeywords} isTextInDict={isTextInDict}/>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default SortableButtonContainer;

// 辅助函数：用于移动数组中的元素
function arrayMove(array, from, to) {
    const startIndex = to < 0 ? array.length + to : to;
    const item = array.splice(from, 1)[0];
    array.splice(startIndex, 0, item);
    return array;
}
