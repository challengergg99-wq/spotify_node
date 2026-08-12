type AlbumCardProps = {
  title: string;
  subtitle: string;
};

export default function AlbumCard({ title, subtitle }: AlbumCardProps) {
  return (
    <button className="group w-[168px] shrink-0 text-left p-3 rounded-lg hover:bg-white/[0.05] transition-colors">
      <div className="relative w-full aspect-square rounded-md bg-gradient-to-br from-white/[0.08] to-white/[0.02] mb-3 overflow-hidden">
        {/* Play button revealed on hover — signature detail echoing the player bar */}
        <div className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-[#E8B34C] text-[#0B0B0D] flex items-center justify-center opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-lg shadow-black/40 text-sm">
          ▶
        </div>
      </div>
      <p className="text-sm font-semibold text-[#F5F3EE] truncate">{title}</p>
      <p className="text-xs text-[#9A9691] truncate mt-0.5">{subtitle}</p>
    </button>
  );
}