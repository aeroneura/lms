// Course data for the LMS application
const COURSES_DATA = [
    {
        id: 'web-dev-fundamentals',
        title: 'Web Development Fundamentals',
        description: 'Learn the basics of web development including HTML, CSS, and JavaScript. Perfect for beginners looking to start their coding journey.',
        category: 'Web Development',
        level: 'Beginner',
        duration: '4 hours',
        instructor: 'Sarah Johnson',
        prerequisites: 'Basic computer skills',
        objectives: [
            'Understand HTML structure and semantic markup',
            'Style web pages with CSS',
            'Add interactivity with JavaScript',
            'Build responsive layouts',
            'Deploy your first website'
        ],
        lessons: [
            {
                id: 'html-basics',
                title: 'HTML Basics',
                type: 'video',
                duration: '45 min',
                content: `
                    <h2>Introduction to HTML</h2>
                    <p>HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page using markup.</p>
                    
                    <h3>HTML Elements</h3>
                    <p>HTML is made up of elements, which are represented by tags. Tags are keywords surrounded by angle brackets.</p>
                    
                    <pre><code>&lt;h1&gt;This is a heading&lt;/h1&gt;
&lt;p&gt;This is a paragraph.&lt;/p&gt;</code></pre>
                    
                    <h3>Document Structure</h3>
                    <p>Every HTML document should have a basic structure:</p>
                    
                    <pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;title&gt;Page Title&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;h1&gt;My First Heading&lt;/h1&gt;
    &lt;p&gt;My first paragraph.&lt;/p&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>
                    
                    <h3>Common HTML Elements</h3>
                    <ul>
                        <li><strong>Headings:</strong> &lt;h1&gt; to &lt;h6&gt;</li>
                        <li><strong>Paragraphs:</strong> &lt;p&gt;</li>
                        <li><strong>Links:</strong> &lt;a href="url"&gt;</li>
                        <li><strong>Images:</strong> &lt;img src="image.jpg" alt="description"&gt;</li>
                        <li><strong>Lists:</strong> &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;</li>
                    </ul>
                    
                    <div class="practice-exercise">
                        <h4>Practice Exercise</h4>
                        <p>Create a simple HTML page with a heading, paragraph, and a list of your favorite hobbies.</p>
                    </div>
                `
            },
            {
                id: 'css-styling',
                title: 'CSS Styling',
                type: 'video',
                duration: '60 min',
                content: `
                    <h2>Introduction to CSS</h2>
                    <p>CSS (Cascading Style Sheets) is used to style and layout web pages. It controls the visual presentation of HTML elements.</p>
                    
                    <h3>CSS Syntax</h3>
                    <p>CSS consists of selectors and declarations:</p>
                    
                    <pre><code>selector {
    property: value;
    property: value;
}</code></pre>
                    
                    <h3>Types of Selectors</h3>
                    <ul>
                        <li><strong>Element selector:</strong> <code>p { color: blue; }</code></li>
                        <li><strong>Class selector:</strong> <code>.highlight { background: yellow; }</code></li>
                        <li><strong>ID selector:</strong> <code>#header { font-size: 24px; }</code></li>
                    </ul>
                    
                    <h3>Common CSS Properties</h3>
                    <ul>
                        <li><strong>Text:</strong> color, font-size, font-family, text-align</li>
                        <li><strong>Background:</strong> background-color, background-image</li>
                        <li><strong>Box Model:</strong> margin, padding, border, width, height</li>
                        <li><strong>Layout:</strong> display, position, float</li>
                    </ul>
                    
                    <h3>The Box Model</h3>
                    <p>Every HTML element is a rectangular box consisting of:</p>
                    <ul>
                        <li>Content - The actual content of the element</li>
                        <li>Padding - Space around the content</li>
                        <li>Border - A border around the padding</li>
                        <li>Margin - Space outside the border</li>
                    </ul>
                    
                    <div class="practice-exercise">
                        <h4>Practice Exercise</h4>
                        <p>Style your HTML page from the previous lesson with colors, fonts, and spacing.</p>
                    </div>
                `
            },
            {
                id: 'javascript-basics',
                title: 'JavaScript Basics',
                type: 'video',
                duration: '75 min',
                content: `
                    <h2>Introduction to JavaScript</h2>
                    <p>JavaScript is a programming language that adds interactivity to web pages. It can update content, control multimedia, animate images, and much more.</p>
                    
                    <h3>Variables</h3>
                    <p>Variables store data values. In JavaScript, you can declare variables using <code>let</code>, <code>const</code>, or <code>var</code>:</p>
                    
                    <pre><code>let name = "John";
const age = 30;
var isStudent = true;</code></pre>
                    
                    <h3>Data Types</h3>
                    <ul>
                        <li><strong>String:</strong> "Hello World"</li>
                        <li><strong>Number:</strong> 42, 3.14</li>
                        <li><strong>Boolean:</strong> true, false</li>
                        <li><strong>Array:</strong> [1, 2, 3]</li>
                        <li><strong>Object:</strong> {name: "John", age: 30}</li>
                    </ul>
                    
                    <h3>Functions</h3>
                    <p>Functions are blocks of code designed to perform particular tasks:</p>
                    
                    <pre><code>function greetUser(name) {
    return "Hello, " + name + "!";
}

let greeting = greetUser("Sarah");</code></pre>
                    
                    <h3>DOM Manipulation</h3>
                    <p>JavaScript can interact with HTML elements through the Document Object Model (DOM):</p>
                    
                    <pre><code>// Get an element by ID
let element = document.getElementById("myButton");

// Change content
element.innerHTML = "New Text";

// Add event listener
element.addEventListener("click", function() {
    alert("Button clicked!");
});</code></pre>
                    
                    <div class="practice-exercise">
                        <h4>Practice Exercise</h4>
                        <p>Add a button to your HTML page that changes the text of a paragraph when clicked.</p>
                    </div>
                `
            },
            {
                id: 'responsive-design',
                title: 'Responsive Design',
                type: 'video',
                duration: '50 min',
                content: `
                    <h2>Responsive Web Design</h2>
                    <p>Responsive design ensures that web pages look good on all devices - desktops, tablets, and phones.</p>
                    
                    <h3>Viewport Meta Tag</h3>
                    <p>Always include the viewport meta tag in your HTML head:</p>
                    
                    <pre><code>&lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;</code></pre>
                    
                    <h3>Flexible Grid Systems</h3>
                    <p>Use percentage-based widths instead of fixed pixels:</p>
                    
                    <pre><code>.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

.column {
    width: 33.33%;
    float: left;
}</code></pre>
                    
                    <h3>CSS Media Queries</h3>
                    <p>Media queries apply different styles for different screen sizes:</p>
                    
                    <pre><code>/* Desktop styles */
.container {
    width: 1200px;
}

/* Tablet styles */
@media screen and (max-width: 768px) {
    .container {
        width: 100%;
        padding: 20px;
    }
}

/* Mobile styles */
@media screen and (max-width: 480px) {
    .column {
        width: 100%;
        float: none;
    }
}</code></pre>
                    
                    <h3>Flexbox Layout</h3>
                    <p>Flexbox provides an efficient way to arrange items:</p>
                    
                    <pre><code>.flex-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.flex-item {
    flex: 1;
}</code></pre>
                    
                    <div class="practice-exercise">
                        <h4>Practice Exercise</h4>
                        <p>Make your website responsive by adding media queries and flexible layouts.</p>
                    </div>
                `
            }
        ],
        quiz: {
            id: 'web-dev-quiz',
            questions: [
                {
                    question: 'What does HTML stand for?',
                    options: [
                        'HyperText Markup Language',
                        'High Tech Modern Language',
                        'Home Tool Markup Language',
                        'Hyper Transfer Markup Language'
                    ],
                    correctAnswer: 0
                },
                {
                    question: 'Which CSS property is used to change the text color?',
                    options: [
                        'font-color',
                        'text-color',
                        'color',
                        'foreground-color'
                    ],
                    correctAnswer: 2
                },
                {
                    question: 'What keyword is used to declare a variable in modern JavaScript?',
                    options: [
                        'var',
                        'let',
                        'const',
                        'Both let and const'
                    ],
                    correctAnswer: 3
                },
                {
                    question: 'What is the purpose of media queries in CSS?',
                    options: [
                        'To load external media files',
                        'To create responsive designs for different screen sizes',
                        'To query database information',
                        'To optimize media file sizes'
                    ],
                    correctAnswer: 1
                },
                {
                    question: 'Which HTML element is used to create a hyperlink?',
                    options: [
                        '<link>',
                        '<href>',
                        '<a>',
                        '<url>'
                    ],
                    correctAnswer: 2
                }
            ],
            timeLimit: 10,
            passingScore: 70
        }
    },
    {
        id: 'python-programming',
        title: 'Python Programming for Beginners',
        description: 'Master the fundamentals of Python programming. Learn variables, functions, loops, and object-oriented programming concepts.',
        category: 'Programming',
        level: 'Beginner',
        duration: '6 hours',
        instructor: 'Michael Chen',
        prerequisites: 'No programming experience required',
        objectives: [
            'Understand Python syntax and basic concepts',
            'Work with variables and data types',
            'Control program flow with loops and conditions',
            'Create and use functions',
            'Introduction to object-oriented programming'
        ],
        lessons: [
            {
                id: 'python-intro',
                title: 'Introduction to Python',
                type: 'video',
                duration: '30 min'
            },
            {
                id: 'variables-data-types',
                title: 'Variables and Data Types',
                type: 'video',
                duration: '45 min'
            },
            {
                id: 'control-structures',
                title: 'Control Structures',
                type: 'video',
                duration: '60 min'
            },
            {
                id: 'functions',
                title: 'Functions and Modules',
                type: 'video',
                duration: '75 min'
            },
            {
                id: 'oop-basics',
                title: 'Object-Oriented Programming Basics',
                type: 'video',
                duration: '90 min'
            }
        ],
        quiz: {
            id: 'python-quiz',
            questions: [
                {
                    question: 'What is the correct way to create a variable in Python?',
                    options: [
                        'var x = 5',
                        'x = 5',
                        'int x = 5',
                        'create x = 5'
                    ],
                    correctAnswer: 1
                },
                {
                    question: 'Which of the following is a Python data type?',
                    options: [
                        'list',
                        'dict',
                        'tuple',
                        'All of the above'
                    ],
                    correctAnswer: 3
                },
                {
                    question: 'How do you create a function in Python?',
                    options: [
                        'function myFunction():',
                        'def myFunction():',
                        'create myFunction():',
                        'func myFunction():'
                    ],
                    correctAnswer: 1
                }
            ],
            timeLimit: 8,
            passingScore: 75
        }
    },
    {
        id: 'data-science-intro',
        title: 'Introduction to Data Science',
        description: 'Explore the fundamentals of data science including data analysis, visualization, and machine learning basics using Python.',
        category: 'Data Science',
        level: 'Intermediate',
        duration: '8 hours',
        instructor: 'Dr. Emily Rodriguez',
        prerequisites: 'Basic Python knowledge',
        objectives: [
            'Understand data science workflow',
            'Learn data manipulation with Pandas',
            'Create visualizations with Matplotlib',
            'Basic statistical analysis',
            'Introduction to machine learning'
        ],
        lessons: [
            {
                id: 'data-science-overview',
                title: 'Data Science Overview',
                type: 'video',
                duration: '40 min'
            },
            {
                id: 'pandas-basics',
                title: 'Data Manipulation with Pandas',
                type: 'interactive',
                duration: '90 min'
            },
            {
                id: 'data-visualization',
                title: 'Data Visualization',
                type: 'interactive',
                duration: '75 min'
            },
            {
                id: 'statistical-analysis',
                title: 'Statistical Analysis',
                type: 'video',
                duration: '85 min'
            },
            {
                id: 'ml-introduction',
                title: 'Machine Learning Basics',
                type: 'video',
                duration: '90 min'
            }
        ],
        quiz: {
            id: 'data-science-quiz',
            questions: [
                {
                    question: 'What is the primary library used for data manipulation in Python?',
                    options: [
                        'NumPy',
                        'Pandas',
                        'Matplotlib',
                        'Scikit-learn'
                    ],
                    correctAnswer: 1
                },
                {
                    question: 'Which type of chart is best for showing trends over time?',
                    options: [
                        'Bar chart',
                        'Pie chart',
                        'Line chart',
                        'Scatter plot'
                    ],
                    correctAnswer: 2
                }
            ],
            timeLimit: 12,
            passingScore: 80
        }
    },
    {
        id: 'digital-marketing',
        title: 'Digital Marketing Fundamentals',
        description: 'Learn the essentials of digital marketing including SEO, social media marketing, content marketing, and analytics.',
        category: 'Marketing',
        level: 'Beginner',
        duration: '5 hours',
        instructor: 'Amanda Foster',
        prerequisites: 'Basic understanding of the internet',
        objectives: [
            'Understand digital marketing landscape',
            'Learn SEO fundamentals',
            'Create effective social media strategies',
            'Master content marketing basics',
            'Analyze marketing performance'
        ],
        lessons: [
            {
                id: 'digital-marketing-overview',
                title: 'Digital Marketing Landscape',
                type: 'video',
                duration: '35 min'
            },
            {
                id: 'seo-fundamentals',
                title: 'SEO Fundamentals',
                type: 'text',
                duration: '60 min'
            },
            {
                id: 'social-media-marketing',
                title: 'Social Media Marketing',
                type: 'video',
                duration: '70 min'
            },
            {
                id: 'content-marketing',
                title: 'Content Marketing Strategy',
                type: 'text',
                duration: '55 min'
            },
            {
                id: 'marketing-analytics',
                title: 'Marketing Analytics',
                type: 'video',
                duration: '60 min'
            }
        ],
        quiz: {
            id: 'marketing-quiz',
            questions: [
                {
                    question: 'What does SEO stand for?',
                    options: [
                        'Social Engine Optimization',
                        'Search Engine Optimization',
                        'Site Engine Optimization',
                        'Search Engine Operations'
                    ],
                    correctAnswer: 1
                },
                {
                    question: 'Which metric measures the percentage of visitors who leave after viewing only one page?',
                    options: [
                        'Conversion rate',
                        'Click-through rate',
                        'Bounce rate',
                        'Engagement rate'
                    ],
                    correctAnswer: 2
                }
            ],
            timeLimit: 10,
            passingScore: 70
        }
    },
    {
        id: 'ux-ui-design',
        title: 'UX/UI Design Principles',
        description: 'Master the principles of user experience and user interface design. Learn to create intuitive and beautiful digital experiences.',
        category: 'Design',
        level: 'Intermediate',
        duration: '7 hours',
        instructor: 'David Kim',
        prerequisites: 'Basic design knowledge helpful',
        objectives: [
            'Understand UX/UI design principles',
            'Learn user research techniques',
            'Master design thinking process',
            'Create wireframes and prototypes',
            'Design accessible interfaces'
        ],
        lessons: [
            {
                id: 'ux-ui-introduction',
                title: 'UX vs UI Design',
                type: 'video',
                duration: '45 min'
            },
            {
                id: 'user-research',
                title: 'User Research and Personas',
                type: 'interactive',
                duration: '80 min'
            },
            {
                id: 'design-thinking',
                title: 'Design Thinking Process',
                type: 'video',
                duration: '70 min'
            },
            {
                id: 'wireframing',
                title: 'Wireframing and Prototyping',
                type: 'interactive',
                duration: '90 min'
            },
            {
                id: 'accessibility',
                title: 'Designing for Accessibility',
                type: 'text',
                duration: '55 min'
            }
        ],
        quiz: {
            id: 'ux-ui-quiz',
            questions: [
                {
                    question: 'What is the primary focus of UX design?',
                    options: [
                        'Visual aesthetics',
                        'User experience and usability',
                        'Brand consistency',
                        'Technical implementation'
                    ],
                    correctAnswer: 1
                },
                {
                    question: 'What is a wireframe?',
                    options: [
                        'A high-fidelity design',
                        'A user persona',
                        'A low-fidelity structural blueprint',
                        'A color palette'
                    ],
                    correctAnswer: 2
                }
            ],
            timeLimit: 10,
            passingScore: 75
        }
    },
    {
        id: 'cybersecurity-basics',
        title: 'Cybersecurity Fundamentals',
        description: 'Learn essential cybersecurity concepts, threats, and protection strategies for individuals and organizations.',
        category: 'Technology',
        level: 'Beginner',
        duration: '6 hours',
        instructor: 'Rebecca Martinez',
        prerequisites: 'Basic computer knowledge',
        objectives: [
            'Understand cybersecurity landscape',
            'Identify common security threats',
            'Learn password and authentication best practices',
            'Understand network security basics',
            'Implement security measures'
        ],
        lessons: [
            {
                id: 'cybersecurity-intro',
                title: 'Introduction to Cybersecurity',
                type: 'video',
                duration: '40 min'
            },
            {
                id: 'common-threats',
                title: 'Common Security Threats',
                type: 'text',
                duration: '65 min'
            },
            {
                id: 'password-security',
                title: 'Password and Authentication Security',
                type: 'video',
                duration: '50 min'
            },
            {
                id: 'network-security',
                title: 'Network Security Basics',
                type: 'video',
                duration: '75 min'
            },
            {
                id: 'security-best-practices',
                title: 'Security Best Practices',
                type: 'text',
                duration: '70 min'
            }
        ],
        quiz: {
            id: 'cybersecurity-quiz',
            questions: [
                {
                    question: 'What is phishing?',
                    options: [
                        'A type of firewall',
                        'A social engineering attack via email',
                        'A password encryption method',
                        'A network protocol'
                    ],
                    correctAnswer: 1
                },
                {
                    question: 'What does two-factor authentication add to security?',
                    options: [
                        'A second password',
                        'An additional verification step',
                        'Better encryption',
                        'Automatic backups'
                    ],
                    correctAnswer: 1
                }
            ],
            timeLimit: 12,
            passingScore: 80
        }
    },
    {
        id: 'project-management',
        title: 'Project Management Essentials',
        description: 'Master the fundamentals of project management including planning, execution, monitoring, and team leadership.',
        category: 'Business',
        level: 'Intermediate',
        duration: '5.5 hours',
        instructor: 'James Wilson',
        prerequisites: 'Work experience preferred',
        objectives: [
            'Understand project management lifecycle',
            'Learn planning and scheduling techniques',
            'Master risk management',
            'Develop team leadership skills',
            'Use project management tools effectively'
        ],
        lessons: [
            {
                id: 'pm-introduction',
                title: 'Project Management Overview',
                type: 'video',
                duration: '35 min'
            },
            {
                id: 'project-planning',
                title: 'Project Planning and Scheduling',
                type: 'interactive',
                duration: '80 min'
            },
            {
                id: 'risk-management',
                title: 'Risk Management',
                type: 'text',
                duration: '60 min'
            },
            {
                id: 'team-leadership',
                title: 'Team Leadership and Communication',
                type: 'video',
                duration: '70 min'
            },
            {
                id: 'pm-tools',
                title: 'Project Management Tools',
                type: 'interactive',
                duration: '45 min'
            }
        ],
        quiz: {
            id: 'pm-quiz',
            questions: [
                {
                    question: 'What are the main phases of a project lifecycle?',
                    options: [
                        'Planning, Execution, Closure',
                        'Initiation, Planning, Execution, Monitoring, Closure',
                        'Start, Middle, End',
                        'Research, Development, Testing, Launch'
                    ],
                    correctAnswer: 1
                },
                {
                    question: 'What is a project milestone?',
                    options: [
                        'A project team member',
                        'A significant point or event in the project',
                        'A project budget item',
                        'A type of project risk'
                    ],
                    correctAnswer: 1
                }
            ],
            timeLimit: 8,
            passingScore: 75
        }
    },
    {
        id: 'machine-learning-advanced',
        title: 'Advanced Machine Learning',
        description: 'Deep dive into advanced machine learning algorithms, neural networks, and deep learning frameworks.',
        category: 'Data Science',
        level: 'Advanced',
        duration: '12 hours',
        instructor: 'Dr. Alan Thompson',
        prerequisites: 'Intermediate Python, Statistics, Linear Algebra',
        objectives: [
            'Master advanced ML algorithms',
            'Understand neural networks and deep learning',
            'Learn to use TensorFlow and PyTorch',
            'Implement computer vision solutions',
            'Build natural language processing models'
        ],
        lessons: [
            {
                id: 'advanced-algorithms',
                title: 'Advanced ML Algorithms',
                type: 'video',
                duration: '90 min'
            },
            {
                id: 'neural-networks',
                title: 'Neural Networks Deep Dive',
                type: 'interactive',
                duration: '120 min'
            },
            {
                id: 'deep-learning-frameworks',
                title: 'TensorFlow and PyTorch',
                type: 'interactive',
                duration: '150 min'
            },
            {
                id: 'computer-vision',
                title: 'Computer Vision Applications',
                type: 'video',
                duration: '100 min'
            },
            {
                id: 'nlp-advanced',
                title: 'Advanced Natural Language Processing',
                type: 'interactive',
                duration: '180 min'
            }
        ],
        quiz: {
            id: 'advanced-ml-quiz',
            questions: [
                {
                    question: 'What is the vanishing gradient problem in deep neural networks?',
                    options: [
                        'When gradients become too large',
                        'When gradients become very small and training becomes ineffective',
                        'When the network overfits',
                        'When the network underfits'
                    ],
                    correctAnswer: 1
                },
                {
                    question: 'Which activation function helps mitigate the vanishing gradient problem?',
                    options: [
                        'Sigmoid',
                        'Tanh',
                        'ReLU',
                        'Linear'
                    ],
                    correctAnswer: 2
                }
            ],
            timeLimit: 20,
            passingScore: 85
        }
    }
];

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { COURSES_DATA };
}
