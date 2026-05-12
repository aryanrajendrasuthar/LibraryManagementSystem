export default function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-10 h-10 border-4 border-[#52B788] border-t-[#1B4332] rounded-full animate-spin" />
      <p className="text-stone-500 text-sm">{text}</p>
    </div>
  );
}
