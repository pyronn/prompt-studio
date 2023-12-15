import React from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Save} from "lucide-react";

const SortableButton = ({
                            id,
                            item,
                            index,
                            saveNewDictPromptDialog,
                            toggleKeyword,
                            activeKeywords,
                            isTextInDict,
                            transKeywords
                        }) => {
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
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`relative`}>
            {
                isTextInDict(item.word) ? "" : <button className={`p-0.25 absolute bottom-0 right-0 rounded`}
                                                       onClick={() => (saveNewDictPromptDialog(item))}>
                    <Save size={15} color="#ababab" className={`text-black`} strokeWidth={1.25} absoluteStrokeWidth/>
                </button>
            }

            <div
                className={`inline-block rounded-lg cursor-pointer hover:cursor-pointer text-xs m-2`}
                onClick={(e) => toggleKeyword(index)} key={id}>
                <div
                    className={`rounded-s-sm inline-block p-1 text-white ${activeKeywords[index] === 1 ? "bg-primary" : "bg-gray-300"}`}>
                    {item.word}
                </div>
                <div
                    className={`${transKeywords[item.word.toLowerCase()] === undefined || transKeywords[item.word.toLowerCase()] === "" ? "hidden" : "show"} rounded-e-sm inline-block p-1 text-white ${activeKeywords[index] === 1 ? "bg-secondary" : "bg-gray-400"}`}>
                    {transKeywords[item.word.toLowerCase()] === undefined || transKeywords[item.word.toLowerCase()] === "" ? "" : transKeywords[item.word.toLowerCase()]}
                </div>
            </div>
        </div>
    );
};

export default SortableButton;
