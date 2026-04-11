/**
 * from Paper
 * https://app.paper.design/file/01KN3QGZ2REZDFZ3FZCNWXEANN?node=F18-0
 * on Apr 4, 2026
 */
"use client";

import { BudgeMePaperPreview } from "@/components/budge-me-paper-preview";

export default function HomePage() {
  return (
    <div className="[font-synthesis:none] overflow-x-clip antialiased min-h-screen bg-[oklch(98.6%_0.002_67.8)] flex flex-col items-center">
      <div className="page-content w-full flex flex-col items-center pt-3 sm:pt-6">
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
            budge appears when your agent makes a change to your UI. Tweak the value (padding, margin, color) then copy the result back to your agent to lock it in.
          </div>
        </div>
        <div className="relative w-full max-w-112.75 min-w-0 px-4 sm:px-0 pb-16">
          <div className="[font-synthesis:none] flex w-full min-w-0 h-fit flex-col gap-4.25 antialiased mt-8">
            <BudgeMePaperPreview autoFocus />
          </div>
        </div>
      </div>
    </div>
  );
}
