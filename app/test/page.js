"use client"
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

export default function Test() {
    const [items, setItems] = useState([]);
    const [nextId, setNextId] = useState(0);

    const onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const reorderedItems = reorder(
            items,
            result.source.index,
            result.destination.index
        );

        setItems(reorderedItems);
    };

    const addNewButton = () => {
        setItems([...items, { id: `button-${nextId}`, text: `Button ${nextId}` }]);
        setNextId(nextId + 1);
    };

    return (
        <div>
            <button onClick={addNewButton} className="mb-4 p-2 bg-blue-500 text-white">
                Add Button
            </button>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={{ backgroundColor: snapshot.isDraggingOver ? 'blue' : 'grey' }}
                        >
                            {items.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={provided.draggableProps.style}
                                        >
                                            <button className="p-2 m-2 bg-green-500 text-white">
                                                {item.text}
                                            </button>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};
