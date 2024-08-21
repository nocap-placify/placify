package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/gocolly/colly"
)

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

func scrapeGitHubProfile(username string) Profile {
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

	c.Visit("https://github.com/" + username)

	// Prepend "https://github.com" to the repository URLs
	for i := range profile.PinnedRepos {
		profile.PinnedRepos[i].URL = "https://github.com" + profile.PinnedRepos[i].URL
	}

	return profile
}

func main() {
	router := gin.Default()

	// Allow all origins for simplicity (you might want to restrict this in production)
	router.Use(cors.Default())

	// Serve the frontend
	router.Use(static.Serve("/", static.LocalFile("../frontend/build", true)))

	router.GET("/profile/:username", func(c *gin.Context) {
		username := c.Param("username")
		profile := scrapeGitHubProfile(username)
		c.JSON(http.StatusOK, profile)
	})

	router.NoRoute(func(c *gin.Context) {
		c.File("../frontend/build/index.html")
	})

	router.Run(":8080")
}
