export interface BasicModalProps {
    isOpen: boolean;
    onClose?: () => void;
    onOpen: () => void;
    onOpenChange: (isOpen: boolean) => void;
    title?: string;
}


export interface DictTextPrompt {
    id: string;
    text: string;
    translation: string;
    category: string;
}
