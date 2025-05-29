import React, { useState, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const toastVariants = cva(
  'pointer-events-auto relative w-full max-w-md overflow-hidden rounded-lg p-4 shadow-lg',
  {
    variants: {
      variant: {
        default: 'bg-white text-gray-900',
        success: 'bg-success-50 text-success-900',
        error: 'bg-error-50 text-error-900',
        warning: 'bg-warning-50 text-warning-900',
        info: 'bg-primary-50 text-primary-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title: string;
  description?: string;
  onClose?: () => void;
  duration?: number;
  isVisible?: boolean;
}

function Toast({
  className,
  variant,
  title,
  description,
  onClose,
  duration = 5000,
  isVisible = true,
  ...props
}: ToastProps) {
  const [isOpen, setIsOpen] = useState(isVisible);

  useEffect(() => {
    setIsOpen(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (isOpen && duration !== Infinity) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-success-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-error-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-warning-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-primary-500" />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 right-4 z-50 flex items-end justify-center sm:items-start"
        >
          <div className={toastVariants({ variant, className })} {...props}>
            <div className="flex items-start">
              {variant && <div className="flex-shrink-0">{getIcon()}</div>}
              <div className={`${variant ? 'ml-3' : ''} w-0 flex-1 pt-0.5`}>
                <p className="text-sm font-medium">{title}</p>
                {description && (
                  <p className="mt-1 text-sm text-gray-500">{description}</p>
                )}
              </div>
              <div className="ml-4 flex flex-shrink-0">
                <button
                  type="button"
                  className="inline-flex rounded-md bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={handleClose}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { Toast,  };