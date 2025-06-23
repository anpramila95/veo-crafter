# VeoCrafter – VEO3-Powered Viral Add Generator

> **Turn any idea into a scroll-stopping AI video, powered by Google's VEO-3—no design skills required.**

## ✨ Overview

VeoCrafter is an automated video generation pipeline that transforms simple text ideas into engaging short-form videos using Google's VEO-3 AI model. The system handles everything from concept brainstorming to final video rendering, making viral content creation accessible to everyone.

## 🚀 Key Features

- **Automated Idea-to-Video Pipeline**: Input a topic and receive multiple polished video concepts with finished clips
- **Intelligent Concept Generation**: GPT-4.1 agent creates viral-ready hooks, captions, and video settings
- **Smart Prompt Optimization**: Dedicated agent refines concepts into VEO-3-optimized prompts
- **Seamless VEO-3 Integration**: Direct access through fal.ai endpoint without expensive Google contracts
- **Automated Workflow**: Batch processing with comprehensive Excel logging of all generated content

## 🎯 Use Cases

- **Social Media Content**: Generate Reels, Shorts, and TikToks at scale
- **Marketing Campaigns**: Test creative concepts before investing in production
- **Rapid Prototyping**: Develop storyboards and visual concepts quickly
- **Educational Content**: Create engaging explainer videos for complex topics
- **Creative Exploration**: Experiment with unique video concepts and styles

## 🔧 How It Works

```
Topic Input → Concept Agent → Prompt Agent → VEO-3 Rendering → Excel Logging
     ↓              ↓             ↓              ↓              ↓
   "Alien food   Viral hooks   Optimized     MP4 video     Metadata
    critic"      & captions    VEO prompts    generation     tracking
```

### Workflow Steps

1. **Topic Input**: Provide a simple text description of your video concept
2. **Concept Generation**: GPT-4.1 creates multiple engaging video ideas with hooks and captions
3. **Prompt Optimization**: Second agent converts concepts into precise VEO-3 prompts
4. **Video Rendering**: fal.ai processes requests through Google's VEO-3 model
5. **Result Logging**: All videos, prompts, and metadata automatically saved to Excel

## 📋 Prerequisites

| Requirement | Purpose |
|-------------|---------|
| **Python 3.12+** | Modern async features and library compatibility |
| **fal.ai API Key** | Access to Google's VEO-3 model |
| **LLM API Key** | Concept generation (OpenRouter/OpenAI/Claude) |

## 📁 Project Structure

```
veo-crafter/
├── main.py              # Main orchestration script
├── prompts.py           # System prompts and templates
├── utils.py             # API utilities and Excel export
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (not tracked)
└── videos.xlsx          # Generated video log (auto-created)
```

## ⚡ Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/prajvalrasik/veo-crafter.git
cd ad_generation_agent

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration

Create a `.env` file in the project root:

```env
FAL_KEY=your_fal_api_key_here
OPENROUTER_API_KEY=your_openrouter_key_here
```

### 3. Usage

Edit `main.py` to set your desired topic and video count:

```python
topic = "Alien food critic reviews Earth cuisine"
count = 3  # Number of videos to generate
```

Run the generator:

```bash
python main.py
```

### 4. Results

Generated videos and metadata will be saved in `videos.xlsx`. Each row contains:
- Video URL
- Original prompt
- Caption
- Timestamp
- Generation parameters

## 💰 Pricing & Limits

- **Cost**: Approximately $0.75 per second of video via fal.ai
- **Duration Limit**: 8 seconds maximum per video
- **Rate Limits**: Subject to fal.ai and VEO-3 API limitations


## 🔗 Links

- [fal.ai Documentation](https://fal.ai/docs)
- [Google VEO-3 Information](https://deepmind.google/technologies/veo/)
- [OpenRouter API](https://openrouter.ai/)

---

**Made with ❤️**