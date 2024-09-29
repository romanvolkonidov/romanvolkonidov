// components/ui/Apple.jsx
import * as React from "react";
import { cn } from "./lib/utils";

const Apple = React.forwardRef(({ size = 24, color = "black", className, ...props }, ref) => {
  return (
    <svg
      ref={ref}
      className={cn("transition-all duration-300 ease-in-out hover:scale-110", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 2C10.3431 2 9 3.34315 9 5C9 6.65685 10.3431 8 12 8C13.6569 8 15 6.65685 15 5C15 3.34315 13.6569 2 12 2ZM12 10C8.68629 10 6 12.6863 6 16C6 19.3137 8.68629 22 12 22C15.3137 22 18 19.3137 18 16C18 12.6863 15.3137 10 12 10Z" />
    </svg>
  );
});
Apple.displayName = "Apple";

export { Apple };