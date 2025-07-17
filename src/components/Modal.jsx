import React from 'react';

/**
 * A reusable modal component for confirmations or alerts.
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {function} props.onClose - Function to call when the modal should be closed.
 * @param {function} props.onConfirm - Function to call when the confirm button is clicked.
 * @param {string} props.title - The title of the modal.
 * @param {React.ReactNode} props.children - The content of the modal body.
 * @param {string} [props.confirmText='Confirmar'] - The text for the confirm button.
 * @param {string} [props.cancelText='Cancelar'] - The text for the cancel button.
 * @returns {JSX.Element|null} The rendered Modal component or null.
 */
const Modal = ({ isOpen, onClose, onConfirm, title, children, confirmText = 'Confirmar', cancelText = 'Cancelar' }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={onClose} // Close modal on overlay click
        >
            <div 
                className="bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
                <div className="text-gray-300 mb-6">
                    {children}
                </div>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-500 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-500 transition-colors"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
