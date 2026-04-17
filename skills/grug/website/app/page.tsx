import { GrugLogo } from "@/components/grug-logo";
import { GrugDemo } from "@/components/grug-demo";
import { CodeBlock } from "@/components/code-block";

export default function HomePage() {
  return (
    <div className="[font-synthesis:none] overflow-x-clip antialiased min-h-screen bg-[oklch(98.6%_0.002_67.8)] flex flex-col items-center justify-center">
      <div className="page-content w-full flex flex-col items-center py-12">
        <div className="relative w-full max-w-112.75 min-w-0 px-4 sm:px-0">
          <div className="mb-0 mt-8 left-0 top-0 w-full min-w-0 [white-space-collapse:preserve] relative text-[#3F3F3F] font-semibold text-[15px]/[22px]">
            <GrugLogo>grug</GrugLogo>
          </div>
          <div className="[letter-spacing:0em] [white-space-collapse:preserve] mt-[17px] mb-6 font-medium text-[15px]/[22px] text-[#696969]">
            kill complexity demon. explain like grug is 5.
          </div>
          <div className="[letter-spacing:0em] [white-space-collapse:preserve] font-medium text-[15px]/[22px] text-[#707070]">
            big brain answer make grug head hurt. fancy word hide simple idea.
            grug skill make your agent talk plain, find the 80/20, and kill
            complexity demon in any topic.
          </div>
          <div className="[letter-spacing:0em] [white-space-collapse:preserve] font-medium text-[15px]/[22px] text-[#707070] mt-4">
            not just for code. work for investing, cooking, fitness, science,
            history, or anything where complexity demon hide. grug find demon and
            hit with club of simplicity.
          </div>
        </div>
        <div className="relative w-full max-w-112.75 min-w-0 px-4 sm:px-0 pb-6">
          <div className="[font-synthesis:none] flex w-full min-w-0 h-fit flex-col gap-4.25 antialiased mt-8">
            <GrugDemo />
          </div>
        </div>
        <div className="relative w-full max-w-112.75 min-w-0 px-4 sm:px-0">
          <div className="mb-0 left-0 top-0 w-full min-w-0 [white-space-collapse:preserve] relative text-[#3F3F3F] font-semibold text-[15px]/[22px]">
            usage
          </div>
          <div className="[letter-spacing:0em] [white-space-collapse:preserve] font-medium text-[15px]/[22px] text-[#707070] mt-4">
            Install the skill, then type{" "}
            <code className="font-mono-override text-[#3F3F3F]">/grug</code> to
            invoke it. Ask your agent anything and grug will explain in simplest
            possible way.
          </div>
          <CodeBlock />
          <div className="[letter-spacing:0em] [white-space-collapse:preserve] font-medium text-[15px]/[22px] text-[#707070] mt-6">
            grug mode stay on until you say &ldquo;bye grug&rdquo; or
            &ldquo;normal mode&rdquo;. every response come from grug until then.
            also trigger with &ldquo;ELI5&rdquo;, &ldquo;simplify this&rdquo;,
            or &ldquo;dumb it down&rdquo;.
          </div>
          <div className="overflow-x-auto rounded-[14px] mt-6 border border-solid border-[color(display-p3_1_1_1)] [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] bg-[color(display-p3_0.991_0.991_0.991)]">
            <table className="w-full text-[13px]/[20px] font-mono">
              <thead>
                <tr className="border-b border-[color(display-p3_0_0_0/0.06)] text-left text-[#707070]">
                  <th className="px-3 py-2 font-medium">Trigger</th>
                  <th className="px-3 py-2 font-medium">What it does</th>
                </tr>
              </thead>
              <tbody className="text-[#3F3F3F]">
                <tr className="border-b border-[color(display-p3_0_0_0/0.04)]">
                  <td className="px-3 py-2">/grug</td>
                  <td className="px-3 py-2">Enter grug mode</td>
                </tr>
                <tr className="border-b border-[color(display-p3_0_0_0/0.04)]">
                  <td className="px-3 py-2">ELI5</td>
                  <td className="px-3 py-2">
                    Explain like grug is 5
                  </td>
                </tr>
                <tr className="border-b border-[color(display-p3_0_0_0/0.04)]">
                  <td className="px-3 py-2">simplify this</td>
                  <td className="px-3 py-2">
                    Kill complexity demon
                  </td>
                </tr>
                <tr className="border-b border-[color(display-p3_0_0_0/0.04)]">
                  <td className="px-3 py-2">bye grug</td>
                  <td className="px-3 py-2">
                    Exit grug mode
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2">normal mode</td>
                  <td className="px-3 py-2">
                    Exit grug mode
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
