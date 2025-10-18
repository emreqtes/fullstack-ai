import gradio as gr
from transformers import pipeline
import json

# Duygu analizi pipeline'ını yükle
# Bu model Türkçe ve İngilizce metinleri analiz edebilir
sentiment_analyzer = pipeline(
    "sentiment-analysis",
    model="cardiffnlp/twitter-roberta-base-sentiment-latest",
    return_all_scores=True
)

def analyze_sentiment(text):
    """
    Metni analiz eder ve duygu skorunu döndürür
    """
    if not text or text.strip() == "":
        return {"error": "Boş metin analiz edilemez"}
    
    try:
        # Metni analiz et
        results = sentiment_analyzer(text)
        
        # Sonuçları işle
        sentiment_scores = {}
        for result in results[0]:
            label = result['label']
            score = result['score']
            
            # Label'ları Türkçe'ye çevir
            if label == 'LABEL_0':
                sentiment_scores['negatif'] = score
            elif label == 'LABEL_1':
                sentiment_scores['nötr'] = score
            elif label == 'LABEL_2':
                sentiment_scores['pozitif'] = score
        
        # En yüksek skorlu duyguyu bul
        dominant_sentiment = max(sentiment_scores, key=sentiment_scores.get)
        confidence = sentiment_scores[dominant_sentiment]
        
        return {
            "sentiment": dominant_sentiment,
            "confidence": round(confidence, 3),
            "scores": sentiment_scores,
            "text": text
        }
        
    except Exception as e:
        return {"error": f"Analiz hatası: {str(e)}"}

def api_endpoint(text):
    """
    API endpoint olarak kullanılacak fonksiyon
    """
    result = analyze_sentiment(text)
    return json.dumps(result, ensure_ascii=False)

# Gradio arayüzü oluştur
with gr.Blocks(title="Duygu Analizi API") as demo:
    gr.Markdown("# 🤖 Duygu Analizi API")
    gr.Markdown("Bu API, metinlerin duygu analizini yapar ve pozitif/nötr/negatif skorlarını döndürür.")
    
    with gr.Row():
        with gr.Column():
            text_input = gr.Textbox(
                label="Analiz Edilecek Metin",
                placeholder="Mesajınızı buraya yazın...",
                lines=3
            )
            analyze_btn = gr.Button("Analiz Et", variant="primary")
        
        with gr.Column():
            output = gr.JSON(label="Analiz Sonucu")
    
    # Örnek metinler
    gr.Markdown("### Örnek Metinler:")
    examples = [
        "Bu harika bir gün!",
        "Hiçbir şey yapmak istemiyorum.",
        "Normal bir gün geçirdim.",
        "Çok mutluyum!",
        "Bu durumdan hiç memnun değilim."
    ]
    
    gr.Examples(examples=examples, inputs=text_input)
    
    # Event handler
    analyze_btn.click(
        fn=analyze_sentiment,
        inputs=text_input,
        outputs=output
    )
    
    # API endpoint bilgisi
    gr.Markdown("""
    ### API Kullanımı:
    ```
    POST /api/predict
    Content-Type: application/json
    
    {
        "data": ["Analiz edilecek metin"]
    }
    ```
    """)

# Uygulamayı başlat
if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=True
    )
