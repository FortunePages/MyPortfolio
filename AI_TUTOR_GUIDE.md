# 🤖 AI Tutor - Multi-Student System Guide

## Overview
The AI Tutor is now a **multi-student** educational platform that supports multiple students with individual profiles, grade levels, and activity tracking.

## ✨ Key Features

### 1. **Student Profile Management**
- Create individual student profiles with name and grade level
- Switch between students instantly
- Persist student data across sessions (auto-loads last student)

### 2. **Activity Logging & Tracking**
- Every action is logged with timestamp
- See what files were uploaded
- Track test attempts
- View chat history per student
- **Delete individual log entries** when needed
- **Clear all logs** at once

### 3. **Per-Student Data Organization**
- Each student has isolated storage:
  - Knowledge base (uploaded materials)
  - Activity logs
  - Test questions
  - Learning goals
- Multiple students **never share data**

### 4. **Storage Organization**
All data stored in browser's `localStorage` with this structure:
```
student_[StudentName]_[Grade]_knowledge   → Uploaded materials
student_[StudentName]_[Grade]_logs       → Activity log entries
student_[StudentName]_[Grade]_tests      → Extracted test questions
student_[StudentName]_[Grade]_goal       → Learning goals
current_student                          → Last active student
current_grade                            → Last active grade
```

---

## 🎯 How to Use

### Step 1: Create a Student Profile
1. **Enter Student Name** - Type the child's name (e.g., "Maria", "Jerico")
2. **Select Grade Level** - Choose from Grade 1 to College
3. **Click "Create Profile 👤"** - Profile is created and activated

**Result**: 
- Student name appears in the left panel
- System is ready to receive learning materials
- Activity log starts tracking

### Step 2: Upload Study Materials
Choose one of these methods:

**Method A: Upload File**
- Click the upload zone or "📁 Insert File" button
- Select a text file (`.txt`)
- File is processed and test questions extracted automatically

**Method B: Paste Content**
- Paste study material in the "Or Paste Content" textarea
- Click "🧠 Feed Knowledge"
- Content is stored for the current student

### Step 3: Set Learning Goal (Optional)
1. **Select Subject** - Choose what to study
2. **Select Exam Date** - When the exam is
3. **Click "Set Learning Goal 🎯"**

### Step 4: Interact with the AI
- **Ask Questions** - Type questions in the chat
- **Start Test** - Click "📝 Start Test" to practice
- **Get Explanations** - Click "💡 Explain" for clarifications
- **Use Voice Input** - Click 🎤 to speak questions

### Step 5: Monitor Activity Logs
The **right panel** shows:
- 📤 Uploaded files with timestamps
- 🎯 Goals set
- 📝 Tests started
- 💬 Messages and interactions
- 📚 Stored knowledge items

**Delete Actions**:
- Click "Delete" on any log entry to remove it
- Click "🗑️" (Clear all) to delete entire log

### Step 6: Switch Between Students
1. Change the student name input
2. Select a different grade
3. Click "Create Profile 👤" 
4. AI loads that student's data instantly
5. Activity logs update to show that student's history

---

## 📊 Example Workflow

### Scenario: Teaching Multiple Children

**Morning Session - Grade 1 (Maria)**
```
Name: Maria
Grade: Grade 1
Actions:
  ✅ Create Profile
  ✅ Upload: math_basics.txt (4 questions found)
  ✅ Set Goal: Math exam on Dec 15
  ✅ Start Test (Practice)
  ✅ Chat: "How do I add numbers?"
  
Logs show:
  - 📤 Uploaded: math_basics.txt
  - 🎯 Goal Set: Math
  - 📝 Started Test Mode
  - 💬 Message Sent
```

**Afternoon Session - Grade 2 (Jerico)**
```
Name: Jerico
Grade: Grade 2
Actions:
  ✅ Create Profile (switch student)
  ✅ Upload: science_notes.txt (6 questions found)
  ✅ Start Test
  ✅ Ask: "What is photosynthesis?"
  
Logs show:
  - 📤 Uploaded: science_notes.txt
  - 📝 Started Test Mode
  - 💬 Message Sent
```

Data kept separate! Maria's Grade 1 materials ≠ Jerico's Grade 2 materials

---

## 🗂️ Data Storage Details

### What Gets Stored Per Student?

**Knowledge Base** `student_[name]_[grade]_knowledge`
- All uploaded text content
- Test questions extracted
- Learning materials

**Activity Logs** `student_[name]_[grade]_logs`
- Timestamp of each action
- Type of action (upload, test, message, etc.)
- Content preview (first 50 chars)
- Unique ID for deletion

**Test Questions** `student_[name]_[grade]_tests`
- Extracted from uploaded materials
- Multiple choice format (A, B, C, D)
- Question text and options

**Learning Goal** `student_[name]_[grade]_goal`
- Subject being studied
- Target exam date
- Student name for reference

### Accessing Stored Data
1. Open browser **Developer Tools** (F12)
2. Go to **Application** → **Local Storage**
3. Find your domain (localhost:8000, etc.)
4. Search for entries starting with `student_`
5. View JSON formatted data

---

## 💡 Tips & Tricks

### Quick Start
- Use the **test_sample.txt** file in the portfolio folder
- It has 4 practice math questions ready to upload

### Batch Students
- Create profiles for all students first
- Then upload materials for each one
- Switch between them to practice

### Verify Data Stored
- Check activity logs panel
- Each action adds a new log entry
- Logs prove data is being saved

### Data Persistence
- Data persists across browser sessions
- Close browser completely → re-open → your student profiles still there!
- Click "Create Profile" to reload last student automatically

### Log Management
- **Delete Individual Entry**: Click "Delete" on specific log
- **Batch Delete**: Click "🗑️" to delete all logs for current student
- **Clear Knowledge**: Clear logs, then upload new materials

---

## 🚀 Multilingual Support

Choose your preferred language:
- **English** - Full English interface
- **Tagalog** - Filipino language support
- **Bisaya** - Cebuano language support

AI adapts explanations based on selected language!

---

## 📋 Troubleshooting

**Problem**: No logs appearing
- Solution: Create student profile first before any actions
- Check that you've done an action (upload file, send message, etc.)

**Problem**: Can't find previous student data
- Solution: Make sure you entered exact same name and grade
- Check LocalStorage (F12 → Application)

**Problem**: File upload not working
- Solution: Use plain text files (.txt)
- Ensure file contains properly formatted questions

**Problem**: AI not responding
- Solution: Make sure student profile is created
- Check browser console (F12 → Console) for errors

---

## 📁 File Formats

### Supported Upload Formats
- **.txt** - Plain text (best for documents)
- **.pdf** - PDF files (text extraction)
- **.jpg/.png** - Images (for visual content)

### Recommended Content Format
```
1. Your first question?
A. Option one
B. Option two
C. Option three
D. Option four

2. Your second question?
A. Option one
B. Option two
C. Option three
D. Option four
```

---

## 🎓 Learning Features

### Test Mode
- Click "📝 Start Test" to begin
- AI presents questions one by one
- Multiple choice answers
- Real-time feedback
- Score calculation

### Chat with AI
- Ask any question
- Get AI responses in your selected language
- Context-aware answers based on uploaded materials

### Quick Actions
- 💡 **Explain** - Get concept explanations
- 🌐 **Translate** - Content translation
- 📊 **Summary** - Generate summaries
- 🎤 **Voice** - Speech input/output

---

## 💾 Backup & Export

To backup student data:
1. Open **Developer Tools** (F12)
2. Application → Local Storage
3. Copy entries starting with `student_`
4. Save to text file for backup

---

## Questions or Issues?
This is your working AI Tutor system! All data persists, activity logs track everything, and multiple students are fully supported. Start by creating a student profile and uploading test materials!

Happy Learning! 🎓✨
