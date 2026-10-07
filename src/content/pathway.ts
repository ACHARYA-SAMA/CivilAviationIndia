/**
 * The planned 2 + 2 aviation-maintenance pathway with Spartan College of Aeronautics and Technology,
 * transcribed from the draft "Memorandum of Understanding, Aviation Maintenance Technology: Student
 * Pathway" (IIASTM_Spartan_MOU_V7.pdf) and the owner's correspondence with Spartan (Mar–Aug 2026).
 *
 * The MOU was not yet signed when this was written, and its section 5 asks IIASTM to obtain Spartan
 * College's written approval before using Spartan's name or program details in student-facing
 * material. Set `published` to false to take the page and the Home band offline until that approval
 * is in hand. Wording follows the MOU: no guarantee of admission, no claims about accreditation or
 * outcomes, and Spartan is the authority on Years 3 and 4. The seat-deposit amount is left out.
 */
export const usaPathway = {
  published: true,
  partner: "Spartan College of Aeronautics and Technology",
  campus: "Tulsa, Oklahoma, USA",
  from: { code: "HYD", place: "IIASTM, Secunderabad", lat: 17.53, lon: 78.48 },
  to: { code: "TUL", place: "Spartan College, Tulsa", lat: 36.16, lon: -95.86 },
  status: "Planned pathway. The agreement between IIASTM and Spartan College is being finalised; details may change before the first cohort, planned for 2027.",
  summary:
    "Two years of aviation maintenance study at IIASTM in Secunderabad, then two years in Spartan College’s Aviation Maintenance Technology program in Tulsa, Oklahoma, preparing you to sit for the FAA Airframe and Powerplant certificate.",
  stages: [
    {
      when: "Years 1 and 2",
      where: "IIASTM, Secunderabad, India",
      body: "Aviation maintenance study at IIASTM, taught in English. IIASTM is responsible for its curriculum and awards its own credential.",
    },
    {
      when: "Years 3 and 4",
      where: "Spartan College, Tulsa, Oklahoma, USA",
      body: "Students who meet Spartan College’s admission criteria join its Aviation Maintenance Technology (AMT) program and earn a Spartan College diploma. The program prepares students to sit for the FAA Airframe and Powerplant (A&P) certificate; exam preparation and exam fees are included in Spartan’s tuition.",
    },
    {
      when: "After graduation",
      where: "Back to India",
      body: "Graduates are expected to return to India. For those who obtain the FAA A&P certificate, IIASTM supports their pursuit of DGCA recognition of it.",
    },
  ],
  admission: {
    rule: "Spartan College alone decides admission. Completing Years 1 and 2 at IIASTM does not guarantee a place.",
    requirements: [
      "A qualifying high-school transcript",
      "Your IIASTM transcript for Years 1 and 2",
      "A passing score on the SmarterMeasure academic readiness assessment, given by Spartan College",
    ],
    english: "IIASTM teaches in English, so students who complete Years 1 and 2 are considered to meet Spartan College’s English-language requirement.",
    process: "Spartan College contacts each IIASTM cohort with pathway details and next steps. Students who choose the pathway apply to Spartan College directly and pay its seat deposit to Spartan.",
  },
  money: [
    { item: "Years 1 and 2 tuition", detail: "Set and collected by IIASTM." },
    { item: "Years 3 and 4 tuition", detail: "Set and collected by Spartan College, at its rates when you enrol." },
    { item: "Seat deposit", detail: "Paid to Spartan College when you enrol at IIASTM and credited to your first semester there. Refunded only if your F-1 visa or your Spartan admission is refused." },
    { item: "Proof of funds", detail: "Before issuing a Form I-20, Spartan College requires proof that you can cover at least one academic year of tuition, fees and living costs, as U.S. rules require." },
    { item: "Visa costs", detail: "The SEVIS fee, consulate application fee and travel are your own." },
  ],
  visa: "You study in the USA on an F-1 student visa. Spartan College assists with the process, including coordinating group visa appointments at U.S. consulates in India; IIASTM helps you prepare the documents in good time.",
  faqs: [
    {
      q: "Is a place at Spartan College guaranteed?",
      a: "No. Spartan College decides every admission on its own criteria. The pathway gives you a structured route and a clear set of requirements, not a guaranteed seat.",
    },
    {
      q: "Do I need IELTS or TOEFL?",
      a: "Students who complete Years 1 and 2 at IIASTM, which teaches in English, are considered to meet Spartan College’s English-language requirement.",
    },
    {
      q: "Will I hold an FAA licence at the end?",
      a: "Spartan’s program prepares you to sit for the FAA Airframe and Powerplant certificate. Certification depends on FAA examinations, examiner availability and your own performance, so it cannot be promised.",
    },
    {
      q: "Who answers questions about Years 3 and 4?",
      a: "Spartan College’s own admissions staff and materials are the authority on Years 3 and 4. IIASTM’s admissions office can tell you about Years 1 and 2 and put you in touch.",
    },
  ],
} as const;
