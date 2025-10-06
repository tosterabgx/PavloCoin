interface Props {
  title: string;
  icon: string;
  value: number;
}

export default function StatPanel({ title, icon, value }: Props) {
  return (
    <div className="flex h-16 w-30 flex-col items-center justify-center rounded-3xl border border-white/40 bg-white/20 backdrop-blur-md">
      <span className="text-xs font-extrabold">
        {title}
        <img
          src={icon}
          alt="Icon"
          className="ml-0.5 inline aspect-square w-[1.75em]"
        />
      </span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
