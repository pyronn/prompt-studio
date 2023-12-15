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
                                     isTextInDict,
                                     transKeywords,
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
            onItemsChange(active.id, over.id)
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
                <div className="flex flex-wrap">
                    {items.map((item, index) => (
                        <SortableButton key={item.id} id={item.id} item={item} index={index}
                                        saveNewDictPromptDialog={saveNewDictPromptDialog} toggleKeyword={toggleKeyword}
                                        activeKeywords={activeKeywords} isTextInDict={isTextInDict} transKeywords={transKeywords}/>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default SortableButtonContainer;

