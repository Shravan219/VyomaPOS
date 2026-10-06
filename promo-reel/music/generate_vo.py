import asyncio
import edge_tts
import os

SCRIPT = [
    {
        "time": 0.0,
        "text": "Meet Vyoma POS. The ultra-fast, cloud hospitality suite engineered for modern luxury dining.",
        "voice": "en-US-ChristopherNeural"
    },
    {
        "time": 3.0,
        "text": "Native Windows and Android binaries with zero lag. Sub fifty millisecond KOT dispatch directly from tableside.",
        "voice": "en-US-ChristopherNeural"
    },
    {
        "time": 6.0,
        "text": "Enterprise IP-whitelisted network security. Locked to your premises with local SQLite edge failover.",
        "voice": "en-US-ChristopherNeural"
    },
    {
        "time": 8.5,
        "text": "Eight unified modules: Captain Tablet, Service Rail, Kitchen KDS, and direct Swiggy and Zomato ingestion.",
        "voice": "en-US-ChristopherNeural"
    },
    {
        "time": 11.5,
        "text": "Powered by an automated AI upselling engine, boosting average check size by twenty-four percent.",
        "voice": "en-US-ChristopherNeural"
    },
    {
        "time": 14.0,
        "text": "Transparent investment. Base onboarding at 3,999 rupees, and full POS starting at 25,000 rupees a year.",
        "voice": "en-US-ChristopherNeural"
    },
    {
        "time": 17.5,
        "text": "Or get the complete VIP Suite at 40,000 rupees annually, including free branded restaurant website and domain.",
        "voice": "en-US-ChristopherNeural"
    },
    {
        "time": 20.5,
        "text": "Transform your dining operations today. Launch your live demo at vyomapos.vercel.app.",
        "voice": "en-US-ChristopherNeural"
    }
]

async def main():
    os.makedirs("assets", exist_ok=True)
    os.makedirs("music", exist_ok=True)
    
    for i, item in enumerate(SCRIPT):
        fn = f"music/vo_seg_{i}.mp3"
        print(f"Generating voice segment {i}...")
        tts = edge_tts.Communicate(item["text"], item["voice"], rate="+8%")
        await tts.save(fn)
        
    print("All voiceover segments generated successfully.")

if __name__ == "__main__":
    asyncio.run(main())
