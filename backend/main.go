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
	"path/filepath"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/gorilla/handlers"
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
	MentorID  string `gorm:"column:mentor_name" csv:"mentor_name"`
	StudentID string `gorm:"column:student_id;primaryKey" csv:"srn" time_format:"2006-01-02"`
	Date      string `gorm:"column:date" csv:"date"`
	Advice    string `gorm:"advice" csv:"advice"`
}

type Mentor_Session_DB struct {
	MentorID  int    `gorm:"column:mentor_name"`
	StudentID string `gorm:"column:student_id;primaryKey"`
	Date      string `gorm:"column:date"`
	Advice    string `gorm:"advice"`
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
	Desc     string `gorm:"type:text;column:description"`
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
	query := `INSERT INTO repository (repo_id, github_id, repo_name, language, description)
              VALUES ($1, $2, $3, $4, $5)`
	err := db.Exec(query, repo.RepoID, repo.GithubID, repo.RepoName, repo.Language, repo.Desc).Error
	if err != nil {
		return fmt.Errorf("could not insert %v", err)
	}
	return nil
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
	query := `INSERT INTO github (github_id, student_id, username, bio, repo_count)
              VALUES ($1, $2, $3, $4, $5)`
	err := db.Exec(query, github.GithubID, github.StudentID, github.Username, github.Bio, github.RepoCount).Error
	if err != nil {
		return fmt.Errorf("could not insert %v", err)
	}
	return nil
}

func insertProblems(db *gorm.DB, problems Problems) error {
	// SQL query to insert a new row into the "problems" table
	query := `
		INSERT INTO problems (problem_id, leetcode_id, no_easy, no_medium, no_hard)
		VALUES ($1, $2, $3, $4, $5);
	`

	// Execute the query with the provided values
	err := db.Exec(query, problems.ProblemID, problems.LeetcodeID, problems.NoEasy, problems.NoMedium, problems.NoHard).Error
	if err != nil {
		return fmt.Errorf("could not insert problem: %v", err)
	}
	return nil
}

func insertMentorSessions(db *gorm.DB, mentors Mentor_Session_DB) error {
	query := `INSERT INTO mentor_sessions (mentor_id, student_id, date, advice)
	VALUES ($1, $2, $3, $4)` // Removed the semicolon inside VALUES

	// Correctly handle the error returned by db.Exec
	if err := db.Exec(query, mentors.MentorID, mentors.StudentID, mentors.Date, mentors.Advice).Error; err != nil {
		return fmt.Errorf("couldn't insert into mentor_sessions: %v", err)
	}

	return nil
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
	query := `INSERT INTO leetcode (leetcode_id, student_id, username, ranking)
              VALUES ($1, $2, $3, $4)`
	err := db.Exec(query, leetcode.LeetCodeID, leetcode.StudentID, leetcode.Username, leetcode.Rank).Error
	if err != nil {
		return fmt.Errorf("could not insert %v", err)
	}
	return nil
}

func GetStudentName(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	srn := r.URL.Query().Get("srn")

	var name string
	// Use GORM to retrieve the student name directly
	result := db.Table("student").Select("name").Where("student_id = ?", srn).Scan(&name)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			fmt.Println("Student not found")
			http.Error(w, "Student not found", http.StatusNotFound)
		} else {
			fmt.Printf("Couldn't retrieve record: %v\n", result.Error)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	// Print the student name to the terminal
	fmt.Printf("Student Name: %s\n", name)

	// Optional: Return the name in the response
	fmt.Fprintf(w, name)
}

func GetStudentGithub(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	srn := r.URL.Query().Get("srn")

	// Struct to hold the result of the JOIN query
	type RepoResult struct {
		GithubID    string `json:"github_id"`
		RepoID      string `json:"repo_id"`
		RepoName    string `json:"repo_name"`
		Language    string `json:"language"`
		Description string `json:"description"`
	}

	var results []RepoResult

	// Run a JOIN query to retrieve github_id and associated repository details
	res := db.Raw(`
		SELECT g.github_id, r.repo_id, r.repo_name, r.language, r.description
		FROM github g
		JOIN repository r ON g.github_id = r.github_id
		WHERE g.student_id = ?`, srn).Scan(&results)

	// Error handling for query execution
	if res.Error != nil {
		if res.Error == gorm.ErrRecordNotFound {
			http.Error(w, "Student not found", http.StatusNotFound)
		} else {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	// Check if any repositories were found
	if len(results) == 0 {
		http.Error(w, "No repositories found for this student", http.StatusNotFound)
		return
	}

	// Extract GithubID and repositories for the response
	response := struct {
		GithubID     string `json:"github_id"`
		Repositories []struct {
			RepoID      string `json:"repo_id"`
			RepoName    string `json:"repo_name"`
			Language    string `json:"language"`
			Description string `json:"description"`
		} `json:"repositories"`
	}{
		GithubID: results[0].GithubID, // GithubID is the same for all entries
	}

	fmt.Printf("results fetched for githubID: %s", response.GithubID)

	// Append repository details to the response
	for _, result := range results {
		response.Repositories = append(response.Repositories, struct {
			RepoID      string `json:"repo_id"`
			RepoName    string `json:"repo_name"`
			Language    string `json:"language"`
			Description string `json:"description"`
		}{
			RepoID:      result.RepoID,
			RepoName:    result.RepoName,
			Language:    result.Language,
			Description: result.Description,
		})
	}

	// Set Content-Type header and encode response as JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
}

func GetLeetcode(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	srn := r.URL.Query().Get("srn")

	// Step 1: Define a struct to hold the result of the JOIN query
	type LeetcodeResult struct {
		LeetcodeID string `json:"leetcode_id"`
		Ranking    int    `json:"ranking"`
		NoEasy     int    `json:"no_easy"`
		NoMedium   int    `json:"no_medium"`
		NoHard     int    `json:"no_hard"`
	}

	var result LeetcodeResult

	// Step 2: Run a JOIN query to fetch leetcode_id, ranking, and the counts of easy, medium, and hard problems
	res := db.Raw(`
		SELECT l.leetcode_id, l.ranking, p.no_easy, p.no_medium, p.no_hard
		FROM leetcode l
		JOIN problems p ON l.leetcode_id = p.leetcode_id
		WHERE l.student_id = ?
	`, srn).Scan(&result)

	// Step 3: Error handling for query execution
	if res.Error != nil {
		if res.Error == gorm.ErrRecordNotFound {
			http.Error(w, "Student not found", http.StatusNotFound)
		} else {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	// Step 4: Calculate the total problems solved
	totalSolved := result.NoEasy + result.NoMedium + result.NoHard

	// Step 5: Create a JSON response
	response := struct {
		LeetcodeID   string `json:"leetcode_id"`
		Ranking      int    `json:"ranking"`
		EasySolved   int    `json:"easy_solved"`
		MediumSolved int    `json:"medium_solved"`
		HardSolved   int    `json:"hard_solved"`
		TotalSolved  int    `json:"total_solved"`
	}{
		LeetcodeID:   result.LeetcodeID,
		Ranking:      result.Ranking,
		EasySolved:   result.NoEasy,
		MediumSolved: result.NoMedium,
		HardSolved:   result.NoHard,
		TotalSolved:  totalSolved,
	}

	// Step 6: Set Content-Type header and encode response as JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
}

func GetResume(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	srn := r.URL.Query().Get("srn")

	// Query to get the resume file path
	var path string
	result := db.Raw("SELECT resume FROM student WHERE student_id = ?", srn).Scan(&path)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			fmt.Println("Student not found")
			http.Error(w, "Student not found", http.StatusNotFound)
		} else {
			fmt.Printf("Couldn't retrieve record: %v\n", result.Error)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}
	fmt.Printf("Resume Path: %s\n", path)

	// Open the resume file
	file, err := os.Open(path)
	if err != nil {
		fmt.Printf("Could not open file: %v\n", err)
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}
	defer file.Close()

	// Set headers to serve the PDF
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", "inline; filename=resume.pdf")

	// Copy the file content to the response writer
	_, err = io.Copy(w, file)
	if err != nil {
		fmt.Printf("Error while sending file: %v\n", err)
		http.Error(w, "Error serving file", http.StatusInternalServerError)
		return
	}
}

func GetMentorSessions(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	type Session struct {
		Date   string `json:"date"`
		Advice string `json:"advice"`
	}

	type MentorSessionsResponse struct {
		SRN      string    `json:"srn"`
		Sessions []Session `json:"sessions"`
	}

	srn := r.URL.Query().Get("srn")
	if srn == "" {
		http.Error(w, "Missing SRN parameter", http.StatusBadRequest)
		return
	}

	var sessions []Session

	query := `
		SELECT date, advice
		FROM mentor_sessions
		WHERE student_id = ?
	`
	if err := db.Raw(query, srn).Scan(&sessions).Error; err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	response := MentorSessionsResponse{
		SRN:      srn,
		Sessions: sessions,
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response: "+err.Error(), http.StatusInternalServerError)
	}
}

func main() {
	counter := 0
	dsn := "host=100.102.21.101 user=postgres password=dbms_porj dbname=dbms_project port=5432 sslmode=disable TimeZone=Asia/Shanghai"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	sqlDB, err := db.DB()
	if err != nil {
		panic("failed to get database handle")
	}

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

	mentor_file, men_err := os.Open("mentor_sesh.csv")
	if men_err != nil {
		log.Fatalf("failed to open mentor csv file: %v", men_err)
	}
	defer mentor_file.Close()

	mentor_reader := csv.NewReader(mentor_file)
	mentor_decoder, dec_err := csvutil.NewDecoder(mentor_reader)
	if dec_err != nil {
		log.Fatalf("couldnt make mentor decoder: %v", dec_err)
	}

	var all_info []Info
	var mentor_info []Mentor_Session_CSV
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
		username_np := student.GithubProfile
		token := ""
		username, err := getUsernameFromURL(username_np)
		profile := fetchProfileData(username, token)
		github := Github{
			GithubID:  student.GithubProfile,
			StudentID: student.StudentID,
			Username:  profile.Username,
			Bio:       profile.Bio,
			RepoCount: profile.RepoCount,
		}
		git_prof := student.GithubProfile
		log.Println(mentorID)
		student := Student{
			StudentID: student.StudentID,
			Name:      student.Name,
			PhoneNo:   student.PhoneNo,
			Dob:       student.DOB,
			Gender:    student.Gender,
			Resume:    student.Resume,
			Sem:       student.Sem,
			MentorID:  mentorID,
			CGPA:      student.CGPA,
			Email:     student.Email,
			Age:       student.Age,
		}

		resumePath := filepath.Join("/home/suraj/Documents/Resumes", student.Resume)
		student.Resume = resumePath

		err = insertStudent(db, student)
		if err != nil {
			log.Fatal("failed to insert student:", err)
		}
		log.Println("Student inserted successfully")

		err = insertGithub(db, github)
		if err != nil {
			log.Fatal("failed to insert github:", err)
		}
		log.Println("github intserted successfully")
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
				RepoID:   git_prof + "/" + repo.Name,
				GithubID: git_prof,
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
	}

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
		if userleet, err := getUsernameFromURL(student.LeetcodeProfile); err == nil {
			leetProfile := fetchLeetCodeProfileData(userleet)
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

	for {
		var men_info Mentor_Session_CSV
		if err := mentor_decoder.Decode(&men_info); err != nil {
			if err == io.EOF {
				break
			}
			log.Fatalf("couldnt decode mentor record: %v", err)
		}
		mentor_info = append(mentor_info, men_info)
	}

	for _, m_info := range mentor_info {
		m_id, err := fetchMentorID(db, m_info.MentorID)
		if err != nil {
			break
		}
		fmt.Printf("mentor_id: %d stud_id: %s", m_id, m_info.StudentID)
		m_str := Mentor_Session_DB{
			MentorID:  m_id,
			StudentID: m_info.StudentID,
			Date:      m_info.Date,
			Advice:    m_info.Advice,
		}
		fmt.Printf("advice: %s\n", m_str.Advice)
		err = insertMentorSessions(db, m_str)
		if err != nil {
			log.Fatal("failed to insert mentor sessions", err)
		}
		log.Println("mentor sessions inserted successfully")
	}

	fmt.Printf("!!!done setting up database!!!")

	http.HandleFunc("/student", func(w http.ResponseWriter, r *http.Request) {
		GetStudentName(db, w, r)
	})

	http.HandleFunc("/getGithub", func(w http.ResponseWriter, r *http.Request) {
		GetStudentGithub(db, w, r)
	})

	http.HandleFunc("/getLeetcode", func(w http.ResponseWriter, r *http.Request) {
		GetLeetcode(db, w, r)
	})

	http.HandleFunc("/getResume", func(w http.ResponseWriter, r *http.Request) {
		GetResume(db, w, r)
	})

	http.HandleFunc("/getMentorSessions", func(w http.ResponseWriter, r *http.Request) {
		GetMentorSessions(db, w, r)
	})
	fmt.Println("Server is running on port 8000")
	http.ListenAndServe(":8000", handlers.CORS()(http.DefaultServeMux))

}
