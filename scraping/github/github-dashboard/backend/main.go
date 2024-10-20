package main

import (
	"database/sql"
	"encoding/csv"
	"encoding/json"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gocolly/colly"
	_ "github.com/lib/pq"
)

type User struct {
	SRN        string `csv:"srn"`
	Name       string `csv:"name"`
	GitHubLink string `csv:"github_link"`
}

type PinnedRepo struct {
	Name        string `json:"name"`
	URL         string `json:"url"`
	Description string `json:"description"`
}

type Profile struct {
	Bio         string       `json:"bio"`
	AvatarURL   string       `json:"avatar_url"`
	PinnedRepos []PinnedRepo `json:"pinned_repos"`
}

func connectDB() (*sql.DB, error) {
	connStr := "user=postgres dbname=test1 sslmode=disable password=test"
	return sql.Open("postgres", connStr)
}

func scrapeGitHubProfile(githubLink string) Profile {
	var profile Profile
	c := colly.NewCollector()

	// Scrape the bio and avatar
	c.OnHTML(".p-note.user-profile-bio", func(e *colly.HTMLElement) {
		profile.Bio = e.Text
	})

	c.OnHTML(".avatar-user", func(e *colly.HTMLElement) {
		profile.AvatarURL = e.Attr("src")
	})

	// Scrape pinned repositories
	c.OnHTML(".pinned-item-list-item", func(e *colly.HTMLElement) {
		repo := PinnedRepo{
			Name:        e.ChildText("span.repo"),
			URL:         e.ChildAttr("a.text-bold", "href"),
			Description: e.ChildText("p.pinned-item-desc"),
		}
		profile.PinnedRepos = append(profile.PinnedRepos, repo)
	})

	c.Visit(githubLink)

	// Prepend "https://github.com" to the repository URLs
	for i := range profile.PinnedRepos {
		profile.PinnedRepos[i].URL = "https://github.com" + profile.PinnedRepos[i].URL
	}

	return profile
}

func storeGitHubData(db *sql.DB, srn string, profile Profile) error {
	repos, _ := json.Marshal(profile.PinnedRepos)
	_, err := db.Exec(`
        INSERT INTO github_data (srn, bio, avatar_url, pinned_repos)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (srn) DO UPDATE SET bio = EXCLUDED.bio, avatar_url = EXCLUDED.avatar_url, pinned_repos = EXCLUDED.pinned_repos, last_updated = CURRENT_TIMESTAMP;
    `, srn, profile.Bio, profile.AvatarURL, repos)
	return err
}

func getGitHubData(db *sql.DB, srn string) (Profile, error) {
	var profile Profile
	var pinnedRepos []byte
	err := db.QueryRow(`SELECT bio, avatar_url, pinned_repos FROM github_data WHERE srn=$1`, srn).
		Scan(&profile.Bio, &profile.AvatarURL, &pinnedRepos)
	if err != nil {
		return profile, err
	}
	json.Unmarshal(pinnedRepos, &profile.PinnedRepos)
	return profile, nil
}

func parseCSV(filePath string) ([]User, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	reader.FieldsPerRecord = -1
	rawCSVdata, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}

	var users []User
	for _, record := range rawCSVdata[1:] {
		users = append(users, User{
			SRN:        record[0],
			Name:       record[1],
			GitHubLink: record[2],
		})
	}

	return users, nil
}

func getUserFromCSV(srn string, filePath string) (User, error) {
	users, err := parseCSV(filePath)
	if err != nil {
		return User{}, err
	}

	for _, user := range users {
		if user.SRN == srn {
			return user, nil
		}
	}
	return User{}, sql.ErrNoRows
}

func main() {
	db, err := connectDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	router := gin.Default()

	// Allow all origins for simplicity
	router.Use(cors.Default())

	router.GET("/profile/:srn", func(c *gin.Context) {
		srn := c.Param("srn")
		profile, err := getGitHubData(db, srn)
		if err != nil {
			// SRN not found in database, so check the CSV file
			user, err := getUserFromCSV(srn, "data.csv")
			if err != nil {
				c.JSON(404, gin.H{"error": "User not found in both database and CSV"})
				return
			}
			profile = scrapeGitHubProfile(user.GitHubLink)
			err = storeGitHubData(db, srn, profile)
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to store GitHub data"})
				return
			}
		}
		c.JSON(200, profile)
	})

	router.Run(":8080")
}
