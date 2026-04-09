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
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set());
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
          <div className="mb-0 left-0 top-0 w-full min-w-0 [white-space-collapse:preserve] relative text-[#3F3F3F] font-['OpenRunde-Semibold','Open_Runde',system-ui,sans-serif] font-semibold text-[18px]/5.75">
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
        <div className="relative w-full max-w-112.75 min-w-0 px-4 sm:px-0">
          <div className="[font-synthesis:none] flex w-full min-w-0 h-fit flex-col gap-4.25 antialiased mt-14">
            <BudgeMePaperPreview />
          </div>
        </div>
        <div className="relative w-full max-w-112.75 min-w-0 px-4 sm:px-0 pb-16">
          {/**
           * from Paper
           * https://app.paper.design/file/01KNQ55X8XBA22KECV7GYDNFVK?node=2T-0
           * on Apr 9, 2026
           */}
          <a
            href="https://github.com/ben-million/skills/blob/main/skills/nudge/SKILL.md"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-[20px] block w-fit rounded-full outline-offset-2"
          >
            <div className="[font-synthesis:none] items-center flex justify-between w-fit rounded-full overflow-clip gap-0.5 py-2.5 px-4.25 bg-white [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] antialiased">
              <div className="items-center flex gap-1.25">
                <svg
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: "18px", height: "auto", flexShrink: "0" }}
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.081 2.543C2.895 2.447 2 3.419 2 4.5V16.5C2 17.632 2.906 18.439 3.887 18.549C6.041 18.792 7.452 19.898 8.27 20.802C8.775 21.36 9.498 21.33 9.916 21.197C10.328 21.065 11 20.641 11 19.806V7.623C11 7.466 10.982 7.273 10.913 7.067C10.775 6.655 10.351 5.625 9.299 4.64C8.233 3.642 6.578 2.745 4.081 2.543ZM22 4.496C22 3.418 21.099 2.425 19.889 2.562C15.784 3.024 13.766 5.933 13.257 6.783C13.069 7.097 13 7.432 13 7.736V19.806C13 20.641 13.672 21.065 14.084 21.197C14.502 21.33 15.225 21.36 15.73 20.802C16.548 19.898 17.959 18.792 20.113 18.549C21.09 18.439 22 17.639 22 16.503V4.496Z"
                    fill="#ACACAC"
                  />
                </svg>
                <div className="shrink-0 [letter-spacing:-0.14px] w-max text-[#323232] font-sans font-medium text-[15px]/4.5">
                  Read the skill.md
                </div>
              </div>
            </div>
          </a>
          <div className="flex flex-col w-full max-w-107.25 mt-14">
            <div className="[letter-spacing:0em] font-['OpenRunde-Semibold','Open_Runde',system-ui,sans-serif] font-semibold text-[18px]/5.75 text-[color(display-p3_0.248_0.248_0.248)] mb-2.75">
              FAQ
            </div>
            <div className="h-[0.5px] self-stretch shrink-0 bg-[#DDDDDD] mb-2.75" />
            {[
              {
                question: "What is Expect?",
                answer: (
                  <div className="flex flex-col mt-1.5">
                    <div className="[letter-spacing:0em] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[15px]/5.5 text-[#858585] mb-2.5">
                      A skill that reads your git changes, generates a test plan, and runs it in a
                      real browser with Playwright.
                    </div>
                    <div className="[letter-spacing:0em] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[15px]/5.5 text-[#858585] mb-2.5">
                      It hooks into your existing agent (Claude Code, Codex, Cursor) and runs
                      entirely on your machine.
                    </div>
                    <div className="[letter-spacing:0em] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[15px]/5.5 text-[#858585] mb-2.5">
                      It checks for:
                    </div>
                    <div className="flex items-center justify-between pt-2 pb-2">
                      <div className="flex items-center gap-1.5">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ width: "14px", height: "auto", flexShrink: "0" }}
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1.25 3.25C1.25 2.145 2.145 1.25 3.25 1.25H8.75C9.855 1.25 10.75 2.145 10.75 3.25V8.75C10.75 9.855 9.855 10.75 8.75 10.75H3.25C2.145 10.75 1.25 9.855 1.25 8.75V3.25ZM7.13 3.925C7.017 3.793 6.845 3.73 6.674 3.756C6.504 3.782 6.358 3.894 6.29 4.053L5.107 6.815L4.13 5.675C4.035 5.564 3.896 5.5 3.75 5.5H2.75C2.474 5.5 2.25 5.724 2.25 6C2.25 6.276 2.474 6.5 2.75 6.5H3.52L4.87 8.075C4.983 8.207 5.155 8.27 5.326 8.244C5.496 8.218 5.642 8.106 5.71 7.947L6.893 5.185L7.87 6.325C7.965 6.436 8.104 6.5 8.25 6.5H9.25C9.526 6.5 9.75 6.276 9.75 6C9.75 5.724 9.526 5.5 9.25 5.5H8.48L7.13 3.925Z"
                            fill="#696969"
                          />
                        </svg>
                        <div className="font-['OpenRunde-Semibold','Open_Runde',system-ui,sans-serif] font-semibold text-[13px]/5 text-[#353535]">
                          Performance
                        </div>
                      </div>
                      <div className="font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[13px]/5 text-[#858585]">
                        long animation frames, INP, LCP
                      </div>
                    </div>
                    <div className="h-px bg-[#EEEEEE]" />
                    <div className="flex items-center justify-between pt-2 pb-2">
                      <div className="flex items-center gap-1.5">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ width: "14px", height: "auto", flexShrink: "0" }}
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1.5 6.283C1.5 6.324 1.501 6.364 1.502 6.404C1.501 6.423 1.5 6.441 1.5 6.46C1.5 7.902 2.243 9.241 3.465 10.005L3.608 10.095L3.615 10.099L4.205 10.468L5.205 11.093C5.691 11.397 6.309 11.397 6.795 11.093L8.385 10.099C9.701 9.277 10.5 7.835 10.5 6.283V5.5V2.576C10.5 2.537 10.498 2.499 10.493 2.461C10.482 2.369 10.457 2.281 10.42 2.2C10.236 1.79 9.76 1.553 9.296 1.708L9.189 1.743C8.387 2.007 7.504 1.797 6.907 1.2C6.406 0.699 5.594 0.699 5.093 1.2C4.494 1.799 3.607 2.009 2.803 1.741L2.704 1.708C2.112 1.51 1.5 1.951 1.5 2.576V6.283ZM6.5 9.196V10.098L7.855 9.251C8.817 8.65 9.424 7.623 9.493 6.5H6.5V9.196ZM5.5 5.5V2.305V2.172C4.656 2.83 3.532 3.033 2.5 2.694V5.5H5.5Z"
                            fill="#696969"
                          />
                        </svg>
                        <div className="font-['OpenRunde-Semibold','Open_Runde',system-ui,sans-serif] font-semibold text-[13px]/5 text-[#353535]">
                          Security
                        </div>
                      </div>
                      <div className="font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[13px]/5 text-[#858585]">
                        npm deps, CSRF attacks, vulns
                      </div>
                    </div>
                    <div className="h-px bg-[#EEEEEE]" />
                    <div className="flex items-center justify-between pt-2 pb-2">
                      <div className="flex items-center gap-1.5">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ width: "14px", height: "auto", flexShrink: "0" }}
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1 6C1 3.239 3.239 1 6 1C8.761 1 11 3.239 11 6C11 6.934 10.172 7.496 9.385 7.496H8.015C7.37 7.496 6.912 8.124 7.109 8.738L7.24 9.147C7.376 9.569 7.321 10.02 7.106 10.376C6.885 10.739 6.492 11 6 11C3.239 11 1 8.761 1 6ZM6.105 3.391C6.208 3.793 5.967 4.201 5.565 4.304C5.164 4.408 4.755 4.166 4.652 3.765C4.549 3.363 4.791 2.955 5.192 2.852C5.593 2.749 6.002 2.99 6.105 3.391ZM3.795 4.603C4.194 4.715 4.427 5.129 4.315 5.528C4.204 5.927 3.79 6.159 3.391 6.048C2.992 5.936 2.759 5.522 2.871 5.124C2.982 4.725 3.396 4.492 3.795 4.603ZM4.749 7.223C4.459 6.927 3.984 6.922 3.688 7.212C3.392 7.501 3.387 7.976 3.676 8.272C3.966 8.568 4.441 8.573 4.737 8.284C5.033 7.994 5.038 7.519 4.749 7.223ZM8.312 4.788C8.016 5.077 7.541 5.072 7.251 4.776C6.962 4.48 6.967 4.005 7.263 3.716C7.559 3.426 8.034 3.431 8.323 3.727C8.613 4.023 8.608 4.498 8.312 4.788Z"
                            fill="#696969"
                          />
                        </svg>
                        <div className="font-['OpenRunde-Semibold','Open_Runde',system-ui,sans-serif] font-semibold text-[13px]/5 text-[#353535]">
                          Design tweaks
                        </div>
                      </div>
                      <div className="font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[13px]/5 text-[#858585]">
                        broken hover states, links, buttons
                      </div>
                    </div>
                    <div className="h-px bg-[#EEEEEE]" />
                    <div className="flex items-center justify-between pt-2 pb-2">
                      <div className="flex items-center gap-1.5">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ width: "14px", height: "auto", flexShrink: "0" }}
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1 6C1 3.239 3.239 1 6 1C8.761 1 11 3.239 11 6C11 8.761 8.761 11 6 11C3.239 11 1 8.761 1 6ZM4.5 5.5C4.914 5.5 5.25 5.164 5.25 4.75C5.25 4.336 4.914 4 4.5 4C4.086 4 3.75 4.336 3.75 4.75C3.75 5.164 4.086 5.5 4.5 5.5ZM9.436 6.667C9.488 6.396 9.311 6.134 9.04 6.081C8.769 6.028 8.507 6.205 8.454 6.477C8.345 7.041 8.044 7.551 7.602 7.919C7.161 8.288 6.606 8.493 6.031 8.5C5.456 8.507 4.896 8.316 4.446 7.958C3.995 7.601 3.682 7.099 3.558 6.537C3.499 6.267 3.232 6.097 2.963 6.156C2.693 6.215 2.522 6.482 2.582 6.752C2.755 7.538 3.193 8.241 3.824 8.741C4.454 9.242 5.238 9.51 6.043 9.5C6.848 9.49 7.625 9.203 8.243 8.687C8.861 8.171 9.282 7.457 9.436 6.667ZM8.25 4.75C8.25 5.164 7.914 5.5 7.5 5.5C7.086 5.5 6.75 5.164 6.75 4.75C6.75 4.336 7.086 4 7.5 4C7.914 4 8.25 4.336 8.25 4.75Z"
                            fill="#696969"
                          />
                        </svg>
                        <div className="font-['OpenRunde-Semibold','Open_Runde',system-ui,sans-serif] font-semibold text-[13px]/5 text-[#353535]">
                          App completeness
                        </div>
                      </div>
                      <div className="font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[13px]/5 text-[#858585]">
                        missing metadata, dead links
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                question: "Why not just use Puppeteer, Playwright, or Cypress?",
                answer:
                  "Instead of writing scripts, maintaining selectors, and wiring up assertions, Expect reads your code changes and tests them in a real browser automatically. It's like giving your agent QA superpowers.",
              },
              {
                question: "How is this different from computer-use agents?",
                answer:
                  "General-purpose browser tools rely on screenshots and mouse coordinates. Expect is purpose-built for testing: it uses Playwright for fast DOM automation, reads your code changes, generates a test plan, and runs it with your real cookies, then reports back what's broken so the agent can fix it.",
              },
              {
                question: "Does it work in CI?",
                answer:
                  "Yes. Use --ci or the add github-action command to set up a workflow that tests every PR. In CI mode it runs headless, skips cookie extraction, auto-approves the plan, and enforces a 30-minute timeout.",
              },
              { question: "Does it support mobile testing?", answer: "Coming soon." },
              {
                question: "Is there a hosted or enterprise version?",
                answer: "Coming soon. Email aiden@million.dev if you have questions or ideas.",
              },
            ].map((faq, index) => (
              <div key={index} className="group/faq pb-2.75">
                <div
                  className="flex justify-between items-start transition-colors group-hover/faq:text-[#1E1E1E] pt-2.75 cursor-pointer"
                  onClick={() =>
                    setOpenFaqs((previous) => {
                      const next = new Set(previous);
                      if (next.has(index)) {
                        next.delete(index);
                      } else {
                        next.add(index);
                      }
                      return next;
                    })
                  }
                >
                  <div
                    className={`[letter-spacing:0em] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[15px]/5.75 transition-colors group-hover/faq:text-[#1E1E1E] ${openFaqs.has(index) ? "text-[#1E1E1E]" : "text-[#5A5A5A]"}`}
                  >
                    {faq.question}
                  </div>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: "20px", height: "auto", flexShrink: "0" }}
                    className={`group-hover/faq:text-[#1E1E1E] transition-all duration-200 ${openFaqs.has(index) ? "text-[#1E1E1E] rotate-45" : "text-[#5A5A5A]"}`}
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M6.5 3C6.5 2.724 6.276 2.5 6 2.5C5.724 2.5 5.5 2.724 5.5 3V5.5H3C2.724 5.5 2.5 5.724 2.5 6C2.5 6.276 2.724 6.5 3 6.5H5.5V9C5.5 9.276 5.724 9.5 6 9.5C6.276 9.5 6.5 9.276 6.5 9V6.5H9C9.276 6.5 9.5 6.276 9.5 6C9.5 5.724 9.276 5.5 9 5.5H6.5V3Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-200 ${openFaqs.has(index) ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    {typeof faq.answer === "string" && (
                      <div className="[letter-spacing:0em] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[15px]/5.5 text-[#858585] whitespace-pre-line mt-1.5">
                        {faq.answer}
                      </div>
                    )}
                    {typeof faq.answer !== "string" && faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
