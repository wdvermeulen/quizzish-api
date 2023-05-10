import React, {
  type DetailedHTMLProps,
  type TextareaHTMLAttributes,
  useEffect,
  useRef,
} from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface TextareaProps
  extends DetailedHTMLProps<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  > {
  register: UseFormRegisterReturn;
}

const Textarea = ({
  register: { ref, ...registeredField },
  ...props
}: TextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  const resize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <textarea
      rows={1}
      onInput={resize}
      className="textarea-bordered textarea w-full resize-none overflow-hidden"
      {...registeredField}
      ref={(e) => {
        ref(e);
        textareaRef.current = e;
      }}
      {...props}
    />
  );
};

export default Textarea;
