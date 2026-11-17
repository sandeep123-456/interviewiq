// Ye ek asli sequence hai (1, 2, 3), isliye yahan numbering sahi hai.
const STEPS = [
  {
    title: 'Choose a role and level',
    text: 'Frontend, Backend, Java, DSA or HR. Upload your resume if you want questions about your own projects.',
  },
  {
    title: 'Answer out loud or type',
    text: 'Questions arrive one at a time. If an answer is thin, you get a follow-up, like in a real round.',
  },
  {
    title: 'Read your report',
    text: 'You get a score for every answer, your weak topics, and a model answer for each question.',
  },
];

export default function HowItWorks() {
  return (
    // id="how": navbar ka "How it works" link yahin scroll karta hai
    <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
      <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
        How a session works
      </h2>

      <ol className="mt-12 grid gap-10 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative">
            <span className="relative z-10 grid h-10 w-10 place-items-center rounded-full bg-ink font-display font-bold text-white">
              {i + 1}
            </span>
            {/* Steps ko jodne wali line (last step ke baad nahi) */}
            {i < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute left-12 -right-9 top-5 hidden h-px bg-line md:block"
              />
            )}
            <h3 className="mt-5 font-display text-xl font-bold">{s.title}</h3>
            <p className="mt-2 max-w-xs text-muted">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}