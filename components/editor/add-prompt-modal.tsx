import {Modal, ModalBody, ModalContent, ModalHeader} from "@nextui-org/modal";
import {BasicModalProps, DictTextPrompt} from "@/lib/types";

interface AddPromptModalProps extends BasicModalProps {
    onAddPrompt: (prompt: DictTextPrompt) => void;
}

export const AddPromptModal: React.FC<BasicModalProps> = ({isOpen, onClose, onOpen, onOpenChange, title}) => {
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} >
            <ModalContent>
                <ModalHeader>title</ModalHeader>
                <ModalBody></ModalBody>
            </ModalContent>
        </Modal>

    );
}
