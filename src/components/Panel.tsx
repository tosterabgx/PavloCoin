interface Props {
  title: string;
  value: number;
}

export default function Panel({ title, value }: Props) {
  return (
    <div className="flex h-16 w-30 flex-col items-center justify-center rounded-3xl border border-white/40 bg-white/20 backdrop-blur-md">
      <span className="text-xs font-extrabold">{title}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
