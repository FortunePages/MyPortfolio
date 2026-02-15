# 🤖 Multi-Student AI Tutor System - Complete Guide

## Overview

Your AI Tutor system now supports **multiple students** with individual profiles, grade levels, learning materials, and activity tracking. Each student has isolated, organized data that persists even after closing the browser.

---

## 🎯 How to Use the System

### Step 1: Create a Student Profile

1. **Fill in Student Name**: Type the student's name in "Enter student name" (e.g., "Jerico", "Maria", "Alex")
2. **Select Grade Level**: Choose from:
   - Grade 1 through Grade 6
   - High School
   - College
3. **Click "Create Profile 👤"**: This creates a new profile for the student

**Result**: 
- The student name and grade display on the right side
- System is ready to accept materials for this student
- All future uploads and activities will be attached to this student

### Step 2: Upload Study Materials

You can add materials in **two ways**:

#### Option A: Upload a file
1. Click the upload zone or "Insert File 📁" button
2. Drag & drop or select a file (`.txt`, `.pdf`, `.jpg`, `.png`, `.gif`)
3. System analyzes the file and extracts test questions
4. **Activity Log** automatically records: "📤 Uploaded: filename.txt"

#### Option B: Paste content
1. Paste text content into the "Or Paste Content:" text area
2. Click "Feed Knowledge 🧠"
3. System processes the content and creates practice questions
4. **Activity Log** automatically records: "📤 Uploaded: Pasted Content"

**Example**: We include `test_sample.txt` with a 4-question math test you can try.

### Step 3: Monitor Activity Logs (Right Panel)

The **📋 Activity Logs** panel on the right shows everything that happens with the current student:

Each log entry displays:
- **Time**: When the action occurred (e.g., "2:34 PM")
- **Action**: What was done (e.g., "📤 Uploaded: math_test.txt")
- **Details**: Additional info about the action
- **Delete Button**: Remove individual entries if needed

**Example Log Entries**:
```
📤 Uploaded: math_test.txt
   [4 questions found] Delete
   
💬 Message Sent
   "Can you help me with..." Delete
   
📝 Started Test Mode
   [4 questions] Delete
   
🎯 Goal Set: Mathematics
   [Exam on 5/15/2024] Delete
```

### Step 4: Clear Logs (Optional)

Click the **🗑️** button at the top of the Activity Logs panel to clear all logs for the current student.

---

## 📚 Data Storage Overview

### How Data is Organized

All student data is stored in **browser localStorage** with this structure:

**For each student:**
```
student_[StudentName]_[Grade]_knowledge    → Uploaded materials
student_[StudentName]_[Grade]_logs         → Activity history
student_[StudentName]_[Grade]_tests        → Practice questions
student_[StudentName]_[Grade]_goal         → Learning goals
```

**Example (two students)**:
```
student_Jerico_grade1_knowledge
student_Jerico_grade1_logs
student_Jerico_grade1_tests

student_Maria_grade2_knowledge
student_Maria_grade2_logs
student_Maria_grade2_tests
```

### Current Student Tracking

```
current_student     → Currently logged-in student name
current_grade       → Currently logged-in student grade
```

---

## 👥 Multi-Student Workflow Example

### Scenario: Teaching Two Students

**Student 1: Jerico (Grade 1)**
1. Enter name: "Jerico"
2. Select: "Grade 1"
3. Click: "Create Profile 👤"
4. Upload Jerico's math materials
5. Activity log tracks everything for Jerico
6. Data stored under `student_Jerico_grade1_*`

**Switching to Student 2: Maria (Grade 2)**
1. Enter name: "Maria"
2. Select: "Grade 2"
3. Click: "Create Profile 👤"
4. Upload Maria's science materials
5. Activity log now shows Maria's activities
6. Data stored under `student_Maria_grade2_*`

**Switching Back to Jerico**
1. Enter name: "Jerico" (same as before)
2. Select: "Grade 1" (same as before)
3. Click: "Create Profile 👤"
4. All of Jerico's previous data loads automatically
5. Activity log shows Jerico's history

---

## 🎯 Feature Details

### Student Profile Section
- **Purpose**: Manage which student you're currently teaching
- **Saves**: Automatically remembers the last student when you refresh
- **Reset**: Simply enter a different name/grade to switch students

### Activity Logs Panel
- **What It Tracks**:
  - File uploads (with file names and question count)
  - Messages sent (first 50 characters)
  - Test mode started (with question count)
  - Learning goals set (with subject and date)

- **How to Use**:
  - Monitor what was done with each student
  - Delete individual entries to clean up
  - See the exact time each action occurred

### Stored Knowledge Section
- **What It Shows**: First 5 items from the student's knowledge base
- **Updates**: Automatically refreshes when new materials are uploaded
- **Purpose**: Quick preview of what materials are stored

---

## 🔍 Finding Your Data

Your data is stored in browser localStorage, which you can inspect:

1. **Open Developer Tools**:
   - Right-click on the page → "Inspect" (or Cmd+Option+I on Mac)
   - Go to "Storage" or "Application" tab

2. **View localStorage**:
   - Expand "Local Storage" → "http://localhost:8000"
   - Look for keys like:
     - `student_Jerico_grade1_knowledge`
     - `student_Jerico_grade1_logs`
     - `current_student`

3. **View Data**:
   - Click any key to see its contents
   - Activity logs are stored as JSON arrays

---

## 📋 What Gets Logged?

### Automatic Logging

The system automatically records these actions:

```
📤 File Uploads
   - File name
   - Number of questions found

💬 Messages
   - First 50 characters of message

📝 Tests Started
   - Number of questions available

🎯 Goals Set
   - Subject and exam date

🌐 Language Changes
   - New language selected
```

### Manual Entry Deletion

Each log entry has a **Delete** button. Click to remove that entry from the logs.

---

## 🔄 Data Persistence

### What Stays After Closing the Browser?

✅ **Persists (stays)**:
- Student profiles (name and grade)
- Uploaded materials and study content
- Activity logs and history
- Learning goals
- Language preference
- Last logged-in student

❌ **Clear on Refresh**:
- Chat messages (conversation history)
- Current test progress
- UI state (though profiles reload)

### How to Clear Everything

**Delete all data for one student**:
1. Switch to that student
2. Open Developer Tools → Application → Local Storage
3. Find and delete all keys starting with `student_[Name]_[Grade]_`

**Clear all data for all students**:
1. Open Developer Tools → Application → Local Storage
2. Delete all keys starting with `student_`
3. Delete `current_student` and `current_grade`

---

## 💡 Tips & Best Practices

### For Teachers/Tutors

1. **Create Profiles for Each Student**
   - Keep separate grade levels even if teaching students with the same first name
   - Use clear, memorable names

2. **Use Activity Logs for Tracking**
   - Check logs to see what was covered in each session
   - Delete entries if you made mistakes

3. **Organize by Grade**
   - Grade 1 materials stay separate from Grade 2
   - Easy to switch between classes

4. **Upload Sample Tests Early**
   - Help students practice with "Start Test" button
   - Tests are automatically extracted from uploaded files

### File Format Tips

**For Test Questions**: Plain text format works best
```
1. What is 2 + 2?
A. 3
B. 4
C. 5
D. 6
```

**Supported File Types**:
- `.txt` - Best for questions and notes
- `.pdf` - Study materials and textbooks
- `.jpg`, `.png`, `.gif` - Images for visual learning

---

## 🆘 Troubleshooting

### Problem: "Please create a student profile first!"
**Solution**: Fill in name and grade, then click "Create Profile 👤"

### Problem: Activity logs disappeared
**Solution**: This is normal if you:
1. Changed student profile (each student has separate logs)
2. Refreshed the browser (chat stays but logs persist)
3. Cleared browser cache (all data deleted - no recovery)

### Problem: Can't upload files
**Solution**:
1. Check file format is supported (.txt, .pdf, .jpg, .png, .gif)
2. Check file size isn't too large (browser has limits)
3. Make sure student profile is created first

### Problem: Data not saving
**Solution**:
1. Check browser localStorage is enabled
2. Not using private/incognito mode (data won't persist)
3. Browser hasn't cleared cache during shutdown

---

## 🚀 Advanced Usage

### Multiple Windows

You can teach multiple students at once:
1. Open AI Tutor in one window for Student A
2. Open AI Tutor in another window for Student B
3. Both windows persist separate data
4. Switch between windows to work with different students

### Backing Up Student Data

**Export Data for Safety**:
1. Open Developer Tools → Application → Local Storage
2. Right-click any `student_*` key → Copy
3. Save to a text file for backup

**Restore if Deleted**:
1. Open Developer Tools → Console
2. Paste: `localStorage.setItem('key', 'value')`
3. Or manually recreate profiles and re-upload materials

---

## 📖 File: `test_sample.txt`

We've included a sample test file with this structure:

```
Sample Math Test - Grade 4

1. What is 5 + 3?
A. 6
B. 8
C. 9
D. 10

2. What is 10 - 4?
A. 5
B. 6
C. 7
D. 8

[...more questions...]
```

**To Use It**:
1. Create a student profile
2. Upload `test_sample.txt`
3. System extracts 4 math questions
4. Click "Start Test 📝" to practice

---

## ✨ Summary

Your AI Tutor now has:
- ✅ Multi-student support with separate profiles
- ✅ Grade-level organization
- ✅ Activity logging for tracking
- ✅ Persistent data storage
- ✅ Individual deletion of log entries
- ✅ Automatic student switching

**All data is organized by student name and grade, making it easy to manage multiple learners!**

---

**Questions?** Check the Activity Logs panel to see exactly what data is stored for each student!
