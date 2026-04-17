"use client";

import { useState, useEffect, useRef } from "react";

const CONVERSATIONS = [
  {
    question: "should grug use microservices?",
    answer:
      "grug wonder why take hardest problem in software and add network call too. start with one thing. make work. split later if pain real, not imagined. most team never need split.",
  },
  {
    question: "how should grug start investing?",
    answer:
      "put shiney rock in boring index fund. not exciting. no big brain stock pick. just boring fund that track whole market. big brain on tv lose to boring fund most time. is embarrassing for them but good for grug.",
  },
  {
    question: "what workout routine is best?",
    answer:
      "one that grug actually do. grug see many perfect plan with spreadsheet and periodization. very impressive. also very complex. grug say: pick up heavy thing three time a week. walk every day. sleep. that 80% of result right there.",
  },
  {
    question: "how do grug make good steak?",
    answer:
      "hot pan. salt. pepper. steak on pan. not touch three minute. flip. three more minute. rest five minute. eat. grug see recipe with 47 step and reverse sear. is fine but hot pan and salt get 80% there.",
  },
  {
    question: "should grug learn new javascript framework?",
    answer:
      "grug ask: does current thing work? if yes, grug keep using. new framework come every season like weather. big brain get excited. two year later, different new framework. boring thing that work beat exciting thing that might work.",
  },
];

export function GrugDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayedAnswer, setDisplayedAnswer] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuestion, setShowQuestion] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    setShowQuestion(true);
    setDisplayedAnswer("");
    setIsTyping(false);

    const questionDelay = setTimeout(() => {
      setIsTyping(true);
      let charIndex = 0;
      const answer = CONVERSATIONS[activeIndex].answer;

      intervalRef.current = setInterval(() => {
        charIndex++;
        setDisplayedAnswer(answer.slice(0, charIndex));
        if (charIndex >= answer.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsTyping(false);

          timeoutRef.current = setTimeout(() => {
            setShowQuestion(false);
            setTimeout(() => {
              setActiveIndex((prev) => (prev + 1) % CONVERSATIONS.length);
            }, 300);
          }, 4000);
        }
      }, 22);
    }, 1200);

    return () => {
      clearTimeout(questionDelay);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [activeIndex]);

  const conversation = CONVERSATIONS[activeIndex];

  return (
    <div className="w-full rounded-[14px] border border-solid border-[color(display-p3_1_1_1)] [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] bg-[color(display-p3_0.991_0.991_0.991)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[color(display-p3_0_0_0/0.06)] flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-[#E5E5E5]" />
          <div className="size-2.5 rounded-full bg-[#E5E5E5]" />
          <div className="size-2.5 rounded-full bg-[#E5E5E5]" />
        </div>
        <span className="text-[12px] text-[#999] ml-1 font-mono-override">
          grug-mode
        </span>
      </div>
      <div className="p-4 min-h-[180px] flex flex-col gap-3">
        <div
          className="transition-opacity duration-300"
          style={{ opacity: showQuestion ? 1 : 0 }}
        >
          <div className="text-[13px]/[20px] text-[#999] mb-1 font-mono-override">
            you
          </div>
          <div className="text-[14px]/[21px] text-[#3F3F3F]">
            {conversation.question}
          </div>
        </div>
        {(displayedAnswer || isTyping) && (
          <div
            className="transition-opacity duration-300"
            style={{ opacity: showQuestion ? 1 : 0 }}
          >
            <div className="text-[13px]/[20px] text-[#999] mb-1 font-mono-override">
              grug
            </div>
            <div className="text-[14px]/[21px] text-[#3F3F3F]">
              {displayedAnswer}
              {isTyping && (
                <span className="inline-block w-[2px] h-[14px] bg-[#3F3F3F] ml-0.5 align-text-bottom animate-pulse" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
