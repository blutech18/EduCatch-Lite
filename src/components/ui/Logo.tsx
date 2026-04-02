import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

export default function Logo({ className = "", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12 sm:h-16 sm:w-16",
    xl: "h-20 w-20 sm:h-24 sm:w-24",
    "2xl": "h-28 w-28 sm:h-32 sm:w-32",
    "3xl": "h-40 w-40 sm:h-48 sm:w-48",
  };

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${sizeClasses[size]} ${className}`}>
      <Image
        src="/logo.png"
        alt="EduCatch Logo"
        fill
        sizes="(max-width: 640px) 48px, 96px"
        className="object-contain"
        priority
      />
    </div>
  );
}
