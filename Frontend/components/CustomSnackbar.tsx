import { useEffect } from "react";

interface SnackbarProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const CustomSnackbar: React.FC<SnackbarProps> = ({ message, type, onClose }) => {
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

export default CustomSnackbar;


/*

"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SnackbarItem {
  id: number;
  message: string;
  type: "success" | "error" | "warning";
  duration?: number;
}

interface CustomSnackbarProps {
  items?: SnackbarItem[]; // خليها اختياري عشان تتجنب crash
  onRemove: (id: number) => void;
}

export default function CustomSnackbar({ items = [], onRemove }: CustomSnackbarProps) {
  if (!items || items.length === 0) return null; // لو مفيش عناصر، مفيش حاجة للعرض

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col gap-2 z-50">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className={`flex items-start gap-2 max-w-xs w-full px-4 py-2 rounded-lg shadow-lg text-white font-medium break-words ${
              item.type === "success"
                ? "bg-green-500"
                : item.type === "error"
                ? "bg-red-500"
                : "bg-yellow-500"
            }`}
          >
            <span className="text-xl">
              {item.type === "success" ? "✅" : item.type === "error" ? "❌" : "⚠️"}
            </span>
            <span className="flex-1">{item.message}</span>
            <button
              className="ml-2 font-bold text-white hover:opacity-80"
              onClick={() => onRemove(item.id)}
            >
              ✖
            </button>

            <AutoRemove id={item.id} duration={item.duration ?? 3000} onRemove={onRemove} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function AutoRemove({ id, duration, onRemove }: { id: number; duration: number; onRemove: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  return null;
}

*/

/*

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SnackbarItem {
  id: number;
  message: string;
  type: "success" | "error" | "warning";
  duration?: number;
}

interface CustomSnackbarProps {
  items: SnackbarItem[];
  onRemove: (id: number) => void;
}

export default function CustomSnackbar({ items, onRemove }: CustomSnackbarProps) {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col gap-2 z-50">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className={`flex items-start gap-2 max-w-xs w-full px-4 py-2 rounded-lg shadow-lg text-white font-medium break-words ${
              item.type === "success"
                ? "bg-green-500"
                : item.type === "error"
                ? "bg-red-500"
                : "bg-yellow-500"
            }`}
          >
            <span className="text-xl">
              {item.type === "success" ? "✅" : item.type === "error" ? "❌" : "⚠️"}
            </span>
            <span className="flex-1">{item.message}</span>
            <button
              className="ml-2 font-bold text-white hover:opacity-80"
              onClick={() => onRemove(item.id)}
            >
              ✖
            </button>

            <AutoRemove id={item.id} duration={item.duration ?? 3000} onRemove={onRemove} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function AutoRemove({ id, duration, onRemove }: { id: number; duration: number; onRemove: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  return null;
}

ء/

/*

"use client";
import { useEffect, useState } from "react";

interface SnackbarProps {
  message: string;
  type?: "success" | "error";
  duration?: number;
  onClose?: () => void;
}

export default function CustomSnackbar({ message, type = "success", duration = 3000, onClose }: SnackbarProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";

  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white font-medium shadow-lg ${bgColor}`}>
      {message}
    </div>
  );
}

*/
