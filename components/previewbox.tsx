import { CircleX, Expand, X, ZoomIn } from 'lucide-react';
import { useState } from 'react';
import Draggable from 'react-draggable';

interface PreviewBoxProps {
    handleTogglePreview: () => void;
    handleZoom: () => void;
    refer ?: React.RefObject<HTMLDivElement>;
}

const PreviewBox: React.FC<PreviewBoxProps> = ({ handleTogglePreview, handleZoom, refer }) => {
    const [showPreview, setShowPreview] = useState(false); // State to control preview box
    const [zoomed, setZoomed] = useState(false); // State to control zoom
    return (
        <>
            <Draggable>
                <div ref={refer} className="relative bg-preview_bg p-0 rounded-md flex justify-center items-center cursor-pointer w-[457px] h-[257px]">
                    <button
                        onClick={handleTogglePreview}
                        className="absolute top-2 right-2"
                    >
                        <CircleX size={20} className='text-white' />
                    </button>
                    <button
                        onClick={handleZoom}
                        className="absolute bottom-2 right-2"
                    >
                        <Expand size={20} className='text-zoom_color' />
                    </button>
                    <p className='text-preview_color text-5xl font-normal uppercase'>Preview</p>
                </div>
            </Draggable>
        </>
    );
}

export default PreviewBox;
