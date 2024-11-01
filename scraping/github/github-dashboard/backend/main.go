package main

import (
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"os"

	"github.com/jszwec/csvutil"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Student represents a student record
type Student struct {
	Name            string `csv:"name"`
	SRN             string `csv:"srn"`
	CGPA            string `csv:"cgpa"`
	Age             string `csv:"age"`
	Email           string `csv:"email"`
	Phone           string `csv:"ph_no"`
	Degree          string `csv:"degree"`
	Stream          string `csv:"stream"`
	Gender          string `csv:"gender"`
	GithubProfile   string `csv:"github_profile"`
	LeetcodeProfile string `csv:"leetcode_profile"`
	MentorName      string `csv:"mentor_name"`
	ResumeLink      string `csv:"resume"`
}

func main() {

	file, err := os.Open("data.csv")
	if err != nil {
		log.Fatalf("Could not open CSV file: %v", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	decoder, err := csvutil.NewDecoder(reader)
	if err != nil {
		log.Fatalf("Could not create CSV decoder: %v", err)
	}

	var students []Student

	// Decode each record into the students slice
	for {
		var student Student
		if err := decoder.Decode(&student); err != nil {
			if err == io.EOF {
				break // End of file reached
			}
			log.Fatalf("Could not decode record: %v", err)
		}
		students = append(students, student)
	}

	// Print or process each student's data
	for _, student := range students {
		fmt.Printf("Name: %s, SRN: %s, CGPA: %s, Age: %s, Email: %s, Phone: %s, Degree: %s, Stream: %s, Gender: %s, GitHub: %s, LeetCode: %s, Mentor: %s, Resume: %s\n",
			student.Name, student.SRN, student.CGPA, student.Age, student.Email, student.Phone,
			student.Degree, student.Stream, student.Gender, student.GithubProfile,
			student.LeetcodeProfile, student.MentorName, student.ResumeLink)
	}
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
}
