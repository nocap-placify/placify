package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/csv"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
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
	DOB             time.Time `gorm:"column:dob" csv:"dob"`
	Gender          string    `gorm:"column:gender" csv:"gender"`
	Resume          string    `gorm:"column:resume" csv:"resume"`
	Sem             int       `gorm:"column:sem" csv:"sem"`
	MentorID        string    `gorm:"column:mentor_name" csv:"mentor_name"`
	CGPA            float64   `gorm:"column:cgpa" csv:"cgpa"`
	Degree          string    `gorm:"column:degree" csv:"degree"`
	Stream          string    `gorm:"column:stream" csv:"stream"`
	Email           string    `gorm:"column:email" csv:"email"`
	GithubProfile   string    `gorm:"column:github_profile" csv:"github_profile"`
	LeetcodeProfile string    `gorm:"column:leetcode_profile" csv:"leetcode_profile"`
	Age             int       `gorm:"column:age" csv:"age"`
	Linkedin        string    `gorm:"column:linkedin" csv:"linkedin_link"`
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
	StudentID string    `gorm:"primaryKey;column:student_id"`
	Name      string    `gorm:"type:varchar(100);column:name"`
	PhoneNo   string    `gorm:"type:varchar(15);column:phone_no"`
	Dob       time.Time `gorm:"type:date;column:dob"`
	Gender    string    `gorm:"type:varchar(10);column:gender"`
	Resume    string    `gorm:"type:text;column:resume"`
	Sem       int       `gorm:"column:sem"`
	MentorID  int       `gorm:"column:mentor_id"`
	CGPA      float64   `gorm:"type:numeric(4,2);column:cgpa"`
	Email     string    `gorm:"type:varchar(255);column:email"`
	Age       int       `gorm:"column:age"`
	Linkedin  string    `gorm:"column:linkedin"`
	Degree    string    `gorm:"column:degree"`
	Stream    string    `gorm:"column:stream"`
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
	query := `
		INSERT INTO student
		(student_id, name, phone_no, dob, gender, resume, sem, mentor_id, cgpa, email, age, linkedin, degree, stream)
		VALUES
		($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
	`
	err := db.Exec(query, student.StudentID, student.Name, student.PhoneNo, student.Dob, student.Gender,
		student.Resume, student.Sem, student.MentorID, student.CGPA, student.Email, student.Age, student.Linkedin, student.Degree, student.Stream).Error

	if err != nil {
		return fmt.Errorf("could not insert student: %v", err)
	}
	return nil
}

func fetchMentorID(db *gorm.DB, name string) (int, error) {
	if name == "" {
		log.Println("Warning: Mentor name is empty. Check CSV data or mapping logic.")
		return 0, fmt.Errorf("mentor name is empty")
	}

	var mentor Mentor
	err := db.Raw("SELECT * FROM mentor WHERE mentor_name = ? LIMIT 1", name).Scan(&mentor).Error
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
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		log.Fatal("Failed to parse HTML:", err)
	}
	profile.Username = doc.Find("span.vcard-username").Text()

	profile.Bio = strings.TrimSpace(doc.Find("div.user-profile-bio").Text())

	profile.RepoCount = strings.TrimSpace(doc.Find("span.Counter").First().Text())
	doc.Find(".pinned-item-list-item-content").Each(func(i int, s *goquery.Selection) {
		repo := PinnedRepo{}
		// get repo name
		repo.Name = strings.TrimSpace(s.Find(".repo").Text())
		// get about section if available
		repo.About = strings.TrimSpace(s.Find("p.pinned-item-desc").Text())
		// fetch all languages used in the repository
		repo.Languages = fetchRepoLanguages(username, repo.Name, token)
		// add this repository to the profile's pinned repos list
		profile.PinnedRepos = append(profile.PinnedRepos, repo)
	})

	return profile
}

// fetchRepoLanguages fetches all languages used in a repository from the GitHub API
func fetchRepoLanguages(username, repoName, token string) []string {
	url := fmt.Sprintf("https://api.github.com/repos/%s/%s/languages", username, repoName)

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

	var languagesMap map[string]int
	body, _ := io.ReadAll(resp.Body)
	if err := json.Unmarshal(body, &languagesMap); err != nil {
		log.Printf("Error parsing languages for %s: %v", repoName, err)
		return nil
	}

	var languages []string
	for lang := range languagesMap {
		languages = append(languages, lang)
	}
	return languages
}
func getUsernameFromURL(githubURL string) (string, error) {
	parsedURL, err := url.Parse(githubURL)
	if err != nil {
		return "", err
	}

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
	query := `
		INSERT INTO problems (problem_id, leetcode_id, no_easy, no_medium, no_hard)
		VALUES ($1, $2, $3, $4, $5);
	`

	err := db.Exec(query, problems.ProblemID, problems.LeetcodeID, problems.NoEasy, problems.NoMedium, problems.NoHard).Error
	if err != nil {
		return fmt.Errorf("could not insert problem: %v", err)
	}
	return nil
}

func insertMentorSessions(db *gorm.DB, mentors Mentor_Session_DB) error {
	query := `INSERT INTO mentor_sessions (mentor_id, student_id, date, advice)
	VALUES ($1, $2, $3, $4)`
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

//authentication functions

// load rsa priv key for decrypting the aes key
func loadPrivateKey(path string) (*rsa.PrivateKey, error) {
	keyBytes, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	block, _ := pem.Decode(keyBytes)
	if block == nil || block.Type != "RSA PRIVATE KEY" {
		return nil, errors.New("failed to decode PEM block containing private key")
	}
	return x509.ParsePKCS1PrivateKey(block.Bytes)
}

// decryptAESKey decrypts the AES key using the provided RSA private key
func decryptAESKey(encryptedAESKey string, privateKey *rsa.PrivateKey) ([]byte, error) {
	aesKey, err := base64.StdEncoding.DecodeString(encryptedAESKey)
	if err != nil {
		return nil, err
	}
	return rsa.DecryptOAEP(sha256.New(), rand.Reader, privateKey, aesKey, nil)
}

// decryptAES decrypts the given AES-encrypted string using the provided AES key
func decryptAES(ciphertext string, aesKey []byte) (string, error) {
	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", err
	}
	block, err := aes.NewCipher(aesKey)
	if err != nil {
		return "", err
	}
	iv := data[:aes.BlockSize]
	data = data[aes.BlockSize:]
	stream := cipher.NewCFBDecrypter(block, iv)
	stream.XORKeyStream(data, data)
	return string(data), nil
}

// readPasswordHash reads the password hash from the file
func readPasswordHash() (string, error) {
	hashFilePath := "testing.hash"

	hashBytes, err := os.ReadFile(hashFilePath)
	if err != nil {
		return "", err
	}
	return string(hashBytes), nil
}

// GetStudentName retrieves the student name based on the provided SRN and password
func GetStudentName(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	encryptedPass := r.URL.Query().Get("password")
	file, err := os.Open("testing.txt")
	if err != nil {
		log.Println("Error opening file: %v", err)
	}
	defer file.Close()
	content, err := io.ReadAll(file)
	if err != nil {
		log.Println("Error reading file: %v", err)
	}
	fileContent := string(content)
	if fileContent != encryptedPass {
		http.Error(w, "wrong password", http.StatusForbidden)
		return
	}
	srn := r.URL.Query().Get("srn")
	var name string
	err = db.Raw("SELECT name FROM student WHERE student_id = ?", srn).Row().Scan(&name)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			http.Error(w, "Student not found", http.StatusNotFound)
		} else {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}
	fmt.Printf("Student Name: %s\n", name)
	fmt.Fprintf(w, "%s", name)
}

func GetStudentGithub(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	srn := r.URL.Query().Get("srn")

	type RepoResult struct {
		GithubID    string `json:"github_id"`
		RepoID      string `json:"repo_id"`
		RepoName    string `json:"repo_name"`
		Language    string `json:"language"`
		Description string `json:"description"`
	}

	var results []RepoResult
	res := db.Raw(`
		SELECT g.github_id, r.repo_id, r.repo_name, r.language, r.description
		FROM github g
		JOIN repository r ON g.github_id = r.github_id
		WHERE g.student_id = ?`, srn).Scan(&results)

	if res.Error != nil {
		if res.Error == gorm.ErrRecordNotFound {
			http.Error(w, "Student not found", http.StatusNotFound)
		} else {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	if len(results) == 0 {
		http.Error(w, "No repositories found for this student", http.StatusNotFound)
		return
	}

	response := struct {
		GithubID     string `json:"github_id"`
		Repositories []struct {
			RepoID      string `json:"repo_id"`
			RepoName    string `json:"repo_name"`
			Language    string `json:"language"`
			Description string `json:"description"`
		} `json:"repositories"`
	}{
		GithubID: results[0].GithubID,
	}

	fmt.Printf("results fetched for githubID: %s", response.GithubID)

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

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
}

func GetLeetcode(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	srn := r.URL.Query().Get("srn")
	type LeetcodeResult struct {
		LeetcodeID string `json:"leetcode_id"`
		Ranking    int    `json:"ranking"`
		NoEasy     int    `json:"no_easy"`
		NoMedium   int    `json:"no_medium"`
		NoHard     int    `json:"no_hard"`
	}

	var result LeetcodeResult
	res := db.Raw(`
		SELECT l.leetcode_id, l.ranking, p.no_easy, p.no_medium, p.no_hard
		FROM leetcode l
		JOIN problems p ON l.leetcode_id = p.leetcode_id
		WHERE l.student_id = ?
	`, srn).Scan(&result)
	if res.Error != nil {
		if res.Error == gorm.ErrRecordNotFound {
			http.Error(w, "Student not found", http.StatusNotFound)
		} else {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}
	totalSolved := result.NoEasy + result.NoMedium + result.NoHard
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

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
}

func GetResume(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	srn := r.URL.Query().Get("srn")
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
	// open the resume file
	file, err := os.Open(path)
	if err != nil {
		fmt.Printf("Could not open file: %v\n", err)
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}
	defer file.Close()
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", "inline; filename=resume.pdf")
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

func GetLinkedin(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	srn := r.URL.Query().Get("srn")
	if srn == "" {
		http.Error(w, "Missing srn parameter", http.StatusBadRequest)
		return
	}
	var linkedinLink string
	err := db.Raw("SELECT linkedin FROM public.student WHERE student_id = ?", srn).Scan(&linkedinLink).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Student not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to query database", http.StatusInternalServerError)
		}
		return
	}
	if linkedinLink == "" {
		http.Error(w, "LinkedIn link not available", http.StatusNotFound)
		return
	}
	response := map[string]string{
		"linkedin": linkedinLink,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func GetInfo(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	srn := r.URL.Query().Get("srn")
	if srn == "" {
		http.Error(w, "Missing srn parameter", http.StatusBadRequest)
		return
	}
	var studentInfo struct {
		SRN    string  `json:"srn"`
		Gender string  `json:"gender"`
		CGPA   float64 `json:"cgpa"`
		Email  string  `json:"email"`
		Sem    int     `json:"sem"`
		Degree string  `json:"degree"`
		Stream string  `json:"stream"`
		Age    int     `json:"age"`
	}
	err := db.Raw(`
		SELECT student_id AS srn, gender, cgpa, email, sem, degree, stream, age
		FROM
			public.student
		WHERE
			student_id = ?`, srn).Scan(&studentInfo).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Student not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to query database", http.StatusInternalServerError)
		}
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(studentInfo)
}

func GetLeetCodeStatistics(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	type Statistics struct {
		Srn  string  `json:"srn"`
		Name string  `json:"name"`
		Cgpa float64 `json:"cgpa"`
		Sem  int     `json:"sem"`
		Rank int     `json:"rank"`
	}

	srn := r.URL.Query().Get("srn")
	if srn == "" {
		http.Error(w, "Missing 'srn' query parameter", http.StatusBadRequest)
		return
	}

	var stats []Statistics

	var relativeRank int

	top15Query := `
		SELECT s.student_id AS srn, s.name, s.cgpa, s.sem, l.ranking AS rank
		FROM student s
		JOIN leetcode l ON s.student_id = l.student_id
		ORDER BY l.ranking
		LIMIT 15
	`
	if err := db.Raw(top15Query).Scan(&stats).Error; err != nil {
		http.Error(w, "Failed to retrieve top 15 data", http.StatusInternalServerError)
		return
	}
	relativeRankQuery := `
		SELECT COUNT(*) + 1 AS relative_rank
		FROM leetcode l
		WHERE l.ranking < (SELECT ranking FROM leetcode WHERE student_id = ?)
	`

	if err := db.Raw(relativeRankQuery, srn).Scan(&relativeRank).Error; err != nil {
		http.Error(w, "Failed to retrieve relative rank", http.StatusInternalServerError)
		return
	}
	response := map[string]interface{}{
		"leaderboard":   stats,
		"relative_rank": relativeRank,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response to JSON", http.StatusInternalServerError)
	}
}

func GetCGPAStatistics(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	type Statistics struct {
		Srn  string  `json:"srn"`
		Name string  `json:"name"`
		Cgpa float64 `json:"cgpa"`
		Sem  int     `json:"sem"`
		Rank int     `json:"rank"`
	}

	srn := r.URL.Query().Get("srn")
	if srn == "" {
		http.Error(w, "Missing 'srn' query parameter", http.StatusBadRequest)
		return
	}
	var stats []Statistics
	var relativeRank int
	top15Query := `
		SELECT s.student_id AS srn, s.name, s.cgpa, s.sem, l.ranking AS rank
		FROM student s
		JOIN leetcode l ON s.student_id = l.student_id
		ORDER BY s.cgpa DESC
		LIMIT 15
	`
	if err := db.Raw(top15Query).Scan(&stats).Error; err != nil {
		http.Error(w, "Failed to retrieve top 15 data", http.StatusInternalServerError)
		return
	}
	relativeRankQuery := `
		SELECT COUNT(*) + 1 AS relative_rank
		FROM student
		WHERE cgpa > (SELECT cgpa FROM student WHERE student_id = ?)
	`
	if err := db.Raw(relativeRankQuery, srn).Scan(&relativeRank).Error; err != nil {
		http.Error(w, "Failed to retrieve relative rank", http.StatusInternalServerError)
		return
	}
	response := map[string]interface{}{
		"leaderboard":   stats,
		"relative_rank": relativeRank,
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response to JSON", http.StatusInternalServerError)
	}
}

func deleteStudent(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	srn := r.URL.Query().Get("srn")
	if err := db.Exec("DELETE FROM student WHERE student_id = ?", srn).Error; err != nil {
		http.Error(w, "Failed to delete student", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Student and all associated records deleted successfully"))
}

func servePublicKey(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "/home/suraj/Documents/keys/public_key.pem")
}

var counter int = 0

func InsertStudent(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	name := r.URL.Query().Get("name")
	srn := r.URL.Query().Get("srn")
	sem := r.URL.Query().Get("sem")
	git_link := r.URL.Query().Get("git_link")
	leet_link := r.URL.Query().Get("leet_link")
	men_name := r.URL.Query().Get("men_name")
	linkedin_link := r.URL.Query().Get("linkedin_link")
	cgpa := r.URL.Query().Get("cgpa")
	age := r.URL.Query().Get("age")
	phone_num := r.URL.Query().Get("phone_num")
	degree := r.URL.Query().Get("degree")
	stream := r.URL.Query().Get("stream")
	gender := r.URL.Query().Get("gender")
	email := r.URL.Query().Get("email")
	resume := r.URL.Query().Get("resume")

	fmt.Printf("Name: %s\nSRN: %s\nSemester: %s\nGitHub Link: %s\nLeetCode Link: %s\nMentor Name: %s\nLinkedIn Link: %s\nCGPA: %s\nAge: %s\nPhone Number: %s\nDegree: %s\nStream: %s\nGender: %s\nEmail: %s\nResume Link: %s\n",
		name, srn, sem, git_link, leet_link, men_name, linkedin_link, cgpa, age, phone_num, degree, stream, gender, email, resume)

	username, err := getUsernameFromURL(git_link)
	token := ""
	profile := fetchProfileData(username, token)
	git := Github{
		GithubID:  git_link,
		StudentID: srn,
		Username:  profile.Username,
		Bio:       profile.Bio,
		RepoCount: profile.RepoCount,
	}

	mentorid, err := fetchMentorID(db, men_name)
	summ := srn + "_Resume.pdf"
	cmd := exec.Command("gdown", "--fuzzy", resume, "-O", summ)

	cmd.Dir = "/home/suraj/Documents/Resumes"

	output, err := cmd.Output()
	if err != nil {
		http.Error(w, "Couldn't add resume", http.StatusInternalServerError)
		log.Printf("Error executing command: %v", err)
	}
	fmt.Println(string(output))

	resumePath := filepath.Join("/home/suraj/Documents/Resumes", srn+"_Resume.pdf")
	cGpa, err := strconv.ParseFloat(cgpa, 64)
	aGe, err := strconv.Atoi(age)
	sEm, err := strconv.Atoi(sem)

	student := Student{
		StudentID: srn,
		Name:      name,
		PhoneNo:   phone_num,
		Dob:       time.Now(),
		Gender:    gender,
		Resume:    resumePath,
		Sem:       sEm,
		MentorID:  mentorid,
		CGPA:      cGpa,
		Email:     email,
		Age:       aGe,
		Linkedin:  linkedin_link,
		Degree:    degree,
		Stream:    stream,
	}

	err = insertStudent(db, student)
	if err != nil {
		http.Error(w, "Couldn't insert student", http.StatusInternalServerError)
		log.Printf("failed to insert student:", err)
	}
	log.Println("Student inserted successfully")

	err = insertGithub(db, git)
	if err != nil {
		http.Error(w, "Couldn't insert github", http.StatusInternalServerError)
		log.Print("failed to insert github:", err)
	}
	log.Println("github inserted successfully")
	//inserting repos
	fmt.Printf("Username: %s\n", profile.Username)
	fmt.Printf("Bio: %s\n", profile.Bio)
	fmt.Printf("Public Repositories: %s\n", profile.RepoCount)
	fmt.Println("Pinned Repositories:")
	for _, repo := range profile.PinnedRepos {
		fmt.Printf("Repository Name: %s\n", repo.Name)
		fmt.Printf("About: %s\n", repo.About)
		fmt.Printf("Languages Used: %s\n", strings.Join(repo.Languages, ", "))
		test_repo := Repository{
			RepoID:   git_link + "/" + repo.Name,
			GithubID: git_link,
			RepoName: repo.Name,
			Language: strings.Join(repo.Languages, ", "),
			Desc:     repo.About,
		}
		fmt.Printf("testing repository struct repo:%s, git:%s, reponame:%s, lang:%s, desc:%s\n", test_repo.RepoID, test_repo.GithubID, test_repo.RepoName, test_repo.Language, test_repo.Desc)
		if err := insertRepository(db, test_repo); err != nil {
			http.Error(w, "Couldnt insert repo", http.StatusInternalServerError)
			log.Fatalf("Failed to insert repository: %v", err)
		} else {
			log.Println("Repository inserted successfully")
		}
	}
	//inserting leetcode
	if username, err := getUsernameFromURL(leet_link); err == nil {
		leetProfile := fetchLeetCodeProfileData(username)
		fmt.Printf("LeetCode Username: %s, Total Solved: %d, Easy: %d, Medium: %d, Hard: %d, Rank: %d\n",
			leetProfile.Username, leetProfile.TotalSolved, leetProfile.EasySolved, leetProfile.MediumSolved, leetProfile.HardSolved, leetProfile.Ranking)
		leetcodeData := LeetCode{
			LeetCodeID: leet_link,
			StudentID:  srn,
			Username:   leetProfile.Username,
			Rank:       leetProfile.Ranking,
		}

		err = insertLeetCode(db, leetcodeData)
		if err != nil {
			http.Error(w, "Failed to insert leetcode", http.StatusInternalServerError)
			log.Printf("Failed to insert LeetCode data for %s: %v", leet_link, err)
		} else {
			log.Println("LeetCode data inserted successfully")
		}
	} else {
		log.Printf("Skipping invalid LeetCode URL for student %s: %v", srn, err)
	}

	if userleet, err := getUsernameFromURL(leet_link); err == nil {
		leetProfile := fetchLeetCodeProfileData(userleet)
		url := fmt.Sprintf("https://leetcode.com/%s", userleet)
		problems := Problems{
			ProblemID:  counter,
			LeetcodeID: url,
			NoEasy:     leetProfile.EasySolved,
			NoMedium:   leetProfile.MediumSolved,
			NoHard:     leetProfile.HardSolved,
		}
		err = insertProblems(db, problems)
		if err != nil {
			http.Error(w, "Failed to insert problems", http.StatusInternalServerError)
			log.Println("failed to insert problems", err)
		}
		log.Println("problems inserted successfully")
		counter = counter + 1
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Student and all associated records inserted successfully"))

}

func main() {
	start := time.Now()

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

	//start of concurrency
	infoChan := make(chan []Info)
	mentorInfoChan := make(chan []Mentor_Session_CSV)
	errorChan := make(chan error)

	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		file, err := os.Open("data.csv")
		if err != nil {
			errorChan <- fmt.Errorf("could not open CSV file: %v", err)
			return
		}
		defer file.Close()

		reader := csv.NewReader(file)
		decoder, err := csvutil.NewDecoder(reader)
		if err != nil {
			errorChan <- fmt.Errorf("could not create CSV decoder: %v", err)
			return
		}

		var all_info []Info
		for {
			var sing_info Info
			if err := decoder.Decode(&sing_info); err != nil {
				if err == io.EOF {
					break
				}
				errorChan <- fmt.Errorf("could not decode record: %v", err)
				return
			}
			all_info = append(all_info, sing_info)
		}
		infoChan <- all_info
	}()

	go func() {
		defer wg.Done()
		mentor_file, err := os.Open("mentor_sesh.csv")
		if err != nil {
			errorChan <- fmt.Errorf("failed to open mentor csv file: %v", err)
			return
		}
		defer mentor_file.Close()

		mentor_reader := csv.NewReader(mentor_file)
		mentor_decoder, err := csvutil.NewDecoder(mentor_reader)
		if err != nil {
			errorChan <- fmt.Errorf("couldn't make mentor decoder: %v", err)
			return
		}

		var mentor_info []Mentor_Session_CSV
		for {
			var men_info Mentor_Session_CSV
			if err := mentor_decoder.Decode(&men_info); err != nil {
				if err == io.EOF {
					break
				}
				errorChan <- fmt.Errorf("couldn't decode mentor record: %v", err)
				return
			}
			mentor_info = append(mentor_info, men_info)
		}
		mentorInfoChan <- mentor_info
	}()

	go func() {
		wg.Wait()
		close(infoChan)
		close(mentorInfoChan)
		close(errorChan)
	}()

	go func() {
		for err := range errorChan {
			log.Fatal(err)
		}
	}()

	var all_info []Info
	var mentor_info []Mentor_Session_CSV

	for i := 0; i < 2; i++ {
		select {
		case info := <-infoChan:
			all_info = info
		case mentorInfo := <-mentorInfoChan:
			mentor_info = mentorInfo
		}
	}

	for _, student := range all_info {
		fmt.Printf("Name: %s, SRN: %s, CGPA: %.2f, Sem: %d, Email: %s, Phone: %s, Degree: %s, Stream: %s, Gender: %s, GitHub: %s, LeetCode: %s, Mentor: %s, Resume: %s\n",
			student.Name, student.StudentID, student.CGPA, student.Sem, student.Email, student.PhoneNo,
			student.Degree, student.Stream, student.Gender, student.GithubProfile,
			student.LeetcodeProfile, student.MentorID, student.Resume, student.Linkedin)

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
			Linkedin:  student.Linkedin,
			Degree:    student.Degree,
			Stream:    student.Stream,
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
		log.Println("github inserted successfully")

		fmt.Printf("Username: %s\n", profile.Username)
		fmt.Printf("Bio: %s\n", profile.Bio)
		fmt.Printf("Public Repositories: %s\n", profile.RepoCount)
		fmt.Println("Pinned Repositories:")

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
		if username, err := getUsernameFromURL(student.LeetcodeProfile); err == nil {
			leetProfile := fetchLeetCodeProfileData(username)
			fmt.Printf("LeetCode Username: %s, Total Solved: %d, Easy: %d, Medium: %d, Hard: %d, Rank: %d\n",
				leetProfile.Username, leetProfile.TotalSolved, leetProfile.EasySolved, leetProfile.MediumSolved, leetProfile.HardSolved, leetProfile.Ranking)

			leetcodeData := LeetCode{
				LeetCodeID: student.LeetcodeProfile,
				StudentID:  student.StudentID,
				Username:   leetProfile.Username,
				Rank:       leetProfile.Ranking,
			}

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
			url := fmt.Sprintf("https://leetcode.com/%s", userleet)
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
			log.Println("problems inserted successfully")
			counter = counter + 1
		}
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

	r := mux.NewRouter()

	r.HandleFunc("/student", func(w http.ResponseWriter, r *http.Request) {
		GetStudentName(db, w, r)
	}).Methods("GET", "POST")

	r.HandleFunc("/getGithub", func(w http.ResponseWriter, r *http.Request) {
		GetStudentGithub(db, w, r)
	}).Methods("GET")

	r.HandleFunc("/getLeetcode", func(w http.ResponseWriter, r *http.Request) {
		GetLeetcode(db, w, r)
	}).Methods("GET")

	r.HandleFunc("/getResume", func(w http.ResponseWriter, r *http.Request) {
		GetResume(db, w, r)
	}).Methods("GET")

	r.HandleFunc("/getMentorSessions", func(w http.ResponseWriter, r *http.Request) {
		GetMentorSessions(db, w, r)
	}).Methods("GET")

	r.HandleFunc("/getLinkedin", func(w http.ResponseWriter, r *http.Request) {
		GetLinkedin(db, w, r)
	}).Methods("GET")

	r.HandleFunc("/getInfo", func(w http.ResponseWriter, r *http.Request) {
		GetInfo(db, w, r)
	}).Methods("GET")

	r.HandleFunc("/getLeetCodeStatistics", func(w http.ResponseWriter, r *http.Request) {
		GetLeetCodeStatistics(db, w, r)
	}).Methods("GET")

	r.HandleFunc("/getCGPAStatistics", func(w http.ResponseWriter, r *http.Request) {
		GetCGPAStatistics(db, w, r)
	}).Methods("GET")

	r.HandleFunc("/deleteStudent", func(w http.ResponseWriter, r *http.Request) {
		deleteStudent(db, w, r)
	}).Methods("GET")

	// r.HandleFunc("/getPublicKey", servePublicKey).Methods("GET")

	r.HandleFunc("/insertStudent", func(w http.ResponseWriter, r *http.Request) {
		InsertStudent(db, w, r)
	}).Methods("GET")

	elapsed := time.Since(start)
	fmt.Printf("\nElapsed Time: %s\n", elapsed)

	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{"*"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization", "X-Encrypted-AES-Key"}),
		handlers.AllowCredentials(),
	)(r)

	// start the server on port 8000
	fmt.Println("Server is running on port 8000")
	http.ListenAndServe(":8000", corsHandler)
}

//testing.....
