interface Props {
  isFlipped: boolean;
  onClick: () => void;
}

export default function Button({ onClick, isFlipped }: Props) {
  return (
    <button
      type="button"
      className="aspect-square h-72 touch-none rounded-full duration-50 active:scale-95"
      onPointerDown={onClick}
    >
      <img
        alt="Tap to earn"
        className={`object-contain ${isFlipped ? `animate-flip-coin` : "animate-unflip-coin"}`}
      />
    </button>
  );
}
