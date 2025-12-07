
import {
    Project,
    User,
    NewsArticle,
    Transaction,
    Contributor,
    MerchandiseItem,
    Order,
    Donation,
    Account,
    AccountSubtype,
    AccountType,
    Withdrawal,
    Ticket,
    LeadershipProfile,
    MinistryScheduleItem,
    MinistryPillar,
} from './types';
import bonfaceImg from './assets/images/bonface.jpg';

const getFutureDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
}

const getPastDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
}

export const MANDATORY_CONTRIBUTION_AMOUNT = 100;

// API Configuration (single source of truth for frontend)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://uetjkuat-54286e10a43b.herokuapp.com/api';

const mockContributors: Contributor[] = [
    { name: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?u=alice' },
    { name: 'Bob Williams', avatar: 'https://i.pravatar.cc/150?u=bob' },
    { name: 'Charlie Brown', avatar: 'https://i.pravatar.cc/150?u=charlie' },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Campus Outreach Mission 2024',
    description: 'Funding for our annual campus-wide mission to spread the gospel and provide support to students.',
    longDescription: 'This annual mission is the cornerstone of our evangelistic efforts at JKUAT. Funds will cover printing of materials, logistical support for volunteers, and follow-up activities for new converts. Our goal is to reach over 5,000 students this year.',
    category: 'Evangelism',
    fundingGoal: 150000,
    currentAmount: 75000,
    featuredImage: 'https://picsum.photos/seed/mission/600/400',
    endDate: getFutureDate(30),
    organizer: 'John Doe, Mission Coordinator',
    impactStatement: 'Your support will help bring the message of hope to thousands of students, fostering a new generation of believers on campus.',
    updates: [
        { date: '2024-07-15', description: 'Volunteer registration is now open! We have already signed up 50 students.' },
        { date: '2024-07-10', description: 'Initial batch of outreach materials has been designed and sent to the printer.' },
    ],
    contributors: [mockContributors[0], mockContributors[2]]
  },
  {
    id: 2,
    title: 'Community Children\'s Home Support',
    description: 'Providing essential supplies, food, and educational materials for a local children\'s home.',
    longDescription: 'We are partnering with the "Upendo Children\'s Home" in Juja to provide much-needed support. This project will supply them with food for three months, new bedding, and a small library of educational books.',
    category: 'Community Service',
    fundingGoal: 200000,
    currentAmount: 180000,
    featuredImage: 'https://picsum.photos/seed/children/600/400',
    endDate: getFutureDate(15),
    organizer: 'Jane Smith, Community Outreach Lead',
    impactStatement: 'Directly impacts the lives of 40 children by providing a safe, comfortable, and nurturing environment for them to grow and learn.',
    updates: [
        { date: '2024-07-20', description: 'We are just KES 20,000 away from our goal! Thank you for your amazing support.' },
    ],
    contributors: [mockContributors[1], mockContributors[0], mockContributors[2]]
  },
  {
    id: 3,
    title: 'Sound System Upgrade for Main Hall',
    description: 'Improving our worship experience with a new, state-of-the-art sound system for our main gatherings.',
    longDescription: 'Our current sound system is over a decade old and struggles to serve our growing congregation. This upgrade includes new speakers, a digital mixing console, and microphones to ensure a clear and immersive worship experience for everyone.',
    category: 'Infrastructure',
    fundingGoal: 350000,
    currentAmount: 120000,
    featuredImage: 'https://picsum.photos/seed/sound/600/400',
    endDate: getFutureDate(60),
    organizer: 'Samwel Kariuki, Technical Lead',
    impactStatement: 'Enhance the quality of our weekly services and major events, ensuring the message and music are delivered with clarity and excellence.',
    updates: [
        { date: '2024-07-01', description: 'Received official quotes from three different suppliers. We are now evaluating the best option.' },
    ],
    contributors: [mockContributors[1]]
  },
  {
    id: 4,
    title: 'Leadership Training Seminar',
    description: 'Empowering the next generation of leaders within the Christian Union through a weekend-long intensive seminar.',
    longDescription: 'This seminar will bring in experienced speakers to train our student leaders in areas of discipleship, ministry management, and public speaking. The goal is to equip them for effective service within UETJKUAT and beyond.',
    category: 'Training',
    fundingGoal: 80000,
    currentAmount: 80000,
    featuredImage: 'https://picsum.photos/seed/leader/600/400',
    endDate: getFutureDate(-10), // Ended in the past
    organizer: 'Leadership Development Committee',
    impactStatement: 'Invests in the spiritual and practical growth of over 30 student leaders, creating a ripple effect of strong leadership throughout the CU.',
    updates: [
        { date: '2024-06-20', description: 'The seminar was a great success! We are grateful to all who supported this project.' },
    ],
    contributors: [...mockContributors, { name: 'David Lee', avatar: 'https://i.pravatar.cc/150?u=david'}]
  },
  {
    id: 5,
    title: 'Student Welfare Fund',
    description: 'A dedicated fund to assist students facing unexpected financial hardships, ensuring they can continue their studies.',
    longDescription: 'This fund provides small, one-time grants to students who are at risk of dropping out due to unforeseen financial emergencies, such as medical bills or loss of a sponsor. A committee confidentially reviews applications to ensure funds are distributed to those in genuine need.',
    category: 'Welfare',
    fundingGoal: 250000,
    currentAmount: 95000,
    featuredImage: 'https://picsum.photos/seed/welfare/600/400',
    endDate: getFutureDate(45),
    organizer: 'Welfare Department',
    impactStatement: 'Acts as a safety net for our most vulnerable members, providing critical support that allows them to complete their education.',
    updates: [],
    contributors: []
  },
  {
    id: 6,
    title: 'Annual Bible Study Conference',
    description: 'Hosting a regional conference to deepen understanding of the scriptures among students from various universities.',
    longDescription: 'This 3-day conference will feature in-depth teaching from renowned Bible scholars, breakout sessions on various books of the Bible, and powerful worship sessions. We expect to host students from over 5 universities in the region.',
    category: 'Conference',
    fundingGoal: 120000,
    currentAmount: 40000,
    featuredImage: 'https://picsum.photos/seed/bible/600/400',
    endDate: getFutureDate(5),
    organizer: 'Conference Planning Team',
    impactStatement: 'Deepen the biblical literacy and spiritual passion of hundreds of students, equipping them to be effective witnesses in their respective campuses.',
    updates: [
        { date: '2024-07-22', description: 'Final speaker confirmations are in! The program is looking fantastic.' },
        { date: '2024-07-18', description: 'Venue has been booked and a down payment made. Excitement is building!' },
    ],
    contributors: [mockContributors[0]]
  },
];


export const MOCK_USERS: User[] = [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        avatar: 'https://i.pravatar.cc/150?u=admin',
        password: 'password123',
        role: 'admin',
        status: 'active',
        phoneNumber: '254700000001',
        yearOfStudy: '4th Year',
        course: 'Information Technology',
        college: 'COHES',
        admissionNumber: 'IT/001/21',
        ministryInterest: 'Media',
        residence: 'Juja'
    },
    {
        id: 101,
        name: 'Jane Contributor',
        email: 'jane@example.com',
        avatar: 'https://i.pravatar.cc/150?u=jane_contributor',
        password: 'password123',
        role: 'user',
        status: 'active',
        phoneNumber: '254711223344',
        yearOfStudy: '3rd Year',
        course: 'Civil Engineering',
        college: 'COETEC',
        admissionNumber: 'CI/234/22',
        ministryInterest: 'Evangelism',
        residence: 'Hall 6'
    },
    {
        id: 102,
        name: 'John Donor',
        email: 'john@example.com',
        avatar: 'https://i.pravatar.cc/150?u=john_donor',
        password: 'password123',
        role: 'user',
        status: 'inactive',
        phoneNumber: '254722334455',
        yearOfStudy: 'Alumnus',
        course: 'Mechanical Engineering',
        college: 'COETEC',
        admissionNumber: 'ME/099/16',
        ministryInterest: 'Discipleship',
        residence: 'Nairobi'
    },
];


export const MOCK_NEWS_ARTICLES: NewsArticle[] = [
    {
        id: 1,
        title: 'UETJKUAT Community Shines in Annual Charity Marathon',
        excerpt: 'Over 200 members of the UETJKUAT community participated in the Nairobi Charity Marathon, raising funds and awareness for clean water projects in rural Kenya.',
        imageUrl: 'https://picsum.photos/seed/marathon/600/400',
        author: 'UETJKUAT Media Team',
        date: 'July 15, 2024',
        category: 'Community'
    },
    {
        id: 2,
        title: 'A Look Ahead: Plans for the Upcoming Semester',
        excerpt: 'The leadership team outlines the theme and key events for the upcoming semester, including the annual mission and a new mentorship program.',
        imageUrl: 'https://picsum.photos/seed/planning/600/400',
        author: 'CU Chairman',
        date: 'July 10, 2024',
        category: 'Announcements'
    },
    {
        id: 3,
        title: 'Alumni Spotlight: Where Are They Now?',
        excerpt: 'We catch up with former UETJKUAT leaders who are now making significant impacts in ministry, business, and technology across the globe.',
        imageUrl: 'https://picsum.photos/seed/alumni/600/400',
        author: 'Alumni Association',
        date: 'July 5, 2024',
        category: 'Alumni'
    }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: 'txn-2401',
        projectId: 1,
        projectTitle: 'Campus Outreach Mission 2024',
        amount: 5000,
        date: getPastDate(2),
        type: 'donation',
        status: 'completed',
        reference: 'MPESA-RFJ23',
        phoneNumber: '254711223344',
        userId: 101,
    },
    {
        id: 'txn-2399',
        projectId: 5,
        projectTitle: 'Student Welfare Fund',
        amount: 1200,
        date: getPastDate(6),
        type: 'donation',
        status: 'completed',
        reference: 'MPESA-HHF67',
        phoneNumber: '254722334455',
        userId: 102,
    },
    {
        id: 'txn-2394',
        projectId: 4,
        projectTitle: 'Leadership Training Seminar',
        amount: 100,
        date: getPastDate(10),
        type: 'donation',
        status: 'completed',
        reference: 'MPESA-PLEDGE',
        phoneNumber: '254700000001',
        userId: 1,
    },
];

export const MOCK_DONATIONS: Donation[] = [
    {
        id: 'don-2401',
        projectId: 1,
        projectTitle: 'Campus Outreach Mission 2024',
        amount: 5000,
        mpesaReceipt: 'QBC123XYZ',
        phoneNumber: '254711223344',
        donorName: 'Jane Contributor',
        userId: 101,
        status: 'completed',
        createdAt: getPastDate(2),
    },
    {
        id: 'don-2399',
        projectId: 5,
        projectTitle: 'Student Welfare Fund',
        amount: 1200,
        mpesaReceipt: 'QBC345XYZ',
        phoneNumber: '254722334455',
        donorName: 'John Donor',
        userId: 102,
        status: 'completed',
        createdAt: getPastDate(6),
    },
    {
        id: 'don-2394',
        projectId: 4,
        projectTitle: 'Leadership Training Seminar',
        amount: 100,
        phoneNumber: '254700000001',
        donorName: 'Admin User',
        userId: 1,
        status: 'completed',
        createdAt: getPastDate(10),
        mpesaReceipt: 'QBC455XYZ',
    },
];

export const MOCK_ACCOUNT_TYPES: AccountType[] = [
    { id: 1, name: 'Operating', description: 'Primary ministry operational accounts' },
    { id: 2, name: 'Project', description: 'Designated accounts for specific projects' },
];

export const MOCK_ACCOUNT_SUBTYPES: AccountSubtype[] = [
    { id: 1, accountTypeId: 1, name: 'General Fund', description: 'Daily running costs' },
    { id: 2, accountTypeId: 1, name: 'Welfare Support', description: 'Emergency welfare assistance' },
    { id: 3, accountTypeId: 2, name: 'Outreach Mission', description: 'Missions & evangelism projects' },
    { id: 4, accountTypeId: 2, name: 'Infrastructure', description: 'Assets and equipment' },
];

export const MOCK_ACCOUNTS: Account[] = [
    {
        id: 1,
        reference: 'UET-GEN-001',
        label: 'General Ministry Operations',
        accountTypeId: 1,
        accountSubtypeId: 1,
        balance: 183450,
        ownerName: 'UET Finance',
        ownerPhone: '254700000001',
        status: 'active',
        createdAt: getPastDate(120),
    },
    {
        id: 2,
        reference: 'UET-WEL-014',
        label: 'Student Welfare Account',
        accountTypeId: 1,
        accountSubtypeId: 2,
        balance: 65400,
        ownerName: 'UET Welfare',
        ownerPhone: '254722334455',
        status: 'active',
        createdAt: getPastDate(200),
    },
    {
        id: 3,
        reference: 'UET-PRJ-002',
        label: 'Campus Outreach Mission 2024',
        accountTypeId: 2,
        accountSubtypeId: 3,
        balance: 75200,
        ownerName: 'Mission Coordinator',
        ownerPhone: '254711223344',
        status: 'active',
        createdAt: getPastDate(45),
    },
];

export const MOCK_WITHDRAWALS: Withdrawal[] = [
    {
        id: 401,
        accountId: 3,
        amount: 15000,
        requestedBy: 'John Doe',
        status: 'approved',
        createdAt: getPastDate(8),
        processedAt: getPastDate(7),
    },
    {
        id: 402,
        accountId: 2,
        amount: 8000,
        requestedBy: 'Mary Wanjiru',
        status: 'pending',
        createdAt: getPastDate(3),
    },
];

export const MOCK_TICKETS: Ticket[] = [
    {
        id: 1,
        ticketNumber: 'TKT-UET-001',
        memberMmid: 'UET12345',
        amount: 500,
        phoneNumber: '254711223344',
        status: 'active',
        purchaseDate: getPastDate(4),
        expiryDate: getFutureDate(26),
    },
    {
        id: 2,
        ticketNumber: 'TKT-UET-002',
        memberMmid: 'UET12345',
        amount: 500,
        phoneNumber: '254711223344',
        status: 'expired',
        purchaseDate: getPastDate(40),
        expiryDate: getPastDate(10),
    },
];

export const MOCK_MERCHANDISE: MerchandiseItem[] = [
    {
        id: 101,
        name: 'UETJKUAT Branded T-Shirt',
        description: 'High-quality cotton t-shirt with the official UETJKUAT logo. Available in all sizes.',
        price: 1200,
        imageUrl: 'https://picsum.photos/seed/tshirt/500/500',
        category: 'Apparel',
        stock: 50,
    },
    {
        id: 102,
        name: 'UETJKUAT Coffee Mug',
        description: 'Start your day with a reminder of the fellowship. Ceramic 11oz mug, dishwasher safe.',
        price: 800,
        imageUrl: 'https://picsum.photos/seed/mug/500/500',
        category: 'Accessories',
        stock: 100,
    },
    {
        id: 103,
        name: 'The CU Journey - History Book',
        description: 'A beautifully written book detailing the rich history and impact of the Christian Union at JKUAT.',
        price: 1500,
        imageUrl: 'https://picsum.photos/seed/book/500/500',
        category: 'Books',
        stock: 30,
    },
    {
        id: 104,
        name: 'UETJKUAT Branded Hoodie',
        description: 'Stay warm and stylish with this comfortable fleece hoodie. Perfect for cool evenings on campus.',
        price: 2500,
        imageUrl: 'https://picsum.photos/seed/hoodie/500/500',
        category: 'Apparel',
        stock: 40,
    },
];

export const MOCK_ORDERS: Order[] = [];

export const CHAIRPERSON_PROFILE: LeadershipProfile = {
    name: 'Boniface Mwanzia David',
    title: 'Chairperson – UET JKUAT (2025/2026)',
    photoUrl: bonfaceImg,
    bio: `I am Boniface Mwanzia David, a final-year student pursuing a Bachelor of Science in Banking and Finance and the current Chairperson of the Uttermost Evangelistic Team (UET), JKUAT Chapter, for the 2025/2026 spiritual year. My journey at UET has been transformative, shaping my spiritual growth, character, discipline, and vision. I desire to lead this team into a deeper knowledge of Jesus Christ—raising disciples who are rooted in the Word, bold in evangelism, and unwavering in their faith.`,
    scripture: '“But grow in the grace and knowledge of our Lord and Savior Jesus Christ. To Him be glory both now and forever! Amen.” – 2 Peter 3:18',
};

export const LEADERSHIP_TEAM: LeadershipProfile[] = [
    CHAIRPERSON_PROFILE,
    {
        name: 'Faith Wairimu',
        title: 'Vice Chairperson',
        photoUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=640&h=640&q=80',
        bio: 'Leads discipleship pathways and ensures every member finds a place to grow and serve.',
    },
    {
        name: 'Kevin Otieno',
        title: 'Treasurer',
        photoUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=640&h=640&q=80',
        bio: 'Stewards ministry finances with transparency and drives resource mobilisation efforts.',
    },
];

export const UET_WEEKLY_PROGRAM: MinistryScheduleItem[] = [
    {
        id: 'sun-fellowship',
        title: 'Sunday Fellowship',
        description: 'Campus-wide worship, teaching, testimonies, and ministry moments.',
        day: 'Sunday',
        time: '3:30 PM – 5:30 PM',
        location: 'Assembly Hall (breaks during long holidays)',
    },
    {
        id: 'tue-evangelism',
        title: 'Tuesday Evangelism',
        description: 'Street and door-to-door outreach across Juja and neighbouring communities.',
        day: 'Tuesday',
        time: '5:00 PM – 6:30 PM',
        location: 'Meet at Pavilion, go out in teams',
    },
    {
        id: 'wed-prayer',
        title: 'Leaders’ Prayer Meeting',
        description: 'Executive and ministry leaders stand in the gap for the campus and nation.',
        day: 'Wednesday',
        time: '8:00 PM – 9:30 PM',
        location: 'Missioners Hall Chapel',
    },
    {
        id: 'thu-fasting',
        title: 'Prayer & Fasting + Family Fellowship',
        description: 'Corporate day of seeking God culminating in family fellowship circles.',
        day: 'Thursday',
        time: 'Fasting all day; 7:00 PM – 8:30 PM fellowship',
        location: 'Various family hubs across campus',
    },
];

export const MINISTRY_PILLARS: MinistryPillar[] = [
    {
        id: 'word',
        title: 'Rooted in the Word',
        description: 'In-depth teaching, Bible study groups, and leadership development to ground believers in scripture.',
    },
    {
        id: 'prayer',
        title: 'Prevailing in Prayer',
        description: 'Consistent personal, corporate, and missional prayer rhythms that fuel ministry assignments.',
    },
    {
        id: 'evangelism',
        title: 'Bold Evangelism',
        description: 'Relentless outreach and missions to ensure every student hears and experiences the Gospel.',
    },
    {
        id: 'community',
        title: 'Family & Care',
        description: 'Strong spiritual families that offer discipleship, welfare support, and accountability.',
    },
];