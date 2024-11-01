package main

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func insertStudent(db *gorm.DB, student Student) error {
	return db.Create(&student).Error
}

// Student represents a student record
//
//	type Student struct {
//		Name            string `csv:"name"`
//		SRN             string `csv:"srn"`
//		CGPA            string `csv:"cgpa"`
//		Age             string `csv:"age"`
//		Email           string `csv:"email"`
//		Phone           string `csv:"ph_no"`
//		Degree          string `csv:"degree"`
//		Stream          string `csv:"stream"`
//		Gender          string `csv:"gender"`
//		GithubProfile   string `csv:"github_profile"`
//		LeetcodeProfile string `csv:"leetcode_profile"`
//		MentorName      string `csv:"mentor_name"`
//		ResumeLink      string `csv:"resume"`
//	}
type Student struct {
	StudentID int     `gorm:"column:student_id;primaryKey"`
	Name      string  `gorm:"column:name"`
	PhoneNo   string  `gorm:"column:phone_no"`
	DOB       string  `gorm:"column:dob"` // Assuming dob is stored as a date, use time.Time if you are handling date.
	Gender    string  `gorm:"column:gender"`
	Resume    string  `gorm:"column:resume"`
	Sem       int     `gorm:"column:sem"`
	MentorID  int     `gorm:"column:mentor_id"`
	CGPA      float32 `gorm:"column:cgpa"`
	Email     string  `gorm:"column:email"`
	Age       int     `gorm:"column:age"`
}

func main() {

	// file, err := os.Open("data.csv")
	// if err != nil {
	// 	log.Fatalf("Could not open CSV file: %v", err)
	// }
	// defer file.Close()

	// reader := csv.NewReader(file)
	// decoder, err := csvutil.NewDecoder(reader)
	// if err != nil {
	// 	log.Fatalf("Could not create CSV decoder: %v", err)
	// }

	// var students []Student

	// // Decode each record into the students slice
	// for {
	// 	var student Student
	// 	if err := decoder.Decode(&student); err != nil {
	// 		if err == io.EOF {
	// 			break // End of file reached
	// 		}
	// 		log.Fatalf("Could not decode record: %v", err)
	// 	}
	// 	students = append(students, student)
	// }

	// Print or process each student's data
	// for _, student := range students {
	// 	fmt.Printf("Name: %s, SRN: %s, CGPA: %s, Age: %s, Email: %s, Phone: %s, Degree: %s, Stream: %s, Gender: %s, GitHub: %s, LeetCode: %s, Mentor: %s, Resume: %s\n",
	// 		student.Name, student.SRN, student.CGPA, student.Age, student.Email, student.Phone,
	// 		student.Degree, student.Stream, student.Gender, student.GithubProfile,
	// 		student.LeetcodeProfile, student.MentorName, student.ResumeLink)
	// }
	dsn := "host=100.102.21.101 user=postgres password=dbms_porj dbname=dbms_project port=5432 sslmode=disable TimeZone=Asia/Shanghai"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// Test the connection by executing a simple query
	sqlDB, err := db.DB() // Access the underlying database/sql DB object
	if err != nil {
		panic("failed to get database handle")
	}

	// Ping the database to verify connection
	err = sqlDB.Ping()
	if err != nil {
		panic("failed to ping database")
	}

	fmt.Println("Successfully connected to the database!")
	student := Student{
		Name:      "John Doe",
		StudentID: 1,
		PhoneNo:   "1234567890",
		DOB:       "2000-01-01", // Adjust date format as needed
		Gender:    "Male",
		Resume:    "link_to_resume",
		Sem:       5,
		MentorID:  3,
		CGPA:      3.8,
		Email:     "johndoe@example.com",
		Age:       22,
	}
	err = insertStudent(db, student)
	if err != nil {
		log.Fatal("failed to insert student:", err)
	}
	log.Println("Student inserted successfully")
}
