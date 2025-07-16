import {
  Smile,
  Frown,
  MessageCircle,
  ExternalLink
} from "lucide-react";

interface ISkeleton { 
    repeat:number;
}


export const PostSkeleton: React.FC<ISkeleton> = ({repeat}) => {

    return (
        <section className="flex flex-col gap-6 justify-center items-center">
            {
                Array.from({length:repeat}, (_,i) => 
                <div key={i} className="bg-[#282a36] w-full h-43 animate-pulse rounded-xl">
            <div className="w-full h-10 border-b-white/10 border-b flex items-center">
                <div className="flex items-center px-3 gap-1">{
                    ["oklch(0.637 0.237 25.331)", "oklch(0.852 0.199 91.936)", "oklch(0.723 0.219 149.579)"].map((col, index) =>
                        <div key={index} style={{ backgroundColor: col }} className={`bg-red-500 h-3 w-3 rounded-full`}></div>)
                }</div>
                <div className="flex-1 items-center justify-center flex">
                    <div className="bg-[#C0CAF5]/10 h-5 w-20 rounded"></div>
                </div>
            </div>

            <div className="h-20 w-full px-3 flex items-start justify-center py-3">
                <div className="w-10 h-10 flex items-center justify-center border-[2px] border-[#7aa2f7] rounded">
                    <p className="text-[#7AA2F7]">{"ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.random() * 25 | 0)}</p>
                </div>

                <div className="flex-1 h-20 px-3 flex flex-col gap-3">
                    <div className="bg-[#E0AF68]/10 h-5 w-20 rounded"></div>
                    <div className="w-full bg-[#C0CAF5]/10 h-10 rounded"></div>
                </div>
            </div>

            <div className="w-full border-t-white/10 border-t h-8  my-4 text-[#565F89] flex items-center justify-start py-1 px-3 gap-3 md:gap-10 ">
                <div className="flex items-center justify-center gap-1">
                    <Smile size={16} />
                    <div className="h-4 w-4 bg-[#565F89]/30 rounded"></div>
                    <span className="hidden md:block">smiles</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                    <Frown size={16} />
                    <div className="h-4 w-4 bg-[#565F89]/30 rounded"></div>
                    <span className="hidden md:block">sads</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                    <MessageCircle size={16} />
                    <div className="h-4 w-4 bg-[#565F89]/30 rounded"></div>
                    <span className="hidden md:block">comentarios</span>
                </div>
                <div className="flex-1 flex items-center justify-end gap-1">
                    <ExternalLink size={16} />
                </div>

            </div>

        </div>)
            }
        </section>
    )
}
