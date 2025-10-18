import requests
import json

def test_sentiment_analysis():
    """AI servisini test et"""
    
    # Test metinleri
    test_texts = [
        "Bu harika bir gün!",
        "Hiçbir şey yapmak istemiyorum.",
        "Normal bir gün geçirdim.",
        "Çok mutluyum!",
        "Bu durumdan hiç memnun değilim."
    ]
    
    # Mock AI servisi (gerçek Hugging Face Spaces URL'i yerine)
    ai_service_url = "https://your-huggingface-space-url"
    
    print("AI Servisi Test Ediliyor...")
    print("=" * 50)
    
    for text in test_texts:
        print(f"\nTest Metni: '{text}'")
        
        # Mock response (gerçek AI servisi olmadığı için)
        mock_response = {
            "sentiment": "pozitif" if "harika" in text or "mutlu" in text else 
                        "negatif" if "istemiyorum" in text or "memnun değilim" in text else "nötr",
            "confidence": 0.85,
            "scores": {
                "pozitif": 0.85 if "harika" in text or "mutlu" in text else 0.15,
                "nötr": 0.10 if "normal" in text else 0.05,
                "negatif": 0.80 if "istemi" in text or "memnun değilim" in text else 0.10
            },
            "text": text
        }
        
        print(f"Sonuc: {mock_response['sentiment']}")
        print(f"Guven: {mock_response['confidence']:.2f}")
        print(f"Skorlar: {mock_response['scores']}")
    
    print("\n" + "=" * 50)
    print("AI Servisi test tamamlandi!")
    print("\nHugging Face Spaces'e deploy için:")
    print("1. https://huggingface.co/new-space adresine git")
    print("2. Space adı: 'sentiment-analysis-chat'")
    print("3. SDK: Gradio seç")
    print("4. app.py dosyasını yükle")
    print("5. requirements.txt dosyasını yükle")
    print("6. Deploy et ve URL'i al")

if __name__ == "__main__":
    test_sentiment_analysis()
