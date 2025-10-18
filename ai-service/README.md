# Duygu Analizi API Servisi

Bu servis Hugging Face Spaces'te çalışan bir duygu analizi API'sidir.

## Özellikler

- Metinlerin duygu analizini yapar (pozitif/nötr/negatif)
- Türkçe ve İngilizce metinleri destekler
- Gerçek zamanlı analiz
- RESTful API endpoint'i

## Kullanım

### Gradio Web Arayüzü
- Hugging Face Spaces'te otomatik olarak web arayüzü sağlanır
- Metin girişi ve analiz sonuçları görsel olarak gösterilir

### API Endpoint
```
POST /api/predict
Content-Type: application/json

{
    "data": ["Analiz edilecek metin"]
}
```

### Yanıt Formatı
```json
{
    "sentiment": "pozitif",
    "confidence": 0.95,
    "scores": {
        "pozitif": 0.95,
        "nötr": 0.03,
        "negatif": 0.02
    },
    "text": "Analiz edilecek metin"
}
```

## Teknik Detaylar

- **Model**: cardiffnlp/twitter-roberta-base-sentiment-latest
- **Framework**: Gradio + Transformers
- **Hosting**: Hugging Face Spaces (ücretsiz)
- **Port**: 7860

## Kurulum

```bash
pip install -r requirements.txt
python app.py
```

## Entegrasyon

Bu API, backend servisinden HTTP istekleri ile çağrılır ve frontend'e duygu skorları gönderilir.
