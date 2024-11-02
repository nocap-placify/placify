package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/jszwec/csvutil"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// ProfileData stores profile information including pinned repositories
type ProfileData struct {
	Username    string
	Bio         string
	RepoCount   string
	PinnedRepos []PinnedRepo
}

// PinnedRepo stores information about a pinned repository
type PinnedRepo struct {
	Name      string
	About     string
	Languages []string
}

type Info struct {
	StudentID       string    `gorm:"column:student_id;primaryKey" csv:"srn"`
	Name            string    `gorm:"column:name" csv:"name"`
	PhoneNo         string    `gorm:"column:phone_no" csv:"ph_no"`
	DOB             time.Time `gorm:"column:dob" csv:"dob"` // Add dob to the CSV if available
	Gender          string    `gorm:"column:gender" csv:"gender"`
	Resume          string    `gorm:"column:resume" csv:"resume"`
	Sem             int       `gorm:"column:sem"`       // Add sem to CSV if relevant
	MentorID        int       `gorm:"column:mentor_id"` // Adjust if MentorID maps to a different field
	CGPA            float64   `gorm:"column:cgpa" csv:"cgpa"`
	Degree          string    `gorm:"column:degree" csv:"degree"`
	Stream          string    `gorm:"column:stream" csv:"stream"`
	Email           string    `gorm:"column:email" csv:"email"`
	GithubProfile   string    `gorm:"column:github_profile" csv:"github_profile"`
	LeetcodeProfile string    `gorm:"column:leetcode_profile" csv:"leetcode_profile"`
	Age             int       `gorm:"column:age" csv:"age"`
}

type Student struct {
	StudentID string    `gorm:"primaryKey;column:student_id"` // Assuming student_id is an auto-incrementing primary key
	Name      string    `gorm:"type:varchar(100);column:name"`
	PhoneNo   string    `gorm:"type:varchar(15);column:phone_no"`
	Dob       time.Time `gorm:"type:date;column:dob"` // Use string or time.Time based on your requirements
	Gender    string    `gorm:"type:varchar(10);column:gender"`
	Resume    string    `gorm:"type:text;column:resume"`
	Sem       int       `gorm:"column:sem"`
	MentorID  int       `gorm:"column:mentor_id"`              // Use pointer if the field can be NULL
	CGPA      float64   `gorm:"type:numeric(4,2);column:cgpa"` // Use float64 to represent numeric types
	Email     string    `gorm:"type:varchar(255);column:email"`
	Age       int       `gorm:"column:age"`
}

func (Student) TableName() string {
	return "student"
}

func insertStudent(db *gorm.DB, student Student) error {
	return db.Create(&student).Error
}

// fetchProfileData scrapes the user's profile page to get username, bio, repo count, and pinned repositories with details
func fetchProfileData(username, token string) ProfileData {
	url := fmt.Sprintf("https://github.com/%s", username)
	var profile ProfileData

	// Send GET request
	resp, err := http.Get(url)
	if err != nil {
		log.Fatal("Failed to fetch profile:", err)
	}
	defer resp.Body.Close()

	// Parse HTML
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		log.Fatal("Failed to parse HTML:", err)
	}

	// Get username
	profile.Username = doc.Find("span.vcard-username").Text()

	// Get bio
	profile.Bio = strings.TrimSpace(doc.Find("div.user-profile-bio").Text())

	// Get repository count
	profile.RepoCount = strings.TrimSpace(doc.Find("span.Counter").First().Text())

	// Select each pinned repository and extract details
	doc.Find(".pinned-item-list-item-content").Each(func(i int, s *goquery.Selection) {
		repo := PinnedRepo{}

		// Get repo name
		repo.Name = strings.TrimSpace(s.Find(".repo").Text())

		// Get about section if available
		repo.About = strings.TrimSpace(s.Find("p.pinned-item-desc").Text())

		// Fetch all languages used in the repository
		repo.Languages = fetchRepoLanguages(username, repo.Name, token)

		// Add this repository to the profile's pinned repos list
		profile.PinnedRepos = append(profile.PinnedRepos, repo)
	})

	return profile
}

// fetchRepoLanguages fetches all languages used in a repository from the GitHub API
func fetchRepoLanguages(username, repoName, token string) []string {
	url := fmt.Sprintf("https://api.github.com/repos/%s/%s/languages", username, repoName)

	// Create request with optional authentication
	req, _ := http.NewRequest("GET", url, nil)
	if token != "" {
		req.Header.Add("Authorization", "token "+token)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Failed to fetch languages for %s: %v", repoName, err)
		return nil
	}
	defer resp.Body.Close()

	// Parse JSON response to get languages
	var languagesMap map[string]int
	body, _ := ioutil.ReadAll(resp.Body)
	if err := json.Unmarshal(body, &languagesMap); err != nil {
		log.Printf("Error parsing languages for %s: %v", repoName, err)
		return nil
	}

	// Extract language names as a slice
	var languages []string
	for lang := range languagesMap {
		languages = append(languages, lang)
	}
	return languages
}
func getUsernameFromURL(githubURL string) (string, error) {
	// Parse the URL
	parsedURL, err := url.Parse(githubURL)
	if err != nil {
		return "", err
	}

	// Split the path and get the username
	parts := strings.Split(parsedURL.Path, "/")
	if len(parts) < 2 || parts[1] == "" {
		return "", fmt.Errorf("invalid GitHub URL: %s", githubURL)
	}

	return parts[1], nil
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

	var all_info []Info

	// Decode each record into the students slice
	for {
		var sing_info Info
		if err := decoder.Decode(&sing_info); err != nil {
			if err == io.EOF {
				break // End of file reached
			}
			log.Fatalf("Could not decode record: %v", err)
		}
		all_info = append(all_info, sing_info)
	}

	// Print or process each student's data
	for _, student := range all_info {
		fmt.Printf("Name: %s, SRN: %s, CGPA: %.2f, Age: %d, Email: %s, Phone: %s, Degree: %s, Stream: %s, Gender: %s, GitHub: %s, LeetCode: %s, Mentor: %d, Resume: %s\n",
			student.Name, student.StudentID, student.CGPA, student.Age, student.Email, student.PhoneNo,
			student.Degree, student.Stream, student.Gender, student.GithubProfile,
			student.LeetcodeProfile, student.MentorID, student.Resume)
	}

	// Database connection
	dsn := "host=100.102.21.101 user=postgres password=dbms_porj dbname=dbms_project port=5432 sslmode=disable TimeZone=Asia/Shanghai"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// Test the connection by executing a simple query
	sqlDB, err := db.DB()
	if err != nil {
		panic("failed to get database handle")
	}

	// Ping the database to verify connection
	err = sqlDB.Ping()
	if err != nil {
		panic("failed to ping database")
	}

	fmt.Println("Successfully connected to the database!")

	// Insert a test student into the database
	student := Student{
		StudentID: all_info[0].StudentID,
		Name:      all_info[0].Name,
		PhoneNo:   all_info[0].PhoneNo,
		Dob:       all_info[0].DOB,
		Gender:    all_info[0].Gender,
		Resume:    all_info[0].Resume,
		Sem:       all_info[0].Sem,
		MentorID:  6,
		CGPA:      all_info[0].CGPA,
		Email:     all_info[0].Email,
		Age:       all_info[0].Age,
	}
	err = insertStudent(db, student)
	if err != nil {
		log.Fatal("failed to insert student:", err)
	}
	log.Println("Student inserted successfully")

	username_np := all_info[0].GithubProfile
	token := ""
	username, err := getUsernameFromURL(username_np)
	if err != nil {
		fmt.Println("Error:", err)
	} else {
		fmt.Println("Username:", username)
	}
	profile := fetchProfileData(username, token)

	// Display profile information
	fmt.Printf("Username: %s\n", profile.Username)
	fmt.Printf("Bio: %s\n", profile.Bio)
	fmt.Printf("Public Repositories: %s\n", profile.RepoCount)
	fmt.Println("Pinned Repositories:")

	// Iterate through each pinned repository and display details
	for _, repo := range profile.PinnedRepos {
		fmt.Printf("\nRepository Name: %s\n", repo.Name)
		fmt.Printf("About: %s\n", repo.About)
		fmt.Printf("Languages Used: %s\n", strings.Join(repo.Languages, ", "))
	}

}
