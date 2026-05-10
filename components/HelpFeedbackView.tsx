const helpItems = [
  {
    title: "더닝노트는 무엇인가요?",
    body: "흩어진 메모를 Inbox에 빠르게 기록하고, PARA 흐름에 맞춰 실행 가능한 구조로 정리하는 로컬 우선 메모 앱입니다.",
  },
  {
    title: "PARA가 무엇인가요?",
    body: "Project, Area, Resource, Archive의 약자로, 지금 실행할 일과 계속 관리할 영역, 참고 자료, 보관 항목을 나누는 정리 방식입니다.",
  },
  {
    title: "메모는 어디에 저장되나요?",
    body: "현재 MVP에서는 브라우저 localStorage에만 저장됩니다. 서버나 외부 데이터베이스로 전송하지 않습니다.",
  },
  {
    title: "파일은 어떻게 처리되나요?",
    body: "파일 본문은 업로드하지 않습니다. 선택한 파일의 이름, 크기, 타입 같은 메타데이터만 메모와 함께 저장합니다.",
  },
];

export function HelpFeedbackView() {
  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-3">
        {helpItems.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-[#dfe7da] bg-white/86 p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900/86"
          >
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-50">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
              {item.body}
            </p>
          </article>
        ))}
      </div>

      <aside className="rounded-2xl border border-[#dfe7da] bg-[#f8faf5] p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <p className="text-xs font-semibold uppercase text-[#6f8f73] dark:text-emerald-300">
          Feedback
        </p>
        <h2 className="mt-2 text-lg font-bold text-stone-900 dark:text-stone-50">
          피드백 보내기
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
          사용하면서 어색한 흐름이나 필요한 기능이 보이면 바로 남겨주세요.
        </p>
        <a
          href="mailto:pjh031126ju@gmail.com?subject=Dunning%20Note%20AI%20Feedback"
          className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#5f7f64] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4f6d55] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 dark:bg-emerald-100 dark:text-[#142018] dark:hover:bg-white dark:focus-visible:ring-emerald-900"
        >
          피드백 보내기
        </a>
      </aside>
    </section>
  );
}
