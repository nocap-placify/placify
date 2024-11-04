package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
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

// LeetCodeProfile stores profile information specific to LeetCode
type LeetCodeProfile struct {
	Username     string
	EasySolved   int
	MediumSolved int
	HardSolved   int
	TotalSolved  int
	Ranking      int //changed rank
}

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
	Sem             int       `gorm:"column:sem"`                           // Add sem to CSV if relevant
	MentorID        string    `gorm:"column:mentor_name" csv:"mentor_name"` // Adjust if MentorID maps to a different field
	CGPA            float64   `gorm:"column:cgpa" csv:"cgpa"`
	Degree          string    `gorm:"column:degree" csv:"degree"`
	Stream          string    `gorm:"column:stream" csv:"stream"`
	Email           string    `gorm:"column:email" csv:"email"`
	GithubProfile   string    `gorm:"column:github_profile" csv:"github_profile"`
	LeetcodeProfile string    `gorm:"column:leetcode_profile" csv:"leetcode_profile"`
	Age             int       `gorm:"column:age" csv:"age"`
}

type Mentor_Session_CSV struct {
	MentorID  int       `gorm:"column:mentor_name" csv:"mentor_name"`
	StudentID string    `gorm:"column:student_id;primaryKey" csv:"srn"`
	Date      time.Time `gorm:"column:date" csv:"date"`
	Advice    string    `gorm:"advice" csv:"advice"`
}

type Mentor_Session_DB struct {
	MentorID  int       `gorm:"column:mentor_name"`
	StudentID string    `gorm:"column:student_id;primaryKey"`
	Date      time.Time `gorm:"column:date"`
	Advice    string    `gorm:"advice"`
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

type Mentor struct {
	MentorID int    `gorm:"primaryKey;column:mentor_id"`
	Name     string `gorm:"type:varchar(100);column:mentor_name"`
}

type Github struct {
	GithubID  string `gorm:"primaryKey;type:text;column:github_id"`
	StudentID string `gorm:"column:student_id"`
	Username  string `gorm:"type:varchar(50);column:username"`
	Bio       string `gorm:"type:text;column:bio"`
	RepoCount string `gorm:"column:repo_count"`
}
type Repository struct {
	RepoID   string `gorm:"primaryKey;column:repo_id"`
	GithubID string `gorm:"column:github_id"`
	RepoName string `gorm:"type:varchar(100);column:repo_name"`
	Language string `gorm:"type:text;column:language"`
	Desc     string `gorm:"type:text;column:desc"`
}
type LeetCode struct {
	LeetCodeID string `gorm:"primaryKey;type:text;column:leetcode_id"`
	StudentID  string `gorm:"column:student_id"`
	Username   string `gorm:"type:varchar(50);column:username"`
	Rank       int    `gorm:"column:ranking"`
}

type Problems struct {
	ProblemID  int    `gorm:"primaryKey;column:problem_id"`
	LeetcodeID string `gorm:"type:text;column:leetcode_id"`
	NoEasy     int    `gorm:"column:no_easy"`
	NoMedium   int    `gorm:"column:no_medium"`
	NoHard     int    `gorm:"column:no_hard"`
}

func insertRepository(db *gorm.DB, repo Repository) error {
	return db.Create(&repo).Error
}

func (Student) TableName() string {
	return "student"
}

func (Mentor) TableName() string {
	return "mentor"
}
func (Github) TableName() string {
	return "github"
}

func (Repository) TableName() string {
	return "repository"
}

func insertStudent(db *gorm.DB, student Student) error {
	// Prepare the SQL query to insert a new student
	query := `
		INSERT INTO student 
		(student_id, name, phone_no, dob, gender, resume, sem, mentor_id, cgpa, email, age) 
		VALUES 
		($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	err := db.Exec(query, student.StudentID, student.Name, student.PhoneNo, student.Dob, student.Gender,
		student.Resume, student.Sem, student.MentorID, student.CGPA, student.Email, student.Age).Error

	if err != nil {
		return fmt.Errorf("could not insert student: %v", err)
	}
	return nil
}

func fetchMentorID(db *gorm.DB, name string) (int, error) {
	// Log the mentor name being searched
	if name == "" {
		log.Println("Warning: Mentor name is empty. Check CSV data or mapping logic.")
		return 0, fmt.Errorf("mentor name is empty")
	}

	var mentor Mentor
	err := db.Where("mentor_name = ?", name).First(&mentor).Error
	if err != nil {
		return 0, err
	}
	return mentor.MentorID, nil
}

// fetchProfileData scrapes the user's profile page to get username, bio, repo count, and pinned repositories with details
func fetchProfileData(username, token string) ProfileData {
	url := fmt.Sprintf("https://github.com/%s", username)
	var profile ProfileData
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
	profile.Username = doc.Find("span.vcard-username").Text()

	profile.Bio = strings.TrimSpace(doc.Find("div.user-profile-bio").Text())

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
	body, _ := io.ReadAll(resp.Body)
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

func insertGithub(db *gorm.DB, github Github) error {
	return db.Create(&github).Error
}

func insertProblems(db *gorm.DB, problems Problems) error {
	return db.Create(&problems).Error
}

func fetchLeetCodeProfileData(username string) LeetCodeProfile {
	url := fmt.Sprintf("http://100.102.21.101:8080/%s", username)
	var profile LeetCodeProfile

	maxRetries := 3
	for i := 0; i < maxRetries; i++ {
		resp, err := http.Get(url)
		if err != nil {
			log.Printf("Failed to fetch LeetCode profile for %s: %v", username, err)
			continue
		}
		defer resp.Body.Close()

		if resp.StatusCode == http.StatusOK {
			err = json.NewDecoder(resp.Body).Decode(&profile)
			if err != nil {
				log.Printf("Failed to parse LeetCode JSON for %s: %v", username, err)
				return profile
			}
			profile.Username = username
			return profile
		} else {
			log.Printf("LeetCode profile fetch error for %s: Status %d", username, resp.StatusCode)
		}

		// Wait before retrying
		time.Sleep(2 * time.Second)
	}
	return profile
}

func (LeetCode) TableName() string {
	return "leetcode"
}
func insertLeetCode(db *gorm.DB, leetcode LeetCode) error {
	return db.Create(&leetcode).Error
}
func main() {
	counter := 0
	//database connection
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
		fmt.Printf("Name: %s, SRN: %s, CGPA: %.2f, Age: %d, Email: %s, Phone: %s, Degree: %s, Stream: %s, Gender: %s, GitHub: %s, LeetCode: %s, Mentor: %s, Resume: %s\n",
			student.Name, student.StudentID, student.CGPA, student.Age, student.Email, student.PhoneNo,
			student.Degree, student.Stream, student.Gender, student.GithubProfile,
			student.LeetcodeProfile, student.MentorID, student.Resume)
		mentorID, err := fetchMentorID(db, student.MentorID)

		if err != nil {
			log.Printf("Could not find mentor ID for %s: %v", student.MentorID, err)
			continue
		}
		// github := Github{
		// 	GithubID: student.GithubProfile,
		// 	// StudentID: student.StudentID,
		// 	StudentID: "PES2UG22CS001",
		// 	Username:  profile.Username,
		// 	Bio:       profile.Bio,
		// 	RepoCount: profile.RepoCount,
		// }
		log.Println(mentorID)
		// student := Student{
		// 	StudentID: student.StudentID,
		// 	Name:      student.Name,
		// 	PhoneNo:   student.PhoneNo,
		// 	Dob:       student.DOB,
		// 	Gender:    student.Gender,
		// 	Resume:    student.Resume,
		// 	Sem:       student.Sem,
		// 	MentorID:  mentorID,
		// 	CGPA:      student.CGPA,
		// 	Email:     student.Email,
		// 	Age:       student.Age,
		// }

		// err = insertStudent(db, student)
		// if err != nil {
		// 	log.Fatal("failed to insert student:", err)
		// }
		// log.Println("Student inserted successfully")

		// err = insertGithub(db, github)
		// if err != nil {
		// 	log.Fatal("failed to insert github:", err)
		// }
		// log.Println("github intserted successfully")
	}
	mentorID, err := fetchMentorID(db, all_info[1].MentorID)
	log.Printf("!!!!!!!!!!inserting INTO STUDENT DB!!!!!USING SQLL!!!!\n")
	student := Student{
		StudentID: all_info[1].StudentID,
		Name:      all_info[1].Name,
		PhoneNo:   all_info[1].PhoneNo,
		Dob:       all_info[1].DOB,
		Gender:    all_info[1].Gender,
		Resume:    all_info[1].Resume,
		Sem:       all_info[1].Sem,
		MentorID:  mentorID,
		CGPA:      all_info[1].CGPA,
		Email:     all_info[1].Email,
		Age:       all_info[1].Age,
	}

	err = insertStudent(db, student)
	if err != nil {
		log.Fatal("failed to insert student:", err)
	}
	log.Println("Student inserted successfully")

	username_np := all_info[0].GithubProfile
	token := ""
	username, err := getUsernameFromURL(username_np)
	profile := fetchProfileData(username, token)

	//creating structure
	github := Github{
		GithubID: all_info[0].GithubProfile,
		// StudentID: student.StudentID,
		StudentID: "PES2UG22CS001",
		Username:  profile.Username,
		Bio:       profile.Bio,
		RepoCount: profile.RepoCount,
	}
	//inserting into db
	err = insertGithub(db, github)
	if err != nil {
		log.Fatal("failed to insert github:", err)
	}
	log.Println("github intserted successfully")

	fmt.Printf("mentor name is %s\n", all_info[0].MentorID)
	mentorId, err := fetchMentorID(db, all_info[0].MentorID)
	fmt.Printf("mentor number is %d\n", mentorId)

	if err != nil {
		fmt.Println("Error:", err)
	} else {
		fmt.Println("Username:", username)
	}

	// Display profile information
	fmt.Printf("Username: %s\n", profile.Username)
	fmt.Printf("Bio: %s\n", profile.Bio)
	fmt.Printf("Public Repositories: %s\n", profile.RepoCount)
	fmt.Println("Pinned Repositories:")

	// Iterate through each pinned repository and display details
	for _, repo := range profile.PinnedRepos {
		fmt.Printf("Repository Name: %s\n", repo.Name)
		fmt.Printf("About: %s\n", repo.About)
		fmt.Printf("Languages Used: %s\n", strings.Join(repo.Languages, ", "))
		test_repo := Repository{
			RepoID:   all_info[0].GithubProfile + "/" + repo.Name,
			GithubID: all_info[0].GithubProfile,
			RepoName: repo.Name,
			Language: strings.Join(repo.Languages, ", "),
			Desc:     repo.About,
		}
		fmt.Printf("testing repository struct repo:%s, git:%s, reponame:%s, lang:%s, desc:%s\n", test_repo.RepoID, test_repo.GithubID, test_repo.RepoName, test_repo.Language, test_repo.Desc)
		if err := insertRepository(db, test_repo); err != nil {
			log.Fatalf("Failed to insert repository: %v", err)
		} else {
			log.Println("Repository inserted successfully")
		}
	}
	// //extracting leetcode info
	// for _, student := range all_info {
	// 	// Process LeetCode Profile
	// 	if username, err := getUsernameFromURL(student.LeetcodeProfile); err == nil {
	// 		leetProfile := fetchLeetCodeProfileData(username)
	// 		fmt.Printf("LeetCode Username: %s, Total Solved: %d, Easy: %d, Medium: %d, Hard: %d\n",
	// 			leetProfile.Username, leetProfile.TotalSolved, leetProfile.EasySolved, leetProfile.MediumSolved, leetProfile.HardSolved)
	// 	} else {
	// 		log.Printf("Skipping invalid LeetCode URL for student %s: %v", student.Name, err)
	// 	}
	// }
	//inserting into table problems

	for _, student := range all_info {
		// Process LeetCode Profile
		if username, err := getUsernameFromURL(student.LeetcodeProfile); err == nil {
			leetProfile := fetchLeetCodeProfileData(username)
			fmt.Printf("LeetCode Username: %s, Total Solved: %d, Easy: %d, Medium: %d, Hard: %d, Rank: %d\n",
				leetProfile.Username, leetProfile.TotalSolved, leetProfile.EasySolved, leetProfile.MediumSolved, leetProfile.HardSolved, leetProfile.Ranking)
			// Prepare the LeetCode struct for insertion
			leetcodeData := LeetCode{
				LeetCodeID: student.LeetcodeProfile,
				StudentID:  student.StudentID,
				Username:   leetProfile.Username,
				Rank:       leetProfile.Ranking,
			}
			// Insert the LeetCode data
			err = insertLeetCode(db, leetcodeData)
			if err != nil {
				log.Printf("Failed to insert LeetCode data for %s: %v", student.LeetcodeProfile, err)
			} else {
				log.Println("LeetCode data inserted successfully")
			}

		} else {
			log.Printf("Skipping invalid LeetCode URL for student %s: %v", student.Name, err)
		}
	}
	if userleet, err := getUsernameFromURL(all_info[0].LeetcodeProfile); err == nil {
		leetProfile := fetchLeetCodeProfileData(userleet)
		fmt.Printf("LeetCode Username: %s, Total Solved: %d, Easy: %d, Medium: %d, Hard: %d, Rank: %d\n",
			leetProfile.Username, leetProfile.TotalSolved, leetProfile.EasySolved, leetProfile.MediumSolved, leetProfile.HardSolved, leetProfile.Ranking)
		// Prepare the LeetCode struct for insertion
		leetcodeData := LeetCode{
			LeetCodeID: all_info[0].LeetcodeProfile,
			StudentID:  all_info[0].StudentID,
			Username:   leetProfile.Username,
			Rank:       leetProfile.Ranking,
		}
		// Insert the LeetCode data
		err = insertLeetCode(db, leetcodeData)
		if err != nil {
			log.Printf("Failed to insert LeetCode data for %s: %v", all_info[0].LeetcodeProfile, err)
		} else {
			log.Println("LeetCode data inserted successfully")
		}

		url := fmt.Sprintf("https://leetcode.com/%s", userleet)
		println(url)
		problems := Problems{
			ProblemID:  counter,
			LeetcodeID: url,
			NoEasy:     leetProfile.EasySolved,
			NoMedium:   leetProfile.MediumSolved,
			NoHard:     leetProfile.HardSolved,
		}
		err = insertProblems(db, problems)
		if err != nil {
			log.Fatal("failed to insert problems", err)
		}
		log.Println("problems intserted successfully")
		counter = counter + 1

	}

}
