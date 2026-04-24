import Link from "next/link";

export default function Logo(){
    return (
        <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-2 bg-white/5 mb-4 cursor-pointer hover:bg-white/10 transition"
        >
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 grid place-items-center font-bold text-emerald-400">
                $€
            </div>
            <span className="font-semibold tracking-wide">
                                EuroWise
                            </span>
        </Link>
    );
}