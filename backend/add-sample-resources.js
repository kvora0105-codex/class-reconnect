// Script to add sample resources to the database for testing
const mongoose = require('mongoose');

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/classreconnect';
mongoose.connect(mongoURI);

// Define the Resource schema
const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: { type: String, required: true },
    semester: { type: String, required: true },
    type: { type: String, required: true },
    branch: { type: String, required: true },
    description: { type: String },
    filePath: { type: String, required: true },
    downloads: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now }
});

const Resource = mongoose.model('Resource', resourceSchema);

// Sample resources from Library Data in index.html
const sampleResources = [
    {
        title: "DBMS Assignment 1",
        subject: "DBMS",
        semester: "Semester 3",
        type: "Assignments",
        branch: "COMPS",
        description: "Assignment covering basic DBMS concepts.",
        filePath: "/uploads/DBMS_Assignment_1.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "DBMS Module 1: Introduction",
        subject: "DBMS",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Introduction to Database Management Systems.",
        filePath: "/uploads/DBMS_Module_1.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "DBMS Module 2: Entity-Relationship Model",
        subject: "DBMS",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Entity-Relationship Model concepts and diagrams.",
        filePath: "/uploads/DBMS_Module_2.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "DBMS Module 3: Relational Model & Algebra",
        subject: "DBMS",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Relational Model and Relational Algebra operations.",
        filePath: "/uploads/DBMS_Module_3.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "DBMS Module 4: Structured Query Language (SQL)",
        subject: "DBMS",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Structured Query Language fundamentals and commands.",
        filePath: "/uploads/DBMS_Module_4_one.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "DBMS Module 5: Relational-Database Design",
        subject: "DBMS",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Relational Database Design principles and normalization.",
        filePath: "/uploads/DBMS_Module_5.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "DLCOA Module 1: Computer Fundamentals",
        subject: "DLCOA",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Computer Fundamentals and basic concepts.",
        filePath: "/uploads/DLCOA_Module_1.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "DLCOA Module 2: Data Representation",
        subject: "DLCOA",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Data Representation in digital systems.",
        filePath: "/uploads/DLCOA_Module_2.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "DLCOA Module 3: Processor Organization & Architecture",
        subject: "DLCOA",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Processor Organization and Computer Architecture.",
        filePath: "/uploads/DLCOA_Module_3.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "Data Structure Module 1: Introduction",
        subject: "Data Structures",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Introduction to Data Structures and algorithms.",
        filePath: "/uploads/DS_Module_1.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "Data Structure Module 2: Stacks and Queues",
        subject: "Data Structures",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Stacks and Queues data structures and operations.",
        filePath: "/uploads/DS_Module_2.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "Data Structure Module 3: Linked Lists",
        subject: "Data Structures",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Linked Lists implementation and operations.",
        filePath: "/uploads/DS_Module_3.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "Data Structure Module 4: Trees",
        subject: "Data Structures",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Trees data structure and traversal algorithms.",
        filePath: "/uploads/DS_Module_4.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "Data Structure Module 5: Graphs",
        subject: "Data Structures",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Graphs data structure and algorithms.",
        filePath: "/uploads/DS_Module_5.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "Data Structure Module 6: Searching Techniques",
        subject: "Data Structures",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Searching techniques and algorithms.",
        filePath: "/uploads/DS_Module_6.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "Maths Module 1: Laplace Transformation",
        subject: "MATHS",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Laplace Transformation concepts and applications.",
        filePath: "/uploads/Maths_Module_1.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "Maths Module 2: Inverse Laplace Transform",
        subject: "MATHS",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Inverse Laplace Transform methods.",
        filePath: "/uploads/Maths_Module_2.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "Maths Module 3: Fourier Series & Fourier Transform",
        subject: "MATHS",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Fourier Series and Fourier Transform concepts.",
        filePath: "/uploads/Maths_Module_3.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "Maths Module 4: Complex Variables",
        subject: "MATHS",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Complex Variables and functions.",
        filePath: "/uploads/Maths_Module_4.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "Maths Module 5: Statistical Techniques",
        subject: "MATHS",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Statistical Techniques and methods.",
        filePath: "/uploads/Maths_Module_5.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "Maths Module 6: Probability",
        subject: "MATHS",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Probability concepts and distributions.",
        filePath: "/uploads/Maths_Module_6.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "DSGT Module 1: Logic and Proofs",
        subject: "DSGT",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Logic and Proofs in Discrete Structures.",
        filePath: "/uploads/DSGT_Module_1.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "DSGT Module 2: Relations & Functions",
        subject: "DSGT",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Relations and Functions concepts.",
        filePath: "/uploads/DSGT_Module_2.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "DSGT Module 3: Posets and Lattice",
        subject: "DSGT",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Posets and Lattice structures.",
        filePath: "/uploads/DSGT_Module_3.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "DSGT Module 4: Counting",
        subject: "DSGT",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Counting principles and techniques.",
        filePath: "/uploads/DSGT_Module_4.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    },
    {
        title: "DSGT Module 6: Graph Theory",
        subject: "DSGT",
        semester: "Semester 3",
        type: "Notes",
        branch: "COMPS",
        description: "Graph Theory concepts and applications.",
        filePath: "/uploads/DSGT_Module_6.pdf",
        uploadedBy: new mongoose.Types.ObjectId() // Placeholder ID
    }
];

async function addSampleResources() {
    try {
        // Clear existing resources
        await Resource.deleteMany({});
        console.log('Cleared existing resources');
        
        // Add sample resources
        for (const resource of sampleResources) {
            const newResource = new Resource(resource);
            await newResource.save();
            console.log(`Added resource: ${resource.title}`);
        }
        
        console.log('Sample resources added successfully!');
        
        // Verify resources were added
        const resources = await Resource.find();
        console.log(`Total resources in database: ${resources.length}`);
        
        mongoose.connection.close();
    } catch (error) {
        console.error('Error adding sample resources:', error);
        mongoose.connection.close();
    }
}

addSampleResources();