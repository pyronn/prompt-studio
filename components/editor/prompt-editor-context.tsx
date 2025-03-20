'use client'
import React, {createContext, ReactNode, useContext, useReducer} from 'react';
import {formatParsedPrompt, parseMidjourneyPrompt, TextPromptPart} from '@/lib/prompt';

interface PromptState {
    textPrompts: TextPromptPart[];
    imagePrompts: string[];
    systemParameters: Record<string, string>;
    negativePrompts: string[];
    rawInput: string;
    finalPrompt: string;
}

interface EditorSetting {
    index: number;
    name: string;
    autoTranslate: boolean;
    addPrefix: boolean;
    translateService: string;
}

interface EditorSettingInput {
    index?: number;
    name?: string;
    autoTranslate?: boolean;
    addPrefix?: boolean;
    translateService?: string;
}

type EditorState = PromptState & EditorSetting;

type Action =
    | { type: 'SET_RAW_INPUT'; payload: string }
    | { type: 'SET_PARSED_PROMPT'; payload: { rawInput: string } & ReturnType<typeof parseMidjourneyPrompt> }
    | { type: 'UPDATE_TEXT_PROMPT'; payload: { index: number; newPrompt: TextPromptPart } }
    | { type: 'ADD_TEXT_PROMPT'; payload: TextPromptPart }
    | { type: 'SET_TEXT_PROMPT'; payload: TextPromptPart[] }
    | { type: 'REMOVE_TEXT_PROMPT'; payload: number }
    | { type: 'UPDATE_IMAGE_PROMPT'; payload: { index: number; newUrl: string } }
    | { type: 'ADD_IMAGE_PROMPT'; payload: string }
    | { type: 'REMOVE_IMAGE_PROMPT'; payload: number }
    | { type: 'UPDATE_SYSTEM_PARAMETER'; payload: { key: string; value: string } }
    | { type: 'UPDATE_NEGATIVE_PROMPTS'; payload: string[] }
    | { type: 'REORDER_TEXT_PROMPTS'; payload: { startIndex: number; endIndex: number } }
    | { type: 'UPDATE_SETTING'; payload: EditorSettingInput };

function updateFinalPrompt(state: EditorState): EditorState {
    const finalPrompt = formatParsedPrompt({
        textPrompts: state.textPrompts,
        imagePrompts: state.imagePrompts,
        systemParameters: state.systemParameters,
        negativePrompts: state.negativePrompts,
    });
    return {...state, finalPrompt};
}

function promptReducer(state: EditorState, action: Action): EditorState {
    let newState: EditorState;

    switch (action.type) {
        case 'SET_RAW_INPUT':
            const parsed = parseMidjourneyPrompt(action.payload);
            newState = {
                ...state,
                rawInput: action.payload,
                ...parsed,
            };
            break;
        case 'SET_PARSED_PROMPT':
            newState = {
                ...state,
                ...action.payload,
            };
            break;
        case 'UPDATE_TEXT_PROMPT':
            newState = {
                ...state,
                textPrompts: state.textPrompts.map((prompt, index) =>
                    index === action.payload.index ? action.payload.newPrompt : prompt
                ),
            };
            break;
        case 'ADD_TEXT_PROMPT':
            newState = {
                ...state,
                textPrompts: [...state.textPrompts, action.payload],
            };
            break;
        case 'SET_TEXT_PROMPT':
            newState = {
                ...state,
                textPrompts: action.payload,
            };
            break;
        case 'REMOVE_TEXT_PROMPT':
            newState = {
                ...state,
                textPrompts: state.textPrompts.filter((_, index) => index !== action.payload),
            };
            break;
        case 'UPDATE_IMAGE_PROMPT':
            newState = {
                ...state,
                imagePrompts: state.imagePrompts.map((url, index) =>
                    index === action.payload.index ? action.payload.newUrl : url
                ),
            };
            break;
        case 'ADD_IMAGE_PROMPT':
            newState = {
                ...state,
                imagePrompts: [...state.imagePrompts, action.payload],
            };
            break;
        case 'REMOVE_IMAGE_PROMPT':
            newState = {
                ...state,
                imagePrompts: state.imagePrompts.filter((_, index) => index !== action.payload),
            };
            break;
        case 'UPDATE_SYSTEM_PARAMETER':
            newState = {
                ...state,
                systemParameters: {
                    ...state.systemParameters,
                    [action.payload.key]: action.payload.value,
                },
            };
            break;
        case 'UPDATE_NEGATIVE_PROMPTS':
            newState = {
                ...state,
                negativePrompts: action.payload,
            };
            break;
        case 'REORDER_TEXT_PROMPTS':
            const newTextPrompts = Array.from(state.textPrompts);
            const [reorderedItem] = newTextPrompts.splice(action.payload.startIndex, 1);
            newTextPrompts.splice(action.payload.endIndex, 0, reorderedItem);
            newState = {
                ...state,
                textPrompts: newTextPrompts,
            };
            break;
        case 'UPDATE_SETTING':
            newState = {
                ...state,
                ...action.payload,
            };
            break;
        default:
            return state;
    }

    return updateFinalPrompt(newState);
}

const initialState: EditorState = {
    textPrompts: [],
    imagePrompts: [],
    systemParameters: {},
    negativePrompts: [],
    rawInput: '',
    finalPrompt: '',
    autoTranslate: true,
    index: 0,
    name: "",
    addPrefix: false,
    translateService: 'tencent',
};

const PromptEditorContext = createContext<{
    state: EditorState;
    dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export function PromptEditorProvider({children}: { children: ReactNode }) {
    const [state, dispatch] = useReducer(promptReducer, initialState);

    return (
        <PromptEditorContext.Provider value={{state, dispatch}}>
            {children}
        </PromptEditorContext.Provider>
    );
}

export function usePromptEditor() {
    const context = useContext(PromptEditorContext);
    if (context === undefined) {
        throw new Error('usePromptEditor must be used within a PromptEditorProvider');
    }
    return context;
}
