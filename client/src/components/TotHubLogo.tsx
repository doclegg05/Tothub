export default function TotHubLogo({
  size = "medium",
}: {
  size?: "small" | "medium" | "large";
}) {
  // Scaling logic
  const dim =
    size === "small"
      ? "h-8 w-8 text-sm"
      : size === "medium"
      ? "h-12 w-12 text-xl"
      : "h-16 w-16 text-2xl";

  // A helper to make a single block
  const Block = ({
    char,
    color,
    rotate,
  }: {
    char: string;
    color: string;
    rotate: string;
  }) => {
    // Map colors to full class names to ensure Tailwind picks them up
    const bgClass =
      color === "nursery-coral"
        ? "bg-nursery-coral"
        : color === "nursery-sage"
        ? "bg-nursery-sage"
        : `bg-${color}`;

    return (
      <div
        className={`
        ${dim} flex items-center justify-center 
        ${bgClass} 
        border-2 border-nursery-dark 
        rounded-lg shadow-[2px_2px_0px_0px_rgba(74,74,104,1)]
        font-heading font-bold text-nursery-dark
        transform ${rotate}
      `}
      >
        {char}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-2 select-none">
      {/* The Icon: Stacked Blocks */}
      <div className="relative flex items-center">
        <div className="z-10">
          <Block char="T" color="nursery-coral" rotate="-rotate-6" />
        </div>
        <div className="-ml-2 z-0 mt-2">
          <Block char="H" color="nursery-sage" rotate="rotate-12" />
        </div>
      </div>

      {/* The Text Name */}
      <span
        className={`font-heading font-bold text-nursery-dark ${
          size === "small" ? "text-xl" : "text-3xl"
        } ml-2`}
      >
        TotHub
      </span>
    </div>
  );
}
