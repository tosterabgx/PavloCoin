interface Props {
  value: number;
}

export default function Counter({ value }: Props) {
  let numberWithCommas = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return (
    <span className="flex h-30 w-90 items-center justify-center rounded-4xl border border-white/40 bg-white/7 text-6xl font-extrabold backdrop-blur-md">
      {numberWithCommas}
    </span>
  );
}
