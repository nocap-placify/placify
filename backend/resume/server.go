package resume

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"sync"

	"github.com/gin-gonic/gin"
)

type ChatContext struct {
	SRN      string    `json:"srn"`
	Messages []Message `json:"messages"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Message string `json:"message"`
}

type ChatResponse struct {
	Reply   string    `json:"reply"`
	Error   string    `json:"error,omitempty"`
	History []Message `json:"history,omitempty"`
}

type OllamaResponse struct {
	Message Message `json:"message"`
	Done    bool    `json:"done"`
}

var (
	chatContexts = make(map[string]*ChatContext)
	portCounter  = 8081 // Start from 8081
	portMutex    sync.Mutex
)

func readResumeFile(srn string) (string, error) {
	filename := fmt.Sprintf("%s_Resume.txt", srn)
	resumePath := filepath.Join("resumes", filename)
	content, err := ioutil.ReadFile(resumePath)
	if err != nil {
		return "", fmt.Errorf("resume file not found for SRN: %s", srn)
	}
	return string(content), nil
}

func getOrCreateChat(srn string) (*ChatContext, error) {
	ctx, exists := chatContexts[srn]
	if exists {
		return ctx, nil
	}
	resume, err := readResumeFile(srn)
	if err != nil {
		return nil, err
	}
	systemPrompt := fmt.Sprintf(`Answer questions about this resume briefly and accurately.

%s`, resume)
	newCtx := &ChatContext{
		SRN: srn,
		Messages: []Message{
			{Role: "system", Content: systemPrompt},
		},
	}
	chatContexts[srn] = newCtx
	return newCtx, nil
}

func chatHandler(srn string) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req ChatRequest
		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, ChatResponse{Error: "Invalid request format"})
			return
		}

		if req.Message == "" {
			c.JSON(http.StatusBadRequest, ChatResponse{Error: "Message is required"})
			return
		}

		chatCtx, err := getOrCreateChat(srn)
		if err != nil {
			c.JSON(http.StatusNotFound, ChatResponse{Error: err.Error()})
			return
		}
		chatCtx.Messages = append(chatCtx.Messages, Message{Role: "user", Content: req.Message})
		resume, _ := readResumeFile(srn)

		prompt := fmt.Sprintf(`You are an expert assistant helping recruiters answer questions based on the following candidate's resume.

RESUME:
%s

QUESTION: %s

Provide a brief and accurate answer based only on the resume data. If the information is not present, clearly state "Information not available in resume." 

ANSWER:`, resume, req.Message)

		generatePayload := map[string]interface{}{
			"model":  "mistral",
			"prompt": prompt,
			"stream": false,
			"options": map[string]interface{}{
				"temperature": 0.3,
				"max_tokens":  200,
			},
		}

		payloadBytes, _ := json.Marshal(generatePayload)
		log.Printf("=== SRN %s: Prompt Sent ===\n%s\n=========================", srn, prompt)

		resp, err := http.Post("http://100.85.227.127:11434/api/generate", "application/json", bytes.NewBuffer(payloadBytes))
		if err != nil {
			log.Printf("Ollama API error: %v", err)
			c.JSON(http.StatusInternalServerError, ChatResponse{Error: "LLM service unavailable"})
			return
		}
		defer resp.Body.Close()

		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			log.Printf("Failed to read Ollama response: %v", err)
			c.JSON(http.StatusInternalServerError, ChatResponse{Error: "Failed to process LLM response"})
			return
		}

		var generateResp struct {
			Response string `json:"response"`
			Done     bool   `json:"done"`
		}

		if err := json.Unmarshal(body, &generateResp); err != nil {
			log.Printf("Failed to parse Ollama response: %v", err)
			log.Printf("Raw response: %s", string(body))
			c.JSON(http.StatusInternalServerError, ChatResponse{Error: "Invalid LLM response format"})
			return
		}

		log.Printf("LLM replied for SRN %s: %s", srn, generateResp.Response)

		assistantMsg := Message{Role: "assistant", Content: generateResp.Response}
		chatCtx.Messages = append(chatCtx.Messages, assistantMsg)

		c.JSON(http.StatusOK, ChatResponse{
			Reply:   generateResp.Response,
			History: chatCtx.Messages[1:], // skip system message
		})
	}
}

func getChatHistoryHandler(srn string) gin.HandlerFunc {
	return func(c *gin.Context) {
		chatCtx, exists := chatContexts[srn]
		if !exists {
			c.JSON(http.StatusOK, ChatResponse{History: []Message{}})
			return
		}
		c.JSON(http.StatusOK, ChatResponse{History: chatCtx.Messages[1:]})
	}
}

func clearChatHandler(srn string) gin.HandlerFunc {
	return func(c *gin.Context) {
		delete(chatContexts, srn)
		c.JSON(http.StatusOK, gin.H{"message": "Chat cleared for SRN " + srn})
	}
}

func getAvailablePort() int {
	portMutex.Lock()
	defer portMutex.Unlock()
	port := portCounter
	portCounter++
	return port
}

func StartResumeServer(srn string) {
	if err := os.MkdirAll("resumes", 0755); err != nil {
		log.Fatal("Failed to create resumes directory:", err)
	}

	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.POST("/chat", chatHandler(srn))
	r.GET("/chat/history", getChatHistoryHandler(srn))
	r.DELETE("/chat/clear", clearChatHandler(srn))

	port := getAvailablePort()
	log.Printf("Resume Server for SRN %s starting on :%d", srn, port)
	log.Printf("Place resume at ./resumes/%s_Resume.txt", srn)

	go r.Run(":" + strconv.Itoa(port))
}
