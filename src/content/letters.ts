/**
 * The 29 scanned letters in appreciationletters.docx, in document order (letter-01 … letter-29).
 * Every caption was read from the scan itself: sender and office as printed on the letterhead, the date
 * as stamped or typed, and a one-line summary of what the letter says. Two letters are in Hindi
 * (letter-08, letter-29); their summaries are translations.
 */
export type LetterGroup = "leaders" | "ministers" | "ceremony" | "outgoing";

export type Letter = {
  id: string;
  from: string;
  /** Office as printed on the letterhead. */
  office: string;
  /** Date as it reads on the letter. */
  date: string;
  /** For sorting: ISO date, or the month when the day is not printed. */
  iso: string;
  summary: string;
  group: LetterGroup;
  language?: "Hindi";
  /** Shown on Home. */
  featured?: boolean;
};

export const LETTER_GROUPS: Record<LetterGroup, string> = {
  leaders: "President, Prime Minister, Chief Minister",
  ministers: "Union ministers, 2014",
  ceremony: "2015 ceremony and exhibition",
  outgoing: "From the Society",
};

export const letters: readonly Letter[] = [
  {
    id: "letter-01",
    from: "Dr. G. Satyanarayana",
    office: "To the President of the United States of America",
    date: "5 September 2012",
    iso: "2012-09-05",
    summary: "Request for a message launching the 1st Guardian Programme.",
    group: "outgoing",
  },
  {
    id: "letter-02",
    from: "Pranab Mukherjee",
    office: "President of India",
    date: "21 August 2012",
    iso: "2012-08-21",
    summary:
      "Welcomes the 1st Guardian Programme at the Indian Institute of Aero Space Technology and Management, Secunderabad, and the better interaction it envisages between technical institutions and industry.",
    group: "leaders",
    featured: true,
  },
  {
    id: "letter-03",
    from: "Dr. Harsh Vardhan",
    office: "Minister of Health & Family Welfare",
    date: "14 June 2014",
    iso: "2014-06-14",
    summary: "Thanks Dr. Satyanarayana for his greetings on becoming Health Minister and invites suggestions for the Ministry.",
    group: "ministers",
  },
  {
    id: "letter-04",
    from: "Dr. Jitendra Singh",
    office: "Minister of State, Prime Minister’s Office; Personnel; Science & Technology; Atomic Energy and Space",
    date: "12 June 2014",
    iso: "2014-06-12",
    summary: "Thanks him for his letter and good wishes on assuming charge, and looks forward to his cooperation.",
    group: "ministers",
  },
  {
    id: "letter-05",
    from: "Dr. Najma Heptulla",
    office: "Minister of Minority Affairs",
    date: "5 June 2014",
    iso: "2014-06-05",
    summary: "Appreciates his congratulations on her induction into the Union Cabinet.",
    group: "ministers",
  },
  {
    id: "letter-06",
    from: "Gen. (Dr.) Vijay Kumar Singh",
    office: "Minister of State for Development of North Eastern Region, External Affairs and Overseas Indian Affairs",
    date: "12 June 2014",
    iso: "2014-06-12",
    summary: "Thanks him for his congratulations and hopes to make good use of his experience during the tenure.",
    group: "ministers",
  },
  {
    id: "letter-07",
    from: "Bharat Lal",
    office: "Prime Minister’s Office, New Delhi",
    date: "18 June 2014",
    iso: "2014-06-18",
    summary: "The Prime Minister has received the Institute’s letter of felicitations and asked that his thanks be conveyed.",
    group: "leaders",
    featured: true,
  },
  {
    id: "letter-08",
    from: "Rajesh Kumar",
    office: "Additional Private Secretary to the Minister of Mines & Steel",
    date: "10 November 2015",
    iso: "2015-11-10",
    summary:
      "Thanks the Society for its invitation; the Minister could not attend the National Aerospace Museum Exhibition the Society held in Hyderabad on 27–29 November 2015.",
    group: "ceremony",
    language: "Hindi",
  },
  {
    id: "letter-09",
    from: "Air Vice Marshal M. K. Guleria, VSM",
    office: "Senior Maintenance Staff Officer, HQ Training Command, Indian Air Force, Bengaluru",
    date: "16 November 2015",
    iso: "2015-11-16",
    summary:
      "Congratulates Dr. Satyanarayana on establishing the Aerospace Society of India and conveys the AOC-in-C’s wishes for the programme’s success.",
    group: "ceremony",
  },
  {
    id: "letter-10",
    from: "Sudarshan Bhagat",
    office: "Minister of State for Rural Development",
    date: "2015",
    iso: "2015-11",
    summary:
      "Message for the Society’s ceremony and souvenir: its aim of producing high-quality aviation professionals carries forward the Skill India Mission.",
    group: "ceremony",
  },
  {
    id: "letter-11",
    from: "Krishan Pal Gurjar",
    office: "Minister of State for Social Justice & Empowerment",
    date: "2015",
    iso: "2015-11",
    summary:
      "Message for the ceremony “The Aerospace Society of India” at Ramoji Film City, Hyderabad, 27–29 November 2015, and its souvenir.",
    group: "ceremony",
  },
  {
    id: "letter-12",
    from: "Kalraj Mishra",
    office: "Minister of Micro, Small & Medium Enterprises",
    date: "November 2015",
    iso: "2015-11",
    summary:
      "Best wishes for the souvenir released at Ramoji Film City in the last week of November 2015, and for the Society’s skill-development work.",
    group: "ceremony",
  },
  {
    id: "letter-13",
    from: "Narendra Modi",
    office: "Chief Minister of Gujarat",
    date: "25 June 2012",
    iso: "2012-06-25",
    summary:
      "Appreciates the Institute’s efforts in introducing the 1st Guardian Program, an industry–institute co-operation under “Technical Nirman, Vision”.",
    group: "leaders",
    featured: true,
  },
  {
    id: "letter-14",
    from: "Sarbananda Sonowal",
    office: "Minister of State for Skill Development, Entrepreneurship, Youth Affairs and Sports",
    date: "9 June 2014",
    iso: "2014-06-09",
    summary: "Grateful for the Institute’s good wishes on his appointment as Union Minister.",
    group: "ministers",
  },
  {
    id: "letter-15",
    from: "Arun Jaitley",
    office: "Finance Minister of India",
    date: "4 June 2014",
    iso: "2014-06-04",
    summary: "Thanks Dr. Satyanarayana for his letter of 29 May 2014 on his appointment as Union Finance Minister.",
    group: "ministers",
  },
  {
    id: "letter-16",
    from: "Manoj Sinha",
    office: "Minister of State for Railways",
    date: "6 June 2014",
    iso: "2014-06-06",
    summary: "Thanks him for his greetings on assuming office as Minister of State for Railways.",
    group: "ministers",
  },
  {
    id: "letter-17",
    from: "Ananth Kumar",
    office: "Minister for Chemicals & Fertilizers",
    date: "6 June 2014",
    iso: "2014-06-06",
    summary: "Thanks him for his wishes and hopes for his continued support and co-operation.",
    group: "ministers",
  },
  {
    id: "letter-18",
    from: "Dharmendra Pradhan",
    office: "Minister of State for Petroleum & Natural Gas",
    date: "3 June 2014",
    iso: "2014-06-03",
    summary: "Acknowledges his letter of 28 May 2014 and looks forward to his cooperation.",
    group: "ministers",
  },
  {
    id: "letter-19",
    from: "Harsimrat Kaur Badal",
    office: "Minister of Food Processing Industries",
    date: "4 June 2014",
    iso: "2014-06-04",
    summary: "Thanks him for his good wishes on her induction into the Union Cabinet.",
    group: "ministers",
  },
  {
    id: "letter-20",
    from: "Jual Oram",
    office: "Minister of Tribal Affairs",
    date: "11 June 2014",
    iso: "2014-06-11",
    summary: "Thanks him for his felicitation and values his support and advice.",
    group: "ministers",
  },
  {
    id: "letter-21",
    from: "Mansukhbhai Vasava",
    office: "Minister of State for Tribal Affairs",
    date: "2 June 2014",
    iso: "2014-06-02",
    summary: "Thanks him for his good wishes and welcomes his guidance and suggestions.",
    group: "ministers",
  },
  {
    id: "letter-22",
    from: "Prakash Javadekar",
    office: "Minister of State for Information & Broadcasting, Environment, Forest & Climate Change and Parliamentary Affairs",
    date: "6 June 2014",
    iso: "2014-06-06",
    summary: "Thanks him for his letter of 28 May 2014 on his assumption of office.",
    group: "ministers",
  },
  {
    id: "letter-23",
    from: "Radha Mohan Singh",
    office: "Minister of Agriculture",
    date: "11 June 2014",
    iso: "2014-06-11",
    summary: "Thanks him for his letter congratulating him on joining the Union Cabinet.",
    group: "ministers",
  },
  {
    id: "letter-24",
    from: "Rajnath Singh",
    office: "Home Minister of India",
    date: "13 June 2014",
    iso: "2014-06-13",
    summary: "Acknowledges his letter of 28 May 2014 on his assumption of charge as Home Minister.",
    group: "ministers",
  },
  {
    id: "letter-25",
    from: "Ravi Shankar Prasad",
    office: "Minister of Law & Justice and Communications & IT",
    date: "19 June 2014",
    iso: "2014-06-19",
    summary: "Thanks him for his message of good wishes on assuming office.",
    group: "ministers",
  },
  {
    id: "letter-26",
    from: "Sandeep Kumar Sultania, IAS",
    office: "Private Secretary to the Minister of Urban Development",
    date: "12 June 2014",
    iso: "2014-06-12",
    summary: "Thanks him, on the Minister’s behalf, for his greetings, and welcomes his suggestions.",
    group: "ministers",
  },
  {
    id: "letter-27",
    from: "Shripad Naik",
    office: "Minister of State for Culture & Tourism",
    date: "June 2014",
    iso: "2014-06",
    summary: "Thanks him for his letter on becoming Minister of State for Culture and Tourism.",
    group: "ministers",
  },
  {
    id: "letter-28",
    from: "Sudarshan Bhagat",
    office: "Minister of State for Social Justice & Empowerment",
    date: "2 June 2014",
    iso: "2014-06-02",
    summary: "Thanks him for his congratulations on joining the Union Council of Ministers.",
    group: "ministers",
  },
  {
    id: "letter-29",
    from: "Smriti Zubin Irani",
    office: "Minister of Human Resource Development",
    date: "7 June 2014",
    iso: "2014-06-07",
    summary: "Thanks him for his good wishes on her taking charge as Minister of Human Resource Development.",
    group: "ministers",
    language: "Hindi",
  },
];

export const letterTitle = (letter: Letter): string => `${letter.from}, ${letter.office}, ${letter.date}`;
