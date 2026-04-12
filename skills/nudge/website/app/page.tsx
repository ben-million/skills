/**
 * from Paper
 * https://app.paper.design/file/01KN3QGZ2REZDFZ3FZCNWXEANN?node=F18-0
 * on Apr 4, 2026
 */
import { BudgeMePaperPreview } from "@/components/budge-me-paper-preview";
import { CodeBlock } from "@/components/code-block";

export default async function HomePage() {
  return (
    <div className="[font-synthesis:none] overflow-x-clip antialiased min-h-screen bg-[oklch(98.6%_0.002_67.8)] flex flex-col items-center justify-center">
      <div className="page-content w-full flex flex-col items-center py-12">
        <div className="relative w-full max-w-112.75 min-w-0 px-4 sm:px-0">
          <div className="mb-0 mt-8 left-0 top-0 w-full min-w-0 [white-space-collapse:preserve] relative text-[#3F3F3F] font-semibold text-[15px]/[22px]">
            budge
          </div>
          <div className="[letter-spacing:0em] [white-space-collapse:preserve] mt-[17px] mb-6 font-medium text-[15px]/[22px] text-[#696969]">
            the tiny design companion for your agent
          </div>
          <div className="[letter-spacing:0em] [white-space-collapse:preserve] font-medium text-[15px]/[22px] text-[#707070]">
            &ldquo;add space above X&rdquo; or &ldquo;make Y less subtle&rdquo; gets you 90% of the
            way there. budge is for the last 10.
          </div>
          <div className="[letter-spacing:0em] [white-space-collapse:preserve] font-medium text-[15px]/[22px] text-[#707070] mt-4">
            budge appears when your agent makes a change to your UI. Tweak the value (padding, margin, color) then copy the result back to your agent to lock it in. It works just like the budge feature in your favourite design tool.
          </div>
        </div>
        <div className="relative w-full max-w-112.75 min-w-0 px-4 sm:px-0 pb-6">
          <div className="[font-synthesis:none] flex w-full min-w-0 h-fit flex-col gap-4.25 antialiased mt-8">
            <BudgeMePaperPreview autoFocus />
          </div>
        </div>
        <div className="relative w-full max-w-112.75 min-w-0 px-4 sm:px-0">
          <div className="mb-0 left-0 top-0 w-full min-w-0 [white-space-collapse:preserve] relative text-[#3F3F3F] font-semibold text-[15px]/[22px]">
            Usage
          </div>
          <div className="[letter-spacing:0em] [white-space-collapse:preserve] font-medium text-[15px]/[22px] text-[#707070] mt-4">
            Drop the script tag into any page. budge works everywhere, no framework required.
          </div>
          <CodeBlock />
          <div className="[letter-spacing:0em] [white-space-collapse:preserve] font-medium text-[15px]/[22px] text-[#707070] mt-6">
            Use arrow keys to nudge the value up or down. Press Enter to copy a prompt to your clipboard, then paste it back to your agent. Press Escape to dismiss.
          </div>
          <div className="[letter-spacing:0em] [white-space-collapse:preserve] font-medium text-[15px]/[22px] text-[#707070] mt-6 mb-4">
            Config options
          </div>
          <div className="overflow-x-auto rounded-lg border border-[#e5e5e5]">
            <table className="w-full text-[13px]/[20px] font-mono">
              <thead>
                <tr className="border-b border-[#e5e5e5] text-left text-[#707070]">
                  <th className="px-3 py-2 font-medium">Property</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-[#3F3F3F]">
                <tr className="border-b border-[#f0f0f0]"><td className="px-3 py-2">property</td><td className="px-3 py-2 text-[#999]">string</td><td className="px-3 py-2">CSS property to adjust</td></tr>
                <tr className="border-b border-[#f0f0f0]"><td className="px-3 py-2">value</td><td className="px-3 py-2 text-[#999]">string</td><td className="px-3 py-2">Current value</td></tr>
                <tr className="border-b border-[#f0f0f0]"><td className="px-3 py-2">original</td><td className="px-3 py-2 text-[#999]">string</td><td className="px-3 py-2">Original value (for reset)</td></tr>
                <tr className="border-b border-[#f0f0f0]"><td className="px-3 py-2">type</td><td className="px-3 py-2 text-[#999]">&quot;numeric&quot; | &quot;color&quot; | &quot;options&quot;</td><td className="px-3 py-2">Value type</td></tr>
                <tr className="border-b border-[#f0f0f0]"><td className="px-3 py-2">min</td><td className="px-3 py-2 text-[#999]">number?</td><td className="px-3 py-2">Minimum for numeric</td></tr>
                <tr className="border-b border-[#f0f0f0]"><td className="px-3 py-2">max</td><td className="px-3 py-2 text-[#999]">number?</td><td className="px-3 py-2">Maximum for numeric</td></tr>
                <tr className="border-b border-[#f0f0f0]"><td className="px-3 py-2">step</td><td className="px-3 py-2 text-[#999]">number?</td><td className="px-3 py-2">Increment per arrow press</td></tr>
                <tr><td className="px-3 py-2">options</td><td className="px-3 py-2 text-[#999]">string[]?</td><td className="px-3 py-2">Values to cycle through</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
