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
        <div className={`bg-gray-100`}>
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="bg-white shadow-lg rounded-lg p-8 m-4 w-full max-w-2xl">
                    <div className="flex flex-col">
                        <div className="overflow-hidden bg-gray-200 rounded-lg aspect-video mb-4">

                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-green-200 p-2 rounded">apple</div>
                            <div className="bg-green-300 p-2 rounded">forest</div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 mb-4">
                            <div className="bg-blue-200 p-2 rounded">big bad wolf</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-purple-200 p-2 rounded">Ikari Shinji from EVA</div>
                            <div className="bg-purple-300 p-2 rounded">unreal engine</div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 mt-4">
                            <div className="bg-red-200 p-2 rounded">cinematic lighting</div>
                        </div>
                        <div class="grid grid-cols-2 gap-4 mt-4">
                            <div class="bg-yellow-200 p-2 rounded">UHD</div>
                            <div class="bg-yellow-300 p-2 rounded">super detail</div>
                        </div>
                        <div class="grid grid-cols-1 gap-4 mt-4">
                            <div class="bg-indigo-200 p-2 rounded">--aspect 2:3</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
