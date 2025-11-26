// frontend/components/common/Snackbar.tsx
import { useEffect } from "react";

interface SnackbarProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white animate-slide-in ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    }`}>
      {message}
      <button onClick={onClose} className="ml-4">×</button>
    </div>
  );
};

export default Snackbar;
