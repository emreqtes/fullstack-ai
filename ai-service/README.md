---
title: Turkish Sentiment Analysis API
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
pinned: false
license: mit
short_description: Turkish sentiment analysis API for chat applications
---

# Turkish Sentiment Analysis API

This API analyzes Turkish text sentiment and returns positive/neutral/negative scores.

## Features

- ✅ Turkish language support
- ✅ Real-time sentiment analysis
- ✅ Confidence scores
- ✅ REST API endpoint
- ✅ Gradio web interface

## API Usage

```python
import requests

# Send text for analysis
response = requests.post(
    "https://your-space-name.hf.space/api/predict",
    json={"data": ["Bu harika bir gün!"]}
)

result = response.json()
print(result)
```

## Model

Uses `cardiffnlp/twitter-roberta-base-sentiment-latest` for sentiment analysis.

## Response Format

```json
{
    "sentiment": "pozitif",
    "confidence": 0.85,
    "scores": {
        "pozitif": 0.85,
        "nötr": 0.10,
        "negatif": 0.05
    },
    "text": "Bu harika bir gün!"
}
```