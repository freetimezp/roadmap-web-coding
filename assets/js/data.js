// Add new lessons here. The catalog UI is generated from this data.
export const roadmapData = [
    {
        id: 1,
        number: "001",
        title: "HTML Headings",
        description:
            "Learn h1–h6, heading hierarchy, font sizes, and semantic structure.",
        category: "HTML",

        topic: "Fundamentals",
        difficulty: "Beginner",
        status: "published",

        learningUrl: "https://github.com/freetimezp/school-001-heading",
        learningDemo: "https://freetimezp.github.io/school-001-heading/",
        testUrl: "https://github.com/freetimezp/skillscheck-001-heading",
        testDemo: "https://freetimezp.github.io/skillscheck-001-heading/",

        preview: "./assets/images/100/001-heading.jpg",
        tags: ["HTML", "Headings", "Semantic HTML", "Fundamentals"],
    },

    {
        id: 2,
        number: "002",
        title: "HTML Paragraph",
        description:
            "Learn how to shape paragraphs into something people actually enjoy reading.",
        category: "HTML",

        topic: "Fundamentals",
        difficulty: "Beginner",
        status: "published",

        learningUrl: "https://github.com/freetimezp/school-002-paragraph",
        learningDemo: "https://freetimezp.github.io/school-002-paragraph/",
        testUrl: "https://github.com/freetimezp/skillscheck-002-paragraph",
        testDemo: "https://freetimezp.github.io/skillscheck-002-paragraph/",

        preview: "./assets/images/100/002-paragraph.jpg",
        tags: ["HTML", "Paragraph", "Semantic HTML", "Fundamentals"],
    },
];

// Future entries can use status: "planned" or "in-progress".
// Only published entries appear in the public catalog by default.
