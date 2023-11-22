import React from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Save} from "lucide-react";

const SortableButton = ({id, item, index, saveNewDictPromptDialog, toggleKeyword, activeKeywords}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({id: id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => {
            toggleKeyword(index)
        }} className={`indicator p-2`}>

            <div className="indicator-item indicator-bottom cursor-pointer hover:cursor-pointer"
                 onClick={() => (saveNewDictPromptDialog(item))}>
                <Save size={20} color="#d567ad" strokeWidth={1.25} absoluteStrokeWidth />
            </div>
            <div
                className={`inline-block rounded-lg cursor-pointer hover:cursor-pointer text-xs`}
                onClick={(e) => toggleKeyword(index)} key={index}>
                <div
                    className={`rounded-s-sm inline-block p-1 text-white ${activeKeywords[index] === 1 ? "bg-green-400" : "bg-gray-300"}`}>
                    {item.word}
                </div>
                <div
                    className={`${item.transText === undefined || item.transText === "" ? "hidden" : "show"} rounded-e-sm inline-block p-1 text-white ${activeKeywords[index] === 1 ? "bg-blue-400" : "bg-gray-400"}`}>
                    {item.transText}
                </div>
            </div>
        </div>
    );
};

export default SortableButton;
