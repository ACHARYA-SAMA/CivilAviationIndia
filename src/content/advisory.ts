/**
 * Advisory committee of the Aero Space Society of India, transcribed from the owner's
 * "ADVISORY C MEMBERS OF ASSI.pdf" (names, qualifications and honours as printed; capitalisation
 * normalised, obvious typos such as "aard" for "award" corrected).
 */
export type AdvisoryMember = {
  name: string;
  qualifications: string;
  honours?: readonly string[];
};

export const advisoryCommittee: readonly AdvisoryMember[] = [
  {
    name: "R. N. Agarwal",
    qualifications: "Doctor of Science (Honoris Causa), M.E. (Aero), B.Sc., D.M.I.T. (Aero)",
    honours: [
      "Padma Shri, conferred by the President of India in 1990 for the successful launch of the Agni Technology Demonstrator",
      "Padma Bhushan, conferred by the President of India in 2000 for “Agni Weaponisation”",
      "DRDO Technology Leadership Award from the Prime Minister of India, 1998, as leader of the Agni Mission",
      "Biren Roy Space Sciences Award of the Aeronautical Society of India, 1990, for aeronautical engineering research",
      "Lifetime Achievement Award, 2004, from the Prime Minister for contributions to aerospace and the Agni Mission",
      "Chandrashekar Saraswati National Eminence Award for Science, 2000",
      "Rajasthan Shri, conferred by the State of Rajasthan",
      "Fellow, Aeronautical Society of India; Fellow, National Academy of Engineering",
    ],
  },
  {
    name: "Dr. Toleti Subba Rao",
    qualifications: "Ph.D. in Biotechnology; M.Sc. in Microbiology, Biochemistry and Immunology; B.Sc. in Botany, Chemistry, Biochemistry and Microbiology",
    honours: [
      "Shri S. K. Seshadri Memorial National Award 2013, The Electrochemical Society of India, Indian Institute of Science, Bengaluru",
      "Group Achievement Award 2011, Department of Atomic Energy, Government of India",
      "NACE Award for Excellence in Microbial Corrosion Science, 2006, National Association of Corrosion Engineers (USA), India Section",
      "Member of the Senate, Alagappa University, Karaikudi",
      "Fellow of the Society for Applied Biotechnology, India",
      "University Gold Medal, B.Sc. (Hons), Osmania University, Hyderabad",
      "Member of syllabus and selection committees at Anna University, Pondicherry University, Sri Ramachandra University and IGCAR Kalpakkam",
    ],
  },
  {
    name: "K. Jayaraman",
    qualifications: "M.Tech Aeronautical Engineering, B.Tech Aeronautical Engineering, B.Sc. Mathematics",
    honours: ["DRDO Performance Excellence Award 2008, for developing armour materials and systems for the Mi-17 helicopter"],
  },
  {
    name: "Ramarao V. Digumarthi",
    qualifications: "Ph.D. (Aeronautics and Astronautics), M.S. (Mechanical Engineering), M.S. (Computer Science), B.E. (Mechanical Engineering)",
  },
  { name: "GSR Sarma", qualifications: "Wing Commander, Indian Air Force; M.Sc. Physics (Electronics)" },
  { name: "MK Bose", qualifications: "Wing Commander, Indian Air Force" },
  { name: "Lt A. G. Jaisimha", qualifications: "Served in the Indian Navy; B.E. Electronics and Communication" },
  { name: "Dr. M. Sridevi", qualifications: "M.A. (Applied Economics), M.Phil., Ph.D. (Economics), Post-Doctoral Fellow of ICSSR" },
  { name: "PSN Rao", qualifications: "MBA (Human Resource Management), Degree and Diploma in Mechanical Engineering" },
  { name: "Shashi Palakodeti", qualifications: "Master of Computer Applications, Bachelor of Computer Science" },
  { name: "Neelima Gadicherla", qualifications: "Masters in Urban and Regional Planning, B.Arch." },
  { name: "Jagannath Baskaradoss", qualifications: "Master of Science in Technology" },
  { name: "G. Prasanthi Latha", qualifications: "Master of Engineering (Industrial Engineering)" },
];
