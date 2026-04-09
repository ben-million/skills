/**
 * from Paper
 * https://app.paper.design/file/01KN3QGZ2REZDFZ3FZCNWXEANN?node=F18-0
 * on Apr 4, 2026
 */
"use client";

import { useRef, useState } from "react";
import { BudgeMePaperPreview } from "@/components/budge-me-paper-preview";

export default function HomePage() {
  const [copied, setCopied] = useState(false);
  const commandRef = useRef<HTMLDivElement>(null);

  const commandText =
    "npx skills add https://github.com/ben-million/skills --skill nudge -y";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(commandText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSelectCommand = () => {
    if (!commandRef.current) return;
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(commandRef.current);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  return (
    <div className="[font-synthesis:none] overflow-x-clip antialiased min-h-screen bg-white flex flex-col items-center">
      <div className="home-page-below-hero w-full flex flex-col items-center pt-3 sm:pt-6">
        <div className="relative w-full max-w-112.75 min-w-0 px-4 sm:px-0">
          <div className="mb-0 mt-8 left-0 top-0 w-full min-w-0 [white-space-collapse:preserve] relative text-[#3F3F3F] font-['OpenRunde-Semibold','Open_Runde',system-ui,sans-serif] font-semibold text-[18px]/5.75">
            budge
          </div>
          <div className="[letter-spacing:0em] [white-space-collapse:preserve] mt-[17px] mb-6 font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[15px]/[22px] text-[#696969]">
            the tiny design companion for your agent
          </div>
          <div className="[letter-spacing:0em] [white-space-collapse:preserve] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[15px]/[22px] text-[#707070]">
            &ldquo;add space above X&rdquo; or &ldquo;make Y less subtle&rdquo; gets you 90% of the
            way there. budge is for the last 10; a tiny stepper appears on the page and you arrow-key
            the value. Just like nudging in your favourite design tool.
          </div>
          {/**
           * from Paper
           * https://app.paper.design/file/01KN3QGZ2REZDFZ3FZCNWXEANN?page=01KNK40PV23TWD3DPP1AV1WTS4&node=I51-0
           * on Apr 7, 2026
           */}
          <div
            onClick={handleSelectCommand}
            className="[font-synthesis:none] mt-[23px] flex w-full flex-row items-center justify-between rounded-[14px] py-3 pr-3.5 pl-3.75 gap-3 [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] antialiased cursor-text bg-white"
          >
              <div className="flex min-w-0 flex-1 items-center gap-2.75">
                <div className="left-0 top-0 [white-space-collapse:preserve] w-max shrink-0 font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[16px]/5.75 text-[#696969]">
                  $
                </div>
                <div
                  ref={commandRef}
                  data-nudge-target
                  style={{ fontSize: "15px" }}
                  className="left-0 top-0 min-w-0 truncate font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[15px]/5.75 text-[#414141] [white-space-collapse:preserve]"
                >
                  {commandText}
                </div>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleCopy();
                }}
                className="cursor-pointer shrink-0 content-center group"
                aria-label="Copy command"
              >
                  {copied && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        height: "20px",
                        verticalAlign: "middle",
                        width: "20px",
                        overflow: "clip",
                      }}
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M10.28 3.22a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06L4.75 7.69l4.47-4.47a.75.75 0 0 1 1.06 0Z"
                        fill="#059669"
                      />
                    </svg>
                  )}
                  {!copied && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      color="#0A0A0A"
                      style={{
                        height: "20px",
                        verticalAlign: "middle",
                        width: "20px",
                        overflow: "clip",
                        left: "0px",
                        top: "0px",
                        flexShrink: "0",
                      }}
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.25 2.25C3.25 1.698 3.698 1.25 4.25 1.25H9.25C10.079 1.25 10.75 1.922 10.75 2.75V7.75C10.75 8.302 10.302 8.75 9.75 8.75C9.474 8.75 9.25 8.526 9.25 8.25C9.25 7.974 9.474 7.75 9.75 7.75V2.75C9.75 2.474 9.526 2.25 9.25 2.25H4.25C4.25 2.526 4.026 2.75 3.75 2.75C3.474 2.75 3.25 2.526 3.25 2.25ZM1.25 4.75C1.25 3.922 1.922 3.25 2.75 3.25H7.25C8.078 3.25 8.75 3.922 8.75 4.75V9.25C8.75 10.079 8.078 10.75 7.25 10.75H2.75C1.922 10.75 1.25 10.079 1.25 9.25V4.75ZM2.75 4.25C2.474 4.25 2.25 4.474 2.25 4.75V9.25C2.25 9.526 2.474 9.75 2.75 9.75H7.25C7.526 9.75 7.75 9.526 7.75 9.25V4.75C7.75 4.474 7.526 4.25 7.25 4.25H2.75Z"
                        fill="#696969"
                      />
                    </svg>
                  )}
                </button>
          </div>
        </div>
        <div className="relative w-full max-w-112.75 min-w-0 px-4 sm:px-0 pb-16">
          <div className="[font-synthesis:none] flex w-full min-w-0 h-fit flex-col gap-4.25 antialiased mt-14">
            <BudgeMePaperPreview />
          </div>
        </div>
      </div>
    </div>
  );
}
