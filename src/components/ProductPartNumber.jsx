export function ProductPartNumber({ value, className = '', valueClassName = '', desktopProminent = false }) {
    if (!value) return null;

    return (
        <div className={`flex w-fit max-w-full flex-col items-start ${desktopProminent ? 'md:w-full md:rounded-xl md:bg-neutral-100 md:px-3 md:py-2.5 md:ring-1 md:ring-inset md:ring-neutral-200/80' : ''} ${className}`.trim()}>
            <span className="mb-0.5 text-[8px] font-extrabold uppercase tracking-[0.16em] text-neutral-500 md:text-[10px]">Part No.</span>
            <span className={`block max-w-full truncate rounded-md bg-neutral-100 px-2 py-1 font-mono font-black leading-none text-neutral-900 ring-1 ring-inset ring-neutral-200/70 ${desktopProminent ? 'md:w-full md:bg-transparent md:px-0 md:py-0 md:text-lg md:ring-0' : ''} ${valueClassName}`.trim()}>{value}</span>
        </div>
    );
}
