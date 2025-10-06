interface Props {
  isFlipped: boolean;
  onClick: () => void;
}

export default function Button({ onClick, isFlipped }: Props) {
  return (
    <button
      type="button"
      className="mb-15 aspect-square h-72 touch-none rounded-full"
      onPointerDown={onClick}
    >
      <img
        alt="Tap to earn"
        className={`object-contain ${isFlipped ? `animate-flip-coin` : "animate-unflip-coin"}`}
      />
    </button>
  );
}
