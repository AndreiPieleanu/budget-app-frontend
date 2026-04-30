import Link from "next/link";

export default function Logo(){
    return (
        <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-2 bg-emerald-500 hover:bg-emerald-400"
        >
            <div className="h-10 w-10 rounded-xl grid place-items-center font-bold">
                $€
            </div>
            <span className="font-semibold tracking-wide ">
                EuroWise
            </span>
        </Link>
    );
}